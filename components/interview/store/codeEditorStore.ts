/**
 * Code Editor Store
 * Separate store for code editor state to keep interview store clean
 */

import { create } from 'zustand'
import type { EditorLanguage } from '@/components/editor'

interface CodeEditorState {
    isOpen: boolean
    content: string
    language: EditorLanguage
}

interface CodeEditorActions {
    setIsOpen: (isOpen: boolean) => void
    toggleEditor: () => void
    setContent: (content: string) => void
    setLanguage: (language: EditorLanguage) => void
    reset: () => void
}

type CodeEditorStore = CodeEditorState & CodeEditorActions

const initialState: CodeEditorState = {
    isOpen: false,
    content: '',
    language: 'javascript',
}

export const useCodeEditorStore = create<CodeEditorStore>((set) => ({
    ...initialState,

    setIsOpen: (isOpen) => set({ isOpen }),
    toggleEditor: () => set((state) => ({ isOpen: !state.isOpen })),
    setContent: (content) => set({ content }),
    setLanguage: (language) => set({ language }),
    reset: () => set(initialState),
}))

// Selector hooks
export const useIsCodeEditorOpen = () => useCodeEditorStore((s) => s.isOpen)
export const useCodeEditorContent = () => useCodeEditorStore((s) => s.content)
export const useCodeEditorLanguage = () => useCodeEditorStore((s) => s.language)
