'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
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
  /**
   * Conversation state machine:
   * - listening: user is expected to speak (silence detection active)
   * - thinking: end_of_turn sent; waiting for backend response (silence detection paused)
   * - speaking: AI audio is actively playing (silence detection paused)
   */
  type ConversationState = 'listening' | 'thinking' | 'speaking'
  const [conversationState, setConversationState] = useState<ConversationState>('listening')
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const silenceRAFRef = useRef<number | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const hasHeardSpeechThisListeningTurnRef = useRef(false)
  const noiseFloorRmsRef = useRef<number>(0.008)

  // Audio playback refs
  const audioPlaybackContextRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<ArrayBuffer[]>([])
  const isPlayingRef = useRef(false)
  const aiStreamBufferRef = useRef<string>('') // Accumulates streaming AI text
  const currentAiMessageIdRef = useRef<string | null>(null)
  const tokenQueueRef = useRef<string[]>([]) // Queue of tokens to display
  const isProcessingTokensRef = useRef(false) // Whether we're currently processing the queue

  // UI refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const conversationPanelRef = useRef<HTMLDivElement | null>(null)

  // Silence detection constants
  // Prefer time-domain RMS over frequency averages; more robust with background noise.
  const SILENCE_DURATION = 2000 // ms of silence after user speech before sending end_of_turn
  const NOISE_FLOOR_ALPHA = 0.05 // EMA smoothing for ambient noise floor
  const MIN_NOISE_FLOOR = 0.008 // minimum RMS (normalized 0..1) treated as baseline noise
  const SPEECH_MARGIN = 0.025 // how much above noise floor counts as speech
  const SILENCE_MARGIN = 0.012 // how much above noise floor still counts as silence (hysteresis)

  // Define message handler types
  type WebSocketTextMessage = {
    type: 'response.text' | 'response.start' | 'response.text.chunk' | 'response.text.complete' | 'response.wait' | 'response.completed' | 'error'
    text?: string
    message?: string
    status?: string
    user_transcript?: string  // User's transcribed speech
    next_action?: string
    error_type?: string  // Type of error (e.g., 'audio', 'session')
  }

  const playNextAudioRef = useRef<(() => Promise<void>) | null>(null)
  const startRecordingRef = useRef<((enableSilenceDetection?: boolean) => Promise<void>) | null>(null)
  const isConnectedRef = useRef(false)
  const micStreamRef = useRef<MediaStream | null>(null)
  const isMicOnRef = useRef(true)
  const hasSentEndOfTurnRef = useRef(false)
  const conversationStateRef = useRef<ConversationState>('listening')

  // Keep an imperative ref in sync with UI state
  useEffect(() => {
    conversationStateRef.current = conversationState
  }, [conversationState])

  // Process token queue one at a time for visible streaming
  const processTokenQueue = useCallback(() => {
    if (isProcessingTokensRef.current || tokenQueueRef.current.length === 0) {
      return
    }

    isProcessingTokensRef.current = true
    const aiId = currentAiMessageIdRef.current

    if (!aiId) {
      isProcessingTokensRef.current = false
      tokenQueueRef.current = []
      return
    }

    const processNext = () => {
      if (tokenQueueRef.current.length === 0) {
        isProcessingTokensRef.current = false
        return
      }

      const token = tokenQueueRef.current.shift()!
      aiStreamBufferRef.current += token

      // Force synchronous update to prevent batching
      flushSync(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, text: aiStreamBufferRef.current } : m)),
        )
      })

      // Process next token after a small delay (20ms for smooth streaming)
      setTimeout(processNext, 20)
    }

    processNext()
  }, [])

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
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return
    }

    isPlayingRef.current = true
    setIsAISpeaking(true)
    setConversationState('speaking')
    // Ensure we never run silence detection while the AI is speaking
    stopSilenceDetection()
    // Keep recording running to avoid missing user speech; only silence detection is disabled.
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
          console.log('[Audio Playback] AI finished speaking completely')
          // Immediately go back to listening: silence detection restarts for the user's response.
          setConversationState('listening')
          hasSentEndOfTurnRef.current = false
          hasHeardSpeechThisListeningTurnRef.current = false
          // IMPORTANT: Do NOT clear `audioChunksRef` while a MediaRecorder session is active.
          // WebM requires the init segment/header from the start of the session; clearing mid-stream corrupts decoding.
          // To start a fresh "turn" buffer, restart the recorder.
          if (isConnectedRef.current && isMicOnRef.current && startRecordingRef.current) {
            const recorder = mediaRecorderRef.current
            const recorderActive = recorder && recorder.state !== 'inactive'
            if (recorderActive) {
              console.log('[Recording] Restarting MediaRecorder for new user turn')
              const onStopHandler = () => {
                recorder.removeEventListener('stop', onStopHandler)
                startRecordingRef.current?.(true)
              }
              recorder.addEventListener('stop', onStopHandler)
              try {
                recorder.stop()
              } catch (e) {
                recorder.removeEventListener('stop', onStopHandler)
                console.error('[Recording] Failed to stop recorder for restart:', e)
                startRecordingRef.current(true)
              }
            } else {
              startRecordingRef.current(true)
            }
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
        // If playback fails and no more audio, treat it as "done speaking"
        setConversationState('listening')
        hasSentEndOfTurnRef.current = false
        hasHeardSpeechThisListeningTurnRef.current = false
        if (isConnectedRef.current && isMicOnRef.current && startRecordingRef.current) {
          const recorder = mediaRecorderRef.current
          const recorderActive = recorder && recorder.state !== 'inactive'
          if (recorderActive) {
            console.log('[Recording] Restarting MediaRecorder for new user turn (after playback error)')
            const onStopHandler = () => {
              recorder.removeEventListener('stop', onStopHandler)
              startRecordingRef.current?.(true)
            }
            recorder.addEventListener('stop', onStopHandler)
            try {
              recorder.stop()
            } catch (e) {
              recorder.removeEventListener('stop', onStopHandler)
              console.error('[Recording] Failed to stop recorder for restart:', e)
              startRecordingRef.current(true)
            }
          } else {
            startRecordingRef.current(true)
          }
        }
      }
    }
  }, [stopSilenceDetection])

  // Store the function in ref for recursive calls
  useEffect(() => {
    playNextAudioRef.current = playNextAudio
  }, [playNextAudio])

  const handleAudioData = useCallback(async (audioData: ArrayBuffer) => {
    // Validate audio data
    if (!audioData || audioData.byteLength === 0) {
      console.warn('[Audio] Received empty audio data, skipping')
      return
    }

    // Limit queue size to prevent memory issues (keep last 10 chunks)
    if (audioQueueRef.current.length >= 10) {
      console.warn('[Audio] Audio queue full, removing oldest chunk')
      audioQueueRef.current.shift()
    }

    // Queue audio for playback
    audioQueueRef.current.push(audioData)
    if (playNextAudioRef.current) {
      playNextAudioRef.current()
    }
  }, [])

  const closeWebSocketRef = useRef<(() => void) | null>(null)

  const handleTextMessage = useCallback((message: WebSocketTextMessage) => {
    console.log('[WebSocket] Received text message:', message)

    if (message.type === 'response.text') {
      console.log('[WebSocket] AI response text received, stopping user recording')
      setIsProcessing(false)
      setIsAISpeaking(true)
      // Don't clobber 'speaking' once audio playback has started
      if (conversationStateRef.current !== 'speaking') setConversationState('thinking')

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
      if (conversationStateRef.current !== 'speaking') setConversationState('thinking')

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
      tokenQueueRef.current = [] // Clear any previous tokens
      isProcessingTokensRef.current = false
      const aiMessage: Message = {
        id: aiMessageId,
        speaker: 'ai',
        text: '',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } else if (message.type === 'response.text.chunk') {
      // Queue the token for gradual display
      const aiId = currentAiMessageIdRef.current
      if (!aiId) return
      
      const token = message.text || ''
      tokenQueueRef.current.push(token)
      
      // Start processing the queue if not already processing
      processTokenQueue()
    } else if (message.type === 'response.text.complete') {
      // Finalize streaming AI message
      const aiId = currentAiMessageIdRef.current
      
      // Wait for queue to finish processing, then finalize
      const waitForQueueAndFinalize = () => {
        if (tokenQueueRef.current.length > 0 || isProcessingTokensRef.current) {
          setTimeout(waitForQueueAndFinalize, 50)
          return
        }
        
        if (aiId) {
          const finalText = message.text || aiStreamBufferRef.current
          setMessages((prev) =>
            prev.map((m) => (m.id === aiId ? { ...m, text: finalText } : m)),
          )
        }
        aiStreamBufferRef.current = ''
        currentAiMessageIdRef.current = null
        // This is *text* stream completion, not necessarily audio playback completion
        if (!isPlayingRef.current) setIsAISpeaking(false)
      }
      
      waitForQueueAndFinalize()
    } else if (message.type === 'response.wait') {
      console.log('[WebSocket] Response wait - processing...')
      setIsProcessing(true)
      setIsAISpeaking(false)
      if (conversationStateRef.current !== 'speaking') setConversationState('thinking')

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
    } else if (message.type === 'response.completed') {
      console.log('[WebSocket] Response completed - resuming listening')
      setIsProcessing(false)
      // No-op for state: we already transition speaking -> listening when playback ends.
    } else if (message.type === 'error') {
      console.error('[WebSocket] Error message received:', message.message)
      setIsProcessing(false)
      setConversationState('listening')
      setError(message.message || 'An error occurred')

      // Handle session errors by closing connection
      if (message.error_type === 'session') {
        console.error('[WebSocket] Session error detected, closing connection')
        if (closeWebSocketRef.current) {
          closeWebSocketRef.current()
        }
        // Optionally redirect or show a message
        setTimeout(() => {
          router.push('/candidate/dashboard')
        }, 2000)
      }

      // Reset flags on error
      hasSentEndOfTurnRef.current = false
    }
  }, [router])

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

  // Store closeWebSocket in ref for use in handleTextMessage
  useEffect(() => {
    closeWebSocketRef.current = closeWebSocket
  }, [closeWebSocket])

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

    // Filter out empty chunks
    const validChunks = webmChunks.filter(chunk => chunk && chunk.size > 0)
    if (validChunks.length === 0) {
      throw new Error('No valid audio chunks to convert (all chunks are empty)')
    }

    // Combine all WebM chunks into a single Blob
    const webmBlob = new Blob(validChunks, { type: 'audio/webm;codecs=opus' })

    if (webmBlob.size === 0) {
      throw new Error('Combined WebM blob is empty')
    }

    console.log(`[Audio Conversion] Converting WebM blob: ${webmBlob.size} bytes from ${validChunks.length} chunks`)

    // Decode WebM audio using Web Audio API
    const arrayBuffer = await webmBlob.arrayBuffer()
    const audioContext = new AudioContext()

    let audioBuffer: AudioBuffer
    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    } catch (error) {
      console.error('[Audio Conversion] Failed to decode WebM audio:', error)
      throw new Error(`Failed to decode audio data: ${error instanceof Error ? error.message : 'Unknown error'}. The audio stream may be corrupted or incomplete.`)
    }

    // Convert AudioBuffer to raw PCM (handles resampling and mono conversion)
    const pcmBuffer = await audioBufferToRawPCM(audioBuffer)
    console.log(`[Audio Conversion] Successfully converted to PCM: ${pcmBuffer.byteLength} bytes`)
    return pcmBuffer
  }, [audioBufferToRawPCM])

  const sendEndOfTurn = useCallback(async (): Promise<void> => {
    if (!isConnected || isProcessing || hasSentEndOfTurnRef.current) {
      console.log('[End of Turn] Skipping - isConnected:', isConnected, 'isProcessing:', isProcessing, 'hasSent:', hasSentEndOfTurnRef.current)
      return
    }

    // Check if we're actually recording and have audio chunks
    const isRecording = mediaRecorderRef.current !== null && mediaRecorderRef.current.state !== 'inactive'
    const hasAudioChunks = audioChunksRef.current.length > 0

    // Don't send end_of_turn if there's no audio to process
    if (!isRecording && !hasAudioChunks) {
      console.log('[End of Turn] Skipping - no audio recorded and not currently recording')
      return
    }

    console.log('[End of Turn] Sending end_of_turn signal to backend')
    setIsProcessing(true)
    hasSentEndOfTurnRef.current = true
    hasHeardSpeechThisListeningTurnRef.current = false

    // Stop recording when sending end of turn
    let recordingStoppedPromise: Promise<void> | null = null
    if (isRecording && mediaRecorderRef.current) {
      console.log('[End of Turn] Stopping recording')
      try {
        // Create a promise that resolves when recording fully stops
        recordingStoppedPromise = new Promise<void>((resolve) => {
          const recorder = mediaRecorderRef.current
          if (!recorder) {
            resolve()
            return
          }

          const onStopHandler = () => {
            recorder.removeEventListener('stop', onStopHandler)
            console.log('[End of Turn] Recording fully stopped, all chunks received')
            // Wait a bit more to ensure all dataavailable events have fired
            setTimeout(() => resolve(), 150)
          }

          recorder.addEventListener('stop', onStopHandler)
          recorder.stop()
        })
      } catch (error) {
        console.error('[End of Turn] Error stopping recorder:', error)
        recordingStoppedPromise = Promise.resolve()
      }
    } else {
      recordingStoppedPromise = Promise.resolve()
    }

    // Pause silence detection to avoid repeated triggers while processing
    stopSilenceDetection()

    // Wait for recording to fully stop and all chunks to arrive
    if (recordingStoppedPromise) {
      await recordingStoppedPromise
    }

    // Make a copy of chunks to avoid race conditions during processing
    const chunksToProcess = [...audioChunksRef.current]

    // Convert accumulated WebM chunks to raw PCM and send
    if (chunksToProcess.length > 0) {
      try {
        console.log(`[End of Turn] Converting ${chunksToProcess.length} WebM chunks to raw PCM...`)
        const pcmBuffer = await convertWebMToRawPCM(chunksToProcess)

        // Clear the audio buffer immediately after conversion
        audioChunksRef.current = []

        // Send the raw PCM audio to backend
        console.log('[End of Turn] Sending raw PCM audio to backend:', pcmBuffer.byteLength, 'bytes')
        if (!isConnectedRef.current || !send) {
          throw new Error('WebSocket not connected; cannot send audio')
        }
        send(pcmBuffer)
        // Wait a bit to ensure the audio is sent before end_of_turn
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        console.error('[End of Turn] Error converting audio to PCM:', error)
        console.error('[End of Turn] Not sending audio/end_of_turn because conversion failed')
        // Clear buffer on error to prevent stale data
        audioChunksRef.current = []
        // Don't send end_of_turn if audio conversion failed
        hasSentEndOfTurnRef.current = false
        setIsProcessing(false)
        setConversationState('listening')
        return
      }
    } else {
      // No audio chunks - don't send end_of_turn
      console.log('[End of Turn] No audio chunks available, skipping end_of_turn')
      hasSentEndOfTurnRef.current = false
      setIsProcessing(false)
      setConversationState('listening')
      return
    }

    // Send end_of_turn message only if we have audio
    try {
      if (!isConnectedRef.current || !send) {
        throw new Error('WebSocket not connected; cannot send end_of_turn')
      }
      const endOfTurnMessage = JSON.stringify({ type: 'end_of_turn' })
      send(endOfTurnMessage)
    } catch (error) {
      console.error('[End of Turn] Error sending end_of_turn message:', error)
      // Treat as failure: unlock and return to listening
      hasSentEndOfTurnRef.current = false
      setIsProcessing(false)
      setConversationState('listening')
      return
    }

    // Successful end_of_turn send -> thinking
    setConversationState('thinking')

    // Start capturing audio while thinking (without silence detection) to avoid missing resumed speech
    if (isConnectedRef.current && micStreamRef.current && isMicOnRef.current && startRecordingRef.current) {
      startRecordingRef.current(false)
    }
  }, [isConnected, isProcessing, send, convertWebMToRawPCM, stopSilenceDetection])

  const setupSilenceDetection = useCallback((): void => {
    if (conversationStateRef.current !== 'listening') {
      return
    }
    hasHeardSpeechThisListeningTurnRef.current = false
    noiseFloorRmsRef.current = MIN_NOISE_FLOOR
    const streamForAnalysis = micStreamRef.current
    const micOn = isMicOnRef.current
    const hasLiveTrack = streamForAnalysis?.getAudioTracks().some((t) => t.readyState === 'live')

    if (!streamForAnalysis || !hasLiveTrack || !micOn) {
      console.log('[Silence Detection] Skipping setup - micStream:', !!streamForAnalysis, 'hasLiveTrack:', !!hasLiveTrack, 'isMicOn:', micOn)
      return
    }

    try {
      console.log('[Silence Detection] Setting up silence detection...')
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
      // Some browsers create AudioContexts in 'suspended' until a user gesture.
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(console.error)
      }

      const source = audioContextRef.current.createMediaStreamSource(streamForAnalysis)
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser

      const timeDomain = new Uint8Array(analyser.fftSize)
      let silenceStartTime: number | null = null

      const checkSilence = () => {
        if (!analyserRef.current || !isMicOnRef.current || conversationStateRef.current !== 'listening') return

        // Only check for silence if we're actually recording and have some audio chunks
        const isRecording = mediaRecorderRef.current !== null && mediaRecorderRef.current.state !== 'inactive'
        const hasAudioChunks = audioChunksRef.current.length > 0

        if (!isRecording && !hasAudioChunks) {
          // Not recording and no audio chunks - don't trigger silence detection
          silenceRAFRef.current = requestAnimationFrame(checkSilence)
          return
        }

        // Compute time-domain RMS (0..1)
        analyserRef.current.getByteTimeDomainData(timeDomain)
        let sumSq = 0
        for (let i = 0; i < timeDomain.length; i++) {
          const centered = (timeDomain[i] - 128) / 128 // [-1..1]
          sumSq += centered * centered
        }
        const rms = Math.sqrt(sumSq / timeDomain.length)

        const prevFloor = noiseFloorRmsRef.current
        const speechThreshold = Math.max(MIN_NOISE_FLOOR + SPEECH_MARGIN, prevFloor + SPEECH_MARGIN)
        const isSpeech = rms > speechThreshold

        // Track ambient noise floor only before speech is detected this turn
        if (!hasHeardSpeechThisListeningTurnRef.current && !isSpeech) {
          noiseFloorRmsRef.current = Math.max(
            MIN_NOISE_FLOOR,
            prevFloor * (1 - NOISE_FLOOR_ALPHA) + rms * NOISE_FLOOR_ALPHA,
          )
        }

        if (isSpeech) {
          if (!hasHeardSpeechThisListeningTurnRef.current) {
            hasHeardSpeechThisListeningTurnRef.current = true
            console.log('[Silence Detection] Speech detected, arming end_of_turn on silence')
          }
          silenceStartTime = null
        } else {
          // Once speech has been detected for this turn, treat "not speech" as silence
          // (handles steady background noise that never falls below a strict silence threshold).
          if (hasAudioChunks && hasHeardSpeechThisListeningTurnRef.current) {
            if (silenceStartTime === null) {
              silenceStartTime = Date.now()
              console.log('[Silence Detection] Silence started')
            } else if (Date.now() - silenceStartTime > SILENCE_DURATION) {
              console.log('[Silence Detection] Silence duration exceeded, sending end_of_turn')
              sendEndOfTurn()
              silenceStartTime = null
            }
          } else {
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

  // Manage thinking timeout and toggle silence detection based on state
  useEffect(() => {
    if (conversationState === 'thinking') {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
      }
      thinkingTimerRef.current = setTimeout(() => {
        console.log('[Conversation State] Auto-toggling from thinking to listening after timeout')
        setIsProcessing(false)
        hasSentEndOfTurnRef.current = false
        setConversationState('listening')
        const recorderInactive = !mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive'
        if (recorderInactive && startRecordingRef.current && isConnectedRef.current && micStreamRef.current && isMicOnRef.current) {
          startRecordingRef.current(true)
        } else if (!recorderInactive) {
          setupSilenceDetection()
        }
      }, 10000)
      stopSilenceDetection()
    } else if (conversationState === 'speaking') {
      // Never run silence detection while AI audio is playing
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
        thinkingTimerRef.current = null
      }
      stopSilenceDetection()
    } else {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
        thinkingTimerRef.current = null
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        setupSilenceDetection()
      }
    }
  }, [conversationState, setupSilenceDetection, stopSilenceDetection])

  // Start audio recording
  const startRecording = useCallback(async (enableSilenceDetection?: boolean): Promise<void> => {
    const currentIsConnected = isConnectedRef.current
    const shouldEnableSilenceDetection = enableSilenceDetection ?? conversationStateRef.current === 'listening'

    if (!currentIsConnected) {
      console.log('[Recording] Cannot start recording - websocket disconnected')
      return
    }

    // Don't start if already recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('[Recording] Already recording, skipping start')
      return
    }

    let stream = micStreamRef.current
    const hasLiveTrack = stream?.getAudioTracks().some(track => track.readyState === 'live')

    if (!stream || !hasLiveTrack) {
      console.log('[Recording] Mic stream missing or ended, requesting new stream')
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        micStreamRef.current = stream
      } catch (error) {
        console.error('[Recording] Failed to obtain microphone stream:', error)
        setError('Microphone unavailable. Please re-enable mic permissions.')
        return
      }
    }

    try {
      console.log('[Recording] Starting user audio recording...')
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream!, {
        mimeType: 'audio/webm;codecs=opus',
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      hasSentEndOfTurnRef.current = false // Reset flag for new recording session

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          // Don't remove chunks - WebM format requires all chunks for proper decoding
          // Removing chunks corrupts the audio stream and causes decoding errors
          audioChunksRef.current.push(event.data)
          const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
          console.log(`[Recording] Audio chunk available: ${event.data.size} bytes (accumulated: ${audioChunksRef.current.length} chunks, total: ${totalSize} bytes)`)
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

      // Setup silence detection only if we're in listening mode
      if (shouldEnableSilenceDetection) {
        setupSilenceDetection()
      } else {
        stopSilenceDetection()
      }
    } catch (error) {
      console.error('[Recording] Error starting recording:', error)
      setError('Failed to start recording')
    }
  }, [setupSilenceDetection, stopSilenceDetection])

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

    // Stop recording first
    stopRecording()

    // Close WebSocket
    closeWebSocket()

    // Stop all media tracks with proper error handling
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
          track.stop()
          track.enabled = false
        })
      }
      if (micStream) {
        micStream.getTracks().forEach(track => {
          track.stop()
          track.enabled = false
        })
      }

      // Also stop any tracks from video element if they exist
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => {
          track.stop()
          track.enabled = false
        })
        videoRef.current.srcObject = null
      }
    } catch (error) {
      console.error('[End Interview] Error stopping media tracks:', error)
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.pause()
      videoRef.current.load()
    }

    // Cleanup audio playback
    if (audioPlaybackContextRef.current && audioPlaybackContextRef.current.state !== 'closed') {
      try {
        await audioPlaybackContextRef.current.close()
      } catch (error) {
        console.error('[End Interview] Error closing audio context:', error)
      }
    }

    // Navigate away (you can customize this)
    router.push('/candidate/dashboard')
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
    const videoElement = videoRef.current
    const cameraStreamCopy = cameraStream
    const micStreamCopy = micStream

    return () => {
      stopRecording()
      closeWebSocket()

      // Cleanup all media tracks
      try {
        if (cameraStreamCopy) {
          cameraStreamCopy.getTracks().forEach(track => {
            track.stop()
            track.enabled = false
          })
        }
        if (micStreamCopy) {
          micStreamCopy.getTracks().forEach(track => {
            track.stop()
            track.enabled = false
          })
        }
        if (videoElement && videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream
          stream.getTracks().forEach(track => {
            track.stop()
            track.enabled = false
          })
          videoElement.srcObject = null
        }
      } catch (error) {
        console.error('[Cleanup] Error stopping media tracks:', error)
      }

      if (audioPlaybackContextRef.current && audioPlaybackContextRef.current.state !== 'closed') {
        audioPlaybackContextRef.current.close().catch(console.error)
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error)
      }
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      if (silenceRAFRef.current !== null) {
        cancelAnimationFrame(silenceRAFRef.current)
      }
      // Clear token queue
      tokenQueueRef.current = []
      isProcessingTokensRef.current = false
    }
  }, [closeWebSocket, stopRecording, cameraStream, micStream])

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