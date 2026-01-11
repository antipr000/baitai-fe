'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const MAX_POLL_DURATION = 3 * 60 * 1000 // 3 minutes in ms

export function ScorePoller() {
    const router = useRouter()
    const startTime = useRef(Date.now())

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime.current

            if (elapsed >= MAX_POLL_DURATION) {
                console.log('[ScorePoller] Max poll duration reached, stopping...')
                toast.warning('Scoring is taking longer than expected. Please refresh later.')
                clearInterval(interval)
                return
            }

            console.log('[ScorePoller] Refreshing to check for score updates...')
            router.refresh()
        }, 10000)

        return () => clearInterval(interval)
    }, [router])

    return null
}
