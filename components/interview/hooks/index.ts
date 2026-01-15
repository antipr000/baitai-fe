/**
 * Interview Hooks - Public API
 */

export {
  useInterviewWebSocket,
  type UseInterviewWebSocketOptions,
  type UseInterviewWebSocketReturn,
} from './useInterviewWebSocket'

export {
  useAudioRecorder,
  type UseAudioRecorderOptions,
  type UseAudioRecorderReturn,
} from './useAudioRecorder'

export {
  useAudioPlayer,
  type UseAudioPlayerOptions,
  type UseAudioPlayerReturn,
} from './useAudioPlayer'

export {
  useMediaRecording,
  type UseMediaRecordingOptions,
  type UseMediaRecordingReturn,
} from './useMediaRecording'

// Simplified versions using centralized actions
export { useInterviewWebSocket as useInterviewWebSocketSimplified } from './useInterviewWebSocketSimplified'
export { useAudioRecorderSimplified } from './useAudioRecorderSimplified'
export { useAudioPlayerSimplified } from './useAudioPlayerSimplified'
