'use client'

/**
 * ActiveInterview Component (with Zustand Actions)
 *
 * This is a highly simplified version that uses:
 * - Zustand store for all state
 * - Centralized actions for cross-module communication
 * - Minimal refs (only UI refs and timers)
 */

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import AIVisualization from './AIVisualization'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  ScreenShare,
  Loader2,
  Circle,
  CheckCircle2,
  AlertCircle,
  Code2,
} from 'lucide-react'
import { toast } from 'sonner'

// Code Editor
import { CodeEditor, EditorToolbar } from '@/components/editor'
import { useCodeEditorStore } from './store'

// Zustand store
import {
  useInterviewStore,
  useMessages,
  useConversationUIState,
  useMediaControlsState,
  useRecordingState,
  useIsAISpeaking,
  useIsAudioPlaying,
} from './store'

// Hooks
import { useInterviewWebSocket } from './hooks/useInterviewWebSocket'
import { useAudioRecorder } from './hooks/useAudioRecorder'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useMediaRecording } from './hooks'

// Centralized actions
import {
  handleMicToggle,
  handleVideoToggle,
  handleEndInterview,
  startRecording,
  stopRecording,
  stopPlayback,
  disconnectWebSocket,
  enableSilenceDetection,
  stopSilenceDetection,
  cleanupAll,
  transitionToListening,
} from './store/interviewActions'

import { MixedAudioContext } from './lib/audioUtils'

// ============================================================================
// Types
// ============================================================================

type ActiveInterviewProps = {
  cameraStream?: MediaStream | null
  micStream?: MediaStream | null
  templateId: string
  sessionId: string
}

// ============================================================================
// Component
// ============================================================================

export default function ActiveInterview({
  cameraStream,
  micStream,
  templateId,
  sessionId,
}: ActiveInterviewProps) {
  const router = useRouter()

  // -------------------------------------------------------------------------
  // Store state (optimized selectors)
  // -------------------------------------------------------------------------
  const {
    connectionStatus,
    conversationState,
    isProcessing,
    // NOTE: isAISpeaking removed from this selector - use useIsAISpeaking() directly
    error,
    showEndConfirm,
  } = useConversationUIState()

  // isAISpeaking is now derived from conversationState + streamingText
  const isAISpeaking = useIsAISpeaking()
  // isAudioPlaying is true only when actual audio is playing (for visualization)
  const isAudioPlaying = useIsAudioPlaying()

  const { isMicOn, isVideoOn, isScreenSharing } = useMediaControlsState()

  const {
    isVideoRecording,
    isScreenRecording,
    videoUploadStatus,
    screenUploadStatus,
    recordingDuration,
  } = useRecordingState()

  const messages = useMessages()
  const isConnected = connectionStatus === 'connected'

  // Code editor state
  const isCodeEditorOpen = useCodeEditorStore((s) => s.isOpen)
  const codeEditorContent = useCodeEditorStore((s) => s.content)
  const codeEditorLanguage = useCodeEditorStore((s) => s.language)

  // -------------------------------------------------------------------------
  // UI Refs only
  // -------------------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // -------------------------------------------------------------------------
  // Initialize store
  // -------------------------------------------------------------------------
  useEffect(() => {
    useInterviewStore.getState().initialize(sessionId, templateId)
    return () => {
      cleanupAll()
    }
  }, [sessionId, templateId])

  // -------------------------------------------------------------------------
  // Setup hooks (they register their controls internally)
  // -------------------------------------------------------------------------

  // WebSocket - handles all message routing
  const { isConnected: wsConnected } = useInterviewWebSocket({
    sessionId,
    templateId,
    onInterviewEnd: () => {
      toast.success('Interview Completed')
      setTimeout(() => {
        toast.info('Processing results. Please wait for it to finish', { duration: 2000 })
        router.push('/candidate/dashboard')
      }, 2000)
    },
  })

  // Audio recorder - registers controls for recording
  const { isRecording, getMixedAudioContext } = useAudioRecorder({
    micStream: micStream || null,
    silenceConfig: {
      silenceDuration: 1000,
    },
  })

  // Audio player - registers controls for playback
  const { isPlaying } = useAudioPlayer()

  // Media recording
  const mediaRecording = useMediaRecording({
    sessionId,
    sendBinary: () => { },
    sendText: () => { },
    isConnected: wsConnected,
  })

  // -------------------------------------------------------------------------
  // Video element setup
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream, isVideoOn])

  // -------------------------------------------------------------------------
  // Auto-scroll messages
  // -------------------------------------------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // -------------------------------------------------------------------------
  // Token queue processing
  // -------------------------------------------------------------------------
  const isProcessingTokensRef = useRef(false)
  // Subscribe to token queue changes (runs outside render cycle - no re-renders)
  useEffect(() => {
    const unsubscribe = useInterviewStore.subscribe(
      (state) => state.streamingText.tokenQueue.length,
      (queueLength) => {
        if (queueLength > 0 && !isProcessingTokensRef.current) {
          isProcessingTokensRef.current = true
          useInterviewStore.getState().setIsProcessingTokens(true)

          const processTokens = () => {
            const currentStore = useInterviewStore.getState()
            const token = currentStore.processNextToken()
            if (token !== null) {
              setTimeout(processTokens, 20)
            } else {
              isProcessingTokensRef.current = false
              currentStore.setIsProcessingTokens(false)
            }
          }

          processTokens()
        }
      }
    )

    return () => unsubscribe()
  }, [])

  // -------------------------------------------------------------------------
  // Start recording when connected
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (wsConnected && micStream && isMicOn && conversationState === 'listening') {
      startRecording(true)
    }
  }, [wsConnected, micStream, isMicOn, conversationState])

  // -------------------------------------------------------------------------
  // Start video recording when connected
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (wsConnected && cameraStream) {
      mediaRecording.startVideoRecording(cameraStream)
    } else {
      mediaRecording.stopVideoRecording()
    }
  }, [wsConnected, cameraStream])

  // -------------------------------------------------------------------------
  // Recording duration timer
  // -------------------------------------------------------------------------
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    const store = useInterviewStore.getState()

    if (isVideoRecording || isScreenRecording) {
      if (!store.recordingStartTime) {
        store.setRecordingStartTime(Date.now())
      }
      interval = setInterval(() => {
        const currentStartTime = useInterviewStore.getState().recordingStartTime
        if (currentStartTime) {
          const elapsed = Math.floor((Date.now() - currentStartTime) / 1000)
          useInterviewStore.getState().setRecordingDuration(elapsed)
        }
      }, 1000)
    } else {
      store.setRecordingDuration(0)  //check
      store.setRecordingStartTime(null) //check
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isVideoRecording, isScreenRecording])

  // -------------------------------------------------------------------------
  // Conversation state management - silence detection and thinking timeout
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (conversationState === 'thinking') {
      if (thinkingTimerRef.current)
        clearTimeout(thinkingTimerRef.current)
      stopSilenceDetection()

      // TODO: Re-enable with proper backend cancellation support
      // Force state transition after 10 seconds - DISABLED to avoid conflicts with late server responses
      // thinkingTimerRef.current = setTimeout(() => {
      //   console.log('[ActiveInterview] 10s thinking timeout - forcing transition to listening')
      //   transitionToListening()
      //   startRecording(true).catch(console.error)
      // }, 10000)
    } else if (conversationState === 'speaking') {
      // Never run silence detection while AI audio is playing
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
        thinkingTimerRef.current = null
      }
      stopSilenceDetection()
    } else {
      // listening state
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
        thinkingTimerRef.current = null
      }
      // Setup silence detection if we're recording
      const store = useInterviewStore.getState()
      if (store.audio.isRecording) {
        enableSilenceDetection()
      }
    }

    return () => {
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current)
    }
  }, [conversationState])

  // -------------------------------------------------------------------------
  // Browser close/unload handlers
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Send finalize message via sendBeacon for reliability on page close
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
      if (sessionId) {
        try {
          navigator.sendBeacon(
            `${apiUrl}/api/v1/interview-session/${sessionId}/media/finalize/`,
            JSON.stringify({ type: 'finalize_all_media' })
          )
        } catch (error) {
          console.error('[Media Upload] Error sending beacon:', error)
        }
      }
    }

    const handlePageHide = () => {
      const store = useInterviewStore.getState()
      store.setHasNavigatedAway(true)
      stopRecording()
      stopPlayback()
      mediaRecording.stopVideoRecording()
      mediaRecording.stopScreenRecording()
      MixedAudioContext.destroyInstance()
      screenStreamRef.current?.getTracks().forEach((t) => t.stop())
      disconnectWebSocket()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [sessionId])

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const onMicToggle = () => handleMicToggle()

  const onVideoToggle = () => handleVideoToggle()

  const onScreenShare = async () => {
    const store = useInterviewStore.getState()

    if (store.isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
      mediaRecording.stopScreenRecording()
      store.setIsScreenSharing(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        })
        screenStreamRef.current = stream
        store.setIsScreenSharing(true)

        await mediaRecording.startScreenRecording(stream)

        stream.getVideoTracks()[0].addEventListener('ended', () => {
          screenStreamRef.current = null
          mediaRecording.stopScreenRecording()
          store.setIsScreenSharing(false)
        })
      } catch (error) {
        store.setError('Failed to start screen sharing')
      }
    }
  }

  const onEndInterview = () => {
    handleEndInterview(
      cameraStream || null,
      micStream || null,
      screenStreamRef.current,
      () => router.push('/candidate/dashboard')
    )
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center relative bg-gray-800">
        <div className="relative">
          <AIVisualization isPlaying={isAudioPlaying} />

          {/* Candidate Video Preview */}
          <div className="fixed bottom-30 right-6 w-60 h-50 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
            {cameraStream && isVideoOn ? (
              <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={!isMicOn}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                <Image src="/interview/logo.svg" alt="Interview" height={80} width={80} className="object-cover" priority />
                <p>Camera off</p>
              </div>
            )}
          </div>

          {/* Conversation Panel */}
          <div className="fixed top-4 left-4 w-96 max-h-[60vh] bg-gray-800/95 rounded-lg border border-gray-700 shadow-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="text-white font-semibold">Conversation</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-sm">Waiting for interview to start...</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'p-3 rounded-lg text-sm',
                      message.speaker === 'ai'
                        ? 'bg-blue-600/20 text-blue-100 ml-8'
                        : 'bg-gray-700 text-gray-100 mr-8'
                    )}
                  >
                    <div className="font-semibold mb-1">
                      {message.speaker === 'ai' ? 'AI Interviewer' : 'You'}
                    </div>
                    <div>{message.text}</div>
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="p-3 rounded-lg bg-gray-700/50 text-gray-400 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing your response...</span>
                </div>
              )}
              {isAISpeaking && (
                <div className="p-3 rounded-lg bg-blue-600/20 text-blue-100 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is speaking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Code Editor Panel - resizable with CSS */}
          {isCodeEditorOpen && (
            <div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[75vh] bg-gray-800 rounded-lg border border-gray-700 shadow-xl flex flex-col overflow-hidden z-50"
            >
              <EditorToolbar
                language={codeEditorLanguage}
                onLanguageChange={(lang) => useCodeEditorStore.getState().setLanguage(lang)}
                onCopy={() => navigator.clipboard.writeText(codeEditorContent)}
              />
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  value={codeEditorContent}
                  onChange={(val) => useCodeEditorStore.getState().setContent(val)}
                  language={codeEditorLanguage}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-4 items-center flex justify-center gap-4">
        {/* Mute Button */}
        <Button
          onClick={onMicToggle}
          disabled={!isConnected}
          className={cn(
            'rounded-full w-14 h-14 flex items-center justify-center transition-all',
            isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          )}
          title={isMicOn ? 'Mute' : 'Unmute'}
        >
          {isMicOn ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </Button>

        {/* Video Toggle Button */}
        <Button
          onClick={onVideoToggle}
          className={cn(
            'rounded-full w-14 h-14 flex items-center justify-center transition-all',
            isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          )}
          title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
        >
          {isVideoOn ? (
            <Video className="w-6 h-6 text-white" />
          ) : (
            <VideoOff className="w-6 h-6 text-white" />
          )}
        </Button>

        {/* Share Screen Button */}
        <Button
          onClick={onScreenShare}
          className={cn(
            'rounded-full w-14 h-14 flex items-center justify-center transition-all',
            isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
          )}
          title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          <ScreenShare className="w-6 h-6 text-white" />
        </Button>

        {/* Code Editor Toggle */}
        <Button
          onClick={() => useCodeEditorStore.getState().toggleEditor()}
          className={cn(
            'rounded-full w-14 h-14 flex items-center justify-center transition-all',
            isCodeEditorOpen ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
          )}
          title="Code Editor"
        >
          <Code2 className="w-6 h-6 text-white" />
        </Button>

        {/* End Call Button */}
        <Button
          onClick={onEndInterview}
          className={cn(
            'rounded-full w-14 h-14 flex items-center justify-center bg-red-600 hover:bg-red-700 transition-all'
          )}
          title="End Call"
        >
          <Phone className="w-6 h-6 text-white rotate-135" />
        </Button>
      </div>

      {/* End Interview Confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-white text-lg font-semibold mb-4">End Interview?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to end this interview? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => useInterviewStore.getState().setShowEndConfirm(false)}
                className="hover:opacity-90"
              >
                Cancel
              </Button>
              <Button
                onClick={onEndInterview}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                End Interview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status and Recording Indicators */}
      <div className="fixed bottom-1 left-4 flex flex-col gap-2">
        <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </span>

        {/* Video Recording Status */}
        {isVideoRecording && (
          <div className="flex items-center gap-2 bg-gray-800/90 px-3 py-1.5 rounded-lg border border-gray-700">
            <Circle className={`w-3 h-3 ${videoUploadStatus === 'error' ? 'text-red-500' : videoUploadStatus === 'complete' ? 'text-green-500' : 'text-red-500 animate-pulse'}`} fill="currentColor" />
            <span className="text-xs text-white">
              Video Recording
              {recordingDuration > 0 && (
                <span className="ml-2 text-gray-400">
                  {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                </span>
              )}
            </span>
            {videoUploadStatus === 'uploading' && (
              <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
            )}
            {videoUploadStatus === 'complete' && (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            )}
            {videoUploadStatus === 'error' && (
              <AlertCircle className="w-3 h-3 text-red-500" />
            )}
          </div>
        )}

        {/* Screen Recording Status */}
        {isScreenRecording && (
          <div className="flex items-center gap-2 bg-gray-800/90 px-3 py-1.5 rounded-lg border border-gray-700">
            <Circle className={`w-3 h-3 ${screenUploadStatus === 'error' ? 'text-red-500' : screenUploadStatus === 'complete' ? 'text-green-500' : 'text-red-500 animate-pulse'}`} fill="currentColor" />
            <span className="text-xs text-white">
              Screen Recording
            </span>
            {screenUploadStatus === 'uploading' && (
              <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
            )}
            {screenUploadStatus === 'complete' && (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            )}
            {screenUploadStatus === 'error' && (
              <AlertCircle className="w-3 h-3 text-red-500" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
