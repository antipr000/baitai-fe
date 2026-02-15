/**
 * Code Editor Store
 * Separate store for code editor state to keep interview store clean.
 *
 * Supports two modes:
 * - Manual mode: user toggles the editor freely (isBackendControlled = false)
 * - Backend-controlled mode: backend sends LOAD_ARTIFACT / UNLOAD_ARTIFACT
 *   to open/close the editor (isBackendControlled = true). User cannot close
 *   it via the toggle button -- only via "Submit".
 */

import { create } from 'zustand'
import type { EditorLanguage } from '@/components/editor'

interface CodeEditorState {
    isOpen: boolean
    content: string
    language: EditorLanguage
    /** Backend-assigned artifact ID (from LOAD_ARTIFACT payload). Null when not in artifact mode. */
    artifactId: string | null
    /** When true, the editor was opened by the backend via LOAD_ARTIFACT.
     *  User cannot close it with the toggle button -- only via "Submit". */
    isBackendControlled: boolean
}

interface CodeEditorActions {
    setIsOpen: (isOpen: boolean) => void
    toggleEditor: () => void
    setContent: (content: string) => void
    setLanguage: (language: EditorLanguage) => void
    setArtifactId: (id: string | null) => void
    setIsBackendControlled: (controlled: boolean) => void
    /** Open the editor in backend-controlled mode (called from LOAD_ARTIFACT handler) */
    openFromBackend: (artifactId: string, artifactType: 'code' | 'whiteboard') => void
    /** Close the editor from backend (called from UNLOAD_ARTIFACT handler) */
    closeFromBackend: () => void
    reset: () => void
}

type CodeEditorStore = CodeEditorState & CodeEditorActions

const initialState: CodeEditorState = {
    isOpen: false,
    content: '',
    language: 'javascript',
    artifactId: null,
    isBackendControlled: false,
}

export const useCodeEditorStore = create<CodeEditorStore>((set) => ({
    ...initialState,

    setIsOpen: (isOpen) => set({ isOpen }),
    toggleEditor: () => set((state) => ({ isOpen: !state.isOpen })),
    setContent: (content) => set({ content }),
    setLanguage: (language) => set({ language }),
    setArtifactId: (artifactId) => set({ artifactId }),
    setIsBackendControlled: (isBackendControlled) => set({ isBackendControlled }),

    openFromBackend: (artifactId, _artifactType) =>
        set({
            isOpen: true,
            artifactId,
            isBackendControlled: true,
            content: '', // Start fresh for the new artifact
        }),

    closeFromBackend: () =>
        set({
            isOpen: false,
            artifactId: null,
            isBackendControlled: false,
            content: '',
        }),

    reset: () => set(initialState),
}))

// Selector hooks
export const useIsCodeEditorOpen = () => useCodeEditorStore((s) => s.isOpen)
export const useCodeEditorContent = () => useCodeEditorStore((s) => s.content)
export const useCodeEditorLanguage = () => useCodeEditorStore((s) => s.language)
export const useIsBackendControlled = () => useCodeEditorStore((s) => s.isBackendControlled)
export const useArtifactId = () => useCodeEditorStore((s) => s.artifactId)
