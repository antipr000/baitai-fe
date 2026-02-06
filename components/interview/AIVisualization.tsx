'use client'

import React, { useEffect, useRef } from 'react'
import { Wave } from '@foobar404/wave'
import { getAudioAnalyser } from './store/interviewActions'

interface AIVisualizationProps {
    isPlaying: boolean
}

// Gradient colors for the visualization
const GRADIENT_COLORS = ['#6366f1', '#8b5cf6', '#a855f7']

export default function AIVisualization({ isPlaying }: AIVisualizationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const waveRef = useRef<Wave | null>(null)


    // Animate with Wave when playing
    useEffect(() => {
        if (!canvasRef.current || !isPlaying) {
            waveRef.current = null
            return
        }

        const analyser = getAudioAnalyser()
        if (!analyser) {
            console.log('[AIVisualization] No analyser available!')
            return
        }

        // Create Wave instance with analyser and canvas
        const wave = new Wave(analyser, canvasRef.current)
        waveRef.current = wave

        // Add the circles animation with gradient
        wave.addAnimation(
            new wave.animations.Circles({
                count: 1,
                lineWidth: 0,
                lineColor: 'transparent',
                diameter: 400,  // Larger base on larger canvas
                frequencyBand: 'lows',
                fillColor: {
                    gradient: GRADIENT_COLORS,
                    rotate: 45,
                },
            })
        )

        return () => {
            waveRef.current = null
        }
    }, [isPlaying])

    return (
        <div className="relative flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="rounded-full"
                style={{
                    width: '200px',
                    height: '200px',
                    filter: 'blur(0.5px)'
                }}
            />
        </div>
    )
}
