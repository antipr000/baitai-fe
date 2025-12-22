'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Video, VideoOff, Phone, ScreenShare, Loader2 } from 'lucide-react'
import { useWebSocket } from '@/hooks/useWebSocket'

type ActiveInterviewProps = {
  cameraStream?: MediaStream | null
  micStream?: MediaStream | null
  templateId: string
}

type Message = {
  id: string
  speaker: 'ai' | 'candidate'
  text: string
  timestamp: Date
}

export default function ActiveInterview({ cameraStream, micStream, templateId }: ActiveInterviewProps) {
  const router = useRouter()
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isSharing, setIsSharing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const silenceRAFRef = useRef<number | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Audio playback refs
  const audioPlaybackContextRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<ArrayBuffer[]>([])
  const isPlayingRef = useRef(false)
  const aiStreamBufferRef = useRef<string>('') // Accumulates streaming AI text
  const currentAiMessageIdRef = useRef<string | null>(null)

  // UI refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const conversationPanelRef = useRef<HTMLDivElement | null>(null)

  // Silence detection constants
  const SILENCE_THRESHOLD = 30 // Audio level threshold (0-255)
  const SILENCE_DURATION = 2000 // 2 seconds of silence before sending end_of_turn

  // Define message handler types
  type WebSocketTextMessage = {
    type: 'response.text' | 'response.wait' | 'error'
    text?: string
    message?: string
    status?: string
    user_transcript?: string  // User's transcribed speech
  }

  const playNextAudioRef = useRef<(() => Promise<void>) | null>(null)
  const startRecordingRef = useRef<(() => void) | null>(null)
  const isConnectedRef = useRef(false)
  const micStreamRef = useRef<MediaStream | null>(null)
  const isMicOnRef = useRef(true)
  const hasSentEndOfTurnRef = useRef(false)

  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return
    }

    isPlayingRef.current = true
    setIsAISpeaking(true)
    console.log('[Audio Playback] Starting AI audio playback')

    try {
      if (!audioPlaybackContextRef.current) {
        audioPlaybackContextRef.current = new AudioContext()
      }

      const audioData = audioQueueRef.current.shift()!
      const audioBuffer = await audioPlaybackContextRef.current.decodeAudioData(audioData)
      const source = audioPlaybackContextRef.current.createBufferSource()
      source.buffer = audioBuffer

      source.onended = () => {
        isPlayingRef.current = false
        setIsAISpeaking(false)
        console.log('[Audio Playback] AI finished speaking, checking for more audio...')
        
        // Play next audio if available
        if (audioQueueRef.current.length > 0 && playNextAudioRef.current) {
          console.log('[Audio Playback] More audio in queue, playing next chunk')
          playNextAudioRef.current()
        } else {
          // AI finished speaking completely - start user recording
          console.log('[Audio Playback] AI finished speaking completely, starting user recording')
          if (isConnectedRef.current && micStreamRef.current && isMicOnRef.current && startRecordingRef.current) {
            startRecordingRef.current()
          }
        }
      }

      source.connect(audioPlaybackContextRef.current.destination)
      source.start(0)
    } catch (error) {
      console.error('[Audio Playback] Error playing audio:', error)
      isPlayingRef.current = false
      setIsAISpeaking(false)
      // Try next audio
      if (audioQueueRef.current.length > 0 && playNextAudioRef.current) {
        playNextAudioRef.current()
      } else {
        // If error and no more audio, start recording
        if (isConnectedRef.current && micStreamRef.current && isMicOnRef.current && startRecordingRef.current) {
          startRecordingRef.current()
        }
      }
    }
  }, [])

  // Store the function in ref for recursive calls
  useEffect(() => {
    playNextAudioRef.current = playNextAudio
  }, [playNextAudio])

  const handleAudioData = useCallback(async (audioData: ArrayBuffer) => {
    // Queue audio for playback
    audioQueueRef.current.push(audioData)
    if (playNextAudioRef.current) {
      playNextAudioRef.current()
    }
  }, [])

  const handleTextMessage = useCallback((message: WebSocketTextMessage) => {
    console.log('[WebSocket] Received text message:', message)
    
    if (message.type === 'response.text') {
      console.log('[WebSocket] AI response text received, stopping user recording')
      setIsProcessing(false)
      setIsAISpeaking(true)
      
      // Stop user recording when AI starts responding
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log('[WebSocket] Stopping user recording as AI is responding')
        mediaRecorderRef.current.stop()
      }
      
      // Clear audio buffers to discard any recorded audio
      console.log('[WebSocket] Clearing audio buffers')
      audioChunksRef.current = []
      hasSentEndOfTurnRef.current = false
      
      // Add user message to conversation if transcript is available
      if (message.user_transcript && message.user_transcript !== '[Silence/Unintelligible]') {
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          speaker: 'candidate',
          text: message.user_transcript,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])
        console.log('[WebSocket] Added user message to conversation:', message.user_transcript)
      }
      
      // Add AI message to conversation
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        speaker: 'ai',
        text: message.text || '',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      // Clear any previous streaming state
      aiStreamBufferRef.current = ''
      currentAiMessageIdRef.current = null
    } else if (message.type === 'response.start') {
      // Start of streaming AI response; stop user recording and capture user transcript
      setIsProcessing(false)
      setIsAISpeaking(true)

      if (message.user_transcript && message.user_transcript !== '[Silence/Unintelligible]') {
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          speaker: 'candidate',
          text: message.user_transcript,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])
      }

      const aiMessageId = `ai-${Date.now()}`
      currentAiMessageIdRef.current = aiMessageId
      aiStreamBufferRef.current = ''
      const aiMessage: Message = {
        id: aiMessageId,
        speaker: 'ai',
        text: '',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } else if (message.type === 'response.text.chunk') {
      // Append streamed chunk to current AI message
      const aiId = currentAiMessageIdRef.current
      if (!aiId) return
      aiStreamBufferRef.current = `${aiStreamBufferRef.current}${aiStreamBufferRef.current ? ' ' : ''}${message.text || ''}`.trim()
      setMessages((prev) =>
        prev.map((m) => (m.id === aiId ? { ...m, text: aiStreamBufferRef.current } : m)),
      )
    } else if (message.type === 'response.text.complete') {
      // Finalize streaming AI message
      const aiId = currentAiMessageIdRef.current
      if (aiId) {
        const finalText = message.text || aiStreamBufferRef.current
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, text: finalText } : m)),
        )
      }
      aiStreamBufferRef.current = ''
      currentAiMessageIdRef.current = null
      setIsAISpeaking(false)
    } else if (message.type === 'response.wait') {
      console.log('[WebSocket] Response wait - processing...')
      setIsProcessing(true)
      setIsAISpeaking(false)
      
      // Add user message to conversation even during wait if transcript is available
      if (message.user_transcript && message.user_transcript !== '[Silence/Unintelligible]') {
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          speaker: 'candidate',
          text: message.user_transcript,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])
        console.log('[WebSocket] Added user message during wait:', message.user_transcript)
      }
    } else if (message.type === 'error') {
      console.error('[WebSocket] Error message received:', message.message)
      setIsProcessing(false)
      setError(message.message || 'An error occurred')
    }
  }, [])

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: ArrayBuffer | string) => {
    if (data instanceof ArrayBuffer) {
      // Binary audio data
      handleAudioData(data)
    } else if (typeof data === 'string') {
      // JSON text message
      try {
        const message = JSON.parse(data) as WebSocketTextMessage
        handleTextMessage(message)
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
      }
    }
  }, [handleAudioData, handleTextMessage])

  const { isConnected, send, ws } = useWebSocket({
    templateId,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('[WebSocket] Connected - waiting for AI to start speaking')
      isConnectedRef.current = true
      // Don't start recording immediately - wait for AI to finish speaking
    },
    onDisconnect: () => {
      console.log('[WebSocket] Disconnected')
      isConnectedRef.current = false
      stopRecording()
    },
    onError: (error) => {
      console.error('[WebSocket] Error:', error)
      setError('Connection error. Please try again.')
    },
  })

  // Update refs when values change
  useEffect(() => {
    isConnectedRef.current = isConnected
  }, [isConnected])

  useEffect(() => {
    micStreamRef.current = micStream || null
  }, [micStream])

  useEffect(() => {
    isMicOnRef.current = isMicOn
  }, [isMicOn])

  const closeWebSocket = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close()
    }
  }, [ws])

  // Helper function to convert AudioBuffer to raw PCM (16-bit, mono, 16kHz)
  const audioBufferToRawPCM = useCallback(async (buffer: AudioBuffer): Promise<ArrayBuffer> => {
    const targetSampleRate = 16000
    let processedBuffer = buffer
    
    // Resample to 16kHz if needed
    if (buffer.sampleRate !== targetSampleRate) {
      const offlineContext = new OfflineAudioContext(1, Math.floor(buffer.length * targetSampleRate / buffer.sampleRate), targetSampleRate)
      const source = offlineContext.createBufferSource()
      source.buffer = buffer
      source.connect(offlineContext.destination)
      source.start(0)
      processedBuffer = await offlineContext.startRendering()
    }
    
    // Convert to mono if needed (average all channels)
    let audioData: Float32Array
    if (processedBuffer.numberOfChannels > 1) {
      const channel0 = processedBuffer.getChannelData(0)
      audioData = new Float32Array(processedBuffer.length)
      for (let i = 0; i < processedBuffer.length; i++) {
        let sum = channel0[i]
        for (let ch = 1; ch < processedBuffer.numberOfChannels; ch++) {
          sum += processedBuffer.getChannelData(ch)[i]
        }
        audioData[i] = sum / processedBuffer.numberOfChannels
      }
    } else {
      audioData = processedBuffer.getChannelData(0)
    }
    
    // Convert float samples to 16-bit PCM (little-endian)
    const pcmBuffer = new ArrayBuffer(audioData.length * 2) // 2 bytes per sample
    const view = new DataView(pcmBuffer)
    
    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.max(-1, Math.min(1, audioData[i]))
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(i * 2, intSample, true) // true = little-endian
    }
    
    return pcmBuffer
  }, [])

  // Helper function to convert WebM chunks to raw PCM
  const convertWebMToRawPCM = useCallback(async (webmChunks: Blob[]): Promise<ArrayBuffer> => {
    if (webmChunks.length === 0) {
      throw new Error('No audio chunks to convert')
    }

    // Combine all WebM chunks into a single Blob
    const webmBlob = new Blob(webmChunks, { type: 'audio/webm;codecs=opus' })
    
    // Decode WebM audio using Web Audio API
    const arrayBuffer = await webmBlob.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Convert AudioBuffer to raw PCM (handles resampling and mono conversion)
    const pcmBuffer = await audioBufferToRawPCM(audioBuffer)
    return pcmBuffer
  }, [audioBufferToRawPCM])

  const stopSilenceDetection = useCallback(() => {
    if (silenceRAFRef.current !== null) {
      cancelAnimationFrame(silenceRAFRef.current)
      silenceRAFRef.current = null
    }
    analyserRef.current = null
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error)
      audioContextRef.current = null
    }
  }, [])

  const sendEndOfTurn = useCallback(async () => {
    if (!isConnected || isProcessing || hasSentEndOfTurnRef.current) {
      console.log('[End of Turn] Skipping - isConnected:', isConnected, 'isProcessing:', isProcessing, 'hasSent:', hasSentEndOfTurnRef.current)
      return
    }

    console.log('[End of Turn] Sending end_of_turn signal to backend')
    setIsProcessing(true)
    hasSentEndOfTurnRef.current = true
    
    // Stop recording when sending end of turn
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('[End of Turn] Stopping recording')
      mediaRecorderRef.current.stop()
      
      // Wait a bit for the final chunk to be added
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    // Pause silence detection to avoid repeated triggers while processing
    stopSilenceDetection()
    
    // Convert accumulated WebM chunks to raw PCM and send
    if (audioChunksRef.current.length > 0) {
      try {
        console.log('[End of Turn] Converting WebM chunks to raw PCM...')
        const pcmBuffer = await convertWebMToRawPCM(audioChunksRef.current)
        
        // Clear the audio buffer
        audioChunksRef.current = []
        
        // Send the raw PCM audio to backend
        console.log('[End of Turn] Sending raw PCM audio to backend:', pcmBuffer.byteLength, 'bytes')
        send(pcmBuffer)
        
        // Wait a bit to ensure the audio is sent before end_of_turn
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        console.error('[End of Turn] Error converting audio to PCM:', error)
      }
    }

    const endOfTurnMessage = JSON.stringify({ type: 'end_of_turn' })
    send(endOfTurnMessage)
  }, [isConnected, isProcessing, send, convertWebMToRawPCM, stopSilenceDetection])

  const setupSilenceDetection = useCallback(() => {
    if (!micStream || !isMicOn) {
      console.log('[Silence Detection] Skipping setup - micStream:', !!micStream, 'isMicOn:', isMicOn)
      return
    }

    try {
      console.log('[Silence Detection] Setting up silence detection...')
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }

      const source = audioContextRef.current.createMediaStreamSource(micStream)
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let silenceStartTime: number | null = null

      const checkSilence = () => {
        if (!analyserRef.current || !isMicOn) return

        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length

        if (average < SILENCE_THRESHOLD) {
          // Silence detected
          if (silenceStartTime === null) {
            silenceStartTime = Date.now()
            console.log('[Silence Detection] Silence started')
          } else if (Date.now() - silenceStartTime > SILENCE_DURATION) {
            // Send end_of_turn signal
            console.log('[Silence Detection] Silence duration exceeded, sending end_of_turn')
            sendEndOfTurn()
            silenceStartTime = null
          }
        } else {
          // Audio detected, reset silence timer
          if (silenceStartTime !== null) {
            console.log('[Silence Detection] Audio detected, resetting silence timer')
            silenceStartTime = null
          }
        }

        silenceRAFRef.current = requestAnimationFrame(checkSilence)
      }

      checkSilence()
      console.log('[Silence Detection] Silence detection active')
    } catch (error) {
      console.error('[Silence Detection] Error setting up silence detection:', error)
    }
  }, [micStream, isMicOn, sendEndOfTurn])

  // Start audio recording
  const startRecording = useCallback(() => {
    const currentMicStream = micStreamRef.current
    const currentIsConnected = isConnectedRef.current
    
    if (!currentMicStream || !currentIsConnected) {
      console.log('[Recording] Cannot start recording - micStream:', !!currentMicStream, 'isConnected:', currentIsConnected)
      return
    }

    // Don't start if already recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('[Recording] Already recording, skipping start')
      return
    }

    try {
      console.log('[Recording] Starting user audio recording...')
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(currentMicStream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      hasSentEndOfTurnRef.current = false // Reset flag for new recording session

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log(`[Recording] Audio chunk available: ${event.data.size} bytes (accumulated: ${audioChunksRef.current.length} chunks)`)
          // Don't send chunks in real-time - we'll convert to WAV and send when end_of_turn is triggered
        }
      }

      mediaRecorder.onerror = (error) => {
        console.error('[Recording] MediaRecorder error:', error)
        setError('Recording error occurred')
      }

      mediaRecorder.onstart = () => {
        console.log('[Recording] MediaRecorder started successfully')
      }

      mediaRecorder.onstop = () => {
        console.log('[Recording] MediaRecorder stopped')
      }

      // Start recording with timeslice for streaming
      mediaRecorder.start(100) // Send chunks every 100ms
      console.log('[Recording] MediaRecorder started with 100ms timeslice')

      // Setup silence detection
      setupSilenceDetection()
    } catch (error) {
      console.error('[Recording] Error starting recording:', error)
      setError('Failed to start recording')
    }
  }, [setupSilenceDetection])

  // Store startRecording in ref
  useEffect(() => {
    startRecordingRef.current = startRecording
  }, [startRecording])

  const stopRecording = useCallback(() => {
    console.log('[Recording] Stopping recording...')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      console.log('[Recording] MediaRecorder stopped')
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    stopSilenceDetection()
    console.log('[Recording] AudioContext closed')
  }, [stopSilenceDetection])

  const handleEndInterview = async () => {
    if (!showEndConfirm) {
      setShowEndConfirm(true)
      return
    }

    // Stop recording
    stopRecording()

    // Close WebSocket
    closeWebSocket()

    // Stop media streams
    cameraStream?.getTracks().forEach(track => track.stop())
    micStream?.getTracks().forEach(track => track.stop())
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    // Cleanup audio playback
    if (audioPlaybackContextRef.current && audioPlaybackContextRef.current.state !== 'closed') {
      audioPlaybackContextRef.current.close().catch(console.error)
    }

    // Navigate away (you can customize this)
    router.push('/candidate/dashboard')

    //bug : sometimes camera does not turn off

  }

  const handleMicToggle = () => {
    setIsMicOn(!isMicOn)
    if (!isMicOn && isConnected) {
      // Restart recording if re-enabling mic
      startRecording()
    }
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Setup video stream
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream

    }
  }, [cameraStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
      closeWebSocket()
      if (audioPlaybackContextRef.current && audioPlaybackContextRef.current.state !== 'closed') {
        audioPlaybackContextRef.current.close().catch(console.error)
      }
    }
  }, [closeWebSocket, stopRecording])

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
                <Image src="/interview/logo.svg" alt="Interview" height={80} width={80} className="object-cover" priority />
                <p>Camera off</p>
              </div>
            )}
          </div>

          {/* Conversation Panel */}
          <div 
            ref={conversationPanelRef}
            className="fixed top-4 left-4 w-96 max-h-[60vh] bg-gray-800/95 rounded-lg border border-gray-700 shadow-xl overflow-hidden flex flex-col"
          >
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

          {/* Error Message */}
          {error && (
            <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg max-w-md">
              <p className="text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="mt-2 text-white hover:bg-red-700"
              >
                Dismiss
              </Button>
            </div>
          )}
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
          onClick={() => setIsVideoOn(!isVideoOn)}
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
          onClick={() => setIsSharing(!isSharing)}
          className={cn(
            'rounded-full w-14 h-14 flex items-center justify-center transition-all',
            isSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
          )}
          title={isSharing ? 'Stop Sharing' : 'Share Screen'}
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
            <h3 className="text-white text-lg font-semibold mb-4">End Interview?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to end this interview? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowEndConfirm(false)}
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

      {/* Connection Status */}
      <div className="fixed bottom-1 left-4">
        <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </span>
      </div>
    </div>
  )
}