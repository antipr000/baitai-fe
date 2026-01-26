/**
 * Interview Actions - Centralized action handlers
 * 
 * This module provides action functions that can be called from anywhere
 * (hooks, components, WebSocket handlers) without stale closure issues.
 * 
 * All actions use store.getState() to get fresh state.
 */

import { useInterviewStore } from './interviewStore'
import type { WebSocketManager } from '../manager/WebSocketManager'
import type { ChatMessage } from './types'

// ============================================
// Singleton References
// ============================================

// These are set by the hooks and can be called from anywhere
let wsManager: WebSocketManager | null = null
let audioRecorderControls: {
  start: (enableSilence?: boolean) => Promise<void>
  stop: () => void
  stopAndClear: () => void
  flush: () => Promise<void>
  sendEndOfTurn: () => Promise<void>
  enableSilenceDetection: () => void
  stopSilenceDetection: () => void
} | null = null
let audioPlayerControls: {
  enqueue: (data: ArrayBuffer) => void
  stop: () => void
  getAnalyser: () => AnalyserNode | null
} | null = null
let mediaRecorderControls: {
  startVideo: (stream: MediaStream) => void
  stopVideo: () => void
  startScreen: (stream: MediaStream) => Promise<void>
  stopScreen: () => void
  finalizeAll: () => Promise<void>
  resetSessionInitialized: (type: 'video' | 'screen') => void
  retryInitSession: (type: 'video' | 'screen') => Promise<void>
} | null = null

// ============================================
// Registration Functions (called by hooks)
// ============================================

export function registerWebSocketManager(manager: WebSocketManager | null) {
  wsManager = manager
}

export function registerAudioRecorderControls(controls: typeof audioRecorderControls) {
  audioRecorderControls = controls
}

export function registerAudioPlayerControls(controls: typeof audioPlayerControls) {
  audioPlayerControls = controls
}

export function registerMediaRecorderControls(controls: typeof mediaRecorderControls) {
  mediaRecorderControls = controls
}

// ============================================
// WebSocket Actions
// ============================================

export function sendAudio(data: ArrayBuffer): boolean {
  return wsManager?.sendAudio(data) ?? false
}

export function sendEndOfTurnMessage(): boolean {
  return wsManager?.sendEndOfTurn() ?? false
}

export function disconnectWebSocket() {
  wsManager?.disconnect()
}

export function isWebSocketConnected(): boolean {
  return wsManager?.isConnected() ?? false
}

// ============================================
// Audio Recorder Actions
// ============================================

export async function startRecording(enableSilenceDetection?: boolean) {
  await audioRecorderControls?.start(enableSilenceDetection)
}

export function stopRecording() {
  audioRecorderControls?.stop()
}

export function stopAndClearRecordingBuffer() {
  audioRecorderControls?.stopAndClear()
}

export async function flushAudio() {
  await audioRecorderControls?.flush()
}

export async function processEndOfTurn() {
  await audioRecorderControls?.sendEndOfTurn()
}

export function enableSilenceDetection() {
  audioRecorderControls?.enableSilenceDetection()
}

export function stopSilenceDetection() {
  audioRecorderControls?.stopSilenceDetection()
}

// ============================================
// Audio Player Actions
// ============================================

export function enqueueAudio(data: ArrayBuffer) {
  audioPlayerControls?.enqueue(data)
}

export function stopPlayback() {
  audioPlayerControls?.stop()
}

export function getAudioAnalyser(): AnalyserNode | null {
  return audioPlayerControls?.getAnalyser() ?? null
}

// ============================================
// Media Recorder Actions
// ============================================

export function startVideoRecording(stream: MediaStream) {
  mediaRecorderControls?.startVideo(stream)
}

export function stopVideoRecording() {
  mediaRecorderControls?.stopVideo()
}

export async function startScreenRecording(stream: MediaStream) {
  await mediaRecorderControls?.startScreen(stream)
}

export function stopScreenRecording() {
  mediaRecorderControls?.stopScreen()
}

export async function finalizeAllMedia() {
  await mediaRecorderControls?.finalizeAll()
}

/**
 * Retry media upload session after an error (matches original behavior)
 * Resets the initialized flag and attempts to reinitialize after 2 seconds
 */
export function retryMediaUploadSession(type: 'video' | 'screen') {
  // Reset the session initialized flag
  mediaRecorderControls?.resetSessionInitialized(type)

  // Schedule retry after 2 seconds (matches original)
  setTimeout(() => {
    mediaRecorderControls?.retryInitSession(type).catch(console.error)
  }, 2000)
}

// ============================================
// State Transition Helpers
// ============================================
// These functions handle all state changes for a given transition,
// reducing the chance of forgetting to set a required flag.

/**
 * Transition to LISTENING state (user's turn to speak)
 * Called when: AI finishes speaking, response.wait received
 * 
 * Sets:
 * - conversationState: 'listening'
 * - isProcessing: false
 * - hasSentEndOfTurn: false
 * - hasHeardSpeech: false
 * 
 * NOTE: Caller is responsible for starting recording if needed
 */
export function transitionToListening() {
  const store = useInterviewStore.getState()
  console.log('[State] → listening')

  store.setConversationState('listening')
  store.setIsProcessing(false)
  store.setHasSentEndOfTurn(false)
  store.setHasHeardSpeech(false)
}



/**
 * Transition to THINKING state (processing user input)
 * Called when: end_of_turn sent, waiting for AI response
 * 
 * Sets:
 * - conversationState: 'thinking'
 * - isProcessing: true (show "Processing..." UI)
 * - hasSentEndOfTurn: true (guard against re-sending)
 * - hasHeardSpeech: false (reset for next turn)
 * 
 * Actions:
 * - Stops silence detection
 */
export function transitionToThinking() {
  const store = useInterviewStore.getState()
  console.log('[State] → thinking')

  store.setConversationState('thinking')
  store.setIsProcessing(true)
  store.setHasSentEndOfTurn(true)
  store.setHasHeardSpeech(false)

  stopSilenceDetection()
}

/**
 * Transition to SPEAKING state (AI is responding with audio)
 * Called when: first sentence audio plays (handleSentenceComplete chunk 0)
 * 
 * Sets:
 * - conversationState: 'speaking'
 * 
 * Does NOT set:
 * - isProcessing (already false from onResponseStart)
 * 
 * Actions:
 * - Stops silence detection
 */
export function transitionToSpeaking() {
  const store = useInterviewStore.getState()
  console.log('[State] → speaking')

  store.setConversationState('speaking')
  // Safety: Stop silence detection in case audio was queued directly 
  // without a preceding response.start (which normally stops it)
  stopSilenceDetection()
}

/**
 * Transition to response received state (AI started responding but no audio yet)
 * Called when: response.start received
 * 
 * Sets:
 * - isProcessing: false (got response, no longer waiting)
 * - conversationState: 'thinking' (if not already speaking)
 * 
 * Note: We stay in 'thinking' until audio plays, which triggers transitionToSpeaking
 */
export function onResponseStart() {
  const store = useInterviewStore.getState()
  console.log('[State] Response start received')

  store.setIsProcessing(false)
  // Only change to thinking if not already speaking (prevents going backward)
  if (store.conversationState !== 'speaking') {
    store.setConversationState('thinking')
  }
}

/**
 * Transition to LISTENING state on error
 * Called when: WebSocket error, audio processing error
 * 
 * Same as transitionToListening but also sets error message
 * and doesn't auto-start recording (let caller decide)
 */
export function transitionToListeningOnError(errorMessage: string) {
  const store = useInterviewStore.getState()
  console.log('[State] Error → listening:', errorMessage)

  store.setConversationState('listening')
  store.setIsProcessing(false)
  store.setHasSentEndOfTurn(false)
  store.setHasHeardSpeech(false)
  store.setError(errorMessage)
}

// ============================================
// Combined Actions
// ============================================

/**
 * Called when AI starts responding - stops recording and clears buffer
 * This matches the original behavior where we:
 * 1. Stop the MediaRecorder
 * 2. Clear audioChunksRef.current = []
 * 3. Reset hasSentEndOfTurnRef.current = false
 */
export function onAIResponseStart() {
  stopAndClearRecordingBuffer()
}

/**
 * Called when AI finishes speaking - restarts recording with silence detection
 */
export async function onAIPlaybackComplete() {
  const store = useInterviewStore.getState()
  console.log('[State] AI playback complete → listening')

  // Use helper to set state
  transitionToListening()

  if (store.connectionStatus !== 'connected' || !store.isMicOn || store.hasNavigatedAway) {
    return
  }

  // Stop current recording first to get fresh WebM headers
  stopRecording()

  // Small delay then restart with silence detection
  await new Promise(resolve => setTimeout(resolve, 100))

  const currentState = useInterviewStore.getState()
  if (currentState.connectionStatus === 'connected' &&
    currentState.isMicOn &&
    !currentState.hasNavigatedAway) {
    await startRecording(true)
  }
}

/**
 * Called when interview ends
 */
export async function onInterviewEnd() {
  const store = useInterviewStore.getState()
  store.setHasNavigatedAway(true)

  // Stop all recordings
  stopRecording()
  stopPlayback()
  stopVideoRecording()
  stopScreenRecording()

  // Finalize media uploads
  await finalizeAllMedia()

  // Disconnect after short delay
  setTimeout(() => {
    disconnectWebSocket()
  }, 1000)
}

/**
 * Called when silence is detected - processes audio and sends end_of_turn
 */
export async function onSilenceDetected() {
  await processEndOfTurn()
}

/**
 * Handle mic toggle
 */
export async function handleMicToggle() {
  const store = useInterviewStore.getState()
  const wasMicOn = store.isMicOn
  store.toggleMic()

  // If enabling mic and connected, start recording (no silence detection - matches original)
  if (!wasMicOn && store.connectionStatus === 'connected' && store.conversationState !== 'speaking') {
    await startRecording()
  }
}

/**
 * Handle video toggle
 */
export function handleVideoToggle() {
  const store = useInterviewStore.getState()
  const newVideoState = !store.isVideoOn
  store.setIsVideoOn(newVideoState)
}

/**
 * Handle end interview
 */
export async function handleEndInterview(
  cameraStream: MediaStream | null,
  micStream: MediaStream | null,
  screenStream: MediaStream | null,
  onNavigate: () => void
) {
  const store = useInterviewStore.getState()

  if (!store.showEndConfirm) {
    store.setShowEndConfirm(true)
    return
  }

  store.setHasNavigatedAway(true)

  // Stop all recordings
  stopRecording()
  stopPlayback()
  stopVideoRecording()
  stopScreenRecording()

  // Finalize media
  await finalizeAllMedia()

  // Disconnect WebSocket
  disconnectWebSocket()

  // Stop all streams
  cameraStream?.getTracks().forEach(t => t.stop())
  micStream?.getTracks().forEach(t => t.stop())
  screenStream?.getTracks().forEach(t => t.stop())

  // Navigate
  onNavigate()
}

// ============================================
// Cleanup
// ============================================

export function cleanupAll() {
  wsManager = null
  audioRecorderControls = null
  audioPlayerControls = null
  mediaRecorderControls = null

  // Reset the Zustand store to initial state
  useInterviewStore.getState().reset()
}
