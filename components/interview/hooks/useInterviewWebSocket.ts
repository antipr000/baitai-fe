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
  stopVideoRecording,
  stopScreenRecording,
  finalizeAllMedia,
  retryMediaUploadSession,
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
  useEffect(() => {
    if (!sessionId) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    console.log('[WebSocket] Connecting to session:', sessionId)

    const manager = new WebSocketManager(
      { sessionId, apiUrl },
      {
        onConnect: () => {
          console.log('[WebSocket] Connected')
          store.getState().setConnectionStatus('connected')
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected')
          store.getState().setConnectionStatus('disconnected')
          // Stop recording when disconnected (matches original)
          stopRecording()
        },
        onError: (error) => {
          console.error('[WebSocket] Error:', error)
          store.getState().setError('Connection error. Please try again.')
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
      case 'response.text':
        handleResponseText(message)
        break
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
    }
  }

  function handleResponseStart(message: WebSocketTextMessage) {
    const state = store.getState()
    state.setIsProcessing(false)
    state.setIsAISpeaking(true)
    if (state.conversationState !== 'speaking') {
      state.setConversationState('thinking')
    }

    // NOTE: Original does NOT stop recording here - that happens in response.text only
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

  function handleResponseText(message: WebSocketTextMessage) {
    const state = store.getState()
    state.setIsProcessing(false)
    state.setIsAISpeaking(true)
    if (state.conversationState !== 'speaking') {
      state.setConversationState('thinking')
    }

    // Stop recording and clear buffer - this is the non-streaming (legacy) case
    onAIResponseStart()
    state.setHasSentEndOfTurn(false)

    if (message.user_transcript && message.user_transcript !== '[Silence/Unintelligible]') {
      state.addMessage({ speaker: 'candidate', text: message.user_transcript })
    }

    if (message.text) {
      state.addMessage({ speaker: 'ai', text: message.text })
    }

    state.clearStreamingState()
  }

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

    // Ensure we're in speaking state when first sentence completes (matches original)
    if (chunkIndex === 0 && !state.isAISpeaking) {
      state.setIsAISpeaking(true)
      state.setConversationState('speaking')
      stopSilenceDetection()
    }
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

      // This is *text* stream completion, not necessarily audio playback completion
      // Only set isAISpeaking to false if audio is not currently playing
      // Original uses: if (!isPlayingRef.current) setIsAISpeaking(false)
      // isAISpeaking in store mirrors isPlayingRef behavior (set false between chunks)
      if (!currentState.isAISpeaking) {
        currentState.setIsAISpeaking(false)
      }

      console.log('[WebSocket] Text finalized after queue drain')
    }

    waitForQueueAndFinalize()
  }

  function handleResponseWait(message: WebSocketTextMessage) {
    const state = store.getState()
    console.log('[WebSocket] Backend processing...')
    state.setIsProcessing(true)
    state.setIsAISpeaking(false)
    if (state.conversationState !== 'speaking') {
      state.setConversationState('thinking')
    }

    if (message.user_transcript && message.user_transcript !== '[Silence/Unintelligible]') {
      state.addMessage({ speaker: 'candidate', text: message.user_transcript })
    }
  }

  function handleResponseCompleted(message: WebSocketTextMessage) {
    const state = store.getState()
    console.log('[WebSocket] Response completed - status:', message.status, 'next_action:', message.next_action)
    state.setIsProcessing(false)

    // Check if interview has completed
    const isCompleted = message.status === 'completed' || message.next_action === 'END_INTERVIEW'

    if (isCompleted) {
      console.log('[WebSocket] Interview completed - ending session')

      // Stop all recordings (matches original)
      stopRecording()
      stopVideoRecording()
      stopScreenRecording()

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


      // Callback will show toast and redirect
      onInterviewEnd?.()
    }
    // No-op for non-completed: we already transition speaking -> listening when playback ends
  }

  function handleError(message: WebSocketTextMessage) {
    const state = store.getState()
    console.error('[WebSocket] Error:', message.message)
    state.setIsProcessing(false)
    state.setConversationState('listening')
    state.setError(message.message || 'An error occurred')
    state.setHasSentEndOfTurn(false)

    if (message.error_type === 'session') {
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
