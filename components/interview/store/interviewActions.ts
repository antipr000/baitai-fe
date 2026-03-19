/**
 * Interview Actions - Centralized action handlers
 *
 * KEY CHANGE: The frontend no longer decides state transitions.
 * State is set ONLY by the backend via STATE_CHANGED / STATE_SYNC events.
 *
 * This module provides:
 * 1. Side-effect appliers (apply*State) that run when state changes arrive from the backend
 * 2. WebSocket action wrappers (send events to the backend)
 * 3. Audio/recording control wrappers
 *
 * All actions use store.getState() to get fresh state.
 */

import { useInterviewStore } from './interviewStore'
import { useCodeEditorStore } from './codeEditorStore'
import type { WebSocketManager } from '../manager/WebSocketManager'
import type { ConversationState } from './types'

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
  /** Lightweight speech onset detector for artifact mode.
   *  Watches for speech, then activates full silence detection. */
  enableSpeechOnsetDetector: () => void
} | null = null
let audioPlayerControls: {
  enqueue: (data: ArrayBuffer) => void
  stop: () => void
  getAnalyser: () => AnalyserNode | null
  /** Check if all audio has been received AND played; if so, send SPEECH_COMPLETED */
  checkIfFullyDone: (force?: boolean) => void
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
// WebSocket Actions (send events to backend)
// ============================================

export function sendAudio(data: ArrayBuffer): boolean {
  return wsManager?.sendAudio(data) ?? false
}

export function sendEndOfTurnMessage(): boolean {
  return wsManager?.sendEndOfTurn() ?? false
}

export function sendSpeechCompletedMessage(): boolean {
  return wsManager?.sendSpeechCompleted() ?? false
}

export function sendEndInterviewMessage(): boolean {
  return wsManager?.sendEndInterview() ?? false
}

export function sendArtifactOpenedMessage(artifactType: 'code' | 'whiteboard'): boolean {
  return wsManager?.sendArtifactOpened(artifactType) ?? false
}

export function sendArtifactInteractionMessage(): boolean {
  return wsManager?.sendArtifactInteraction() ?? false
}

export function sendArtifactSubmittedMessage(content: string, language?: string): boolean {
  return wsManager?.sendArtifactSubmitted(content, language) ?? false
}

export function sendArtifactContentUpdateMessage(content: string, language?: string): boolean {
  return wsManager?.sendArtifactContentUpdate(content, language) ?? false
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

/**
 * Enable the speech onset detector (artifact mode only).
 * Lightweight rAF loop that watches for speech onset, then
 * activates full silence detection when the user starts speaking.
 */
export function enableSpeechOnsetDetector() {
  audioRecorderControls?.enableSpeechOnsetDetector()
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

/**
 * Ask the audio player to check if all audio has been received AND played.
 * If so, it sends SPEECH_COMPLETED to the backend.
 *
 * Called by the WebSocket handler after setting responseAudioDone = true,
 * so that if playback already finished while waiting for the flag, we
 * send SPEECH_COMPLETED immediately.
 */
export function checkAudioPlaybackComplete(force: boolean = false) {
  audioPlayerControls?.checkIfFullyDone(force)
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
// State Side-Effect Appliers
// ============================================
//
// These functions apply the side-effects needed when the backend transitions
// to a given state. They do NOT decide the state -- that's the backend's job.
// They are called from the STATE_CHANGED handler in useInterviewWebSocket.
//
// Each function:
// 1. Resets the relevant flags for the new state
// 2. Starts/stops recording and silence detection as needed

/**
 * Apply side effects for LISTENING state (user's turn to speak)
 * Called when: backend sends STATE_CHANGED with state = 'listening'
 *
 * Resets: hasHeardSpeech, hasSentAudioSegments
 * Starts: recording with silence detection (if mic is on and connected)
 */
export async function applyListeningState(isSync: boolean = false) {
  const store = useInterviewStore.getState()
  console.log('[State] Backend → listening', isSync ? '(syncing)' : '')

  if (!isSync) {
    store.setHasHeardSpeech(false)
    store.setHasSentAudioSegments(false)
    store.clearTranscript()
  }

  // Check if there's a pending ARTIFACT_OPENED to send.
  // This happens when LOAD_ARTIFACT arrived during SPEAKING state --
  // the editor was opened but the ack was deferred until LISTENING.
  const editorState = useCodeEditorStore.getState()
  if (editorState.pendingArtifactOpen) {
    const artifactType = editorState.pendingArtifactOpen
    editorState.clearPendingArtifactOpen()
    console.log(`[State] Sending deferred artifact_opened (${artifactType})`)
    sendArtifactOpenedMessage(artifactType)
    // Backend will transition LISTENING -> ARTIFACT and send STATE_CHANGED(artifact).
    // applyArtifactState() will handle starting recording with speech onset detector.
    return
  }

  // If the code editor is backend-controlled (artifact section still active),
  // use artifact audio behavior: recording + speech onset detector instead of
  // full silence detection. This handles the case where the backend transitions
  // ARTIFACT -> THINKING -> wait_decision -> LISTENING during an artifact section.
  if (editorState.isBackendControlled) {
    console.log('[State] Artifact section active → using artifact audio behavior')
    if (store.connectionStatus === 'connected' && store.isMicOn && !store.hasNavigatedAway) {
      stopRecording()
      await new Promise(resolve => setTimeout(resolve, 100))

      const currentState = useInterviewStore.getState()
      if (currentState.connectionStatus === 'connected' &&
        currentState.isMicOn &&
        !currentState.hasNavigatedAway) {
        await startRecording(false)   // recording only, no silence detection
        enableSpeechOnsetDetector()   // lightweight speech watcher
      }
    }
    return
  }

  // Normal listening mode: start recording with full silence detection
  if (store.connectionStatus === 'connected' && store.isMicOn && !store.hasNavigatedAway) {
    // Stop current recording first to get fresh WebM headers
    stopRecording()
    await new Promise(resolve => setTimeout(resolve, 100))

    const currentState = useInterviewStore.getState()
    if (currentState.connectionStatus === 'connected' &&
      currentState.isMicOn &&
      !currentState.hasNavigatedAway) {
      await startRecording(true)
    }
  }
}

/**
 * Apply side effects for THINKING state (backend processing)
 * Called when: backend sends STATE_CHANGED with state = 'thinking'
 *
 * Stops: silence detection
 */
export function applyThinkingState() {
  console.log('[State] Backend → thinking')
  stopSilenceDetection()
}

/**
 * Apply side effects for SPEAKING state (AI streaming response)
 * Called when: backend sends STATE_CHANGED with state = 'speaking'
 *
 * Stops: recording and silence detection
 * Resets: responseAudioDone, streaming state for new response
 */
export function applySpeakingState(isSync: boolean = false) {
  const store = useInterviewStore.getState()
  console.log('[State] Backend → speaking', isSync ? '(syncing)' : '')

  // Always stop the microphone and silence detection if we are supposed to be listening to the AI
  stopAndClearRecordingBuffer()
  stopSilenceDetection()

  if (!isSync) {
    // Reset for new response only on fresh turn
    store.setResponseAudioDone(false)
    store.clearStreamingState()
    store.setExpectedAudioChunk(null)
    store.clearCompletedSentences()
    store.startStreamingMessage()
  }
}

/**
 * Apply side effects for ARTIFACT state (user working on code/whiteboard)
 * Called when: backend sends STATE_CHANGED with state = 'artifact'
 *
 * @param isSync If true, skips resetting progress flags but restarts the microphone onset detector.
 */
export async function applyArtifactState(isSync: boolean = false) {
  const store = useInterviewStore.getState()
  console.log('[State] Backend → artifact', isSync ? '(syncing)' : '')

  if (!isSync) {
    // Reset speech/audio flags for a clean start.
    store.setHasHeardSpeech(false)
    store.setHasSentAudioSegments(false)
  }

  // Start recording WITHOUT silence detection.
  // The speech onset detector will activate full silence detection
  // only when the user starts speaking. This prevents typing noise
  // from triggering false end_of_turn events while coding.
  if (store.connectionStatus === 'connected' && store.isMicOn && !store.hasNavigatedAway) {
    // Stop current recording first to ensure the old MediaRecorder has
    // fully transitioned to 'inactive'. Without this, startRecordingInternal
    // silently bails out because the previous recorder (stopped async by
    // applySpeakingState → stopAndClearRecordingBuffer) hasn't finished yet.
    stopRecording()
    await new Promise(resolve => setTimeout(resolve, 100))

    const currentState = useInterviewStore.getState()
    if (currentState.connectionStatus === 'connected' &&
      currentState.isMicOn &&
      !currentState.hasNavigatedAway) {
      await startRecording(false)   // recording only, no silence detection
      enableSpeechOnsetDetector()   // lightweight speech watcher
    }
  }
}

/**
 * Apply side effects for COMPLETED state (interview over)
 * Called when: backend sends STATE_CHANGED with state = 'completed'
 *
 * Stops: all recording, playback
 */
export function applyCompletedState() {
  const store = useInterviewStore.getState()
  console.log('[State] Backend → completed')

  store.setHasNavigatedAway(true)
  stopRecording()
  stopPlayback()
  stopVideoRecording()
  stopScreenRecording()
}

/**
 * Apply side effects for IDLE state
 * Called when: backend sends STATE_CHANGED with state = 'idle'
 */
export function applyIdleState() {
  console.log('[State] Backend → idle')
}

/**
 * Central handler for STATE_CHANGED events from the backend.
 * Dispatches to the appropriate apply*State() function based on the new state.
 *
 * Called from the useInterviewWebSocket handler for STATE_CHANGED events.
 */
export async function onStateChanged(
  newState: ConversationState,
  _previousState: ConversationState,
  _metadata: Record<string, unknown>
) {
  const store = useInterviewStore.getState()

  // Use the LOCAL state to detect if this is a redundant update/sync.
  // This is more robust than relying on the backend's reported previous_state,
  // which might be 'disconnected' (mapped to 'idle' or null).
  const isSync = newState === store.conversationState

  // Update the store first
  store.setConversationState(newState)

  // Apply side effects for the new state
  switch (newState) {
    case 'idle':
      applyIdleState()
      break
    case 'listening':
      await applyListeningState(isSync)
      break
    case 'thinking':
      applyThinkingState()
      break
    case 'speaking':
      applySpeakingState(isSync)
      break
    case 'artifact':
      await applyArtifactState(isSync)
      break
    case 'completed':
      applyCompletedState()
      break
  }
}

// ============================================
// Combined Actions
// ============================================

/**
 * Called when AI finishes speaking (all audio played, response_audio_done received).
 * Sends SPEECH_COMPLETED to the backend. Does NOT transition state locally.
 * The backend will respond with STATE_CHANGED(listening).
 */
export function onAIPlaybackComplete() {
  console.log('[State] AI playback complete → sending speech_completed')
  sendSpeechCompletedMessage()
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

  // Send end_interview message to backend via WebSocket
  // This triggers the backend to mark the session as COMPLETED and run scoring
  sendEndInterviewMessage()

  // Stop all recordings
  stopRecording()
  stopPlayback()
  stopVideoRecording()
  stopScreenRecording()

  // Finalize media
  await finalizeAllMedia()

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
  const store = useInterviewStore.getState()

  // 1. Mark as intentional so the WebSocket hook doesn't try to reconnect
  // while we are clearing the state.
  store.setIsIntentionalDisconnect(true)

  // 2. Disconnect and nullify managers
  wsManager?.disconnect()
  wsManager = null

  audioRecorderControls = null
  audioPlayerControls = null
  mediaRecorderControls = null

  // 3. Reset all Zustand stores to initial state
  store.reset()
  useCodeEditorStore.getState().reset()
}
