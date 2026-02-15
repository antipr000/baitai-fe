/**
 * Event Protocol Types for Interview WebSocket Communication
 *
 * This file mirrors the backend's events.py exactly and serves as the
 * single source of truth for all WebSocket message types on the frontend.
 *
 * Naming convention:
 *   - InboundEvent  = Frontend -> Backend (events WE send)
 *   - OutboundEvent = Backend -> Frontend (events WE receive)
 */

// ============================================
// Interview State (mirrors backend InterviewState enum)
// ============================================

/**
 * Real-time interaction state of an active interview session.
 * This is set ONLY by the backend via STATE_CHANGED / STATE_SYNC events.
 * The frontend NEVER decides the next state.
 *
 * Distinct from session lifecycle status (not_started, in_progress, completed)
 * which is used for dashboards/history.
 */
export enum BackendInterviewState {
  /** WebSocket connected, session validated, waiting for interview to begin. */
  IDLE = 'idle',

  /** AI is actively streaming text + audio to the frontend. */
  SPEAKING = 'speaking',

  /** AI is silent. Frontend is capturing user audio and streaming chunks. */
  LISTENING = 'listening',

  /** Backend is processing: LLM decision, response generation, TTS. */
  THINKING = 'thinking',

  /** User is interacting with a code editor / whiteboard. */
  ARTIFACT = 'artifact',

  /** Terminal. Interview is over. No further transitions possible. */
  COMPLETED = 'completed',

  /** WebSocket lost. Previous state preserved in Redis. */
  DISCONNECTED = 'disconnected',
}

// ============================================
// Inbound Events (Frontend -> Backend)
// ============================================

/**
 * Events sent FROM the frontend TO the backend over WebSocket.
 * These are the ONLY text message types the backend will accept.
 */
export enum InboundEvent {
  /**
   * Keep-alive heartbeat. Backend responds with PONG.
   * Sent periodically (e.g. every 30s) to detect dead connections.
   */
  PING = 'ping',

  /**
   * Frontend finished playing ALL queued audio chunks for the current AI response.
   * The backend will not transition out of SPEAKING until it receives this event.
   * Triggers state transition: SPEAKING -> LISTENING.
   */
  SPEECH_COMPLETED = 'speech_completed',

  /**
   * Frontend detected that the user stopped speaking (silence threshold met).
   * Backend will finalize the accumulated transcript and run the LLM decision pipeline.
   * Triggers state transition: LISTENING -> THINKING.
   */
  END_OF_TURN = 'end_of_turn',

  /**
   * User explicitly requests to end the interview early (e.g. via a UI button).
   * Backend will wrap up the session, trigger scoring, and close the connection.
   * Can be sent from any non-terminal state.
   */
  END_INTERVIEW = 'end_interview',

  /**
   * User opened an artifact panel (code editor, whiteboard, etc.).
   * Backend pauses silence-based turn detection and starts an inactivity timer.
   * Triggers state transition: LISTENING -> ARTIFACT.
   */
  ARTIFACT_OPENED = 'artifact_opened',

  /**
   * User interacted with the artifact (keystroke, draw stroke, scroll, etc.).
   * Sent debounced from the frontend (e.g. at most once every 5 seconds).
   * Resets the backend inactivity timer. Does NOT trigger a state transition.
   */
  ARTIFACT_INTERACTION = 'artifact_interaction',

  /**
   * User explicitly signals they are done with the artifact and want feedback.
   * Backend persists the artifact content, cancels the inactivity timer,
   * and runs the decision pipeline with the artifact as context.
   * Triggers state transition: ARTIFACT -> THINKING.
   */
  ARTIFACT_SUBMITTED = 'artifact_submitted',

  /**
   * Periodic sync of the current artifact content to the backend.
   * Sent every ~5 seconds while the editor is open and state is ARTIFACT.
   * Backend persists the content and uses it in LLM decision context.
   */
  ARTIFACT_CONTENT_UPDATE = 'artifact_content_update',
}

// ============================================
// Outbound Events (Backend -> Frontend)
// ============================================

/**
 * Events sent FROM the backend TO the frontend over WebSocket.
 * These are the ONLY text message types the frontend should handle.
 * Every JSON message has a "type" field set to one of these values.
 */
export enum OutboundEvent {
  /** Response to a PING heartbeat. Confirms the connection is alive. */
  PONG = 'pong',

  /**
   * Emitted on EVERY state machine transition. This is the single mechanism
   * by which the frontend knows what UI state to render.
   * The frontend MUST update its UI to match the new state.
   */
  STATE_CHANGED = 'state_changed',

  /**
   * Sent immediately after a successful WebSocket reconnection.
   * Contains the authoritative state so the frontend can recover.
   */
  STATE_SYNC = 'state_sync',

  /** A recoverable or fatal error occurred during processing. */
  ERROR = 'error',

  /**
   * Real-time partial transcript of what the user is saying.
   * Frontend can display this as a live subtitle / caption.
   */
  TRANSCRIPT_CHUNK = 'transcript_chunk',

  /**
   * The finalized, complete transcript for this user turn.
   * Sent after END_OF_TURN processing, before the AI response begins.
   */
  TRANSCRIPT_FINAL = 'transcript_final',

  /** A token from the AI's text response, streamed in real-time. */
  RESPONSE_TEXT_CHUNK = 'response_text_chunk',

  /** All text tokens for this AI response have been sent. */
  RESPONSE_TEXT_DONE = 'response_text_done',

  /**
   * Metadata for a sentence-level audio chunk about to be sent as binary.
   * IMMEDIATELY followed by a binary WebSocket frame containing the audio bytes.
   */
  RESPONSE_AUDIO_CHUNK = 'response_audio_chunk',

  /**
   * All audio chunks for this AI response have been sent.
   * Once the frontend finishes playing all queued audio, it MUST send SPEECH_COMPLETED.
   */
  RESPONSE_AUDIO_DONE = 'response_audio_done',

  /**
   * The interview has concluded. Terminal event -- no further events will follow.
   */
  INTERVIEW_ENDED = 'interview_ended',

  /**
   * Backend tells frontend to open the artifact panel (code editor, whiteboard).
   * Sent when entering an artifact section. Frontend should open the editor
   * and acknowledge with ARTIFACT_OPENED.
   */
  LOAD_ARTIFACT = 'load_artifact',

  /**
   * Backend tells frontend to close the artifact panel.
   * Sent when leaving an artifact section (moving to a non-artifact section).
   */
  UNLOAD_ARTIFACT = 'unload_artifact',
}

// ============================================
// Outbound Event Payloads
// ============================================

export interface StateChangedPayload {
  type: OutboundEvent.STATE_CHANGED
  state: BackendInterviewState
  previous_state: BackendInterviewState
  metadata: Record<string, unknown>
}

export interface StateSyncPayload {
  type: OutboundEvent.STATE_SYNC
  state: BackendInterviewState
  session_status: string
  metadata: Record<string, unknown>
}

export interface ErrorPayload {
  type: OutboundEvent.ERROR
  message: string
  error_type: 'audio' | 'session' | 'internal'
  fatal: boolean
}

export interface TranscriptChunkPayload {
  type: OutboundEvent.TRANSCRIPT_CHUNK
  text: string
}

export interface TranscriptFinalPayload {
  type: OutboundEvent.TRANSCRIPT_FINAL
  text: string
}

export interface ResponseTextChunkPayload {
  type: OutboundEvent.RESPONSE_TEXT_CHUNK
  text: string
}

export interface ResponseTextDonePayload {
  type: OutboundEvent.RESPONSE_TEXT_DONE
  text: string
}

export interface ResponseAudioChunkPayload {
  type: OutboundEvent.RESPONSE_AUDIO_CHUNK
  chunk_index: number
  text: string
}

export interface ResponseAudioDonePayload {
  type: OutboundEvent.RESPONSE_AUDIO_DONE
  total_chunks: number
}

export interface InterviewEndedPayload {
  type: OutboundEvent.INTERVIEW_ENDED
  reason: 'completed' | 'user_ended' | 'error' | 'timeout'
  message: string
}

export interface PongPayload {
  type: OutboundEvent.PONG
}

export interface LoadArtifactPayload {
  type: OutboundEvent.LOAD_ARTIFACT
  artifact_type: 'code' | 'whiteboard'
  artifact_id: string
}

export interface UnloadArtifactPayload {
  type: OutboundEvent.UNLOAD_ARTIFACT
}

/**
 * Discriminated union of all possible outbound (backend -> frontend) messages.
 * Use this as the type for incoming WebSocket JSON messages.
 */
export type OutboundMessage =
  | StateChangedPayload
  | StateSyncPayload
  | ErrorPayload
  | TranscriptChunkPayload
  | TranscriptFinalPayload
  | ResponseTextChunkPayload
  | ResponseTextDonePayload
  | ResponseAudioChunkPayload
  | ResponseAudioDonePayload
  | InterviewEndedPayload
  | PongPayload
  | LoadArtifactPayload
  | UnloadArtifactPayload

// ============================================
// Inbound Event Payloads
// ============================================

export interface ArtifactOpenedPayload {
  type: InboundEvent.ARTIFACT_OPENED
  artifact_type: 'code' | 'whiteboard'
}

export interface ArtifactSubmittedPayload {
  type: InboundEvent.ARTIFACT_SUBMITTED
  content: string
  language?: string
}
