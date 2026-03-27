/**
 * useInterviewWebSocket Hook
 *
 * Manages WebSocket connection for real-time interview communication.
 * Uses the new backend-driven state machine protocol:
 * - STATE_CHANGED / STATE_SYNC events drive conversationState
 * - Frontend emits user-action events (speech_completed, end_of_turn, etc.)
 * - Frontend NEVER decides the next state
 *
 * Message handlers are organized as a dispatch map (Record<OutboundEvent, handler>)
 * for easy extensibility -- adding a new event requires adding the enum value,
 * a handler function, and registering it in the map.
 */

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useInterviewStore } from '../store'
import { WebSocketManager } from '../manager/WebSocketManager'
import { OutboundEvent, BackendInterviewState } from '../store/events'
import type {
  OutboundMessage,
  StateChangedPayload,
  StateSyncPayload,
  ErrorPayload,
  TranscriptChunkPayload,
  TranscriptFinalPayload,
  ResponseTextChunkPayload,
  ResponseTextDonePayload,
  ResponseAudioChunkPayload,
  ResponseAudioDonePayload,
  InterviewEndedPayload,
  LoadArtifactPayload,
  UnloadArtifactPayload,
} from '../store/events'
import type { ConversationState } from '../store/types'
import {
  registerWebSocketManager,
  enqueueAudio,
  onStateChanged,
  stopRecording,
  stopPlayback,
  stopVideoRecording,
  stopScreenRecording,
  finalizeAllMedia,
  applyListeningState,
  checkAudioPlaybackComplete,
  sendSpeechCompletedMessage,
} from '../store/interviewActions'
import { useCodeEditorStore } from '../store/codeEditorStore'

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
// Helpers
// ============================================

/**
 * Convert BackendInterviewState enum value to ConversationState type.
 * Filters out 'disconnected' which is not a UI-renderable state.
 */
function toConversationState(backendState: BackendInterviewState): ConversationState | null {
  const mapping: Record<string, ConversationState> = {
    [BackendInterviewState.IDLE]: 'idle',
    [BackendInterviewState.SPEAKING]: 'speaking',
    [BackendInterviewState.LISTENING]: 'listening',
    [BackendInterviewState.THINKING]: 'thinking',
    [BackendInterviewState.ARTIFACT]: 'artifact',
    [BackendInterviewState.COMPLETED]: 'completed',
  }
  return mapping[backendState] ?? null
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

  // Subscribe to isInitialized to trigger effect when store is ready
  const isInitialized = useInterviewStore((s) => s.isInitialized)

  useEffect(() => {
    if (!sessionId || !isInitialized) {
      console.log('[WebSocket] Skipping connection - sessionId:', sessionId, 'isInitialized:', isInitialized)
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    console.log('[WebSocket] Connecting to session:', sessionId)

    // Reset reconnection state on new session
    store.getState().resetReconnectionState()

    const manager = new WebSocketManager(
      { sessionId, apiUrl },
      {
        onConnect: () => {
          console.log('[WebSocket] Connected')
          // Reset reconnection attempts on successful connection
          store.getState().setReconnectAttempts(0)

          // Do NOT set conversationState here.
          // Wait for STATE_SYNC (reconnection) or STATE_CHANGED (fresh connection)
          // from the backend to set the authoritative state.
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected')
          const state = store.getState()

          // Check if we should attempt to reconnect (infinite retries)
          if (!state.isIntentionalDisconnect) {
            const attempt = state.incrementReconnectAttempts()
            const delay = 5000 // Always wait 5 seconds between attempts

            console.log(`[WebSocket] Connection lost unexpectedly. Attempting reconnect (Attempt ${attempt}) in ${delay}ms...`)

            state.setConnectionStatus('connecting')
            toast.error('Connection lost. Trying to reconnect...', { id: 'connection-status' })

            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('[WebSocket] Reconnecting now...')
              manager.connect()
            }, delay)

            return
          }

        

          stopRecording()
        },
        onStatusChange: (status) => {
          const state = store.getState()
          state.setConnectionStatus(status)
        },
        onError: (error) => {
          console.error('[WebSocket] Error:', error)
          const state = store.getState()
          // We log the error but don't show a fatal overlay since we are retrying indefinitely.
          state.setError('Connection error. Retrying...')
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
  }, [sessionId, isInitialized]) // Reconnect when sessionId or isInitialized changes

  // ============================================
  // Message Handlers
  // ============================================

  function handleStateChanged(message: StateChangedPayload) {
    const newState = toConversationState(message.state)
    const previousState = toConversationState(message.previous_state)

    if (!newState) {
      console.warn('[WebSocket] Ignoring state_changed with unrenderable state:', message.state)
      return
    }

    console.log(`[WebSocket] State changed: ${previousState ?? '?'} → ${newState}`)
    onStateChanged(newState, previousState ?? 'idle', message.metadata ?? {})
  }

  function handleStateSync(message: StateSyncPayload) {
    const newState = toConversationState(message.state)
    if (!newState) {
      console.warn('[WebSocket] Ignoring state_sync with unrenderable state:', message.state)
      return
    }

    console.log(`[WebSocket] State sync: ${newState} (session_status: ${message.session_status})`)
    const currentStore = store.getState()
    const localPreviousState = currentStore.conversationState

    // 1. Run all state side-effects (onStateChanged will now see the sync accurately)
    onStateChanged(newState, localPreviousState, message.metadata ?? {})

    // 2. Check if we recovered into a stuck 'speaking' state after side effects are applied
    if (newState === 'speaking' && message.metadata?.audio_streaming_complete) {
      console.log('[WebSocket] StateSync: backend audio_streaming_complete is true -> syncing local playback status')
      
      // Tell the audio player that the backend is fully done generating this chunk.
      currentStore.setResponseAudioDone(true)

      // This native check prevents cutting off recovered audio.
      // If the queue is empty, it fires the Ack instantly.
      // If the queue is full of recovered audio, it ignores this, and the player will naturally fire the Ack when it finishes playing!
      checkAudioPlaybackComplete(true)
    }
  }

  function handleError(message: ErrorPayload) {
    console.error('[WebSocket] Error:', message.message, '(type:', message.error_type, ', fatal:', message.fatal, ')')

    const state = store.getState()
    state.setError(message.message)

    if (message.error_type === 'session' || message.fatal) {
      state.setIsIntentionalDisconnect(true)
      wsManagerRef.current?.disconnect()
    }

    onError?.(new Error(message.message || 'WebSocket error'))
  }

  function handleTranscriptChunk(message: TranscriptChunkPayload) {
    const text = message.text || ''
    if (text) {
      store.getState().setTranscript(text)
    }
  }

  function handleTranscriptFinal(message: TranscriptFinalPayload) {
    const text = message.text || ''
    if (text && text !== '[Silence/Unintelligible]') {
      store.getState().addMessage({ speaker: 'candidate', text })
    }
    store.getState().clearTranscript()
  }

  function handleResponseTextChunk(message: ResponseTextChunkPayload) {
    const chunk = message.text || ''
    if (chunk) {
      store.getState().addTokenToQueue(chunk)
    }
  }

  function handleResponseTextDone(message: ResponseTextDonePayload) {
    console.log('[WebSocket] Text complete, waiting for token queue...')

    const waitForQueueAndFinalize = () => {
      const currentState = store.getState()
      const { tokenQueue, isProcessingTokens } = currentState.streamingText

      if (tokenQueue.length > 0 || isProcessingTokens) {
        setTimeout(waitForQueueAndFinalize, 50)
        return
      }

      // Use message.text if provided, otherwise the accumulated buffer
      currentState.finalizeStreamingMessage(message.text)
      console.log('[WebSocket] Text finalized after queue drain')
    }

    waitForQueueAndFinalize()
  }

  function handleResponseAudioChunk(message: ResponseAudioChunkPayload) {
    const state = store.getState()
    const chunkIndex = message.chunk_index ?? 0
    const chunkText = message.text || ''
    state.setExpectedAudioChunk({ chunkIndex, text: chunkText })
    state.addCompletedSentence(chunkIndex, chunkText)
    console.log(`[WebSocket] Audio chunk ${chunkIndex} metadata received`)
  }

  function handleResponseAudioDone(message: ResponseAudioDonePayload) {
    console.log(`[WebSocket] Response audio done (total_chunks: ${message.total_chunks})`)
    // Mark that all audio has been sent for this response.
    store.getState().setResponseAudioDone(true)
    // Ask the audio player to check if playback is already finished.
    // If so, it sends SPEECH_COMPLETED immediately. If not, it will
    // re-check when the last chunk finishes playing.
    checkAudioPlaybackComplete()
  }

  function handleInterviewEnded(message: InterviewEndedPayload) {
    console.log('[WebSocket] Interview ended - reason:', message.reason)
    const state = store.getState()

    // Add completion message to conversation
    state.addMessage({
      speaker: 'ai',
      text: message.message || 'Thank you, the interview is now concluded.',
    })

    // Stop all recordings and playback
    stopRecording()
    stopPlayback()
    stopVideoRecording()
    stopScreenRecording()

    // Mark as intentional to prevent reconnection attempts during cleanup
    state.setIsIntentionalDisconnect(true)

    // Finalize all media uploads before closing
    finalizeAllMedia()

    // Wait a bit for finalization to complete, then close WebSocket
    setTimeout(() => {
      wsManagerRef.current?.disconnect()
    }, 1000)

    // Mark as navigated away to prevent further processing
    state.setHasNavigatedAway(true)

    // Callback will show toast and redirect
    onInterviewEnd?.()
  }

  function handlePong() {
    // No-op: keep-alive response
  }

  function handleLoadArtifact(message: LoadArtifactPayload) {
    console.log(`[WebSocket] Load artifact: ${message.artifact_type} (id: ${message.artifact_id})`)
    // Open the code editor in backend-controlled mode.
    // Do NOT send ARTIFACT_OPENED yet -- the backend is likely still in SPEAKING state
    // (LOAD_ARTIFACT arrives during the response stream). The ack will be sent
    // from applyListeningState() once the state transitions to LISTENING
    // (after speech_completed is sent and processed).
    useCodeEditorStore.getState().openFromBackend(message.artifact_id, message.artifact_type)
  }

  function handleUnloadArtifact() {
    console.log('[WebSocket] Unload artifact')
    // Close the code editor and clear artifact state
    useCodeEditorStore.getState().closeFromBackend()
  }

  // ============================================
  // Handler Dispatch Map
  // ============================================
  // Adding a new event type requires:
  // 1. Add enum value to OutboundEvent in events.ts
  // 2. Create a handler function above
  // 3. Register it in this map

  const handlerMap: Partial<Record<OutboundEvent, (message: OutboundMessage) => void>> = {
    [OutboundEvent.STATE_CHANGED]: (m) => handleStateChanged(m as StateChangedPayload),
    [OutboundEvent.STATE_SYNC]: (m) => handleStateSync(m as StateSyncPayload),
    [OutboundEvent.ERROR]: (m) => handleError(m as ErrorPayload),
    [OutboundEvent.TRANSCRIPT_CHUNK]: (m) => handleTranscriptChunk(m as TranscriptChunkPayload),
    [OutboundEvent.TRANSCRIPT_FINAL]: (m) => handleTranscriptFinal(m as TranscriptFinalPayload),
    [OutboundEvent.RESPONSE_TEXT_CHUNK]: (m) => handleResponseTextChunk(m as ResponseTextChunkPayload),
    [OutboundEvent.RESPONSE_TEXT_DONE]: (m) => handleResponseTextDone(m as ResponseTextDonePayload),
    [OutboundEvent.RESPONSE_AUDIO_CHUNK]: (m) => handleResponseAudioChunk(m as ResponseAudioChunkPayload),
    [OutboundEvent.RESPONSE_AUDIO_DONE]: (m) => handleResponseAudioDone(m as ResponseAudioDonePayload),
    [OutboundEvent.INTERVIEW_ENDED]: (m) => handleInterviewEnded(m as InterviewEndedPayload),
    [OutboundEvent.PONG]: () => handlePong(),
    [OutboundEvent.LOAD_ARTIFACT]: (m) => handleLoadArtifact(m as LoadArtifactPayload),
    [OutboundEvent.UNLOAD_ARTIFACT]: () => handleUnloadArtifact(),
  }

  // ============================================
  // Message Router
  // ============================================

  function handleTextMessage(message: OutboundMessage) {
    const state = store.getState()
    if (state.hasNavigatedAway) return

    const eventType = message.type as OutboundEvent
    console.log('[WebSocket] Text message:', eventType)

    const handler = handlerMap[eventType]
    if (handler) {
      handler(message)
    } else {
      console.warn('[WebSocket] Unknown event type:', eventType)
    }
  }

  // ============================================
  // Return
  // ============================================
  const isConnected = useInterviewStore((s) => s.connectionStatus === 'connected')

  return { isConnected }
}
