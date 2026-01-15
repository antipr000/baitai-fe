/**
 * useAudioRecorder Hook (Simplified)
 *
 * Manages microphone audio recording with silence detection.
 * Registers controls with centralized actions for cross-module calls.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useInterviewStore } from '../store'
import { convertWebMToRawPCM, MixedAudioContext } from '../lib/audioUtils'
import { 
  registerAudioRecorderControls,
  sendAudio,
  sendEndOfTurnMessage,
} from '../store/interviewActions'
import { DEFAULT_SILENCE_CONFIG } from '../store/types'
import type { SilenceDetectionConfig } from '../store/types'

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

export function useAudioRecorderSimplified(
  options: UseAudioRecorderOptions
): UseAudioRecorderReturn {
  const { micStream, silenceConfig, onSpeechDetected, onError } = options

  const config: SilenceDetectionConfig = {
    ...DEFAULT_SILENCE_CONFIG,
    ...silenceConfig,
  }

  const store = useInterviewStore

  // Refs for browser APIs (not serializable)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  // Timers
  const silenceRAFRef = useRef<number | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const periodicFlushTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Noise floor (updates at 60fps)
  const noiseFloorRmsRef = useRef<number>(config.minNoiseFloor)

  // ============================================
  // Silence Detection
  // ============================================

  const stopSilenceDetection = useCallback(() => {
    if (silenceRAFRef.current !== null) {
      cancelAnimationFrame(silenceRAFRef.current)
      silenceRAFRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current = null
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error)
      }
      audioContextRef.current = null
    }
  }, [])

  const setupSilenceDetection = useCallback(() => {
    const state = store.getState()
    if (state.conversationState !== 'listening') return

    state.setHasHeardSpeech(false)
    noiseFloorRmsRef.current = config.minNoiseFloor

    const stream = micStream
    const hasLiveTrack = stream?.getAudioTracks().some((t) => t.readyState === 'live')

    if (!stream || !hasLiveTrack || !state.isMicOn) {
      console.log('[AudioRecorder] Skipping silence detection - no valid stream')
      return
    }

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext()
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(console.error)
      }

      const source = audioContextRef.current.createMediaStreamSource(stream)
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser

      const timeDomain = new Uint8Array(analyser.fftSize)
      let silenceStartTime: number | null = null

      const checkSilence = () => {
        const currentState = store.getState()

        if (!analyserRef.current || !currentState.isMicOn || currentState.conversationState !== 'listening') {
          return
        }

        const isRecording = mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'
        const hasAudioChunks = audioChunksRef.current.length > 0
        const hasSentSegments = currentState.hasSentAudioSegments

        if (!isRecording && !hasAudioChunks && !hasSentSegments) {
          silenceRAFRef.current = requestAnimationFrame(checkSilence)
          return
        }

        analyserRef.current.getByteTimeDomainData(timeDomain)
        let sumSq = 0
        for (let i = 0; i < timeDomain.length; i++) {
          const centered = (timeDomain[i] - 128) / 128
          sumSq += centered * centered
        }
        const rms = Math.sqrt(sumSq / timeDomain.length)

        const prevFloor = noiseFloorRmsRef.current
        const speechThreshold = Math.max(
          config.minNoiseFloor + config.speechMargin,
          prevFloor + config.speechMargin
        )
        const isSpeech = rms > speechThreshold

        if (!currentState.hasHeardSpeech && !isSpeech) {
          noiseFloorRmsRef.current = Math.max(
            config.minNoiseFloor,
            prevFloor * (1 - config.noiseFloorAlpha) + rms * config.noiseFloorAlpha
          )
        }

        if (isSpeech) {
          if (!currentState.hasHeardSpeech) {
            store.getState().setHasHeardSpeech(true)
            console.log('[AudioRecorder] Speech detected')
            onSpeechDetected?.()
          }
          silenceStartTime = null
        } else {
          if ((hasAudioChunks || hasSentSegments) && currentState.hasHeardSpeech) {
            if (silenceStartTime === null) {
              silenceStartTime = Date.now()
            } else if (Date.now() - silenceStartTime > config.silenceDuration) {
              console.log('[AudioRecorder] Silence duration exceeded')
              // Call sendEndOfTurn which is registered via actions
              sendEndOfTurnInternal()
              silenceStartTime = null
              return
            }
          } else {
            silenceStartTime = null
          }
        }

        silenceRAFRef.current = requestAnimationFrame(checkSilence)
      }

      checkSilence()
      console.log('[AudioRecorder] Silence detection active')
    } catch (error) {
      console.error('[AudioRecorder] Error setting up silence detection:', error)
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [config, micStream, onSpeechDetected, onError])

  // ============================================
  // Audio Flushing
  // ============================================

  const flushAudio = useCallback(async (): Promise<void> => {
    const state = store.getState()
    const isRecording = mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'

    if (!isRecording || audioChunksRef.current.length === 0) {
      return
    }

    console.log('[AudioRecorder] Flushing audio segments...')
    const recorder = mediaRecorderRef.current!

    const stoppedPromise = new Promise<void>((resolve) => {
      const onStop = () => {
        recorder.removeEventListener('stop', onStop)
        setTimeout(resolve, 150)
      }
      recorder.addEventListener('stop', onStop)
    })

    try {
      recorder.stop()
    } catch {
      return
    }

    await stoppedPromise

    const chunksToProcess = [...audioChunksRef.current]
    audioChunksRef.current = []

    // Restart recorder
    if (state.connectionStatus === 'connected' && !state.hasNavigatedAway) {
      const shouldEnableSilence = state.conversationState === 'listening'
      await startRecordingInternal(shouldEnableSilence)
    }

    // Convert and send
    try {
      if (chunksToProcess.length > 0) {
        const pcmBuffer = await convertWebMToRawPCM(chunksToProcess)
        store.getState().setHasSentAudioSegments(true)
        sendAudio(pcmBuffer)
      }
    } catch (error) {
      console.error('[AudioRecorder] Error converting audio:', error)
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [onError])

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
      periodicFlushTimerRef.current = setInterval(flushAudio, 40000)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
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
    state.setIsProcessing(true)
    state.setHasSentEndOfTurn(true)
    state.setHasHeardSpeech(false)

    stopSilenceDetection()

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
          state.setHasSentEndOfTurn(false)
          state.setIsProcessing(false)
          state.setConversationState('listening')
          await startRecordingInternal(true)
          return
        }
      }
    } else if (!hasSentSegments) {
      state.setHasSentEndOfTurn(false)
      state.setIsProcessing(false)
      state.setConversationState('listening')
      await startRecordingInternal(true)
      return
    }

    // Send end_of_turn via WebSocket
    const sendSuccess = sendEndOfTurnMessage()

    if (!sendSuccess) {
      state.setHasSentEndOfTurn(false)
      state.setIsProcessing(false)
      state.setConversationState('listening')
      await startRecordingInternal(true)
      return
    }

    state.setConversationState('thinking')

    // Restart recording without silence detection
    const currentState = store.getState()
    if (currentState.connectionStatus === 'connected' && !currentState.hasNavigatedAway && currentState.isMicOn) {
      await startRecordingInternal(false)
    }
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
  }, [startRecording, stopRecording, stopAndClearBuffer, flushAudio, sendEndOfTurnInternal, setupSilenceDetection,stopSilenceDetection])

  // ============================================
  // Cleanup
  // ============================================
  useEffect(() => {
    return () => {
      stopRecording()
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
