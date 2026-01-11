import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Mic, Video, Volume2 } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '../ui/badge'
import { motion } from "motion/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Progress } from '../ui/progress'
type InterviewSectionProps = {
    cameras: MediaDeviceInfo[]
    microphones: MediaDeviceInfo[]
    speakers: MediaDeviceInfo[]
    selectedCamera: string | null
    selectedMic: string | null
    selectedSpeaker: string | null
    setSelectedCamera: (id: string | null) => void
    setSelectedMic: (id: string | null) => void
    setSelectedSpeaker: (id: string | null) => void
    saveSelection: (key: string, value: string) => void
    startInterview: () => void
    onCameraStream?: (stream: MediaStream) => void
    onMicStream?: (stream: MediaStream) => void
    keepCameraStreamOnUnmount?: boolean
    keepMicStreamOnUnmount?: boolean
    permission?: "pending" | "granted" | "denied"
    title?: string
    duration?: number
}

const beforeYouBeginItems = [
    {
        iconPath: "/interview/timer.svg",
        text: "Expect to spend 30 minutes in this interview."
    },
    {
        iconPath: "/interview/loop.svg",
        text: "Hiring team-approved single retake per interview"
    },
    {
        iconPath: "/interview/lock.svg",
        text: "Your data is in your control"
    },
    {
        iconPath: "/interview/wave.svg",
        text: "Find a quiet place with good lighting"
    },
    {
        iconPath: "/interview/wifi.svg",
        text: "Ensure stable internet connection"
    },
    {
        iconPath: "/interview/record.svg",
        text: "The interview will be recorded for evaluation"
    }

]

export default function InterviewSection({
    cameras,
    microphones,
    speakers,
    selectedCamera,
    selectedMic,
    selectedSpeaker,
    setSelectedCamera,
    setSelectedMic,
    setSelectedSpeaker,
    saveSelection,
    startInterview,
    onCameraStream,
    onMicStream,
    keepCameraStreamOnUnmount,
    keepMicStreamOnUnmount,
    permission,
    title,
    duration,

}: InterviewSectionProps) {
    const [isMicTesting, setIsMicTesting] = useState(false)
    const [audioLevel, setAudioLevel] = useState(0)
    const [isSpeakerTesting, setIsSpeakerTesting] = useState(false)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const micStreamRef = useRef<MediaStream | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const videoElementRef = useRef<HTMLVideoElement | null>(null)
    const cameraStreamRef = useRef<MediaStream | null>(null)

    const startMicTest = async () => {
        try {
            // Reuse existing stream if available, otherwise create new one
            const stream = micStreamRef.current || await navigator.mediaDevices.getUserMedia({ audio: true })
            const audioContext = new AudioContext()
            const analyser = audioContext.createAnalyser()
            const source = audioContext.createMediaStreamSource(stream)
            source.connect(analyser)  // Connect source to analyser

            micStreamRef.current = stream
            audioContextRef.current = audioContext
            analyserRef.current = analyser


            const buffer = new Uint8Array(analyser.frequencyBinCount)
            const updateLevel = () => {
                analyser.getByteFrequencyData(buffer)
                const avg = buffer.reduce((sum, val) => sum + val, 0) / buffer.length
                setAudioLevel(avg / 255)
                animationFrameRef.current = requestAnimationFrame(updateLevel)
            }

            updateLevel()
            setIsMicTesting(true)
        } catch (error) {
            console.error('Mic error:', error)
        }
    }

    const stopMicTest = () => {
        animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current)
        micStreamRef.current?.getTracks().forEach(track => track.stop())
        micStreamRef.current = null
        audioContextRef.current?.close() // Independent system resource → needs .close() to release
        audioContextRef.current = null
        setIsMicTesting(false)
        setAudioLevel(0)
    }

    const startMicStream = async () => {
        try {
            // Use 'ideal' instead of 'exact' to allow fallback if device unavailable
            const audioConstraints = selectedMic
                ? { deviceId: { ideal: selectedMic } }
                : true
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: audioConstraints
            })
            micStreamRef.current = stream
            // surface mic stream to parent for reuse (e.g., ActiveInterview)
            onMicStream?.(stream)
        } catch (error) {
            console.error('Mic stream error:', error)
        }
    }

    const startSpeakerTest = () => {
        const audio = new Audio('/interview/test.wav')
        audio.play().catch(err => console.error('Audio play error:', err))

        setIsSpeakerTesting(true)
        setTimeout(() => {
            setIsSpeakerTesting(false)
            audio.pause()
            audio.currentTime = 0
        }, 2000);
    }

    const startCamera = async () => {
        try {
            // Use 'ideal' instead of 'exact' to allow fallback if device unavailable
            const videoConstraints = selectedCamera
                ? { deviceId: { ideal: selectedCamera } }
                : true
            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints
            })

            // Stop old stream only after new one is ready
            if (cameraStreamRef.current) {
                cameraStreamRef.current.getTracks().forEach(track => track.stop())
            }

            cameraStreamRef.current = stream
            // surface camera stream to parent for reuse (e.g., ActiveInterview)
            onCameraStream?.(stream)
            console.log('Camera stream started')
            if (videoElementRef.current) {
                videoElementRef.current.srcObject = stream
            }
        } catch (error) {
            console.error('Camera error:', error)
        }
    }

    const restartCamera = () => {
        startCamera()
    }

    useEffect(() => {
        // Initial mount - start both streams
        startCamera()
        startMicStream()

        // Force cleanup on browser back/forward navigation
        const stopAllStreams = () => {
            console.log('[InterviewSection Cleanup] Stopping all streams');
            if (micStreamRef.current) {
                micStreamRef.current.getTracks().forEach(track => track.stop())
                micStreamRef.current = null
            }
            if (cameraStreamRef.current) {
                cameraStreamRef.current.getTracks().forEach(track => track.stop())
                cameraStreamRef.current = null
            }
            animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current)
            audioContextRef.current?.close()
            audioContextRef.current = null
            analyserRef.current = null
        }



        const handlePageHide = () => {
            console.log('[InterviewSection] beforeunload - stopping streams');
            stopAllStreams();
        }

        window.addEventListener('pagehide', handlePageHide) // popstate doesn't work

        return () => {
            window.removeEventListener('pagehide', handlePageHide);

            // Only fully stop mic test if we're not keeping the stream
            if (!keepMicStreamOnUnmount) {
                stopMicTest()
            } else {
                // Just cleanup UI state and audio analysis without killing the stream
                animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current)
                audioContextRef.current?.close()
                audioContextRef.current = null
                analyserRef.current = null
                setIsMicTesting(false)
                setAudioLevel(0)
            }

            // optionally keep mic stream alive for reuse on ActiveInterview
            if (!keepMicStreamOnUnmount && micStreamRef.current) {
                micStreamRef.current.getTracks().forEach(track => track.stop())
                micStreamRef.current = null
            }
            // optionally keep camera stream alive for reuse on ActiveInterview
            if (!keepCameraStreamOnUnmount && cameraStreamRef.current) {
                cameraStreamRef.current.getTracks().forEach(track => track.stop())
                cameraStreamRef.current = null
            }
        }
    }, [keepCameraStreamOnUnmount, keepMicStreamOnUnmount])

    useEffect(() => {
        // Only restart when device selection changes (not on initial mount)
        if (selectedCamera && cameraStreamRef.current) {
            startCamera()
        }
        if (selectedMic && micStreamRef.current) {
            startMicStream()
        }
    }, [selectedCamera, selectedMic])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='flex-2 px-24 '
        >
            {/* <RightSection /> */}
            <div>
                <div className="flex items-center gap-3 md:justify-end justify-start px-6 py-4">
                    <Button variant="outline" size="lg" className=" hover:bg-transparent rounded-3xl text-[rgba(104,100,247,1)] font-semibold border-[rgba(142,158,254,0.6)] px-15" >FAQ</Button>
                    <Button variant="outline" size="lg" className="hover:text-bg-transparent rounded-3xl text-[rgba(104,100,247,1)] font-semibold border-[rgba(142,158,254,0.6)] " >Contact Support</Button>
                </div>

                <div className="flex items-center px-6 py-4 justify-between mb-6">
                    <div>
                        <div className="relative">
                            <h2 className="text-2xl font-semibold bg-linear-to-r from-[rgba(0,13,144,0.9)] to-[rgba(93,107,238,1)] bg-clip-text text-transparent mb-1">{title || 'Interview'}</h2>
                            <Badge className="absolute font-semibold text-muted-foreground -right-16 top-0 bg-[rgba(85,98,228,0.1)]" variant="secondary">{duration ? `${duration} min` : '...'}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">AI-powered domain evaluation</p>
                    </div>
                </div>
                {/* Main Content Area */}
                <div className="w-full px-6">
                    <div className="w-full max-w-4xl mx-auto">


                        {/* Video Area */}
                        <div className="w-full relative bg-black rounded-lg overflow-hidden aspect-video">
                            <video
                                ref={videoElementRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Controls */}
                        <div className="grid grid-cols-3 gap-4 mb-6 mt-5">
                            <div className="space-y-2">
                                <Select
                                    value={selectedMic || undefined}
                                    onValueChange={(val) => {
                                        setSelectedMic(val)
                                        saveSelection('selectedMic', val)
                                    }}
                                >
                                    <SelectTrigger className="w-full justify-start gap-2">
                                        <Mic className="w-4 h-4" />
                                        <SelectValue placeholder="Microphone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {microphones?.map((m, idx) => (
                                            <SelectItem key={m.deviceId || `mic-${idx}`} value={m.deviceId}>
                                                {m.label || `Microphone ${idx + 1}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <button
                                    onClick={isMicTesting ? stopMicTest : startMicTest}
                                    className="text-xs text-green-600 hover:underline cursor-pointer"
                                >
                                    {isMicTesting ? 'Stop testing' : 'Test your mic'}
                                </button>
                                {isMicTesting && (
                                    <Progress value={audioLevel * 100} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Select
                                    value={selectedSpeaker || undefined}
                                    onValueChange={(val) => {
                                        setSelectedSpeaker(val)
                                        saveSelection('selectedSpeaker', val)
                                    }}
                                >
                                    <SelectTrigger className="w-full justify-start gap-2">
                                        <Volume2 className="w-4 h-4" />
                                        <SelectValue placeholder="Speakers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {speakers?.[0] && (
                                            <SelectItem key={speakers[0].deviceId} value={speakers[0].deviceId}>
                                                {speakers[0].label || 'Default Speaker'}
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                <button
                                    onClick={isSpeakerTesting ? undefined : startSpeakerTest}
                                    disabled={isSpeakerTesting}
                                    className="text-xs text-green-600 hover:underline cursor-pointer disabled:opacity-50"
                                >
                                    {isSpeakerTesting ? 'Playing...' : 'Play test sound'}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <Select
                                    value={selectedCamera || undefined}
                                    onValueChange={(val) => {
                                        setSelectedCamera(val)
                                        saveSelection('selectedCamera', val)
                                    }}
                                >
                                    <SelectTrigger className="w-full justify-start gap-2">
                                        <Video className="w-4 h-4" />
                                        <SelectValue placeholder="Camera" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cameras?.map((c, idx) => (
                                            <SelectItem key={c.deviceId || `cam-${idx}`} value={c.deviceId}>
                                                {c.label || `Camera ${idx + 1}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <button
                                    onClick={restartCamera}
                                    className="text-xs text-green-600 hover:underline cursor-pointer"
                                >
                                    Restart camera
                                </button>
                            </div>
                        </div>

                        {/* Keep Scrolling Button */}
                        <div className="mb-8">
                            <Button className="bg-[rgba(104,100,247,1)] hover:bg-[rgba(98,117,252,1)] text-white px-8 py-3 rounded-lg font-semibold">
                                Keep Scrolling
                            </Button>
                        </div>


                        {/* Before you begin section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-6">Before you begin</h3>
                            <div className="space-y-4">
                                {beforeYouBeginItems.map((item) => (
                                    <div key={item.text} className="flex items-center gap-3">
                                        <div className="w-7 h-7  flex items-center justify-center shrink-0">
                                            <Image
                                                src={item.iconPath}
                                                alt=""
                                                width={12}
                                                height={12}
                                                className="w-3 h-3"
                                            />
                                        </div>
                                        <p className="text-sm  font-medium ">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Start Now Button */}
                        <div className="text-center mb-4">
                            <Button
                                disabled={permission !== 'granted'}
                                onClick={startInterview}
                                className={`w-full hover:bg-transparent border-2 border-[rgba(104,100,247,1)] hover:text-[rgba(104,100,247,1)] bg-[rgba(104,100,247,1)] text-white py-3 rounded-lg font-semibold text-lg ${permission !== 'granted' ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' : ''}`}
                            >
                                Start Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
