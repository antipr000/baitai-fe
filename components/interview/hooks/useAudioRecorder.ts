/**
 * useAudioRecorder Hook
 *
 * Manages microphone audio recording with silence detection.
 * Integrates with the Zustand store for state management.
 *
 * Features:
 * - MediaRecorder management for WebM/Opus recording
 * - Silence detection using RMS analysis
 * - Periodic audio flushing (40s intervals)
 * - Mixed audio context for recording both mic and AI audio
 * - Automatic chunk accumulation and conversion
 */

import { useEffect, useRef, useCallback } from 'react'
import { useInterviewStore } from '../store'
import {
  convertWebMToRawPCM,
  MixedAudioContext,
} from '../lib/audioUtils'
import { DEFAULT_SILENCE_CONFIG } from '../store/types'
import type { SilenceDetectionConfig } from '../store/types'

// ============================================
// Types
// ============================================

export interface UseAudioRecorderOptions {
  /** Microphone stream from getUserMedia */
  micStream: MediaStream | null
  /** Whether mic is enabled */
  isMicOn: boolean
  /** Silence detection config (optional) */
  silenceConfig?: Partial<SilenceDetectionConfig>
  /** Called when audio is ready to send */
  onAudioReady?: (pcmData: ArrayBuffer) => void
  /** Called when silence is detected - triggers sendEndOfTurn internally */
  onSilenceDetected?: () => void
  /** Called when speech is first detected */
  onSpeechDetected?: () => void
  /** Called to send end_of_turn message to WebSocket after audio is sent. Returns true if successful */
  onEndOfTurn?: () => boolean
  /** Called on recording error */
  onError?: (error: Error) => void
}

export interface UseAudioRecorderReturn {
  /** Start recording */
  startRecording: (enableSilenceDetection?: boolean) => Promise<void>
  /** Stop recording */
  stopRecording: () => void
  /** Stop recording and clear buffered audio (e.g., when AI starts responding) */
  stopAndClearBuffer: () => void
  /** Whether currently recording */
  isRecording: boolean
  /** Flush current audio segments and send */
  flushAudio: () => Promise<void>
  /** Get the mixed audio context (for AI audio routing) */
  getMixedAudioContext: () => MixedAudioContext | null
  /** Process and send end of turn */
  sendEndOfTurn: () => Promise<void>
  /** Enable silence detection (if already recording) */
  enableSilenceDetection: () => void
}

// ============================================
// Hook Implementation
// ============================================

export function useAudioRecorder(
  options: UseAudioRecorderOptions
): UseAudioRecorderReturn {
  const {
    micStream,
    isMicOn,
    silenceConfig,
    onAudioReady,
    onSilenceDetected,
    onSpeechDetected,
    onEndOfTurn,
    onError,
  } = options

  // Merge silence config with defaults
  const config: SilenceDetectionConfig = {
    ...DEFAULT_SILENCE_CONFIG,
    ...silenceConfig,
  }

  // Store reference
  const store = useInterviewStore

  // Refs for browser APIs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  // Note: MixedAudioContext uses singleton pattern - no ref needed

  // Audio chunks accumulator
  const audioChunksRef = useRef<Blob[]>([])

  // Timers
  const silenceRAFRef = useRef<number | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const periodicFlushTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Noise floor for silence detection (updates at 60fps, not suitable for store)
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

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error)
      audioContextRef.current = null
    }
  }, [])

  const setupSilenceDetection = useCallback((): void => {
    const state = store.getState()
    if (state.conversationState !== 'listening') {
      return
    }

    state.setHasHeardSpeech(false)
    noiseFloorRmsRef.current = config.minNoiseFloor

    const stream = micStream
    const hasLiveTrack = stream?.getAudioTracks().some((t) => t.readyState === 'live')

    if (!stream || !hasLiveTrack || !isMicOn) {
      console.log('[useAudioRecorder] Skipping silence detection setup - no valid stream')
      return
    }

    try {
      console.log('[useAudioRecorder] Setting up silence detection...')

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

        if (
          !analyserRef.current ||
          !currentState.isMicOn ||
          currentState.conversationState !== 'listening'
        ) {
          return
        }

        // Only check for silence if we're actually recording
        const isRecording =
          mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'
        const hasAudioChunks = audioChunksRef.current.length > 0
        const hasSentSegments = currentState.hasSentAudioSegments

        if (!isRecording && !hasAudioChunks && !hasSentSegments) {
          silenceRAFRef.current = requestAnimationFrame(checkSilence)
          return
        }

        // Compute time-domain RMS (0..1)
        analyserRef.current.getByteTimeDomainData(timeDomain)
        let sumSq = 0
        for (let i = 0; i < timeDomain.length; i++) {
          const centered = (timeDomain[i] - 128) / 128 // [-1..1]
          sumSq += centered * centered
        }
        const rms = Math.sqrt(sumSq / timeDomain.length)

        const prevFloor = noiseFloorRmsRef.current
        const speechThreshold = Math.max(
          config.minNoiseFloor + config.speechMargin,
          prevFloor + config.speechMargin
        )
        const isSpeech = rms > speechThreshold

        // Track ambient noise floor only before speech is detected
        if (!currentState.hasHeardSpeech && !isSpeech) {
          noiseFloorRmsRef.current = Math.max(
            config.minNoiseFloor,
            prevFloor * (1 - config.noiseFloorAlpha) + rms * config.noiseFloorAlpha
          )
        }

        if (isSpeech) {
          if (!currentState.hasHeardSpeech) {
            store.getState().setHasHeardSpeech(true)
            console.log('[useAudioRecorder] Speech detected')
            onSpeechDetected?.()
          }
          silenceStartTime = null
        } else {
          // Once speech has been detected, treat "not speech" as silence
          if ((hasAudioChunks || hasSentSegments) && currentState.hasHeardSpeech) {
            if (silenceStartTime === null) {
              silenceStartTime = Date.now()
              console.log('[useAudioRecorder] Silence started')
            } else if (Date.now() - silenceStartTime > config.silenceDuration) {
              console.log('[useAudioRecorder] Silence duration exceeded')
              onSilenceDetected?.()
              silenceStartTime = null
              return // Don't continue checking
            }
          } else {
            silenceStartTime = null
          }
        }

        silenceRAFRef.current = requestAnimationFrame(checkSilence)
      }

      checkSilence()
      console.log('[useAudioRecorder] Silence detection active')
    } catch (error) {
      console.error('[useAudioRecorder] Error setting up silence detection:', error)
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [config, micStream, isMicOn, onSilenceDetected, onSpeechDetected, onError])

  // ============================================
  // Audio Flushing
  // ============================================

  const flushAudio = useCallback(async (): Promise<void> => {
    const state = store.getState()
    const isRecording =
      mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'

    if (!isRecording || audioChunksRef.current.length === 0) {
      console.log('[useAudioRecorder] Skipping flush - no data')
      return
    }

    console.log('[useAudioRecorder] Flushing audio segments...')

    const recorder = mediaRecorderRef.current!

    // Stop recorder to get complete WebM segment
    const stoppedPromise = new Promise<void>((resolve) => {
      const onStop = () => {
        recorder.removeEventListener('stop', onStop)
        setTimeout(resolve, 150)
      }
      recorder.addEventListener('stop', onStop)
    })

    try {
      recorder.stop()
    } catch (e) {
      console.error('[useAudioRecorder] Error stopping recorder:', e)
      return
    }

    await stoppedPromise

    // Capture chunks
    const chunksToProcess = [...audioChunksRef.current]
    audioChunksRef.current = []

    console.log(`[useAudioRecorder] Captured ${chunksToProcess.length} chunks`)

    // Restart recorder
    if (
      state.connectionStatus === 'connected' &&
      !state.hasNavigatedAway
    ) {
      const shouldEnableSilence = state.conversationState === 'listening'
      await startRecordingInternal(shouldEnableSilence)
    }

    // Convert and send
    try {
      if (chunksToProcess.length > 0) {
        const pcmBuffer = await convertWebMToRawPCM(chunksToProcess)
        console.log(`[useAudioRecorder] Sending ${pcmBuffer.byteLength} bytes`)
        store.getState().setHasSentAudioSegments(true)
        onAudioReady?.(pcmBuffer)
      }
    } catch (error) {
      console.error('[useAudioRecorder] Error converting audio:', error)
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [onAudioReady, onError])

  // ============================================
  // Recording Control
  // ============================================

  const startRecordingInternal = useCallback(
    async (enableSilenceDetection: boolean): Promise<void> => {
      const state = store.getState()

      if (state.connectionStatus !== 'connected') {
        console.log('[useAudioRecorder] Cannot start - not connected')
        return
      }

      if (state.hasNavigatedAway) {
        console.log('[useAudioRecorder] Cannot start - navigated away')
        return
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log('[useAudioRecorder] Already recording')
        return
      }

      let stream = micStream
      const hasLiveTrack = stream?.getAudioTracks().some((t) => t.readyState === 'live')

      if (!stream || !hasLiveTrack) {
        console.log('[useAudioRecorder] Requesting new mic stream...')
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          // Note: The new stream should be passed back via callback if needed
        } catch (error) {
          console.error('[useAudioRecorder] Failed to get mic:', error)
          onError?.(error instanceof Error ? error : new Error('Microphone unavailable'))
          return
        }
      }

      try {
        // Use singleton MixedAudioContext for consistent audio routing
        const mixedAudioCtx = MixedAudioContext.getInstance()
        const mixedStream = await mixedAudioCtx.initialize(stream, 16000)
        console.log('[useAudioRecorder] Mixed audio context initialized (singleton)')

        // Create MediaRecorder
        const mediaRecorder = new MediaRecorder(mixedStream, {
          mimeType: 'audio/webm;codecs=opus',
        })

        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []
        state.setHasSentEndOfTurn(false)
        state.setHasSentAudioSegments(false)

        // Setup periodic flush (40 seconds)
        if (periodicFlushTimerRef.current) {
          clearInterval(periodicFlushTimerRef.current)
        }
        periodicFlushTimerRef.current = setInterval(flushAudio, 40000)
        console.log('[useAudioRecorder] Started 40s periodic flush')

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data)
            const totalSize = audioChunksRef.current.reduce((sum, c) => sum + c.size, 0)
            console.log(
              `[useAudioRecorder] Chunk: ${event.data.size} bytes (${audioChunksRef.current.length} chunks, ${totalSize} total)`
            )
          }
        }

        mediaRecorder.onerror = (event) => {
          console.error('[useAudioRecorder] MediaRecorder error:', event)
          onError?.(new Error('Recording error'))
        }

        mediaRecorder.onstart = () => {
          console.log('[useAudioRecorder] Recording started')
          store.getState().setAudioRecording({ isRecording: true })
        }

        mediaRecorder.onstop = () => {
          console.log('[useAudioRecorder] Recording stopped')
          store.getState().setAudioRecording({ isRecording: false })
        }

        // Start with 100ms timeslice
        mediaRecorder.start(100)

        // Setup silence detection if requested
        if (enableSilenceDetection) {
          setupSilenceDetection()
        } else {
          stopSilenceDetection()
        }
      } catch (error) {
        console.error('[useAudioRecorder] Error starting recording:', error)
        onError?.(error instanceof Error ? error : new Error(String(error)))
      }
    },
    [micStream, flushAudio, setupSilenceDetection, stopSilenceDetection, onError]
  )

  const startRecording = useCallback(
    async (enableSilenceDetection?: boolean): Promise<void> => {
      const state = store.getState()
      const shouldEnableSilence =
        enableSilenceDetection ?? state.conversationState === 'listening'
      await startRecordingInternal(shouldEnableSilence)
    },
    [startRecordingInternal]
  )

  const stopRecording = useCallback(() => {
    console.log('[useAudioRecorder] Stopping recording...')

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (periodicFlushTimerRef.current) {
      clearInterval(periodicFlushTimerRef.current)
      periodicFlushTimerRef.current = null
    }

    stopSilenceDetection()

    // Don't destroy mixed audio context - might need it for AI audio routing
  }, [stopSilenceDetection])

  // Stop recording and clear buffered audio (e.g., when AI starts responding)
  const stopAndClearBuffer = useCallback(() => {
    console.log('[useAudioRecorder] Stopping recording and clearing buffer...')

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (periodicFlushTimerRef.current) {
      clearInterval(periodicFlushTimerRef.current)
      periodicFlushTimerRef.current = null
    }

    stopSilenceDetection()

    // Clear buffered audio - discard any recorded audio when AI starts responding
    audioChunksRef.current = []
  }, [stopSilenceDetection])

  // ============================================
  // End of Turn
  // ============================================

  const sendEndOfTurn = useCallback(async (): Promise<void> => {
    const state = store.getState()

    if (
      state.connectionStatus !== 'connected' ||
      state.isProcessing ||
      state.hasSentEndOfTurn
    ) {
      console.log('[useAudioRecorder] Skipping end of turn')
      return
    }

    const isRecording =
      mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'
    const hasAudioChunks = audioChunksRef.current.length > 0
    const hasSentSegments = state.hasSentAudioSegments

    if (!isRecording && !hasAudioChunks && !hasSentSegments) {
      console.log('[useAudioRecorder] No audio to send')
      return
    }

    console.log('[useAudioRecorder] Processing end of turn...')
    state.setIsProcessing(true)
    state.setHasSentEndOfTurn(true)
    state.setHasHeardSpeech(false)

    stopSilenceDetection()

    // Stop recording and wait for chunks
    let recordingStoppedPromise: Promise<void> = Promise.resolve()
    if (isRecording && mediaRecorderRef.current) {
      recordingStoppedPromise = new Promise((resolve) => {
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
        } catch (e) {
          recorder.removeEventListener('stop', onStop)
          resolve()
        }
      })
    }

    await recordingStoppedPromise

    // Process chunks
    const chunksToProcess = [...audioChunksRef.current]

    if (chunksToProcess.length > 0) {
      try {
        console.log(`[useAudioRecorder] Converting ${chunksToProcess.length} chunks...`)
        const pcmBuffer = await convertWebMToRawPCM(chunksToProcess)
        audioChunksRef.current = []

        console.log(`[useAudioRecorder] Sending ${pcmBuffer.byteLength} bytes`)
        onAudioReady?.(pcmBuffer)

        // Small delay before end_of_turn
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (error) {
        console.error('[useAudioRecorder] Conversion error:', error)
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
      console.log('[useAudioRecorder] No chunks and no prior segments')
      state.setHasSentEndOfTurn(false)
      state.setIsProcessing(false)
      state.setConversationState('listening')
      await startRecordingInternal(true)
      return
    }

    // Send end_of_turn message via WebSocket
    const sendSuccess = onEndOfTurn?.() ?? false
    
    if (!sendSuccess) {
      // Failed to send end_of_turn - reset state and restart recording
      console.error('[useAudioRecorder] Failed to send end_of_turn message')
      state.setHasSentEndOfTurn(false)
      state.setIsProcessing(false)
      state.setConversationState('listening')
      await startRecordingInternal(true)
      return
    }

    // Successful end_of_turn send -> thinking
    state.setConversationState('thinking')

    // Restart recording without silence detection
    const currentState = store.getState()
    if (currentState.connectionStatus === 'connected' && !currentState.hasNavigatedAway && currentState.isMicOn) {
      await startRecordingInternal(false)
    }
  }, [onAudioReady, stopSilenceDetection, startRecordingInternal, onEndOfTurn])

  // ============================================
  // Cleanup
  // ============================================

  useEffect(() => {
    return () => {
      stopRecording()
      // Note: Don't destroy MixedAudioContext singleton here - 
      // it should be destroyed when the entire interview ends
      // This allows AI audio to still be routed for recording
    }
  }, [stopRecording])

  // ============================================
  // Public API
  // ============================================

  const isRecording = useInterviewStore((s) => s.audio.isRecording)

  // Returns singleton instance if it exists
  const getMixedAudioContext = useCallback(
    () => (MixedAudioContext.hasInstance() ? MixedAudioContext.getInstance() : null),
    []
  )

  // Expose setupSilenceDetection as enableSilenceDetection for external use
  const enableSilenceDetection = setupSilenceDetection

  return {
    startRecording,
    stopRecording,
    stopAndClearBuffer,
    isRecording,
    flushAudio,
    getMixedAudioContext,
    sendEndOfTurn,
    enableSilenceDetection,
  }
}
