'use client'

import React from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { autocompletion } from '@codemirror/autocomplete'
import { completionKeymap } from "@codemirror/autocomplete";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

export type EditorLanguage = 'javascript' | 'typescript' | 'python'

interface CodeEditorProps {
    value: string
    onChange: (value: string) => void
    language: EditorLanguage
    className?: string
    readOnly?: boolean
}

// Language extensions configuration
// Each language has its own explicit setup
const getLanguageExtension = (language: EditorLanguage) => {
    switch (language) {
        case 'javascript':
            return javascript({ jsx: true, typescript: false })
        case 'typescript':
            return javascript({ jsx: true, typescript: true })
        case 'python':
            return python()
        default:
            return javascript()
    }
}

export function CodeEditor({
    value,
    onChange,
    language,
    className = '',
    readOnly = false,
}: CodeEditorProps) {
    return (
        <CodeMirror
            value={value}
            onChange={onChange}
            extensions={[
                getLanguageExtension(language),
                autocompletion({
                    activateOnTyping: true,
                }),
                keymap.of([...completionKeymap,
                    indentWithTab   // not working
                ]),
            ]}
            theme={oneDark}
            readOnly={readOnly}
            className={className}
            basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: true,
                autocompletion: false, // We configure it ourselves above
            }}
        />
    )
}

