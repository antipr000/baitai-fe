/**
 * useAudioPlayer Hook
 *
 * Manages AI audio playback with queue management.
 * Registers controls with centralized actions for cross-module calls.
 *
 * SPEECH_COMPLETED logic:
 *   Only sends SPEECH_COMPLETED when BOTH conditions are true:
 *   1. Backend has sent RESPONSE_AUDIO_DONE (all chunks dispatched)
 *   2. Frontend has finished playing all queued audio (queue empty, nothing playing)
 *
 *   A shared checkIfFullyDone() function is called from two sites:
 *   - source.onended (when a chunk finishes playing and queue is empty)
 *   - handleResponseAudioDone (when the backend signals no more chunks)
 *   Whichever fires last triggers the send.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useInterviewStore } from '../store'
import {
  registerAudioPlayerControls,
  onAIPlaybackComplete,
  stopRecording,
} from '../store/interviewActions'

// ============================================
// Types
// ============================================

export interface UseAudioPlayerOptions {
  onPlaybackStart?: () => void
  onError?: (error: Error) => void
}

export interface UseAudioPlayerReturn {
  isPlaying: boolean
  queueLength: number
  getAnalyser: () => AnalyserNode | null
}

// ============================================
// Hook Implementation
// ============================================

export function useAudioPlayer(
  options: UseAudioPlayerOptions = {}
): UseAudioPlayerReturn {
  const { onPlaybackStart, onError } = options
  const store = useInterviewStore

  // Refs for browser APIs
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const audioQueueRef = useRef<ArrayBuffer[]>([])
  const playNextRef = useRef<(() => Promise<void>) | null>(null)
  const isPlayingRef = useRef(false)  // Local playing state (not in store to avoid re-renders)

  // Guard against sending SPEECH_COMPLETED more than once per response.
  // Reset to false in applySpeakingState() via setResponseAudioDone(false).
  const speechCompletedSentRef = useRef(false)

  // ============================================
  // checkIfFullyDone — the single decision point for SPEECH_COMPLETED
  // ============================================
  //
  // Called from two sites:
  //   1. source.onended — when a chunk finishes and no more are queued
  //   2. audioPlayerControls.checkIfFullyDone — called by the WS handler
  //      after setting responseAudioDone = true
  //
  // Only sends SPEECH_COMPLETED when ALL of:
  //   - responseAudioDone is true (backend says no more chunks)
  //   - isPlayingRef is false (no chunk currently playing)
  //   - audioQueueRef is empty (no chunks waiting)
  //   - speechCompletedSentRef is false (haven't already sent)

  const checkIfFullyDone = useCallback((): void => {
    if (speechCompletedSentRef.current) return

    const state = store.getState()
    const queueEmpty = audioQueueRef.current.length === 0
    const notPlaying = !isPlayingRef.current
    const allChunksReceived = state.responseAudioDone

    if (allChunksReceived && notPlaying && queueEmpty) {
      speechCompletedSentRef.current = true
      console.log('[AudioPlayer] All audio received and played → sending speech_completed')
      onAIPlaybackComplete()
    }
  }, [])

  // ============================================
  // Playback Logic
  // ============================================

  const playNext = useCallback(async (): Promise<void> => {
    const state = store.getState()

    // Use local ref for playing state (matches original pattern)
    if (state.hasNavigatedAway || isPlayingRef.current || audioQueueRef.current.length === 0) {
      return
    }

    isPlayingRef.current = true
    const isFirstChunk = state.conversationState !== 'speaking'

    try {
      let playbackContext: AudioContext

      // Reuse existing AudioContext or create new one
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        playbackContext = audioContextRef.current
      } else {
        audioContextRef.current = new AudioContext()
        playbackContext = audioContextRef.current
      }

      // Ensure analyser exists (create if missing)
      if (!analyserRef.current) {
        const analyser = playbackContext.createAnalyser()
        analyser.fftSize = 256
        analyserRef.current = analyser
      }

      // Only on first chunk: stop recording, notify
      // Done AFTER analyser is created so visualization has access to it
      if (isFirstChunk) {
        stopRecording()
        console.log('[AudioPlayer] Starting playback (backend already set state to speaking)')
        onPlaybackStart?.()
      }

      if (playbackContext.state === 'suspended') {
        await playbackContext.resume()
        if (store.getState().hasNavigatedAway) return
      }

      const audioData = audioQueueRef.current.shift()!
      const audioBuffer = await playbackContext.decodeAudioData(audioData.slice(0))

      if (store.getState().hasNavigatedAway) {
        return
      }

      const source = playbackContext.createBufferSource()
      source.buffer = audioBuffer
      currentSourceRef.current = source

      source.onended = () => {
        currentSourceRef.current = null
        isPlayingRef.current = false

        if (audioQueueRef.current.length > 0 && playNextRef.current) {
          // More chunks queued — keep playing
          playNextRef.current()
        } else {
          // Queue is empty and nothing playing — check if we're fully done
          checkIfFullyDone()
        }
      }

      // Connect through analyser for visualization
      if (analyserRef.current) {
        source.connect(analyserRef.current)
        analyserRef.current.connect(playbackContext.destination)
      } else {
        source.connect(playbackContext.destination)
      }
      source.start(0)
    } catch (error) {
      console.error('[AudioPlayer] Playback error:', error)
      currentSourceRef.current = null
      isPlayingRef.current = false

      onError?.(error instanceof Error ? error : new Error(String(error)))

      if (audioQueueRef.current.length > 0 && playNextRef.current) {
        playNextRef.current()
      } else {
        // Error and no more audio — check if we should send speech_completed
        checkIfFullyDone()
      }
    }
  }, [onPlaybackStart, onError, checkIfFullyDone])

  useEffect(() => {
    playNextRef.current = playNext
  }, [playNext])

  // ============================================
  // Public API
  // ============================================

  const enqueueAudio = useCallback((audioData: ArrayBuffer): void => {
    const state = store.getState()
    if (state.hasNavigatedAway) return

    if (!audioData || audioData.byteLength === 0) return

    if (audioQueueRef.current.length >= 10) {
      audioQueueRef.current.shift()
    }

    audioQueueRef.current.push(audioData)

    // Start playing if not already playing (matches original pattern)
    if (!isPlayingRef.current && playNextRef.current) {
      playNextRef.current()
    }
  }, [])

  const stopPlayback = useCallback((): void => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop()
      } catch { }
      currentSourceRef.current = null
    }
    audioQueueRef.current = []
    isPlayingRef.current = false
    // Emergency stop - don't transition state, backend controls that
  }, [])

  // Reset the guard when a new speaking turn starts.
  // Called via store subscription on responseAudioDone going to false
  // (which happens in applySpeakingState).
  useEffect(() => {
    const unsubscribe = store.subscribe(
      (state) => state.responseAudioDone,
      (done) => {
        if (!done) {
          // New response starting — reset the guard
          speechCompletedSentRef.current = false
        }
      }
    )
    return () => unsubscribe()
  }, [])

  // ============================================
  // Register Controls
  // ============================================
  const getAnalyser = useCallback((): AnalyserNode | null => {
    return analyserRef.current
  }, [])

  useEffect(() => {
    registerAudioPlayerControls({
      enqueue: enqueueAudio,
      stop: stopPlayback,
      getAnalyser,
      checkIfFullyDone,
    })

    return () => {
      registerAudioPlayerControls(null)
    }
  }, [enqueueAudio, stopPlayback, getAnalyser, checkIfFullyDone])

  // ============================================
  // Cleanup
  // ============================================
  useEffect(() => {
    return () => {
      stopPlayback()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error)
        audioContextRef.current = null
      }
    }
  }, [stopPlayback])

  // ============================================
  // Return
  // ============================================
  const isPlaying = useInterviewStore(
    (s) => s.conversationState === 'speaking'
  )

  return {
    isPlaying,
    queueLength: audioQueueRef.current.length,
    getAnalyser,
  }
}
