/**
 * useAudioRecorder Hook
 *
 * Manages microphone audio recording with silence detection using @ricky0123/vad-web.
 * Registers controls with centralized actions for cross-module calls.
 */

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useInterviewStore } from '../store'
import { convertWebMToRawPCM, MixedAudioContext } from '../lib/audioUtils'
import {
  registerAudioRecorderControls,
  sendAudio,
  sendEndOfTurnMessage,
  transitionToListening,
  transitionToThinking,
} from '../store/interviewActions'
import { DEFAULT_SILENCE_CONFIG } from '../store/types'
import type { SilenceDetectionConfig } from '../store/types'
import { MicVAD } from '@ricky0123/vad-web'

// ============================================
// Types
// ============================================

export interface UseAudioRecorderOptions {
  micStream: MediaStream | null
  silenceConfig?: Partial<SilenceDetectionConfig>
  onSpeechDetected?: () => void
  onError?: (error: Error) => void
}

export interface UseAudioRecorderReturn {
  isRecording: boolean
  getMixedAudioContext: () => MixedAudioContext | null
}

// ============================================
// Hook Implementation
// ============================================

export function useAudioRecorder(
  options: UseAudioRecorderOptions
): UseAudioRecorderReturn {
  const { micStream, silenceConfig, onSpeechDetected, onError } = options

  const config = useMemo<SilenceDetectionConfig>(() => ({
    ...DEFAULT_SILENCE_CONFIG,
    ...silenceConfig,
  }), [silenceConfig])

  const store = useInterviewStore

  // Refs for browser APIs (not serializable)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const vadRef = useRef<MicVAD | null>(null)
  const vadStreamRef = useRef<MediaStream | null>(null)  // Track which stream VAD was created with
  const audioChunksRef = useRef<Blob[]>([])

  // Timers and guards
  const periodicFlushTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isFlushingRef = useRef(false)  // Guard against concurrent flushes

  // ============================================
  // Silence Detection
  // ============================================

  const stopSilenceDetection = useCallback(() => {
    if (vadRef.current) {
      vadRef.current.pause()
      // Don't nullify - keep VAD instance for reuse across turns
    }
  }, [])

  const setupSilenceDetection = useCallback(async () => {
    const state = store.getState()
    if (state.conversationState !== 'listening') return

    state.setHasHeardSpeech(false)

    const stream = micStream
    const hasLiveTrack = stream?.getAudioTracks().some((t) => t.readyState === 'live')

    if (!stream || !state.isMicOn || !hasLiveTrack) {
      console.log('[AudioRecorder] Skipping silence detection - mic is off or stream is not live')
      return
    }

    try {
      // Check if we can reuse existing VAD or need to recreate (stream changed)
      const streamChanged = vadStreamRef.current !== stream

      if (vadRef.current && !streamChanged) {
        console.log('[AudioRecorder] Resuming existing VAD')
        vadRef.current.start()
        return
      }

      // Stream changed or no VAD exists - destroy old and create new
      if (vadRef.current) {
        console.log('[AudioRecorder] Stream changed, recreating VAD')
        vadRef.current.destroy()
        vadRef.current = null
      }

      console.log('[AudioRecorder] Initializing new VAD...')

      vadRef.current = await MicVAD.new({
        model: 'v5',
        baseAssetPath: '/vad/',
        onnxWASMBasePath: '/vad/',
        getStream: async () => stream!,
        pauseStream: async () => {
          // No-op to preserve stream for MediaRecorder
        },
        resumeStream: async (s) => s,
        onSpeechStart: () => {
          console.log('[AudioRecorder] Speech detected (VAD)')
          const currentState = store.getState()
          if (currentState.conversationState === 'listening' && !currentState.hasHeardSpeech) {
            currentState.setHasHeardSpeech(true)
            onSpeechDetected?.()
          }
        },
        onSpeechEnd: () => {
          console.log('[AudioRecorder] Speech ended (VAD)')
          const currentState = store.getState()
          if (currentState.conversationState === 'listening' && currentState.hasHeardSpeech) {
            console.log('[AudioRecorder] Triggering end of turn from VAD')
            sendEndOfTurnInternal()
          }
        },
        onVADMisfire: () => {
          console.log('[AudioRecorder] VAD misfire (noise)')
        },
        positiveSpeechThreshold: 0.5,
        negativeSpeechThreshold: 0.6,
        minSpeechMs: 150,
        redemptionMs: config.silenceDuration,
      })

      vadRef.current.start()
      vadStreamRef.current = stream  // Remember which stream VAD was created with
      console.log('[AudioRecorder] Silence detection active (VAD)')

    } catch (error) {
      console.error('[AudioRecorder] Error setting up silence detection:', error)
      if (error instanceof Error) {
        console.error('[AudioRecorder] Error details:', error.message, error.stack);
      }
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [config, micStream, onSpeechDetected, onError])

  // ============================================
  // Audio Flushing
  // ============================================

  const flushAudio = useCallback(async (): Promise<void> => {
    // Guard against concurrent flushes
    if (isFlushingRef.current) {
      console.log('[AudioRecorder] Flush already in progress, skipping')
      return
    }

    const isRecording = mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'

    if (!isRecording || audioChunksRef.current.length === 0) {
      return
    }

    isFlushingRef.current = true
    console.log('[AudioRecorder] Flushing audio segments...')
    const recorder = mediaRecorderRef.current

    if (!recorder) {
      console.error('[AudioRecorder] No media recorder found')
      isFlushingRef.current = false
      return
    }

    const stoppedPromise = new Promise<void>((resolve) => {
      const onStop = () => {
        recorder.removeEventListener('stop', onStop)
        setTimeout(resolve, 150)
      }
      recorder.addEventListener('stop', onStop)

      try {
        recorder.stop()
      } catch {
        console.error('[AudioRecorder] Error stopping media recorder')
        recorder.removeEventListener('stop', onStop)  // Clean up listener on error
        resolve()
      }
    })

    await stoppedPromise

    const chunksToProcess = [...audioChunksRef.current]
    audioChunksRef.current = []

    // Get fresh state to determine if we should send and restart
    const currentState = store.getState()
    const isListening = currentState.conversationState === 'listening'

    // Only send audio to backend in 'listening' state (user speech)
    if (isListening && chunksToProcess.length > 0) {
      try {
        const pcmBuffer = await convertWebMToRawPCM(chunksToProcess)
        store.getState().setHasSentAudioSegments(true)
        sendAudio(pcmBuffer)
      } catch (error) {
        console.error('[AudioRecorder] Error converting audio:', error)
        onError?.(error instanceof Error ? error : new Error(String(error)))
      }
    } else if (!isListening) {
      console.log('[AudioRecorder] Discarding audio chunks (AI is speaking/thinking)')
    }

    // Restart recorder only if still in listening state
    const stateAfterSend = store.getState()
    if (stateAfterSend.connectionStatus === 'connected' &&
      !stateAfterSend.hasNavigatedAway &&
      stateAfterSend.conversationState === 'listening') {
      await startRecordingInternal(true)  // With silence detection for user turn
    }

    isFlushingRef.current = false
  }, [onError])  // Note: startRecordingInternal intentionally omitted to avoid circular dependency

  // ============================================
  // Recording Control
  // ============================================

  const startRecordingInternal = useCallback(async (enableSilenceDetection: boolean): Promise<void> => {
    const state = store.getState()

    if (state.connectionStatus !== 'connected' || state.hasNavigatedAway) {
      return
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      return
    }

    let stream = micStream
    const hasLiveTrack = stream?.getAudioTracks().some((t) => t.readyState === 'live')

    if (!stream || !hasLiveTrack) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Microphone unavailable'))
        return
      }
    }

    try {
      const mixedAudioCtx = MixedAudioContext.getInstance()
      const mixedStream = await mixedAudioCtx.initialize(stream, 16000)

      // IMPORTANT: Nullify old recorder's event handlers to prevent stale ondataavailable
      // events from adding chunks to the new session's buffer (causing WebM decoding errors)
      const oldRecorder = mediaRecorderRef.current
      if (oldRecorder) {
        oldRecorder.ondataavailable = null
        oldRecorder.onerror = null
        oldRecorder.onstart = null
        oldRecorder.onstop = null
      }

      const mediaRecorder = new MediaRecorder(mixedStream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      state.setHasSentEndOfTurn(false)
      state.setHasSentAudioSegments(false)

      if (periodicFlushTimerRef.current) {
        clearInterval(periodicFlushTimerRef.current)
      }
      periodicFlushTimerRef.current = setInterval(flushAudio, 10000)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
          console.log(`[Recording] Audio chunk available: ${event.data.size} bytes (accumulated: ${audioChunksRef.current.length} chunks, total: ${totalSize} bytes)`)

        }
      }

      mediaRecorder.onerror = () => {
        onError?.(new Error('Recording error'))
      }

      mediaRecorder.onstart = () => {
        store.getState().setAudioRecording({ isRecording: true })
      }

      mediaRecorder.onstop = () => {
        store.getState().setAudioRecording({ isRecording: false })
      }

      mediaRecorder.start(100)

      if (enableSilenceDetection) {
        setupSilenceDetection()
      } else {
        stopSilenceDetection()
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [micStream, flushAudio, setupSilenceDetection, stopSilenceDetection, onError])

  const startRecording = useCallback(async (enableSilence?: boolean): Promise<void> => {
    const state = store.getState()
    const shouldEnableSilence = enableSilence ?? state.conversationState === 'listening'
    await startRecordingInternal(shouldEnableSilence)
  }, [startRecordingInternal])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (periodicFlushTimerRef.current) {
      clearInterval(periodicFlushTimerRef.current)
      periodicFlushTimerRef.current = null
    }
    stopSilenceDetection()
  }, [stopSilenceDetection])

  const stopAndClearBuffer = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (periodicFlushTimerRef.current) {
      clearInterval(periodicFlushTimerRef.current)
      periodicFlushTimerRef.current = null
    }
    stopSilenceDetection()
    audioChunksRef.current = []
    store.getState().setHasSentEndOfTurn(false)
  }, [stopSilenceDetection])

  // ============================================
  // End of Turn
  // ============================================

  // Only invoked for user's  end of turn
  const sendEndOfTurnInternal = useCallback(async (): Promise<void> => {
    const state = store.getState()

    if (state.connectionStatus !== 'connected' || state.isProcessing || state.hasSentEndOfTurn) {
      return
    }

    const isRecording = mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'
    const hasAudioChunks = audioChunksRef.current.length > 0
    const hasSentSegments = state.hasSentAudioSegments

    if (!isRecording && !hasAudioChunks && !hasSentSegments) {
      return
    }

    console.log('[AudioRecorder] Processing end of turn...')
    // Set processing flag early to prevent duplicate calls (guard at line 388)
    state.setIsProcessing(true)
    // Other flags will be set by transitionToThinking() after successful send
    // Early failures call transitionToListening() which resets isProcessing
    stopSilenceDetection()

    // Clear periodic flush timer - we're stopping recording
    if (periodicFlushTimerRef.current) {
      clearInterval(periodicFlushTimerRef.current)
      periodicFlushTimerRef.current = null
    }

    // Stop recording and wait for chunks
    if (isRecording && mediaRecorderRef.current) {
      await new Promise<void>((resolve) => {
        const recorder = mediaRecorderRef.current
        if (!recorder) {
          resolve()
          return
        }
        const onStop = () => {
          recorder.removeEventListener('stop', onStop)
          setTimeout(resolve, 150)
        }
        recorder.addEventListener('stop', onStop)
        try {
          recorder.stop()
        } catch {
          recorder.removeEventListener('stop', onStop)
          resolve()
        }
      })
    }

    // Process chunks
    const chunksToProcess = [...audioChunksRef.current]

    if (chunksToProcess.length > 0) {
      try {
        const pcmBuffer = await convertWebMToRawPCM(chunksToProcess)
        audioChunksRef.current = []
        sendAudio(pcmBuffer)
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (error) {
        audioChunksRef.current = []
        if (!hasSentSegments) {
          transitionToListening()
          await startRecordingInternal(true)
          return
        }
      }
    }
    //Rare case: No audio chunks and no segments sent
    else if (!hasSentSegments) {
      transitionToListening()
      await startRecordingInternal(true)
      return
    }

    // Send end_of_turn via WebSocket
    const sendSuccess = sendEndOfTurnMessage()

    if (!sendSuccess) {
      transitionToListening()
      await startRecordingInternal(true)
      return
    }

    // Successfully sent end_of_turn - transition to thinking
    transitionToThinking()

    // Do NOT restart recording here - AI is about to speak
    // Recording will be restarted by onAIPlaybackComplete when AI finishes speaking
  }, [stopSilenceDetection, startRecordingInternal])

  // ============================================
  // Register Controls with Actions Module
  // ============================================
  useEffect(() => {
    registerAudioRecorderControls({
      start: startRecording,
      stop: stopRecording,
      stopAndClear: stopAndClearBuffer,
      flush: flushAudio,
      sendEndOfTurn: sendEndOfTurnInternal,
      enableSilenceDetection: setupSilenceDetection,
      stopSilenceDetection: stopSilenceDetection,
    })

    return () => {
      registerAudioRecorderControls(null)
    }
  }, [startRecording, stopRecording, stopAndClearBuffer, flushAudio, sendEndOfTurnInternal, setupSilenceDetection, stopSilenceDetection])

  // ============================================
  // Cleanup
  // ============================================
  useEffect(() => {
    return () => {
      stopRecording()
      // Properly destroy VAD on unmount to release ONNX resources
      if (vadRef.current) {
        vadRef.current.destroy()
        vadRef.current = null
      }
    }
  }, [stopRecording])

  // ============================================
  // Return
  // ============================================
  const isRecording = useInterviewStore((s) => s.audio.isRecording)

  const getMixedAudioContext = useCallback(
    () => (MixedAudioContext.hasInstance() ? MixedAudioContext.getInstance() : null),
    []
  )

  return {
    isRecording,
    getMixedAudioContext,
  }
}
