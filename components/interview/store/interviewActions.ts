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
} | null = null
let mediaRecorderControls: {
  startVideo: (stream: MediaStream) => void
  stopVideo: () => void
  startScreen: (stream: MediaStream) => Promise<void>
  stopScreen: () => void
  finalizeAll: () => Promise<void>
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
 * This matches original behavior:
 * 1. Set conversationState to 'listening'
 * 2. Reset hasSentEndOfTurn = false
 * 3. Reset hasHeardSpeech = false
 * 4. Restart MediaRecorder for new user turn
 */
export async function onAIPlaybackComplete() {
  const store = useInterviewStore.getState()
  
  // Set state to listening and reset flags (like original onended)
  store.setConversationState('listening')
  store.setHasSentEndOfTurn(false)
  store.setHasHeardSpeech(false)
  
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
}
