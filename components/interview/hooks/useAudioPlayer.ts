/**
 * useAudioPlayer Hook
 *
 * Manages AI audio playback with queue management.
 * Registers controls with centralized actions for cross-module calls.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useInterviewStore } from '../store'
import { MixedAudioContext } from '../lib/audioUtils'
import {
  registerAudioPlayerControls,
  onAIPlaybackComplete,
  stopRecording,  // Add this import
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
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const audioQueueRef = useRef<ArrayBuffer[]>([])
  const playNextRef = useRef<(() => Promise<void>) | null>(null)
  const isPlayingRef = useRef(false)  // Local playing state (not in store to avoid re-renders)

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
    state.setIsAISpeaking(true)
    state.setConversationState('speaking')

    // Stop recording while AI is speaking (matches original)
    stopRecording()

    console.log('[AudioPlayer] Starting playback')
    onPlaybackStart?.()

    try {
      let playbackContext: AudioContext

      audioContextRef.current = new AudioContext()
      playbackContext = audioContextRef.current


      if (playbackContext.state === 'suspended') {
        await playbackContext.resume()
        if (store.getState().hasNavigatedAway) return
      }

      const audioData = audioQueueRef.current.shift()!
      const audioBuffer = await playbackContext.decodeAudioData(audioData.slice(0))

      if (store.getState().hasNavigatedAway) {
        store.getState().setIsAISpeaking(false)
        return
      }

      const source = playbackContext.createBufferSource()
      source.buffer = audioBuffer
      currentSourceRef.current = source

      source.onended = () => {
        currentSourceRef.current = null
        isPlayingRef.current = false

        if (audioQueueRef.current.length > 0 && playNextRef.current) {
          playNextRef.current()
        } else {
          // All audio finished - trigger recording restart via centralized action
          // onAIPlaybackComplete handles: conversationState, hasSentEndOfTurn, hasHeardSpeech, recording restart
          store.getState().setIsAISpeaking(false)
          console.log('[AudioPlayer] Playback complete')
          onAIPlaybackComplete()
        }
      }
      source.connect(playbackContext.destination)
      source.start(0)
    } catch (error) {
      console.error('[AudioPlayer] Playback error:', error)
      currentSourceRef.current = null
      isPlayingRef.current = false
      store.getState().setIsAISpeaking(false)

      onError?.(error instanceof Error ? error : new Error(String(error)))

      if (audioQueueRef.current.length > 0 && playNextRef.current) {
        playNextRef.current()
      } else {
        // Error and no more audio - treat as done speaking
        // onAIPlaybackComplete handles: conversationState, hasSentEndOfTurn, hasHeardSpeech, recording restart
        onAIPlaybackComplete()
      }
    }
  }, [onPlaybackStart, onError])

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
    store.getState().setIsAISpeaking(false)
  }, [])

  // ============================================
  // Register Controls
  // ============================================
  useEffect(() => {
    registerAudioPlayerControls({
      enqueue: enqueueAudio,
      stop: stopPlayback,
    })

    return () => {
      registerAudioPlayerControls(null)
    }
  }, [enqueueAudio, stopPlayback])

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
  const isPlaying = useInterviewStore((s) => s.isAISpeaking)

  return {
    isPlaying,
    queueLength: audioQueueRef.current.length,
  }
}
