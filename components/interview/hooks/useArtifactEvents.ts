/**
 * useArtifactEvents Hook
 *
 * Manages artifact (code editor / whiteboard) WebSocket events:
 * - Sends debounced artifact_interaction on keystrokes (resets backend inactivity timer)
 * - Sends periodic ARTIFACT_CONTENT_UPDATE with editor content every 5s
 * - Sends artifact_submitted when user submits their work
 *
 * NOTE: The editor is now opened/closed by the backend via LOAD_ARTIFACT / UNLOAD_ARTIFACT
 * events handled in useInterviewWebSocket. This hook no longer sends artifact_opened.
 *
 * Isolated from the code editor store itself so that artifact event logic
 * can be extended to other artifact types (whiteboard, etc.) without modifying the editor.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useInterviewStore } from '../store'
import { useCodeEditorStore } from '../store/codeEditorStore'
import {
  sendArtifactInteractionMessage,
  sendArtifactSubmittedMessage,
  sendArtifactContentUpdateMessage,
} from '../store/interviewActions'

// ============================================
// Types
// ============================================

export interface UseArtifactEventsOptions {
  /** Whether the artifact panel is currently open */
  isOpen: boolean
  /** The type of artifact (code editor, whiteboard, etc.) */
  artifactType: 'code' | 'whiteboard'
  /** Debounce interval for interaction events in ms (default: 5000) */
  interactionDebounceMs?: number
  /** Interval for periodic content sync in ms (default: 5000) */
  contentSyncIntervalMs?: number
}

export interface UseArtifactEventsReturn {
  /** Call this on every user interaction (keystroke, draw, scroll) */
  reportInteraction: () => void
  /** Call this when the user submits their artifact */
  submitArtifact: (content: string, language?: string) => void
}

// ============================================
// Hook Implementation
// ============================================

export function useArtifactEvents(
  options: UseArtifactEventsOptions
): UseArtifactEventsReturn {
  const {
    isOpen,
    artifactType,
    interactionDebounceMs = 5000,
    contentSyncIntervalMs = 5000,
  } = options

  const store = useInterviewStore
  const interactionDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const contentSyncTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ============================================
  // Periodic Content Sync
  // ============================================
  // Sends ARTIFACT_CONTENT_UPDATE every contentSyncIntervalMs while
  // the editor is open and conversationState is 'artifact'.

  const conversationState = useInterviewStore((s) => s.conversationState)

  useEffect(() => {
    const shouldSync = isOpen && conversationState === 'artifact'

    if (shouldSync) {
      // Start periodic sync
      contentSyncTimerRef.current = setInterval(() => {
        const editorState = useCodeEditorStore.getState()
        const interviewState = store.getState()

        if (interviewState.connectionStatus !== 'connected' || interviewState.hasNavigatedAway) {
          return
        }

        sendArtifactContentUpdateMessage(editorState.content, editorState.language)
      }, contentSyncIntervalMs)

      console.log(`[ArtifactEvents] Started periodic content sync (${contentSyncIntervalMs}ms)`)
    }

    return () => {
      if (contentSyncTimerRef.current) {
        clearInterval(contentSyncTimerRef.current)
        contentSyncTimerRef.current = null
      }
    }
  }, [isOpen, conversationState, contentSyncIntervalMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (interactionDebounceRef.current) {
        clearTimeout(interactionDebounceRef.current)
        interactionDebounceRef.current = null
      }
      if (contentSyncTimerRef.current) {
        clearInterval(contentSyncTimerRef.current)
        contentSyncTimerRef.current = null
      }
    }
  }, [])

  // ============================================
  // Interaction Reporting (debounced)
  // ============================================

  const reportInteraction = useCallback(() => {
    const state = store.getState()
    if (state.conversationState !== 'artifact' || state.connectionStatus !== 'connected') {
      return
    }

    // Debounce: only send at most once per interactionDebounceMs
    if (interactionDebounceRef.current) {
      return // Already have a pending send
    }

    sendArtifactInteractionMessage()

    interactionDebounceRef.current = setTimeout(() => {
      interactionDebounceRef.current = null
    }, interactionDebounceMs)
  }, [interactionDebounceMs])

  // ============================================
  // Submit
  // ============================================

  const submitArtifact = useCallback((content: string, language?: string) => {
    const state = store.getState()
    if (state.connectionStatus !== 'connected') {
      console.warn('[ArtifactEvents] Cannot submit - not connected')
      return
    }

    console.log('[ArtifactEvents] Submitting artifact')

    // Clear timers
    if (interactionDebounceRef.current) {
      clearTimeout(interactionDebounceRef.current)
      interactionDebounceRef.current = null
    }
    if (contentSyncTimerRef.current) {
      clearInterval(contentSyncTimerRef.current)
      contentSyncTimerRef.current = null
    }

    sendArtifactSubmittedMessage(content, language)
  }, [])

  return {
    reportInteraction,
    submitArtifact,
  }
}
