/**
 * Interview Store - Public API
 */

// Types
export type {
  ConversationState,
  UploadStatus,
  ConnectionStatus,
  ChatMessage,
  WebSocketMessageType,
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
  useHasSentEndOfTurn,
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

