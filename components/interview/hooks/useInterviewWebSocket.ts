/**
 * useInterviewWebSocket Hook
 *
 * Manages WebSocket connection for real-time interview communication.
 * Uses Zustand store for state and centralized actions for cross-module calls.
 */

import { useEffect, useRef } from 'react'
import { useInterviewStore } from '../store'
import { WebSocketManager } from '../manager/WebSocketManager'
import {
  registerWebSocketManager,
  enqueueAudio,
  onAIResponseStart,
  stopSilenceDetection,
  stopRecording,
  stopPlayback,
  startRecording,
  stopVideoRecording,
  stopScreenRecording,
  finalizeAllMedia,
  retryMediaUploadSession,
  transitionToListening,
  transitionToSpeaking,
  onResponseStart,
  transitionToListeningOnError,
} from '../store/interviewActions'
import type { WebSocketTextMessage } from '../store/types'

// ============================================
// Types
// ============================================

export interface UseInterviewWebSocketOptions {
  sessionId: string
  templateId: string
  onInterviewEnd?: () => void
  onError?: (error: Error) => void
}

export interface UseInterviewWebSocketReturn {
  isConnected: boolean
}

// ============================================
// Hook Implementation
// ============================================

export function useInterviewWebSocket(
  options: UseInterviewWebSocketOptions
): UseInterviewWebSocketReturn {
  const { sessionId, templateId, onInterviewEnd, onError } = options
  const store = useInterviewStore
  const wsManagerRef = useRef<WebSocketManager | null>(null)

  // ============================================
  // WebSocket Connection Effect
  // ============================================

  // Ref for timeout cleanup only (not state)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const MAX_RECONNECT_ATTEMPTS = 5

  useEffect(() => {
    if (!sessionId) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    console.log('[WebSocket] Connecting to session:', sessionId)

    // Reset reconnection state on new session
    store.getState().resetReconnectionState()

    const manager = new WebSocketManager(
      { sessionId, apiUrl },
      {
        onConnect: () => {
          console.log('[WebSocket] Connected')
          const state = store.getState()

          // If this was a reconnection (attempts > 0), ensure we're in listening state
          if (state.reconnectAttempts > 0) {
            console.log('[WebSocket] Reconnection successful - resetting to listening state')
            store.getState().setConversationState('listening')
            // Also reset processing flags to be safe
            store.getState().setIsProcessing(false)
          }

          // Reset reconnection attempts on successful connection
          store.getState().setReconnectAttempts(0)
          // Status update handled by onStatusChange
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected')
          const state = store.getState()

          // Check if we should attempt to reconnect
          if (!state.isIntentionalDisconnect && state.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            const attempt = state.incrementReconnectAttempts()
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Exponential backoff: 1s, 2s, 4s, 5s...

            console.log(`[WebSocket] Connection lost unexpectedly. Attempting reconnect ${attempt}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms...`)

            state.setConnectionStatus('connecting')

            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('[WebSocket] Reconnecting now...')
              manager.connect()
            }, delay)

            // NOTE: We do NOT stop recording here to allow seamless resumption if possible,
            // or at least wait until max retries fail.
            return
          }

          if (!state.isIntentionalDisconnect) {
            console.error('[WebSocket] Max reconnection attempts reached')
            state.setError('Connection lost. Please refresh the page.')
            onError?.(new Error('WebSocket connection lost'))
          }

          // Legacy behavior: Stop recording when finally disconnected
          stopRecording()
        },
        onStatusChange: (status) => {
          const state = store.getState()
          // Don't overwrite 'connecting' status during reconnection delay
          if (status === 'disconnected' && !state.isIntentionalDisconnect && state.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            return
          }
          state.setConnectionStatus(status)
        },
        onError: (error) => {
          console.error('[WebSocket] Error:', error)
          const state = store.getState()
          // Only set user-facing error if we're not going to retry or if it's a critical error
          if (state.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            state.setError('Connection error. Please try again.')
          }
          onError?.(error instanceof Error ? error : new Error('WebSocket connection error'))
        },
        onTextMessage: handleTextMessage,
        onBinaryMessage: (data) => {
          const state = store.getState()
          if (state.hasNavigatedAway) return

          // Validate audio data
          if (!data || data.byteLength === 0) {
            console.warn('[Audio] Received empty audio data, skipping')
            return
          }

          /* May be not needed */

          // // Check if this is a streaming audio chunk (matches original handleAudioData)
          // const expectedChunk = state.expectedAudioChunk
          // if (expectedChunk) {
          //   const chunkIndex = expectedChunk.chunkIndex

          //   // Verify this matches a completed sentence for better sync
          //   const sentenceText = state.getCompletedSentence(chunkIndex)
          //   if (sentenceText && sentenceText === expectedChunk.text) {
          //     console.log(
          //       `[Audio] Received synchronized audio chunk ${chunkIndex} (${data.byteLength} bytes) for sentence: "${expectedChunk.text.substring(0, 30)}..."`
          //     )
          //     // Remove from tracking since we've received the audio
          //     state.removeCompletedSentence(chunkIndex)
          //   } else {
          //     console.log(
          //       `[Audio] Received audio chunk (out of sync) ${chunkIndex} (${data.byteLength} bytes) for: "${expectedChunk.text.substring(0, 30)}..."`
          //     )
          //   }
          //   state.setExpectedAudioChunk(null)
          // } else {
          //   // Legacy complete audio (for backward compatibility)
          //   console.log(`[Audio] Received complete audio (${data.byteLength} bytes)`)
          // }

          // Queue audio for playback
          enqueueAudio(data)
        },
      }
    )

    wsManagerRef.current = manager
    registerWebSocketManager(manager)
    manager.connect()

    return () => {
      console.log('[WebSocket] Cleanup - disconnecting')
      // Mark as intentional to prevent reconnection attempts (navigating away, unmounting, etc.)
      store.getState().setIsIntentionalDisconnect(true)

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      manager.disconnect()
      wsManagerRef.current = null
      registerWebSocketManager(null)
    }
  }, [sessionId]) // Only reconnect when sessionId changes

  // ============================================
  // Message Handler (uses store.getState() for fresh state)
  // ============================================
  function handleTextMessage(message: WebSocketTextMessage) {
    const state = store.getState()
    if (state.hasNavigatedAway) return

    console.log('[WebSocket] Text message:', message.type)

    switch (message.type) {
      case 'response.start':
        handleResponseStart(message)
        break
      // NOTE: response.text is not used by current backend (always streams)
      // case 'response.text':
      //   handleResponseText(message)
      //   break
      case 'response.text.chunk':
        handleTextChunk(message)
        break
      case 'response.sentence.complete':
        handleSentenceComplete(message)
        break
      case 'response.audio.chunk':
        handleAudioChunk(message)
        break
      case 'response.text.complete':
        handleTextComplete(message)
        break
      case 'response.wait':
        handleResponseWait(message)
        break
      case 'response.completed':
        handleResponseCompleted(message)
        break
      case 'error':
        handleError(message)
        break
      case 'media_upload.started':
      case 'media_upload.error':
      case 'media_chunk.ack':
      case 'media_chunk.error':
        handleMediaUpload(message)
        break
      // TODO: Handle real-time transcription display
      case 'transcript.chunk':
        console.log('[WebSocket] Real-time transcript:', message.text)
        // Could update UI to show what user is saying in real-time
        break
      // Keep-alive response (no action needed)
      case 'pong': // check
        break
      // Media finalization (could update UI if needed)
      case 'media_finalized':
      case 'all_media_finalized':
        console.log('[WebSocket] Media finalized:', message)
        break
    }
  }

  function handleResponseStart(message: WebSocketTextMessage) {
    const state = store.getState()

    // Use transition helper for state changes
    onResponseStart()

    // Mark response as incomplete - audio chunks are expected
    state.setIsResponseComplete(false)
    // response.start is for streaming - recording continues until AI starts speaking audio

    if (message.user_transcript && message.user_transcript !== '[Silence/Unintelligible]') {
      state.addMessage({ speaker: 'candidate', text: message.user_transcript })
    }

    // Clear previous streaming state and start new message
    state.clearStreamingState()
    state.setExpectedAudioChunk(null)
    state.clearCompletedSentences()
    state.startStreamingMessage()
  }


  // NOTE: handleResponseText is not used by current backend (always streams)
  // Kept for potential future backward compatibility
  // function handleResponseText(message: WebSocketTextMessage) {
  //   const state = store.getState()
  //   state.setIsProcessing(false)
  //   if (state.conversationState !== 'speaking') {
  //     state.setConversationState('thinking')
  //   }
  //   onAIResponseStart()
  //   state.setHasSentEndOfTurn(false)
  //   if (message.user_transcript && message.user_transcript !== '[Silence/Unintelligible]') {
  //     state.addMessage({ speaker: 'candidate', text: message.user_transcript })
  //   }
  //   if (message.text) {
  //     state.addMessage({ speaker: 'ai', text: message.text })
  //   }
  //   state.clearStreamingState()
  // }

  function handleTextChunk(message: WebSocketTextMessage) {
    const chunk = message.text || ''
    if (chunk) {
      store.getState().addTokenToQueue(chunk)
    }
  }

  function handleSentenceComplete(message: WebSocketTextMessage) {
    const state = store.getState()
    const chunkIndex = message.chunk_index ?? 0
    const sentenceText = message.text || ''
    state.addCompletedSentence(chunkIndex, sentenceText)
    console.log(`[WebSocket] Sentence ${chunkIndex} complete: "${sentenceText.substring(0, 50)}..." - expecting audio chunk`)

    // NOTE: Don't transition to speaking here - the audio player handles this 
    // when audio actually starts playing, ensuring the analyser exists first
  }

  function handleAudioChunk(message: WebSocketTextMessage) {
    const state = store.getState()
    const chunkIndex = message.chunk_index ?? 0
    const chunkText = message.text || ''
    state.setExpectedAudioChunk({ chunkIndex, text: chunkText })
    console.log(`[WebSocket] Audio chunk ${chunkIndex} metadata received`)

    // Check if this sentence was already marked as complete (Sanity check)
    const sentenceText = state.getCompletedSentence(chunkIndex)
    if (sentenceText && sentenceText === chunkText) {
      console.log(`[WebSocket] Audio chunk ${chunkIndex} matches completed sentence - ready for synchronized playback`)
    }
  }

  function handleTextComplete(message: WebSocketTextMessage) {
    console.log('[WebSocket] Text complete, waiting for token queue...')

    const waitForQueueAndFinalize = () => {
      const currentState = store.getState()
      const { tokenQueue, isProcessingTokens } = currentState.streamingText

      if (tokenQueue.length > 0 || isProcessingTokens) {
        setTimeout(waitForQueueAndFinalize, 50)
        return
      }

      // Use message.text if provided, otherwise the accumulated buffer (matches original)
      currentState.finalizeStreamingMessage(message.text)

      // NOTE: isAISpeaking is now derived, no need to set it manually

      console.log('[WebSocket] Text finalized after queue drain')
    }

    waitForQueueAndFinalize()
  }

  function handleResponseWait(message: WebSocketTextMessage) {
    // Backend sends response.wait when candidate is "still thinking"
    // This means: let user continue speaking, don't generate AI response yet
    // NOTE: Don't add partial transcript here - only add final transcript from response.start
    console.log('[WebSocket] response.wait received')
    transitionToListening()
    startRecording(true).catch(console.error)
  }

  function handleResponseCompleted(message: WebSocketTextMessage) {
    const state = store.getState()
    console.log('[WebSocket] Response completed - status:', message.status, 'next_action:', message.next_action)
    state.setIsProcessing(false)

    // Mark response as complete - audio player can now transition to listening when queue empties
    state.setIsResponseComplete(true)

    // Check if interview has completed
    const isCompleted = message.status === 'completed' || message.next_action === 'END_INTERVIEW'

    if (isCompleted) {
      console.log('[WebSocket] Interview completed - ending session')



      // Stop all recordings and playback (consistent with handleEndInterview)
      stopRecording()
      stopPlayback()
      stopVideoRecording()
      stopScreenRecording()

      // Mark as intentional to prevent reconnection attempts during cleanup
      store.getState().setIsIntentionalDisconnect(true)

      // Finalize all media uploads before closing
      finalizeAllMedia()

      // Wait a bit for finalization to complete, then close WebSocket
      setTimeout(() => {
        wsManagerRef.current?.disconnect()
      }, 1000)

      // Add completion message to conversation
      state.addMessage({
        speaker: 'ai',
        text: 'Thank you, the interview is now concluded.',
      })
      // maybe we can have an audio from the backend to play when the interview is completed

      // Mark as navigated away to prevent further processing
      state.setHasNavigatedAway(true)
      // Callback will show toast and redirect
      onInterviewEnd?.()
    }
    // No-op for non-completed: we already transition speaking -> listening when playback ends
  }

  function handleError(message: WebSocketTextMessage) {
    console.error('[WebSocket] Error:', message.message)
    transitionToListeningOnError(message.message || 'An error occurred')

    if (message.error_type === 'session') {
      store.getState().setIsIntentionalDisconnect(true)
      wsManagerRef.current?.disconnect()
    }

    onError?.(new Error(message.message || 'WebSocket error'))
  }

  function handleMediaUpload(message: WebSocketTextMessage) {
    const state = store.getState()
    const recordingType = message.recording_type

    if (message.type === 'media_upload.started' || message.type === 'media_chunk.ack') {
      if (recordingType === 'video') {
        state.setVideoRecording({ uploadStatus: 'uploading' })
      } else if (recordingType === 'screen') {
        state.setScreenRecording({ uploadStatus: 'uploading' })
      }
    } else if (message.type === 'media_upload.error') {
      // Session-level error - reset and retry after delay (matches original)
      console.error(`[WebSocket] Media upload session error for ${recordingType}:`, message.message)
      if (recordingType === 'video') {
        state.setVideoRecording({ uploadStatus: 'error' })
        retryMediaUploadSession('video')
      } else if (recordingType === 'screen') {
        state.setScreenRecording({ uploadStatus: 'error' })
        retryMediaUploadSession('screen')
      }
    } else if (message.type === 'media_chunk.error') {
      // Chunk-level error - just mark error, no retry (original behavior)
      console.error(`[WebSocket] Media chunk error for ${recordingType}:`, message.message)
      if (recordingType === 'video') {
        state.setVideoRecording({ uploadStatus: 'error' })
      } else if (recordingType === 'screen') {
        state.setScreenRecording({ uploadStatus: 'error' })
      }
    }
  }

  // ============================================
  // Return
  // ============================================
  const isConnected = useInterviewStore((s) => s.connectionStatus === 'connected')

  return { isConnected }
}
