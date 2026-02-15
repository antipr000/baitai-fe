/**
 * Type definitions for Interview Module
 * Centralized types for state management and components
 */

import type { BackendInterviewState, OutboundMessage } from './events'

// ============================================
// Core State Types
// ============================================

/**
 * Conversation state -- set ONLY by the backend via STATE_CHANGED / STATE_SYNC events.
 * The frontend never decides the next state itself.
 *
 * Values mirror BackendInterviewState:
 * - 'idle': WebSocket connected, waiting for interview to begin
 * - 'listening': User's turn to speak (silence detection active)
 * - 'thinking': Backend processing (LLM decision, TTS, etc.)
 * - 'speaking': AI audio is streaming / playing
 * - 'artifact': User is interacting with code editor / whiteboard
 * - 'completed': Interview is over (terminal)
 */
export type ConversationState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'artifact'
  | 'completed'

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

/**
 * The type for incoming WebSocket JSON messages.
 * This is the discriminated union from events.ts.
 */
export type WebSocketTextMessage = OutboundMessage

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
  silenceDuration: 1500,
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
   * Real-time interaction state, set ONLY by the backend via STATE_CHANGED / STATE_SYNC.
   * The frontend NEVER decides the next state -- it reacts to these events.
   */
  conversationState: ConversationState
  messages: ChatMessage[]

  // Live transcript (from TRANSCRIPT_CHUNK / TRANSCRIPT_FINAL events)
  transcript: string

  // Streaming text (replaces aiStreamBufferRef, currentAiMessageIdRef, tokenQueueRef, isProcessingTokensRef)
  streamingText: StreamingTextState

  // Audio chunk tracking (replaces expectedAudioChunkRef, sentenceCompleteRef)
  expectedAudioChunk: AudioChunkInfo | null
  completedSentences: Map<number, string>

  /**
   * True when backend has sent RESPONSE_AUDIO_DONE for the current response.
   * When audio playback finishes and this is true, frontend sends SPEECH_COMPLETED.
   */
  responseAudioDone: boolean

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
  hasHeardSpeech: boolean
  hasNavigatedAway: boolean
  hasSentAudioSegments: boolean

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

  // Conversation state (set ONLY from state_changed / state_sync handlers)
  setConversationState: (state: ConversationState) => void

  // Messages
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateMessage: (id: string, text: string) => void
  clearMessages: () => void

  // Transcript
  setTranscript: (text: string) => void
  appendTranscript: (text: string) => void
  clearTranscript: () => void

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

  // Response audio tracking
  setResponseAudioDone: (done: boolean) => void

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
  setHasHeardSpeech: (heard: boolean) => void
  setHasNavigatedAway: (navigated: boolean) => void
  setHasSentAudioSegments: (sent: boolean) => void

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
