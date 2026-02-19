/**
 * useAudioRecorder Hook
 *
 * Manages microphone audio recording with silence detection.
 * Registers controls with centralized actions for cross-module calls.
 *
 * KEY CHANGE: sendEndOfTurn no longer transitions state locally.
 * It sends the end_of_turn event to the backend. The backend responds with
 * STATE_CHANGED(thinking) which triggers applyThinkingState via onStateChanged.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useInterviewStore } from '../store'
import { convertWebMToRawPCM, MixedAudioContext } from '../lib/audioUtils'
import {
  registerAudioRecorderControls,
  sendAudio,
  sendEndOfTurnMessage,
  stopSilenceDetection as stopSilenceDetectionAction,
} from '../store/interviewActions'
import { DEFAULT_SILENCE_CONFIG, ARTIFACT_SILENCE_CONFIG } from '../store/types'
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

export function useAudioRecorder(
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

  // Refs for artifact mode functions (to break circular dependencies)
  const setupSpeechOnsetDetectorRef = useRef<(() => void) | null>(null)
  const flushAudioForArtifactRef = useRef<(() => Promise<void>) | null>(null)
  const setupSilenceDetectionForArtifactRef = useRef<(() => void) | null>(null)
  const startRecordingInternalForArtifactRef = useRef<(() => Promise<void>) | null>(null)
  const sendEndOfTurnInternalRef = useRef<(() => Promise<void>) | null>(null)

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
    analyserRef.current = null
    // NOTE: AudioContext is NOT closed here -- it is reused by setupSilenceDetection
    // to avoid expensive recreation. Cleanup on unmount handles closing it.
  }, [])

  const setupSilenceDetection = useCallback(() => {
    const state = store.getState()
    if (state.conversationState !== 'listening' && state.conversationState !== 'artifact') return

    // NOTE: hasHeardSpeech is NOT reset here. It is reset in applyListeningState()
    // at the start of each new turn. This prevents periodic flushAudio restarts
    // from clearing the speech flag mid-turn.
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

        // Only truly stop when analyser is nulled (via stopSilenceDetection)
        if (!analyserRef.current) {
          return
        }

        // If mic is off or state doesn't support audio capture, keep the loop
        // alive but skip analysis. This prevents the loop from dying permanently
        // on transient state changes (e.g., brief state sync flickers).
        // Both 'listening' and 'artifact' states support audio capture with
        // silence detection. In 'artifact' state, the user is coding but can
        // speak to ask questions -- speech-then-silence triggers end_of_turn.
        const supportsAudioCapture =
          currentState.conversationState === 'listening' ||
          currentState.conversationState === 'artifact'
        if (!currentState.isMicOn || !supportsAudioCapture) {
          silenceRAFRef.current = requestAnimationFrame(checkSilence)
          return
        }

        // NOTE: The audio-data gate (!isRecording && !hasAudioChunks && !hasSentSegments)
        // has been removed. The silence timer now runs purely based on RMS analysis
        // regardless of recorder state. This prevents the timer from stalling during
        // brief recorder restart gaps (e.g., periodic flushAudio). The sendEndOfTurnInternal
        // function already guards against sending when there is no audio to send.

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
          if (currentState.hasHeardSpeech) {
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
  // Artifact Mode Silence Detection (1.2s timeout)
  // ============================================
  //
  // Similar to setupSilenceDetection but uses ARTIFACT_SILENCE_CONFIG
  // with a shorter 1.2s silence duration. Used after speech is detected
  // in artifact mode.

  const setupSilenceDetectionForArtifact = useCallback(() => {
    const state = store.getState()
    if (state.conversationState !== 'artifact') return

    const artifactConfig = ARTIFACT_SILENCE_CONFIG

    const stream = micStream
    const hasLiveTrack = stream?.getAudioTracks().some((t) => t.readyState === 'live')

    if (!stream || !hasLiveTrack || !state.isMicOn) {
      console.log('[AudioRecorder] Skipping artifact silence detection - no valid stream')
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

        // Only truly stop when analyser is nulled (via stopSilenceDetection)
        if (!analyserRef.current) {
          return
        }

        // Only run in artifact state with mic on
        if (!currentState.isMicOn || currentState.conversationState !== 'artifact') {
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
          artifactConfig.minNoiseFloor + artifactConfig.speechMargin,
          prevFloor + artifactConfig.speechMargin
        )
        const isSpeech = rms > speechThreshold

        if (isSpeech) {
          // User is speaking - reset silence timer
          silenceStartTime = null
        } else {
          // User stopped speaking - start/check silence timer
          if (silenceStartTime === null) {
            silenceStartTime = Date.now()
            console.log('[AudioRecorder] Artifact mode: silence started, waiting 1.2s')
          } else if (Date.now() - silenceStartTime > artifactConfig.silenceDuration) {
            console.log('[AudioRecorder] Artifact mode: 1.2s silence exceeded, sending end_of_turn')
            // Use ref to call sendEndOfTurnInternal (breaks circular dependency)
            sendEndOfTurnInternalRef.current?.()
            silenceStartTime = null
            return
          }
        }

        silenceRAFRef.current = requestAnimationFrame(checkSilence)
      }

      checkSilence()
      console.log('[AudioRecorder] Artifact silence detection active (1.2s timeout)')
    } catch (error) {
      console.error('[AudioRecorder] Error setting up artifact silence detection:', error)
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [micStream, onError])

  // ============================================
  // Artifact Mode Audio Flush (immediate streaming)
  // ============================================
  //
  // Flushes accumulated audio immediately when speech is detected
  // in artifact mode, and sets up a faster periodic flush (2s)
  // to stream audio in near real-time while user is speaking.

  const flushAudioForArtifact = useCallback(async (): Promise<void> => {
    const isRecording = mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'

    if (!isRecording) {
      return
    }

    console.log('[AudioRecorder] Artifact mode: flushing audio on speech detection...')
    const recorder = mediaRecorderRef.current

    if (!recorder) {
      return
    }

    // Stop current recorder to get chunks
    const stoppedPromise = new Promise<void>((resolve) => {
      const onStop = () => {
        recorder.removeEventListener('stop', onStop)
        setTimeout(resolve, 100)
      }
      recorder.addEventListener('stop', onStop)
    })

    try {
      recorder.stop()
    } catch {
      console.error('[AudioRecorder] Error stopping media recorder for artifact flush')
      return
    }

    await stoppedPromise

    const chunksToProcess = [...audioChunksRef.current]
    audioChunksRef.current = []

    // Send audio if we have chunks
    if (chunksToProcess.length > 0) {
      try {
        const pcmBuffer = await convertWebMToRawPCM(chunksToProcess)
        store.getState().setHasSentAudioSegments(true)
        sendAudio(pcmBuffer)
        console.log('[AudioRecorder] Artifact mode: streamed audio to backend')
      } catch (error) {
        console.error('[AudioRecorder] Error converting audio for artifact flush:', error)
        onError?.(error instanceof Error ? error : new Error(String(error)))
      }
    }

    // Restart recorder with faster periodic flush (2s) for artifact mode
    const currentState = store.getState()
    if (currentState.connectionStatus === 'connected' &&
      !currentState.hasNavigatedAway &&
      currentState.conversationState === 'artifact') {
      // Use ref to call startRecordingInternalForArtifact (breaks circular dependency)
      await startRecordingInternalForArtifactRef.current?.()
    }
  }, [onError])

  // ============================================
  // Artifact Mode Recording (faster flush interval)
  // ============================================

  const startRecordingInternalForArtifact = useCallback(async (): Promise<void> => {
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

      // Use faster 2s flush interval for artifact mode (streaming while speaking)
      if (periodicFlushTimerRef.current) {
        clearInterval(periodicFlushTimerRef.current)
      }
      // Use ref to call flushAudioForArtifact (breaks circular dependency)
      periodicFlushTimerRef.current = setInterval(() => {
        flushAudioForArtifactRef.current?.()
      }, 2000)

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
      // Note: silence detection is handled separately by setupSilenceDetectionForArtifact
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [micStream, onError])

  // ============================================
  // Speech Onset Detector (Artifact Mode Only)
  // ============================================
  //
  // Lightweight rAF loop that ONLY watches for speech onset.
  // No silence timer, no end_of_turn triggering.
  // When speech is detected, it stops itself and activates
  // full silence detection (setupSilenceDetection).
  //
  // Used in artifact state where silence is the default (user is typing)
  // and we only want to engage silence detection when the user speaks.

  const setupSpeechOnsetDetector = useCallback(() => {
    const state = store.getState()
    if (state.conversationState !== 'artifact') return

    const artifactConfig = ARTIFACT_SILENCE_CONFIG
    noiseFloorRmsRef.current = artifactConfig.minNoiseFloor

    const stream = micStream
    const hasLiveTrack = stream?.getAudioTracks().some((t) => t.readyState === 'live')

    if (!stream || !hasLiveTrack || !state.isMicOn) {
      console.log('[AudioRecorder] Skipping speech onset detector - no valid stream')
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

      const checkOnset = () => {
        const currentState = store.getState()

        // Stop when analyser is nulled (via stopSilenceDetection)
        if (!analyserRef.current) {
          return
        }

        // Only run in artifact state with mic on
        if (!currentState.isMicOn || currentState.conversationState !== 'artifact') {
          silenceRAFRef.current = requestAnimationFrame(checkOnset)
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
          artifactConfig.minNoiseFloor + artifactConfig.speechMargin,
          prevFloor + artifactConfig.speechMargin
        )
        const isSpeech = rms > speechThreshold

        if (!isSpeech) {
          // Update noise floor while no speech
          noiseFloorRmsRef.current = Math.max(
            artifactConfig.minNoiseFloor,
            prevFloor * (1 - artifactConfig.noiseFloorAlpha) + rms * artifactConfig.noiseFloorAlpha
          )
          silenceRAFRef.current = requestAnimationFrame(checkOnset)
        } else {
          // Speech detected! Set the flag, flush audio immediately, and switch to silence detection.
          store.getState().setHasHeardSpeech(true)
          console.log('[AudioRecorder] Speech onset detected in artifact mode → flushing audio and activating silence detection')
          onSpeechDetected?.()

          // Immediately flush any accumulated audio to stream it to backend
          // Use ref to call flushAudioForArtifact (breaks circular dependency)
          flushAudioForArtifactRef.current?.()

          // Stop this onset loop (null analyser to break it, then set up full detection)
          analyserRef.current = null
          if (silenceRAFRef.current !== null) {
            cancelAnimationFrame(silenceRAFRef.current)
            silenceRAFRef.current = null
          }

          // Activate full silence detection with artifact-specific config (1.2s)
          // Use ref to call setupSilenceDetectionForArtifact (breaks circular dependency)
          setupSilenceDetectionForArtifactRef.current?.()
        }
      }

      checkOnset()
      console.log('[AudioRecorder] Speech onset detector active (artifact mode)')
    } catch (error) {
      console.error('[AudioRecorder] Error setting up speech onset detector:', error)
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }, [micStream, onSpeechDetected, onError])

  // ============================================
  // Audio Flushing
  // ============================================

  const flushAudio = useCallback(async (): Promise<void> => {
    const isRecording = mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'

    if (!isRecording || audioChunksRef.current.length === 0) {
      return
    }

    console.log('[AudioRecorder] Flushing audio segments...')
    const recorder = mediaRecorderRef.current

    if (!recorder) {
      console.error('[AudioRecorder] No media recorder found')
      return
    }

    const stoppedPromise = new Promise<void>((resolve) => {
      const onStop = () => {
        recorder.removeEventListener('stop', onStop)
        setTimeout(resolve, 150)
      }
      recorder.addEventListener('stop', onStop)
    })

    try {
      recorder.stop() // happens async in background
    } catch {
      console.error('[AudioRecorder] Error stopping media recorder')
      return
    }

    await stoppedPromise

    const chunksToProcess = [...audioChunksRef.current]
    audioChunksRef.current = []

    // Get fresh state to determine if we should send and restart
    const currentState = store.getState()
    const canSendAudio =
      currentState.conversationState === 'listening' ||
      currentState.conversationState === 'artifact'

    // Send audio to backend in 'listening' or 'artifact' states
    if (canSendAudio && chunksToProcess.length > 0) {
      try {
        const pcmBuffer = await convertWebMToRawPCM(chunksToProcess)
        store.getState().setHasSentAudioSegments(true)
        sendAudio(pcmBuffer)
      } catch (error) {
        console.error('[AudioRecorder] Error converting audio:', error)
        onError?.(error instanceof Error ? error : new Error(String(error)))
      }
    } else if (!canSendAudio) {
      console.log('[AudioRecorder] Discarding audio chunks (AI is speaking/thinking)')
    }

    // Restart recorder if still in a state that captures audio
    const stateAfterSend = store.getState()
    if (stateAfterSend.connectionStatus === 'connected' &&
      !stateAfterSend.hasNavigatedAway &&
      (stateAfterSend.conversationState === 'listening' || stateAfterSend.conversationState === 'artifact')) {
      // In listening mode: restart with silence detection
      // In artifact mode: restart without (speech onset detector handles it separately)
      const enableSilence = stateAfterSend.conversationState === 'listening'
      await startRecordingInternal(enableSilence)
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
      // NOTE: hasSentAudioSegments is NOT reset here. It is reset in applyListeningState()
      // at the start of each new turn. This prevents periodic flushAudio restarts
      // from clearing the sent-segments flag mid-turn (backend already has previous audio).

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
  }, [stopSilenceDetection])

  // ============================================
  // End of Turn
  // ============================================

  /**
   * Process end of turn: flush remaining audio, send it, then send end_of_turn event.
   * Does NOT transition state locally -- the backend will respond with
   * STATE_CHANGED(thinking) via the WebSocket.
   */
  const sendEndOfTurnInternal = useCallback(async (): Promise<void> => {
    const state = store.getState()

    // Guard: only send when connected and in a state that accepts end_of_turn
    if (state.connectionStatus !== 'connected' ||
      (state.conversationState !== 'listening' && state.conversationState !== 'artifact')) {
      return
    }

    const wasInArtifactState = state.conversationState === 'artifact'

    const isRecording = mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive'
    const hasAudioChunks = audioChunksRef.current.length > 0
    const hasSentSegments = state.hasSentAudioSegments

    if (!isRecording && !hasAudioChunks && !hasSentSegments) {
      return
    }

    console.log('[AudioRecorder] Processing end of turn...')
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
          // No audio was ever sent; don't send end_of_turn
          // Backend will stay in listening state; restart recording
          await startRecordingInternal(true)
          return
        }
      }
    } else if (!hasSentSegments) {
      // No audio chunks and no segments sent; restart recording
      await startRecordingInternal(true)
      return
    }

    // Send end_of_turn via WebSocket
    // Backend will handle the LISTENING -> THINKING transition
    const sendSuccess = sendEndOfTurnMessage()

    if (!sendSuccess) {
      // Failed to send; restart recording so user can try again
      await startRecordingInternal(true)
      return
    }

    // Successfully sent end_of_turn. The backend will respond with
    // STATE_CHANGED(thinking). Do NOT transition state locally.
    console.log('[AudioRecorder] end_of_turn sent, waiting for backend state change')

    // If we were in artifact mode, reset hasHeardSpeech and restart recording
    // with speech onset detector (waiting for next speech)
    if (wasInArtifactState) {
      // Reset speech flag so we can detect next speech
      store.getState().setHasHeardSpeech(false)
      store.getState().setHasSentAudioSegments(false)

      // Wait a bit for the end_of_turn to be processed
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check if we're still in artifact mode (backend might have changed state)
      const currentState = store.getState()
      if (currentState.conversationState === 'artifact' &&
        currentState.connectionStatus === 'connected' &&
        currentState.isMicOn &&
        !currentState.hasNavigatedAway) {
        console.log('[AudioRecorder] Artifact mode: restarting recording with speech onset detector')
        // Restart recording without silence detection
        await startRecordingInternal(false)
        // Re-enable speech onset detector to wait for next speech
        setupSpeechOnsetDetectorRef.current?.()
      }
    }
  }, [stopSilenceDetection, startRecordingInternal])

  // ============================================
  // Update Refs for Artifact Mode Functions
  // ============================================
  // These refs allow the artifact mode functions to call each other
  // without creating circular dependencies in useCallback
  useEffect(() => {
    setupSpeechOnsetDetectorRef.current = setupSpeechOnsetDetector
    flushAudioForArtifactRef.current = flushAudioForArtifact
    setupSilenceDetectionForArtifactRef.current = setupSilenceDetectionForArtifact
    startRecordingInternalForArtifactRef.current = startRecordingInternalForArtifact
    sendEndOfTurnInternalRef.current = sendEndOfTurnInternal
  }, [setupSpeechOnsetDetector, flushAudioForArtifact, setupSilenceDetectionForArtifact, startRecordingInternalForArtifact, sendEndOfTurnInternal])

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
      enableSpeechOnsetDetector: setupSpeechOnsetDetector,
    })

    return () => {
      registerAudioRecorderControls(null)
    }
  }, [startRecording, stopRecording, stopAndClearBuffer, flushAudio, sendEndOfTurnInternal, setupSilenceDetection, stopSilenceDetection, setupSpeechOnsetDetector])

  // ============================================
  // Cleanup
  // ============================================
  useEffect(() => {
    return () => {
      stopRecording()
      // Close the AudioContext on unmount (not closed in stopSilenceDetection
      // to allow fast restart during the session)
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error)
        audioContextRef.current = null
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
