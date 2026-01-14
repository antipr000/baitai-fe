/**
 * useAudioPlayer Hook
 *
 * Manages AI audio playback with queue management.
 * Integrates with the Zustand store for state management.
 *
 * Features:
 * - Audio queue management for streaming chunks
 * - Integration with MixedAudioContext for recording AI audio
 * - Automatic state transitions (speaking → listening)
 * - Cleanup on navigation/unmount
 */

import { useEffect, useRef, useCallback } from 'react'
import { useInterviewStore } from '../store'
import { MixedAudioContext } from '../lib/audioUtils'

// ============================================
// Types
// ============================================

export interface UseAudioPlayerOptions {
  /** @deprecated No longer needed - MixedAudioContext is accessed directly as singleton */
  mixedAudioContext?: MixedAudioContext | null
  /** Called when AI finishes speaking and we should start recording */
  onPlaybackComplete?: () => void
  /** Called when playback starts */
  onPlaybackStart?: () => void
  /** Called on playback error */
  onError?: (error: Error) => void
}

export interface UseAudioPlayerReturn {
  /** Add audio data to the queue */
  enqueueAudio: (audioData: ArrayBuffer) => void
  /** Stop all playback and clear queue */
  stopPlayback: () => void
  /** Whether currently playing */
  isPlaying: boolean
  /** Number of audio chunks in queue */
  queueLength: number
}

// ============================================
// Hook Implementation
// ============================================

export function useAudioPlayer(
  options: UseAudioPlayerOptions = {}
): UseAudioPlayerReturn {
  const {
    // mixedAudioContext is deprecated - we access singleton directly
    onPlaybackComplete,
    onPlaybackStart,
    onError,
  } = options

  // Store reference
  const store = useInterviewStore

  // Refs for browser APIs (must be refs - not serializable)
  const audioContextRef = useRef<AudioContext | null>(null)
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const audioQueueRef = useRef<ArrayBuffer[]>([])

  // Ref for recursive playNext calls
  const playNextRef = useRef<(() => Promise<void>) | null>(null)

  // ============================================
  // Playback Logic
  // ============================================

  const playNext = useCallback(async (): Promise<void> => {
    const state = store.getState()

    // Don't play if navigated away, already playing, or no audio
    if (state.hasNavigatedAway || state.isAISpeaking || audioQueueRef.current.length === 0) {
      return
    }

    state.setIsAISpeaking(true)
    state.setConversationState('speaking')

    console.log('[useAudioPlayer] Starting playback')
    onPlaybackStart?.()

    try {
      // Get or create audio context
      // Prefer mixed audio context if available for recording
      // IMPORTANT: Get singleton dynamically here, not from options (which may be stale)
      const mixedAudioCtx = MixedAudioContext.hasInstance() ? MixedAudioContext.getInstance() : null
      let playbackContext: AudioContext
      const mixedCtx = mixedAudioCtx?.getAudioContext()

      if (mixedCtx && mixedCtx.state !== 'closed') {
        playbackContext = mixedCtx
      } else {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioContext()
        }
        playbackContext = audioContextRef.current
      }

      // Resume if suspended
      if (playbackContext.state === 'suspended') {
        await playbackContext.resume()
        // Check if navigated away while resuming
        if (store.getState().hasNavigatedAway) return
      }

      // Get next audio chunk
      const audioData = audioQueueRef.current.shift()!

      // Decode audio
      const audioBuffer = await playbackContext.decodeAudioData(audioData.slice(0))

      // Check if navigated away while decoding
      if (store.getState().hasNavigatedAway) {
        console.log('[useAudioPlayer] Navigated away during decode - aborting')
        store.getState().setIsAISpeaking(false)
        return
      }

      // Create source node
      const source = playbackContext.createBufferSource()
      source.buffer = audioBuffer
      currentSourceRef.current = source

      // Handle playback end
      source.onended = () => {
        currentSourceRef.current = null
        store.getState().setIsAISpeaking(false)

        console.log('[useAudioPlayer] Chunk finished, queue length:', audioQueueRef.current.length)

        // Play next chunk if available
        if (audioQueueRef.current.length > 0 && playNextRef.current) {
          console.log('[useAudioPlayer] Playing next chunk')
          playNextRef.current()
        } else {
          // All audio finished
          console.log('[useAudioPlayer] Playback complete')
          const currentState = store.getState()
          currentState.setConversationState('listening')
          currentState.setHasSentEndOfTurn(false)
          currentState.setHasHeardSpeech(false)

          onPlaybackComplete?.()
        }
      }

      // Connect to destination (speakers)
      source.connect(playbackContext.destination)

      // Also route to mixed audio context for recording if available
      const aiGainNode = mixedAudioCtx?.getAIGainNode()
      if (aiGainNode && playbackContext === mixedCtx) {
        source.connect(aiGainNode)
        console.log('[useAudioPlayer] Routed to speakers + recording mix')
      } else {
        console.log('[useAudioPlayer] Routed to speakers only')
      }

      // Start playback
      source.start(0)
    } catch (error) {
      console.error('[useAudioPlayer] Playback error:', error)
      currentSourceRef.current = null
      store.getState().setIsAISpeaking(false)

      onError?.(error instanceof Error ? error : new Error(String(error)))

      // Try next audio chunk
      if (audioQueueRef.current.length > 0 && playNextRef.current) {
        playNextRef.current()
      } else {
        // No more audio - transition to listening
        const currentState = store.getState()
        currentState.setConversationState('listening')
        currentState.setHasSentEndOfTurn(false)
        currentState.setHasHeardSpeech(false)

        onPlaybackComplete?.()
      }
    }
  }, [onPlaybackStart, onPlaybackComplete, onError])

  // Store playNext in ref for recursive calls
  useEffect(() => {
    playNextRef.current = playNext
  }, [playNext])

  // ============================================
  // Public API
  // ============================================

  const enqueueAudio = useCallback((audioData: ArrayBuffer): void => {
    const state = store.getState()

    // Don't queue if navigated away
    if (state.hasNavigatedAway) {
      console.log('[useAudioPlayer] Ignoring audio - navigated away')
      return
    }

    // Validate audio data
    if (!audioData || audioData.byteLength === 0) {
      console.warn('[useAudioPlayer] Received empty audio data')
      return
    }

    // Limit queue size to prevent memory issues
    if (audioQueueRef.current.length >= 10) {
      console.warn('[useAudioPlayer] Queue full, removing oldest chunk')
      audioQueueRef.current.shift()
    }

    console.log(`[useAudioPlayer] Enqueuing ${audioData.byteLength} bytes, queue size: ${audioQueueRef.current.length + 1}`)
    audioQueueRef.current.push(audioData)

    // Start playback if not already playing
    if (!store.getState().isAISpeaking && playNextRef.current) {
      playNextRef.current()
    }
  }, [])

  const stopPlayback = useCallback((): void => {
    console.log('[useAudioPlayer] Stopping playback')

    // Stop current source
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop()
      } catch {
        // Ignore errors (might already be stopped)
      }
      currentSourceRef.current = null
    }

    // Clear queue
    audioQueueRef.current = []

    // Update store
    store.getState().setIsAISpeaking(false)
  }, [])

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
    enqueueAudio,
    stopPlayback,
    isPlaying,
    queueLength: audioQueueRef.current.length,
  }
}
