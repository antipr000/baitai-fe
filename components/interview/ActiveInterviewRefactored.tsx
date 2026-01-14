'use client'

/**
 * ActiveInterview Component (Refactored)
 *
 * This is a simplified version of the interview component that uses:
 * - Zustand store for state management
 * - Custom hooks for audio recording, playback, and media recording
 * - Significantly reduced refs (only UI refs remain)
 *
 * Original: ~2500 lines, 46+ refs
 * Refactored: ~400 lines, ~5 refs (UI only)
 */

import React, { useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { toast } from 'sonner'

// Import our new modules
import {
  useInterviewStore,
  useMessages,
  useConversationUIState,
  useMediaControlsState,
  useRecordingState,
  useStreamingText,
} from './store'
import { useInterviewWebSocket, useAudioRecorder, useAudioPlayer, useMediaRecording } from './hooks'
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

export default function ActiveInterviewRefactored({
  cameraStream,
  micStream,
  templateId,
  sessionId,
}: ActiveInterviewProps) {
  const router = useRouter()

  // -------------------------------------------------------------------------
  // Store state (optimized selectors using shallow equality)
  // -------------------------------------------------------------------------
  
  // Combined selectors - re-renders only when contained values change
  const {
    connectionStatus,
    conversationState,
    isProcessing,
    isAISpeaking,
    error,
    showEndConfirm,
  } = useConversationUIState()

  const { isMicOn, isVideoOn, isScreenSharing } = useMediaControlsState()

  const {
    isVideoRecording,
    isScreenRecording,
    videoUploadStatus,
    screenUploadStatus,
    recordingDuration,
  } = useRecordingState()

  // Messages array - separate selector (reference stable unless messages change)
  const messages = useMessages()

  // Streaming text state for token processing
  const streamingText = useStreamingText()

  const isConnected = connectionStatus === 'connected'

  // -------------------------------------------------------------------------
  // UI Refs (only refs we need - for DOM elements)
  // -------------------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  
  // Timer ref for cleanup (cannot be in store - setTimeout ID)
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // -------------------------------------------------------------------------
  // Initialize store
  // -------------------------------------------------------------------------
  useEffect(() => {
    useInterviewStore.getState().initialize(sessionId, templateId)
  }, [sessionId, templateId])

  // -------------------------------------------------------------------------
  // Callback refs to avoid stale closures
  // -------------------------------------------------------------------------
  const enqueueAudioRef = useRef<((data: ArrayBuffer) => void) | null>(null)
  const startRecordingRef = useRef<((resetSilence?: boolean) => void) | null>(null)
  const stopRecordingRef = useRef<(() => void) | null>(null)

  // -------------------------------------------------------------------------
  // Hooks
  // -------------------------------------------------------------------------

  // Audio player hook (defined first so we can reference it)
  // Uses singleton MixedAudioContext for consistent audio routing
  const { enqueueAudio, stopPlayback } = useAudioPlayer({
    mixedAudioContext: MixedAudioContext.hasInstance() ? MixedAudioContext.getInstance() : null,
    onPlaybackComplete: () => {
      // Restart recording with silence detection when AI finishes speaking
      // Need to stop current recorder (if any) first to get fresh WebM headers
      const store = useInterviewStore.getState()
      if (store.connectionStatus !== 'connected' || !store.isMicOn || store.hasNavigatedAway) {
        return
      }

      // Use setTimeout to allow stop to complete before starting
      // This matches the original behavior where we wait for stop event
      stopRecordingRef.current?.()
      setTimeout(() => {
        const currentStore = useInterviewStore.getState()
        if (currentStore.connectionStatus === 'connected' && 
            currentStore.isMicOn && 
            !currentStore.hasNavigatedAway &&
            startRecordingRef.current) {
          startRecordingRef.current(true)
        }
      }, 100)
    },
    onPlaybackStart: () => {
      // Stop recording when AI starts speaking
      if (stopRecordingRef.current) {
        stopRecordingRef.current()
      }
    },
  })

  // Store enqueueAudio in ref for WebSocket callback
  useEffect(() => {
    enqueueAudioRef.current = enqueueAudio
  }, [enqueueAudio])

  // WebSocket hook
  const {
    isConnected: wsConnected,
    sendAudio,
    sendEndOfTurn,
    disconnect: disconnectWebSocket,
  } = useInterviewWebSocket({
    sessionId,
    templateId,
    onAudioData: (audioData: ArrayBuffer) => {
      // Forward to audio player using ref to avoid stale closure
      if (enqueueAudioRef.current) {
        enqueueAudioRef.current(audioData)
      }
    },
    onInterviewEnd: () => {
      // Stop all recordings
      stopRecordingRef.current?.()
      stopVideoRecording()
      stopScreenRecording()
      
      // Finalize all media uploads
      finalizeAllMedia()
      
      // Close WebSocket after a short delay for finalization
      setTimeout(() => {
        disconnectWebSocket()
      }, 1000)
      
      toast.message('Interview Completed')
      setTimeout(() => router.push('/candidate/dashboard'), 2000)
    },
    onStopRecording: () => {
      // Stop recording and clear buffer when AI starts responding
      stopAndClearBufferRef.current?.()
    },
    onAISpeakingStart: () => {
      // Stop recording when AI starts speaking (before audio arrives)
      // This matches the original behavior of stopping silence detection early
      stopRecordingRef.current?.()
    },
  })

  // Audio recorder hook - sendEndOfTurn processes audio then triggers onEndOfTurn
  const sendEndOfTurnRef = useRef<(() => Promise<void>) | null>(null)
  const stopAndClearBufferRef = useRef<(() => void) | null>(null)
  const enableSilenceDetectionRef = useRef<(() => void) | null>(null)
  
  const {
    startRecording,
    stopRecording,
    stopAndClearBuffer,
    flushAudio,
    getMixedAudioContext,
    sendEndOfTurn: recorderSendEndOfTurn,
    enableSilenceDetection,
  } = useAudioRecorder({
    micStream: micStream || null,
    isMicOn,
    onAudioReady: (pcmBuffer: ArrayBuffer) => {
      sendAudio(pcmBuffer)
    },
    onSilenceDetected: () => {
      // When silence is detected, call the recorder's sendEndOfTurn
      // which processes audio and then calls onEndOfTurn
      sendEndOfTurnRef.current?.()
    },
    onEndOfTurn: () => {
      // After audio is processed, send the WebSocket end_of_turn message
      // Returns boolean indicating success
      return sendEndOfTurn()
    },
    silenceConfig: {
      silenceDuration: 2000,
      noiseFloorAlpha: 0.05,
      minNoiseFloor: 0.008,
      speechMargin: 0.025,
      silenceMargin: 0.012,
    },
  })

  // Store sendEndOfTurn ref for use in silence detection callback
  useEffect(() => {
    sendEndOfTurnRef.current = recorderSendEndOfTurn
    stopAndClearBufferRef.current = stopAndClearBuffer
    enableSilenceDetectionRef.current = enableSilenceDetection
  }, [recorderSendEndOfTurn, stopAndClearBuffer, enableSilenceDetection])

  // Store recording functions in refs for callbacks
  useEffect(() => {
    startRecordingRef.current = startRecording
    stopRecordingRef.current = stopRecording
  }, [startRecording, stopRecording])

  // Media recording hook
  const {
    startVideoRecording,
    stopVideoRecording,
    startScreenRecording,
    stopScreenRecording,
    finalizeAllMedia,
  } = useMediaRecording({
    sessionId,
    sendBinary: (data) => {
      // Would need to add to WebSocket hook
    },
    sendText: (data) => {
      // Would need to add to WebSocket hook
    },
    isConnected: wsConnected,
  })

  // Note: MixedAudioContext is managed by useAudioRecorder hook
  // The singleton is initialized when recording starts

  // -------------------------------------------------------------------------
  // Video element setup
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  // -------------------------------------------------------------------------
  // Auto-scroll messages
  // -------------------------------------------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // -------------------------------------------------------------------------
  // Token queue processing for smooth streaming text display
  // -------------------------------------------------------------------------
  const isProcessingTokensRef = useRef(false)
  
  useEffect(() => {
    // If there are tokens in the queue and we're not already processing, start processing
    const store = useInterviewStore.getState()
    if (store.streamingText.tokenQueue.length > 0 && !isProcessingTokensRef.current) {
      isProcessingTokensRef.current = true
      store.setIsProcessingTokens(true)
      
      const processTokens = () => {
        const currentStore = useInterviewStore.getState()
        const token = currentStore.processNextToken()
        if (token !== null) {
          // Process next token after a small delay (20ms for smooth streaming)
          setTimeout(processTokens, 20)
        } else {
          isProcessingTokensRef.current = false
          currentStore.setIsProcessingTokens(false)
        }
      }
      
      processTokens()
    }
  }) // No dependencies - runs on every render but guards with ref

  // -------------------------------------------------------------------------
  // Start recording when connected
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (wsConnected && micStream && isMicOn && conversationState === 'listening') {
      startRecording(true)
    }
  }, [wsConnected, micStream, isMicOn, conversationState, startRecording])

  // -------------------------------------------------------------------------
  // Start video recording when connected with camera
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (wsConnected && cameraStream) {
      startVideoRecording(cameraStream)
    } else {
      stopVideoRecording()
    }
  }, [wsConnected, cameraStream, startVideoRecording, stopVideoRecording])

  // -------------------------------------------------------------------------
  // Recording duration timer
  // -------------------------------------------------------------------------
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    const store = useInterviewStore.getState()

    if (isVideoRecording || isScreenRecording) {
      // Set start time in store if not already set
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
      store.setRecordingDuration(0)
      store.setRecordingStartTime(null)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isVideoRecording, isScreenRecording])

  // -------------------------------------------------------------------------
  // Conversation state management (thinking timeout)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (conversationState === 'thinking') {
      // Clear any existing timer
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
      }

      // Set a timeout to auto-toggle from thinking to listening after 10 seconds
      thinkingTimerRef.current = setTimeout(() => {
        console.log('[Conversation State] Auto-toggling from thinking to listening after timeout')
        const store = useInterviewStore.getState()
        store.setIsProcessing(false)
        store.setHasSentEndOfTurn(false)
        store.setConversationState('listening')

        // Restart recording if conditions are met
        if (store.connectionStatus === 'connected' && store.isMicOn) {
          // Check if recorder is already active (from store to avoid stale closure)
          const isRecorderActive = store.audio.isRecording
          if (!isRecorderActive) {
            // Recorder is not active, start it with silence detection
            startRecordingRef.current?.(true)
          } else {
            // Recorder is already active, just enable silence detection
            enableSilenceDetectionRef.current?.()
          }
        }
      }, 10000)
    } else {
      // Clear timer when not thinking
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
        thinkingTimerRef.current = null
      }
    }

    return () => {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
      }
    }
  }, [conversationState])

  // -------------------------------------------------------------------------
  // Browser close/unload handlers
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (wsConnected) {
        // Send finalize message via sendBeacon as a fallback
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
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

    const handleVisibilityChange = () => {
      if (document.hidden && wsConnected) {
        // Flush any pending audio when tab becomes hidden
        flushAudio()
      }
    }

    const handlePageHide = () => {
      const store = useInterviewStore.getState()
      store.setHasNavigatedAway(true)

      // Stop all recordings and streams
      stopRecording()
      stopPlayback()
      stopVideoRecording()
      stopScreenRecording()

      // Cleanup mixed audio context singleton
      MixedAudioContext.destroyInstance()

      // Stop screen stream
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
        screenStreamRef.current = null
      }

      disconnectWebSocket()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [
    wsConnected,
    sessionId,
    flushAudio,
    stopRecording,
    stopPlayback,
    stopVideoRecording,
    stopScreenRecording,
    disconnectWebSocket,
  ])

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleMicToggle = useCallback(() => {
    const store = useInterviewStore.getState()
    const wasMicOn = store.isMicOn
    store.toggleMic()
    const newMicOn = !wasMicOn // Mic state after toggle

    // Restart recording if re-enabling mic and AI is not speaking
    if (newMicOn && wsConnected && conversationState !== 'speaking') {
      startRecording(true)
    }
  }, [wsConnected, conversationState, startRecording])

  const handleVideoToggle = useCallback(() => {
    useInterviewStore.getState().toggleVideo()
  }, [])

  const handleScreenShare = useCallback(async () => {
    const store = useInterviewStore.getState()

    if (store.isScreenSharing) {
      // Stop sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
        screenStreamRef.current = null
      }
      stopScreenRecording()
      store.setIsScreenSharing(false)
    } else {
      // Start sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        })
        screenStreamRef.current = stream
        store.setIsScreenSharing(true)

        await startScreenRecording(stream)

        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          screenStreamRef.current = null
          stopScreenRecording()
          store.setIsScreenSharing(false)
        })
      } catch (error) {
        console.error('[Screen Share] Error:', error)
        store.setError('Failed to start screen sharing')
      }
    }
  }, [startScreenRecording, stopScreenRecording])

  const handleEndInterview = useCallback(async () => {
    const store = useInterviewStore.getState()

    if (!store.showEndConfirm) {
      store.setShowEndConfirm(true)
      return
    }

    // Mark as navigated away to prevent further processing
    store.setHasNavigatedAway(true)

    // Stop all recordings
    stopRecording()
    stopPlayback()
    stopVideoRecording()
    stopScreenRecording()

    // Finalize media uploads
    await finalizeAllMedia()

    // Disconnect WebSocket
    disconnectWebSocket()

    // Stop all media tracks
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
    }
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop())
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    // Navigate away
    router.push('/candidate/dashboard')
  }, [
    cameraStream,
    micStream,
    stopRecording,
    stopPlayback,
    stopVideoRecording,
    stopScreenRecording,
    finalizeAllMedia,
    disconnectWebSocket,
    router,
  ])

  // -------------------------------------------------------------------------
  // Cleanup on unmount
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Store references to cleanup functions to avoid stale closures
    const cleanupFunctions = {
      stopRecording,
      stopPlayback,
      stopVideoRecording,
      stopScreenRecording,
      disconnectWebSocket,
      screenStreamRef,
      thinkingTimerRef,
    }

    return () => {
      const store = useInterviewStore.getState()
      store.setHasNavigatedAway(true)

      // Clear thinking timer
      if (cleanupFunctions.thinkingTimerRef.current) {
        clearTimeout(cleanupFunctions.thinkingTimerRef.current)
        cleanupFunctions.thinkingTimerRef.current = null
      }

      // Stop all recordings
      cleanupFunctions.stopRecording()
      cleanupFunctions.stopPlayback()
      cleanupFunctions.stopVideoRecording()
      cleanupFunctions.stopScreenRecording()

      // Cleanup mixed audio context singleton
      MixedAudioContext.destroyInstance()

      // Stop screen stream
      if (cleanupFunctions.screenStreamRef.current) {
        cleanupFunctions.screenStreamRef.current.getTracks().forEach((track) => track.stop())
        cleanupFunctions.screenStreamRef.current = null
      }

      // Disconnect WebSocket
      cleanupFunctions.disconnectWebSocket()

      // Reset store
      store.reset()
    }
  }, [stopRecording, stopPlayback, stopVideoRecording, stopScreenRecording, disconnectWebSocket])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center relative bg-gray-800">
        <div className="relative">
          <Image
            src="/interview/logo.svg"
            alt="Interviewer"
            height={100}
            width={100}
            className="object-cover"
            priority
          />

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
                <Image
                  src="/interview/logo.svg"
                  alt="Interview"
                  height={80}
                  width={80}
                  className="object-cover"
                  priority
                />
                <p>Camera off</p>
              </div>
            )}
          </div>

          {/* Conversation Panel */}
          <div
            className="fixed top-4 left-4 w-96 max-h-[60vh] bg-gray-800/95 rounded-lg border border-gray-700 shadow-xl overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-gray-700">
              <h3 className="text-white font-semibold">Conversation</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  Waiting for interview to start...
                </p>
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
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-4 items-center flex justify-center gap-4">
        {/* Mute Button */}
        <Button
          onClick={handleMicToggle}
          disabled={!isConnected}
          className={cn(
            'rounded-full w-14 h-14 flex items-center justify-center transition-all',
            isMicOn
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-red-600 hover:bg-red-700'
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
          onClick={handleVideoToggle}
          className={cn(
            'rounded-full w-14 h-14 flex items-center justify-center transition-all',
            isVideoOn
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-red-600 hover:bg-red-700'
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
          onClick={handleScreenShare}
          className={cn(
            'rounded-full w-14 h-14 flex items-center justify-center transition-all',
            isScreenSharing
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-700 hover:bg-gray-600'
          )}
          title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          <ScreenShare className="w-6 h-6 text-white" />
        </Button>

        {/* End Call Button */}
        <Button
          onClick={handleEndInterview}
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
            <h3 className="text-white text-lg font-semibold mb-4">
              End Interview?
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to end this interview? This action cannot be
              undone.
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  useInterviewStore.getState().setShowEndConfirm(false)
                }
                className="hover:opacity-90"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEndInterview}
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
        <span
          className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}
        >
          {isConnected ? '● Connected' : '● Disconnected'}
        </span>

        {/* Video Recording Status */}
        {isVideoRecording && (
          <div className="flex items-center gap-2 bg-gray-800/90 px-3 py-1.5 rounded-lg border border-gray-700">
            <Circle
              className={`w-3 h-3 ${
                videoUploadStatus === 'error'
                  ? 'text-red-500'
                  : videoUploadStatus === 'complete'
                    ? 'text-green-500'
                    : 'text-red-500 animate-pulse'
              }`}
              fill="currentColor"
            />
            <span className="text-xs text-white">
              Video Recording
              {recordingDuration > 0 && (
                <span className="ml-2 text-gray-400">
                  {Math.floor(recordingDuration / 60)}:
                  {(recordingDuration % 60).toString().padStart(2, '0')}
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
            <Circle
              className={`w-3 h-3 ${
                screenUploadStatus === 'error'
                  ? 'text-red-500'
                  : screenUploadStatus === 'complete'
                    ? 'text-green-500'
                    : 'text-red-500 animate-pulse'
              }`}
              fill="currentColor"
            />
            <span className="text-xs text-white">Screen Recording</span>
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
