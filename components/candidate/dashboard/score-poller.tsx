'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'


export function ScorePoller() {
    const router = useRouter()

    useEffect(() => {
        // Show a toast immediately when this component mounts

        const timer = setTimeout(() => {
            console.log('[ScorePoller] Refreshing to check for score updates...')
            router.refresh()
        }, 5000)

        return () => clearTimeout(timer)
    }, [router])

    return null
}
