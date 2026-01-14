/**
 * useInterviewWebSocket Hook
 *
 * Manages WebSocket connection for real-time interview communication.
 * Handles text messages, audio data, and connection lifecycle.
 */

import { useCallback, useEffect, useRef } from 'react'
import { useInterviewStore } from '../store'
import { WebSocketManager } from '../manager/WebSocketManager'
import type { ChatMessage, WebSocketTextMessage } from '../store/types'

// ============================================
// Types
// ============================================

export interface UseInterviewWebSocketOptions {
  /** Session ID for the interview */
  sessionId: string
  /** Template ID for the interview */
  templateId: string
  /** Called when audio data is received */
  onAudioData?: (data: ArrayBuffer) => void
  /** Called when interview ends */
  onInterviewEnd?: () => void
  /** Called when recording should stop (AI starts responding) */
  onStopRecording?: () => void
  /** Called when AI starts speaking (before audio arrives) */
  onAISpeakingStart?: () => void
  /** Called on connection error */
  onError?: (error: Error) => void
}

export interface UseInterviewWebSocketReturn {
  /** Whether connected to WebSocket */
  isConnected: boolean
  /** Send audio data */
  sendAudio: (data: ArrayBuffer) => void
  /** Send end of turn signal - returns true if successful */
  sendEndOfTurn: () => boolean
  /** Send text message */
  sendText: (message: string) => void
  /** Disconnect from WebSocket */
  disconnect: () => void
}

// ============================================
// Hook Implementation
// ============================================

export function useInterviewWebSocket(
  options: UseInterviewWebSocketOptions
): UseInterviewWebSocketReturn {
  const {
    sessionId,
    templateId,
    onAudioData,
    onInterviewEnd,
    onStopRecording,
    onAISpeakingStart,
    onError,
  } = options

  const store = useInterviewStore
  const wsManagerRef = useRef<WebSocketManager | null>(null)

  // ============================================
  // Message Handlers
  // ============================================

  const handleTextMessage = useCallback(
    (message: WebSocketTextMessage) => {
      const state = store.getState()

      // Don't process messages if navigated away
      if (state.hasNavigatedAway) return

      console.log('[WebSocket] Text message:', message.type)

      if (message.type === 'response.start') {
        // Start of streaming AI response - stop user recording
        console.log('[WebSocket] AI starting response')
        state.setIsProcessing(false)
        state.setIsAISpeaking(true)
        if (state.conversationState !== 'speaking') {
          state.setConversationState('thinking')
        }
        
        onStopRecording?.()

        // Add user message if transcript available
        if (message.user_transcript && message.user_transcript !== '[Silence/Unintelligible]') {
          state.addMessage({
            speaker: 'candidate',
            text: message.user_transcript,
          })
        }

        // Clear previous streaming state and start new message
        state.clearStreamingState()
        state.setExpectedAudioChunk(null)
        state.clearCompletedSentences()
        state.startStreamingMessage()
      } else if (message.type === 'response.text') {
        // Full AI response (legacy/non-streaming format)
        console.log('[WebSocket] AI response text received')
        state.setIsProcessing(false)
        state.setIsAISpeaking(true)
        if (state.conversationState !== 'speaking') {
          state.setConversationState('thinking')
        }
        
        onAISpeakingStart?.()
        onStopRecording?.()
        
        // Reset end of turn flag (audio buffers cleared by onStopRecording)
        state.setHasSentEndOfTurn(false)

        // Add user message if transcript available
        if (message.user_transcript && message.user_transcript !== '[Silence/Unintelligible]') {
          state.addMessage({
            speaker: 'candidate',
            text: message.user_transcript,
          })
        }

        // Add AI message directly (not streaming)
        if (message.text) {
          state.addMessage({
            speaker: 'ai',
            text: message.text,
          })
        }
        
        // Clear any streaming state
        state.clearStreamingState()
      } else if (message.type === 'response.text.chunk') {
        // Streaming text chunk - add to token queue for smooth display
        const chunk = message.text || ''
        if (chunk) {
          state.addTokenToQueue(chunk)
        }
      } else if (message.type === 'response.audio') {
        // Audio is starting - this means AI is speaking
        console.log('[WebSocket] Audio response starting')
        state.setConversationState('speaking')
      } else if (message.type === 'response.sentence.complete') {
        // Sentence complete signal - text is ready, audio will follow
        const chunkIndex = message.chunk_index ?? 0
        const sentenceText = message.text || ''
        state.addCompletedSentence(chunkIndex, sentenceText)
        console.log(`[WebSocket] Sentence ${chunkIndex} complete: "${sentenceText.substring(0, 50)}..." - expecting audio chunk`)

        // Ensure we're in speaking state when first sentence completes
        if (chunkIndex === 0 && !state.isAISpeaking) {
          state.setIsAISpeaking(true)
          state.setConversationState('speaking')
        }
      } else if (message.type === 'response.audio.chunk') {
        // Audio chunk metadata received - expect binary audio data next
        const chunkIndex = message.chunk_index ?? 0
        const chunkText = message.text || ''
        state.setExpectedAudioChunk({ chunkIndex, text: chunkText })
        console.log(`[WebSocket] Audio chunk ${chunkIndex} metadata received, expecting binary data for: "${chunkText.substring(0, 30)}..."`)

        // Check if this sentence was already marked as complete
        const sentenceText = state.getCompletedSentence(chunkIndex)
        if (sentenceText && sentenceText === chunkText) {
          console.log(`[WebSocket] Audio chunk ${chunkIndex} matches completed sentence - ready for synchronized playback`)
        }
      } else if (message.type === 'response.text.complete') {
        // Text streaming complete - wait for token queue to finish then finalize
        console.log('[WebSocket] Text complete, waiting for token queue...')
        
        // Wait for token queue to be processed before finalizing
        const waitForQueueAndFinalize = () => {
          const currentState = store.getState()
          const { tokenQueue, isProcessingTokens } = currentState.streamingText
          
          if (tokenQueue.length > 0 || isProcessingTokens) {
            // Still processing tokens, wait and check again
            setTimeout(waitForQueueAndFinalize, 50)
            return
          }
          
          // Queue is empty and not processing, finalize
          currentState.finalizeStreamingMessage()
          console.log('[WebSocket] Text finalized after queue drain')
        }
        
        waitForQueueAndFinalize()
      } else if (message.type === 'response.wait') {
        // Backend is processing user's speech
        console.log('[WebSocket] Backend processing...')
        state.setIsProcessing(true)
        state.setIsAISpeaking(false)
        if (state.conversationState !== 'speaking') {
          state.setConversationState('thinking')
        }

        // Add user message if transcript available
        if (message.user_transcript && message.user_transcript !== '[Silence/Unintelligible]') {
          state.addMessage({
            speaker: 'candidate',
            text: message.user_transcript,
          })
          console.log('[WebSocket] Added user message during wait:', message.user_transcript)
        }
      } else if (message.type === 'response.completed') {
        // Interview completed
        console.log('[WebSocket] Interview completed')

        // Add completion message
        state.addMessage({
          speaker: 'ai',
          text: 'Thank you, the interview is now concluded.',
        })

        onInterviewEnd?.()
      } else if (message.type === 'error') {
        // Error from backend
        console.error('[WebSocket] Error:', message.message)
        state.setIsProcessing(false)
        state.setConversationState('listening')
        state.setError(message.message || 'An error occurred')
        state.setHasSentEndOfTurn(false)

        // Handle session errors by closing connection
        if (message.error_type === 'session') {
          console.error('[WebSocket] Session error, closing connection')
          wsManagerRef.current?.disconnect()
        }

        onError?.(new Error(message.message || 'WebSocket error'))
      } else if (message.type === 'media_upload.started') {
        // Media upload session started
        const recordingType = message.recording_type
        if (recordingType === 'video') {
          state.setVideoRecording({ uploadStatus: 'uploading' })
        } else if (recordingType === 'screen') {
          state.setScreenRecording({ uploadStatus: 'uploading' })
        }
      } else if (message.type === 'media_upload.error') {
        // Media upload error
        const recordingType = message.recording_type
        console.error(`[WebSocket] Media upload error for ${recordingType}:`, message.message)
        if (recordingType === 'video') {
          state.setVideoRecording({ uploadStatus: 'error' })
        } else if (recordingType === 'screen') {
          state.setScreenRecording({ uploadStatus: 'error' })
        }
      } else if (message.type === 'media_chunk.ack') {
        // Media chunk acknowledged
        const recordingType = message.recording_type
        if (recordingType === 'video') {
          state.setVideoRecording({ uploadStatus: 'uploading' })
        } else if (recordingType === 'screen') {
          state.setScreenRecording({ uploadStatus: 'uploading' })
        }
      } else if (message.type === 'media_chunk.error') {
        // Media chunk error
        const recordingType = message.recording_type
        console.error(`[WebSocket] Media chunk error for ${recordingType}:`, message.message)
        if (recordingType === 'video') {
          state.setVideoRecording({ uploadStatus: 'error' })
        } else if (recordingType === 'screen') {
          state.setScreenRecording({ uploadStatus: 'error' })
        }
      }
    },
    [onStopRecording, onAISpeakingStart, onInterviewEnd, onError]
  )

  const handleAudioData = useCallback(
    (data: ArrayBuffer) => {
      const state = store.getState()
      if (state.hasNavigatedAway) return

      // Forward to audio player
      onAudioData?.(data)
    },
    [onAudioData]
  )

  const handleConnect = useCallback(() => {
    console.log('[WebSocket] Connected')
    store.getState().setConnectionStatus('connected')
  }, [])

  const handleDisconnect = useCallback(() => {
    console.log('[WebSocket] Disconnected')
    store.getState().setConnectionStatus('disconnected')
  }, [])

  const handleError = useCallback(
    (error: Event | Error) => {
      console.error('[WebSocket] Error:', error)
      store.getState().setError('Connection error. Please try again.')
      onError?.(error instanceof Error ? error : new Error('WebSocket connection error'))
    },
    [onError]
  )

  // ============================================
  // WebSocket Connection
  // ============================================

  useEffect(() => {
    if (!sessionId) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'

    console.log('[WebSocket] Connecting to session:', sessionId)

    const manager = new WebSocketManager(
      {
        sessionId,
        apiUrl,
      },
      {
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        onError: handleError,
        onTextMessage: handleTextMessage,
        onBinaryMessage: handleAudioData,
      }
    )

    wsManagerRef.current = manager
    manager.connect()

    return () => {
      console.log('[WebSocket] Cleanup - disconnecting')
      manager.disconnect()
      wsManagerRef.current = null
    }
    // Only reconnect when sessionId changes - handlers use store.getState() for fresh state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  // ============================================
  // Public API
  // ============================================

  const sendAudio = useCallback((data: ArrayBuffer) => {
    wsManagerRef.current?.sendAudio(data)
  }, [])

  const sendEndOfTurn = useCallback((): boolean => {
    const manager = wsManagerRef.current
    if (!manager) {
      console.error('[WebSocket] Cannot send end_of_turn - no connection')
      return false
    }
    
    return manager.sendEndOfTurn()
  }, [])

  const sendText = useCallback((message: string) => {
    wsManagerRef.current?.send(message)
  }, [])

  const disconnect = useCallback(() => {
    wsManagerRef.current?.disconnect()
  }, [])

  const isConnected = useInterviewStore((s) => s.connectionStatus === 'connected')

  return {
    isConnected,
    sendAudio,
    sendEndOfTurn,
    sendText,
    disconnect,
  }
}

