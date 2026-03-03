'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Copy, Check, Send } from 'lucide-react'
import type { EditorLanguage } from './code-editor'

interface EditorToolbarProps {
    language: EditorLanguage
    onLanguageChange: (lang: EditorLanguage) => void
    onCopy: () => void
    /** Optional submit handler -- when provided, shows a "Submit" button */
    onSubmit?: () => void
    /** Whether the submit button should be disabled */
    submitDisabled?: boolean
}

const languages: { value: EditorLanguage; label: string }[] = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
]

export function EditorToolbar({
    language,
    onLanguageChange,
    onCopy,
    onSubmit,
    submitDisabled,
}: EditorToolbarProps) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = () => {
        onCopy()
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const currentLang = languages.find((l) => l.value === language)

    return (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700 rounded-t-lg">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                        {currentLang?.label}
                        <ChevronDown className="ml-1 w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    {languages.map((lang) => (
                        <DropdownMenuItem
                            key={lang.value}
                            onClick={() => onLanguageChange(lang.value)}
                            className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                        >
                            {lang.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <Copy className="w-4 h-4" />
                    )}
                </Button>

                {onSubmit && (
                    <Button
                        size="sm"
                        onClick={onSubmit}
                        disabled={submitDisabled}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3"
                    >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Submit
                    </Button>
                )}
            </div>
        </div>
    )
}
