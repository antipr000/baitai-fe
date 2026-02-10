/**
 * useArtifactEvents Hook
 *
 * Manages artifact (code editor / whiteboard) WebSocket events:
 * - Sends artifact_opened when editor opens
 * - Sends debounced artifact_interaction on keystrokes
 * - Sends artifact_submitted when user submits their work
 *
 * Isolated from the code editor store itself so that artifact
 * event logic can be extended to other artifact types (whiteboard, etc.)
 * without modifying the editor.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useInterviewStore } from '../store'
import {
  sendArtifactOpenedMessage,
  sendArtifactInteractionMessage,
  sendArtifactSubmittedMessage,
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
  const { isOpen, artifactType, interactionDebounceMs = 5000 } = options
  const store = useInterviewStore
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const wasOpenRef = useRef(false)

  // ============================================
  // Open / Close Effect
  // ============================================

  useEffect(() => {
    const state = store.getState()

    if (isOpen && !wasOpenRef.current) {
      // Editor just opened -- send artifact_opened to backend
      // Only send if we're in a state where the backend expects it (listening)
      if (state.conversationState === 'listening' && state.connectionStatus === 'connected') {
        console.log(`[ArtifactEvents] Sending artifact_opened (${artifactType})`)
        sendArtifactOpenedMessage(artifactType)
      }
    }

    wasOpenRef.current = isOpen

    // Cleanup debounce timer when editor closes
    if (!isOpen && debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [isOpen, artifactType])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
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
    if (debounceTimerRef.current) {
      return // Already have a pending send
    }

    sendArtifactInteractionMessage()

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
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

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    sendArtifactSubmittedMessage(content, language)
  }, [])

  return {
    reportInteraction,
    submitArtifact,
  }
}
