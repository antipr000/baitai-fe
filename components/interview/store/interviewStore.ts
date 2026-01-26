/**
 * Zustand Store for Interview State Management
 * 
 * This store replaces:
 * - 15 useState calls from ActiveInterview
 * - 9 state-mirror refs (isMicOnRef, isConnectedRef, conversationStateRef, etc.)
 * - 4 streaming text refs (aiStreamBufferRef, currentAiMessageIdRef, tokenQueueRef, isProcessingTokensRef)
 * - 5 flag refs (hasSentEndOfTurnRef, hasNavigatedAwayRef, hasHeardSpeechThisListeningTurnRef, etc.)
 * - 2 audio tracking refs (expectedAudioChunkRef, sentenceCompleteRef)
 * 
 * Use store.getState() in callbacks to avoid stale closure issues.
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'
import type {
  InterviewStore,
  InterviewState,
  ConversationState,
  ConnectionStatus,
  ChatMessage,
  MediaRecordingState,
  AudioChunkInfo,
  StreamingTextState,
} from './types'

// ============================================
// Initial State Factory
// ============================================

const createInitialStreamingTextState = (): StreamingTextState => ({
  currentMessageId: null,
  buffer: '',
  tokenQueue: [],
  isProcessingTokens: false,
})

const createInitialMediaState = (): MediaRecordingState => ({
  isRecording: false,
  uploadStatus: 'idle',
})

const createInitialState = (): InterviewState => ({
  // Session info
  sessionId: '',
  templateId: '',

  // Connection
  connectionStatus: 'disconnected',
  error: null,

  // Conversation
  conversationState: 'idle',
  messages: [],
  isProcessing: false,

  // Streaming text
  streamingText: createInitialStreamingTextState(),

  // Audio chunk tracking
  expectedAudioChunk: null,
  completedSentences: new Map(),  // check why used map

  // Recording states
  audio: createInitialMediaState(),
  video: createInitialMediaState(),
  screen: createInitialMediaState(),

  // Recording duration
  recordingDuration: 0,
  recordingStartTime: null,

  // Media controls
  isMicOn: true,
  isVideoOn: true,
  isScreenSharing: false,

  // Flags
  hasSentEndOfTurn: false,
  hasHeardSpeech: false,
  hasNavigatedAway: false,
  hasSentAudioSegments: false,
  isResponseComplete: true, // Start as true (no pending response)

  // UI
  showEndConfirm: false,
})

// ============================================
// Store Implementation
// ============================================

export const useInterviewStore = create<InterviewStore>()(
  subscribeWithSelector((set, get) => ({
    ...createInitialState(),

    // ----------------------------------------
    // Initialization
    // ----------------------------------------
    initialize: (sessionId: string, templateId: string) =>
      set({
        sessionId,
        templateId,
        conversationState: 'thinking',
        connectionStatus: 'disconnected',
      }),

    // ----------------------------------------
    // Connection
    // ----------------------------------------
    setConnectionStatus: (connectionStatus: ConnectionStatus) =>
      set({ connectionStatus }),

    setError: (error: string | null) => set({ error }),

    // ----------------------------------------
    // Conversation State
    // ----------------------------------------
    setConversationState: (conversationState: ConversationState) =>
      set({ conversationState }),

    setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),

    // NOTE: setIsAISpeaking removed - isAISpeaking is now derived

    // ----------------------------------------
    // Messages
    // ----------------------------------------
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) =>
      set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: `${message.speaker}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date(),
          },
        ],
      })),

    updateMessage: (id: string, text: string) =>
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === id ? { ...m, text } : m
        ),
      })),

    clearMessages: () => set({ messages: [] }),

    // ----------------------------------------
    // Streaming Text
    // ----------------------------------------
    startStreamingMessage: () => {
      const messageId = `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`
      set((state) => ({
        streamingText: {
          currentMessageId: messageId,
          buffer: '',
          tokenQueue: [],
          isProcessingTokens: false,
        },
        messages: [
          ...state.messages,
          {
            id: messageId,
            speaker: 'ai' as const,
            text: '',
            timestamp: new Date(),
          },
        ],
      }))
      return messageId
    },

    appendToStreamingBuffer: (text: string) =>
      set((state) => {
        const newBuffer = state.streamingText.buffer + text
        const messageId = state.streamingText.currentMessageId
        return {
          streamingText: {
            ...state.streamingText,
            buffer: newBuffer,
          },
          // Also update the message in the messages array
          messages: messageId
            ? state.messages.map((m) =>
              m.id === messageId ? { ...m, text: newBuffer } : m
            )
            : state.messages,
        }
      }),

    addTokenToQueue: (token: string) =>
      set((state) => ({
        streamingText: {
          ...state.streamingText,
          tokenQueue: [...state.streamingText.tokenQueue, token],
        },
      })),

    processNextToken: () => {
      let nextToken: string | null = null

      set((state) => {
        if (state.streamingText.tokenQueue.length === 0) {
          return state // No change
        }

        const [token, ...remainingTokens] = state.streamingText.tokenQueue
        nextToken = token
        const newBuffer = state.streamingText.buffer + token
        const messageId = state.streamingText.currentMessageId

        return {
          streamingText: {
            ...state.streamingText,
            buffer: newBuffer,
            tokenQueue: remainingTokens,
          },
          messages: messageId
            ? state.messages.map((m) =>
              m.id === messageId ? { ...m, text: newBuffer } : m
            )
            : state.messages,
        }
      })

      return nextToken
    },

    setIsProcessingTokens: (isProcessingTokens: boolean) =>
      set((state) => ({
        streamingText: {
          ...state.streamingText,
          isProcessingTokens,
        },
      })),

    finalizeStreamingMessage: (finalText?: string) =>
      set((state) => {
        const messageId = state.streamingText.currentMessageId
        if (!messageId) return state

        const text = finalText ?? state.streamingText.buffer
        return {
          streamingText: createInitialStreamingTextState(),
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, text } : m
          ),
        }
      }),

    clearStreamingState: () =>
      set({ streamingText: createInitialStreamingTextState() }),

    // ----------------------------------------
    // Audio Chunk Tracking
    // ----------------------------------------
    setExpectedAudioChunk: (expectedAudioChunk: AudioChunkInfo | null) =>
      set({ expectedAudioChunk }),

    addCompletedSentence: (chunkIndex: number, text: string) =>
      set((state) => {
        const newMap = new Map(state.completedSentences)
        newMap.set(chunkIndex, text)
        return { completedSentences: newMap }
      }),

    getCompletedSentence: (chunkIndex: number) => {
      return get().completedSentences.get(chunkIndex)
    },

    removeCompletedSentence: (chunkIndex: number) =>
      set((state) => {
        const newMap = new Map(state.completedSentences)
        newMap.delete(chunkIndex)
        return { completedSentences: newMap }
      }),

    clearCompletedSentences: () =>
      set({ completedSentences: new Map() }),

    // ----------------------------------------
    // Recording States
    // ----------------------------------------
    setAudioRecording: (update: Partial<MediaRecordingState>) =>
      set((state) => ({
        audio: { ...state.audio, ...update },
      })),

    setVideoRecording: (update: Partial<MediaRecordingState>) =>
      set((state) => ({
        video: { ...state.video, ...update },
      })),

    setScreenRecording: (update: Partial<MediaRecordingState>) =>
      set((state) => ({
        screen: { ...state.screen, ...update },
      })),

    setRecordingDuration: (recordingDuration: number) =>
      set({ recordingDuration }),

    setRecordingStartTime: (recordingStartTime: number | null) =>
      set({ recordingStartTime }),

    // ----------------------------------------
    // Media Controls
    // ----------------------------------------
    setIsMicOn: (isMicOn: boolean) => set({ isMicOn }),

    toggleMic: () => set((state) => ({ isMicOn: !state.isMicOn })),

    setIsVideoOn: (isVideoOn: boolean) => set({ isVideoOn }),

    toggleVideo: () => set((state) => ({ isVideoOn: !state.isVideoOn })),

    setIsScreenSharing: (isScreenSharing: boolean) => set({ isScreenSharing }),

    // ----------------------------------------
    // Flags
    // ----------------------------------------
    setHasSentEndOfTurn: (hasSentEndOfTurn: boolean) =>
      set({ hasSentEndOfTurn }),

    setHasHeardSpeech: (hasHeardSpeech: boolean) => set({ hasHeardSpeech }),

    setHasNavigatedAway: (hasNavigatedAway: boolean) =>
      set({ hasNavigatedAway }),

    setHasSentAudioSegments: (hasSentAudioSegments: boolean) =>
      set({ hasSentAudioSegments }),

    setIsResponseComplete: (isResponseComplete: boolean) =>
      set({ isResponseComplete }),

    // ----------------------------------------
    // UI
    // ----------------------------------------
    setShowEndConfirm: (showEndConfirm: boolean) => set({ showEndConfirm }),

    // ----------------------------------------
    // Reset
    // ----------------------------------------
    reset: () => set(createInitialState()),
  }))
)

// ============================================
// Selector Hooks for Optimal Re-renders
// ============================================

// Connection
export const useConnectionStatus = () =>
  useInterviewStore((s) => s.connectionStatus)
export const useIsConnected = () =>
  useInterviewStore((s) => s.connectionStatus === 'connected')
export const useError = () => useInterviewStore((s) => s.error)

// Conversation
export const useConversationState = () =>
  useInterviewStore((s) => s.conversationState)
export const useMessages = () => useInterviewStore((s) => s.messages)
export const useIsProcessing = () => useInterviewStore((s) => s.isProcessing)
export const useIsAISpeaking = () =>
  useInterviewStore(
    (s) =>
      s.conversationState === 'speaking' ||
      (s.conversationState === 'thinking' && s.streamingText.currentMessageId !== null)
  )

// Audio-only: true only when actual audio is playing (not just text streaming)
export const useIsAudioPlaying = () =>
  useInterviewStore((s) => s.conversationState === 'speaking')



// Streaming text
export const useStreamingText = () =>
  useInterviewStore((s) => s.streamingText)
export const useCurrentStreamingMessageId = () =>
  useInterviewStore((s) => s.streamingText.currentMessageId)

// Recording states
export const useAudioRecording = () => useInterviewStore((s) => s.audio)
export const useVideoRecording = () => useInterviewStore((s) => s.video)
export const useScreenRecording = () => useInterviewStore((s) => s.screen)
export const useRecordingDuration = () =>
  useInterviewStore((s) => s.recordingDuration)

// Optimized: Individual primitive selectors for nested objects (avoid object reference issues)
export const useIsVideoRecording = () => useInterviewStore((s) => s.video.isRecording)
export const useIsScreenRecording = () => useInterviewStore((s) => s.screen.isRecording)
export const useVideoUploadStatus = () => useInterviewStore((s) => s.video.uploadStatus)
export const useScreenUploadStatus = () => useInterviewStore((s) => s.screen.uploadStatus)

// Optimized: Combined selectors using shallow equality for related UI state
export const useMediaControlsState = () =>
  useInterviewStore(
    useShallow((s) => ({
      isMicOn: s.isMicOn,
      isVideoOn: s.isVideoOn,
      isScreenSharing: s.isScreenSharing,
    }))
  )

export const useRecordingState = () =>
  useInterviewStore(
    useShallow((s) => ({
      isVideoRecording: s.video.isRecording,
      isScreenRecording: s.screen.isRecording,
      videoUploadStatus: s.video.uploadStatus,
      screenUploadStatus: s.screen.uploadStatus,
      recordingDuration: s.recordingDuration,
    }))
  )

export const useConversationUIState = () =>
  useInterviewStore(
    useShallow((s) => ({
      connectionStatus: s.connectionStatus,
      conversationState: s.conversationState,
      isProcessing: s.isProcessing,
      // NOTE: isAISpeaking removed from this selector - use useIsAISpeaking() hook directly
      error: s.error,
      showEndConfirm: s.showEndConfirm,
    }))
  )

// Media controls
export const useIsMicOn = () => useInterviewStore((s) => s.isMicOn)
export const useIsVideoOn = () => useInterviewStore((s) => s.isVideoOn)
export const useIsScreenSharing = () =>
  useInterviewStore((s) => s.isScreenSharing)

// Flags
export const useHasSentEndOfTurn = () =>
  useInterviewStore((s) => s.hasSentEndOfTurn)
export const useHasHeardSpeech = () =>
  useInterviewStore((s) => s.hasHeardSpeech)
export const useHasNavigatedAway = () =>
  useInterviewStore((s) => s.hasNavigatedAway)
export const useHasSentAudioSegments = () =>
  useInterviewStore((s) => s.hasSentAudioSegments)

// UI
export const useShowEndConfirm = () =>
  useInterviewStore((s) => s.showEndConfirm)

// ============================================
// Action Getters (for use outside React components)
// ============================================

/**
 * Get current state snapshot (for use in callbacks/effects)
 * This replaces all the ref-syncing patterns like:
 *   const isMicOnRef = useRef(isMicOn)
 *   useEffect(() => { isMicOnRef.current = isMicOn }, [isMicOn])
 * 
 * Instead, just use: useInterviewStore.getState().isMicOn
 */
export const getInterviewState = () => useInterviewStore.getState()

/**
 * Subscribe to specific state changes
 * Useful for effects that need to react to state changes
 */
export const subscribeToInterview = useInterviewStore.subscribe
