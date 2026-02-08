/**
 * Type definitions for Interview Module
 * Centralized types for state management and components
 */

// ============================================
// Core State Types
// ============================================

/**
 * Conversation state machine:
 * - idle: Initial state before connection
 * - listening: User is expected to speak (silence detection active)
 * - thinking: end_of_turn sent; waiting for backend response
 * - speaking: AI audio is actively playing
 */
export type ConversationState = 'idle' | 'listening' | 'thinking' | 'speaking'

/**
 * Upload status for media
 */
export type UploadStatus = 'idle' | 'uploading' | 'complete' | 'error'

/**
 * Connection status
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// ============================================
// Message Types
// ============================================

export interface ChatMessage {
  id: string
  speaker: 'ai' | 'candidate'
  text: string
  timestamp: Date
}

// ============================================
// WebSocket Message Types
// ============================================

export type WebSocketMessageType =
  // NOTE: response.text not used by current backend (always streams)
  // | 'response.text'
  | 'response.start'
  | 'response.text.chunk'
  | 'response.text.complete'
  // NOTE: response.audio not used by current backend (uses response.audio.chunk instead)
  // | 'response.audio'
  | 'response.audio.chunk'
  | 'response.sentence.complete'
  | 'response.wait'
  | 'response.completed'
  | 'error'
  | 'transcript.chunk'  // TODO: Handle real-time transcription display
  | 'pong'
  | 'media_upload.started'
  | 'media_upload.error'
  | 'media_chunk.ack'
  | 'media_chunk.error'
  | 'media_finalized'
  | 'all_media_finalized'

export interface WebSocketTextMessage {
  type: WebSocketMessageType
  text?: string
  message?: string
  status?: string
  user_transcript?: string
  next_action?: string
  error_type?: string
  chunk_index?: number
  recording_type?: MediaType
  bytes_uploaded?: number
}

// ============================================
// Recording Types
// ============================================

export type MediaType = 'audio' | 'video' | 'screen'

export interface MediaRecordingState {
  isRecording: boolean
  uploadStatus: UploadStatus
}

// ============================================
// Audio Types
// ============================================

export interface AudioConfig {
  sampleRate: number
  channels: number
  bitsPerSample: number
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
}

export interface AudioChunkInfo {
  chunkIndex: number
  text: string
}

// ============================================
// Silence Detection Types
// ============================================

export interface SilenceDetectionConfig {
  /** ms of silence after user speech before sending end_of_turn */
  silenceDuration: number
  /** EMA smoothing for ambient noise floor */
  noiseFloorAlpha: number
  /** minimum RMS (normalized 0..1) treated as baseline noise */
  minNoiseFloor: number
  /** how much above noise floor counts as speech */
  speechMargin: number
  /** how much above noise floor still counts as silence (hysteresis) */
  silenceMargin: number
}

export const DEFAULT_SILENCE_CONFIG: SilenceDetectionConfig = {
  silenceDuration: 2000,
  noiseFloorAlpha: 0.05,
  minNoiseFloor: 0.008,
  speechMargin: 0.025,
  silenceMargin: 0.012,
}

// ============================================
// Streaming Text State
// ============================================

export interface StreamingTextState {
  /** ID of the AI message currently being streamed */
  currentMessageId: string | null
  /** Accumulated text buffer */
  buffer: string
  /** Queue of tokens waiting to be displayed */
  tokenQueue: string[]
  /** Whether the token queue is being processed */
  isProcessingTokens: boolean
}

// ============================================
// Interview Store State
// ============================================

export interface InterviewState {
  // Session info
  sessionId: string
  templateId: string

  // Connection
  connectionStatus: ConnectionStatus
  error: string | null

  // Conversation
  /**
   * Turn-taking state machine (source of truth for whose turn it is):
   * - 'idle': Initial state before connection
   * - 'listening': User's turn to speak (silence detection active)
   * - 'thinking': Processing user input, waiting for AI response
   * - 'speaking': AI audio is actively playing
   */
  conversationState: ConversationState
  messages: ChatMessage[]
  /**
   * Backend is processing user's audio (waiting for response).
   * True during 'thinking' state when no streaming has started yet.
   */
  isProcessing: boolean
  // NOTE: isAISpeaking is now derived from conversationState + streamingText.
  // Use useIsAISpeakingDerived() selector instead.

  // Streaming text (replaces aiStreamBufferRef, currentAiMessageIdRef, tokenQueueRef, isProcessingTokensRef)
  streamingText: StreamingTextState

  // Audio chunk tracking (replaces expectedAudioChunkRef, sentenceCompleteRef)
  expectedAudioChunk: AudioChunkInfo | null
  completedSentences: Map<number, string>

  // Recording states
  audio: MediaRecordingState
  video: MediaRecordingState
  screen: MediaRecordingState

  // Recording duration in seconds
  recordingDuration: number
  // Timestamp when recording started (null when not recording)
  recordingStartTime: number | null

  // Media controls
  isMicOn: boolean
  isVideoOn: boolean
  isScreenSharing: boolean

  // Flags (replaces various refs)
  hasSentEndOfTurn: boolean
  hasHeardSpeech: boolean
  hasNavigatedAway: boolean
  hasSentAudioSegments: boolean
  /**
   * True when AI response is complete (all audio chunks received).
   * Used to prevent premature transition to listening when audio queue is temporarily empty.
   */
  isResponseComplete: boolean

  // UI
  showEndConfirm: boolean

  // Reconnection
  reconnectAttempts: number
  isIntentionalDisconnect: boolean

  // Initialization flag
  isInitialized: boolean
}

// ============================================
// Interview Store Actions
// ============================================

export interface InterviewActions {
  // Initialization
  initialize: (sessionId: string, templateId: string) => void

  // Connection
  setConnectionStatus: (status: ConnectionStatus) => void
  setError: (error: string | null) => void

  // Conversation state
  setConversationState: (state: ConversationState) => void
  setIsProcessing: (processing: boolean) => void
  // NOTE: setIsAISpeaking removed - isAISpeaking is now derived

  // Messages
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateMessage: (id: string, text: string) => void
  clearMessages: () => void

  // Streaming text
  startStreamingMessage: () => string // returns new messageId
  appendToStreamingBuffer: (text: string) => void
  addTokenToQueue: (token: string) => void
  processNextToken: () => string | null // returns token or null if queue empty
  setIsProcessingTokens: (processing: boolean) => void
  finalizeStreamingMessage: (finalText?: string) => void
  clearStreamingState: () => void

  // Audio chunk tracking
  setExpectedAudioChunk: (chunk: AudioChunkInfo | null) => void
  addCompletedSentence: (chunkIndex: number, text: string) => void
  getCompletedSentence: (chunkIndex: number) => string | undefined
  removeCompletedSentence: (chunkIndex: number) => void
  clearCompletedSentences: () => void

  // Recording states
  setAudioRecording: (update: Partial<MediaRecordingState>) => void
  setVideoRecording: (update: Partial<MediaRecordingState>) => void
  setScreenRecording: (update: Partial<MediaRecordingState>) => void
  setRecordingDuration: (duration: number) => void
  setRecordingStartTime: (time: number | null) => void

  // Media controls
  setIsMicOn: (on: boolean) => void
  toggleMic: () => void
  setIsVideoOn: (on: boolean) => void
  toggleVideo: () => void
  setIsScreenSharing: (sharing: boolean) => void

  // Flags
  setHasSentEndOfTurn: (sent: boolean) => void
  setHasHeardSpeech: (heard: boolean) => void
  setHasNavigatedAway: (navigated: boolean) => void
  setHasSentAudioSegments: (sent: boolean) => void
  setIsResponseComplete: (complete: boolean) => void

  // UI
  setShowEndConfirm: (show: boolean) => void

  // Reconnection
  setReconnectAttempts: (attempts: number) => void
  incrementReconnectAttempts: () => number // returns new count
  setIsIntentionalDisconnect: (intentional: boolean) => void
  resetReconnectionState: () => void

  // Reset
  reset: () => void
}

export type InterviewStore = InterviewState & InterviewActions
