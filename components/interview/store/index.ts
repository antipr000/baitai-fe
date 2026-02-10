/**
 * Interview Store - Public API
 */

// Event Protocol Types (mirrors backend events.py)
export {
  BackendInterviewState,
  InboundEvent,
  OutboundEvent,
} from './events'

export type {
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
  PongPayload,
  OutboundMessage,
  ArtifactOpenedPayload,
  ArtifactSubmittedPayload,
} from './events'

// Types
export type {
  ConversationState,
  UploadStatus,
  ConnectionStatus,
  ChatMessage,
  WebSocketTextMessage,
  MediaType,
  MediaRecordingState,
  AudioConfig,
  AudioChunkInfo,
  SilenceDetectionConfig,
  StreamingTextState,
  InterviewState,
  InterviewActions,
  InterviewStore,
} from './types'

export { DEFAULT_AUDIO_CONFIG, DEFAULT_SILENCE_CONFIG } from './types'

// Store
export {
  useInterviewStore,
  // Selector hooks
  useConnectionStatus,
  useIsConnected,
  useError,
  useConversationState,
  useMessages,
  useIsProcessing,
  useIsAISpeaking,
  useIsAudioPlaying,
  useTranscript,
  useStreamingText,
  useCurrentStreamingMessageId,
  useAudioRecording,
  useVideoRecording,
  useScreenRecording,
  useRecordingDuration,
  // Optimized primitive selectors for nested objects
  useIsVideoRecording,
  useIsScreenRecording,
  useVideoUploadStatus,
  useScreenUploadStatus,
  // Optimized combined selectors using shallow equality
  useMediaControlsState,
  useRecordingState,
  useConversationUIState,
  // Individual media controls
  useIsMicOn,
  useIsVideoOn,
  useIsScreenSharing,
  useHasHeardSpeech,
  useHasNavigatedAway,
  useHasSentAudioSegments,
  useShowEndConfirm,
  // Utilities
  getInterviewState,
  subscribeToInterview,
} from './interviewStore'

// Centralized Actions (for cross-module communication)
export * from './interviewActions'

// Code Editor Store
export {
  useCodeEditorStore,
  useIsCodeEditorOpen,
  useCodeEditorContent,
  useCodeEditorLanguage,
} from './codeEditorStore'
