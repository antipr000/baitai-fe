'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Video, VideoOff, Phone, ScreenShare, Loader2, Circle, CheckCircle2, AlertCircle } from 'lucide-react'
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
  
  // Recording status state
  const [isVideoRecording, setIsVideoRecording] = useState(false)
  const [isScreenRecording, setIsScreenRecording] = useState(false)
  const [videoUploadStatus, setVideoUploadStatus] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle')
  const [screenUploadStatus, setScreenUploadStatus] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle')
  const [recordingDuration, setRecordingDuration] = useState(0) // seconds
  const recordingStartTimeRef = useRef<number | null>(null)

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
  
  // Mixed audio recording refs (for capturing both user mic and AI audio)
  const mixedAudioContextRef = useRef<AudioContext | null>(null)
  const mixedAudioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const mixedAudioStreamRef = useRef<MediaStream | null>(null)
  const micSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const aiAudioGainNodeRef = useRef<GainNode | null>(null)

  // Video and screen recording refs
  const screenStreamRef = useRef<MediaStream | null>(null)
  const videoRecorderRef = useRef<MediaRecorder | null>(null)
  const screenRecorderRef = useRef<MediaRecorder | null>(null)
  const videoChunksRef = useRef<Blob[]>([])
  const screenChunksRef = useRef<Blob[]>([])
  
  // Media upload tracking refs
  const mediaUploadIntervalsRef = useRef<{
    audio: NodeJS.Timeout | null
    video: NodeJS.Timeout | null
    screen: NodeJS.Timeout | null
  }>({ audio: null, video: null, screen: null })
  const lastSentIndexRef = useRef<{
    audio: number
    video: number
    screen: number
  }>({ audio: 0, video: 0, screen: 0 })
  
  // Upload session tracking - track which sessions have been initialized
  const uploadSessionsInitializedRef = useRef<{
    video: boolean
    screen: boolean
  }>({ video: false, screen: false })
  
  // Retry tracking for failed uploads
  const uploadRetryCountRef = useRef<{
    video: number
    screen: number
  }>({ video: 0, screen: 0 })
  const MAX_RETRIES = 3
  
  // Refs for state values used in callbacks
  const isVideoRecordingRef = useRef(false)
  const isScreenRecordingRef = useRef(false)
  const videoUploadStatusRef = useRef<'idle' | 'uploading' | 'complete' | 'error'>('idle')
  const screenUploadStatusRef = useRef<'idle' | 'uploading' | 'complete' | 'error'>('idle')
  const startMediaUploadSessionRef = useRef<((recordingType: 'video' | 'screen') => Promise<boolean>) | null>(null)
  
  // Keep refs in sync with state
  useEffect(() => {
    isVideoRecordingRef.current = isVideoRecording
  }, [isVideoRecording])
  
  useEffect(() => {
    isScreenRecordingRef.current = isScreenRecording
  }, [isScreenRecording])
  
  useEffect(() => {
    videoUploadStatusRef.current = videoUploadStatus
  }, [videoUploadStatus])
  
  useEffect(() => {
    screenUploadStatusRef.current = screenUploadStatus
  }, [screenUploadStatus])

  // Audio playback refs
  const audioPlaybackContextRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<ArrayBuffer[]>([])
  const isPlayingRef = useRef(false)
  const aiStreamBufferRef = useRef<string>('') // Accumulates streaming AI text
  const currentAiMessageIdRef = useRef<string | null>(null)
  const tokenQueueRef = useRef<string[]>([]) // Queue of tokens to display
  const isProcessingTokensRef = useRef(false) // Whether we're currently processing the queue
  const expectedAudioChunkRef = useRef<{ chunkIndex: number; text: string } | null>(null) // Track expected audio chunk
  const sentenceCompleteRef = useRef<Map<number, string>>(new Map()) // Track completed sentences by chunk index
  const currentAISourceNodeRef = useRef<AudioBufferSourceNode | null>(null) // Track current AI audio source for mixing

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
    type: 'response.text' | 'response.start' | 'response.text.chunk' | 'response.text.complete' | 'response.wait' | 'response.completed' | 'response.audio.chunk' | 'response.sentence.complete' | 'error' | 'media_upload.started' | 'media_upload.error' | 'media_chunk.ack' | 'media_chunk.error'
    text?: string
    message?: string
    status?: string
    user_transcript?: string  // User's transcribed speech
    next_action?: string
    error_type?: string  // Type of error (e.g., 'audio', 'session')
    chunk_index?: number  // Audio chunk index
    recording_type?: 'video' | 'screen' | 'audio'
    bytes_uploaded?: number
  }

  const playNextAudioRef = useRef<(() => Promise<void>) | null>(null)
  const startRecordingRef = useRef<((enableSilenceDetection?: boolean) => Promise<void>) | null>(null)
  const stopRecordingRef = useRef<(() => void) | null>(null)
  const isConnectedRef = useRef(false)
  const cameraStreamRef = useRef<MediaStream | null>(null)
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

  // Initialize mixed audio context for recording both user mic and AI audio
  const initializeMixedAudioContext = useCallback(async (micStream: MediaStream): Promise<void> => {
    try {
      // Create or reuse mixed audio context
      if (!mixedAudioContextRef.current || mixedAudioContextRef.current.state === 'closed') {
        mixedAudioContextRef.current = new AudioContext({ sampleRate: 16000 })
      }
      
      if (mixedAudioContextRef.current.state === 'suspended') {
        await mixedAudioContextRef.current.resume()
      }

      // Create destination node for mixed audio recording
      if (!mixedAudioDestinationRef.current) {
        mixedAudioDestinationRef.current = mixedAudioContextRef.current.createMediaStreamDestination()
        mixedAudioStreamRef.current = mixedAudioDestinationRef.current.stream
      }

      // Connect mic input to mixed destination
      if (micSourceNodeRef.current) {
        micSourceNodeRef.current.disconnect()
      }
      micSourceNodeRef.current = mixedAudioContextRef.current.createMediaStreamSource(micStream)
      micSourceNodeRef.current.connect(mixedAudioDestinationRef.current)

      // Create gain node for AI audio (to control volume in mix)
      if (!aiAudioGainNodeRef.current) {
        aiAudioGainNodeRef.current = mixedAudioContextRef.current.createGain()
        aiAudioGainNodeRef.current.gain.value = 1.0 // Full volume
        aiAudioGainNodeRef.current.connect(mixedAudioDestinationRef.current)
      }

      console.log('[Mixed Audio] Initialized mixed audio context for recording')
    } catch (error) {
      console.error('[Mixed Audio] Error initializing mixed audio context:', error)
      throw error
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
      // Use mixed audio context if available, otherwise create a new playback context
      let playbackContext = mixedAudioContextRef.current
      if (!playbackContext || playbackContext.state === 'closed') {
        if (!audioPlaybackContextRef.current || audioPlaybackContextRef.current.state === 'closed') {
          audioPlaybackContextRef.current = new AudioContext()
        }
        playbackContext = audioPlaybackContextRef.current
      }

      if (playbackContext.state === 'suspended') {
        await playbackContext.resume()
      }

      const audioData = audioQueueRef.current.shift()!
      const audioBuffer = await playbackContext.decodeAudioData(audioData)
      const source = playbackContext.createBufferSource()
      source.buffer = audioBuffer
      currentAISourceNodeRef.current = source

      source.onended = () => {
        currentAISourceNodeRef.current = null
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

      // Connect to both speakers (for user to hear) and mixed destination (for recording)
      source.connect(playbackContext.destination) // Play to speakers
      if (aiAudioGainNodeRef.current && playbackContext === mixedAudioContextRef.current) {
        // Also connect to mixed audio destination for recording (only if using mixed context)
        source.connect(aiAudioGainNodeRef.current)
        console.log('[Audio Playback] AI audio routed to both speakers and recording mix')
      } else {
        console.log('[Audio Playback] AI audio routed to speakers only (mixed context not initialized)')
      }
      source.start(0)
    } catch (error) {
      console.error('[Audio Playback] Error playing audio:', error)
      currentAISourceNodeRef.current = null
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

    // Check if this is a streaming audio chunk
    if (expectedAudioChunkRef.current) {
      const chunkInfo = expectedAudioChunkRef.current
      const chunkIndex = chunkInfo.chunkIndex
      
      // Verify this matches a completed sentence for better sync
      const sentenceText = sentenceCompleteRef.current.get(chunkIndex)
      if (sentenceText && sentenceText === chunkInfo.text) {
        console.log(
          `[Audio] Received synchronized audio chunk ${chunkIndex} (${audioData.byteLength} bytes) for sentence: "${chunkInfo.text.substring(0, 30)}..."`
        )
        // Remove from tracking since we've received the audio
        sentenceCompleteRef.current.delete(chunkIndex)
      } else {
        console.log(
          `[Audio] Received audio chunk ${chunkIndex} (${audioData.byteLength} bytes) for: "${chunkInfo.text.substring(0, 30)}..."`
        )
      }
      expectedAudioChunkRef.current = null
    } else {
      // Legacy complete audio (for backward compatibility)
      console.log(`[Audio] Received complete audio (${audioData.byteLength} bytes)`)
    }

    // Limit queue size to prevent memory issues (keep last 10 chunks)
    if (audioQueueRef.current.length >= 10) {
      console.warn('[Audio] Audio queue full, removing oldest chunk')
      audioQueueRef.current.shift()
    }

    // Queue audio for playback - start playing immediately for better sync
    audioQueueRef.current.push(audioData)
    
    // Start playing immediately for synchronized playback
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
      expectedAudioChunkRef.current = null // Clear expected audio chunk
      sentenceCompleteRef.current.clear() // Clear sentence completion tracking
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
    } else if (message.type === 'response.sentence.complete') {
      // Sentence complete signal - text is ready, audio will follow
      const chunkIndex = message.chunk_index ?? 0
      const sentenceText = message.text || ''
      sentenceCompleteRef.current.set(chunkIndex, sentenceText)
      console.log(`[WebSocket] Sentence ${chunkIndex} complete: "${sentenceText.substring(0, 50)}..." - expecting audio chunk`)
      
      // Ensure we're in speaking state when sentence completes
      if (chunkIndex === 0 && !isAISpeaking) {
        setIsAISpeaking(true)
        setConversationState('speaking')
        stopSilenceDetection()
      }
    } else if (message.type === 'response.audio.chunk') {
      // Audio chunk metadata received, expect binary audio data next
      const chunkIndex = message.chunk_index ?? 0
      const chunkText = message.text || ''
      expectedAudioChunkRef.current = { chunkIndex, text: chunkText }
      console.log(`[WebSocket] Audio chunk ${chunkIndex} metadata received, expecting binary data for: "${chunkText.substring(0, 30)}..."`)
      
      // Check if this sentence was already marked as complete
      const sentenceText = sentenceCompleteRef.current.get(chunkIndex)
      if (sentenceText && sentenceText === chunkText) {
        console.log(`[WebSocket] Audio chunk ${chunkIndex} matches completed sentence - ready for synchronized playback`)
      }
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
      console.log('[WebSocket] Response completed - status:', message.status, 'next_action:', message.next_action)
      setIsProcessing(false)
      
      // Check if interview has completed
      const isCompleted = message.status === 'completed' || message.next_action === 'END_INTERVIEW'
      
      if (isCompleted) {
        console.log('[WebSocket] Interview completed - ending session')
        
        // Stop all recordings
        if (stopRecordingRef.current) {
          stopRecordingRef.current()
        }
        stopVideoRecording()
        stopScreenRecording()
        
        // Stop media upload intervals
        stopMediaUploadIntervals()
        
        // Finalize all media uploads before closing
        finalizeAllMedia()
        
        // Wait a bit for finalization to complete
        setTimeout(() => {
          // Close WebSocket
          if (closeWebSocketRef.current) {
            closeWebSocketRef.current()
          }
        }, 1000)
        
        // Add completion message to conversation
        const completionMessage: Message = {
          id: `completion-${Date.now()}`,
          speaker: 'ai',
          text: 'Thank you, the interview is now concluded.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, completionMessage])
        
        // Redirect to dashboard after a short delay to show the completion message
        setTimeout(() => {
          router.push('/candidate/dashboard')
        }, 2000)
      } else {
        // No-op for state: we already transition speaking -> listening when playback ends.
      }
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
    } else if (message.type === 'media_upload.started') {
      // Upload session confirmed by backend
      const recordingType = message.recording_type
      if (recordingType === 'video' || recordingType === 'screen') {
        console.log(`[Media Upload] Upload session confirmed for ${recordingType}`)
        uploadSessionsInitializedRef.current[recordingType] = true
        if (recordingType === 'video') {
          setVideoUploadStatus('uploading')
        } else {
          setScreenUploadStatus('uploading')
        }
      }
    } else if (message.type === 'media_upload.error') {
      // Upload session error
      const recordingType = message.recording_type
      console.error(`[Media Upload] Upload session error for ${recordingType}:`, message.message)
      if (recordingType === 'video') {
        setVideoUploadStatus('error')
        uploadSessionsInitializedRef.current.video = false
        // Try to reinitialize after a delay
        setTimeout(() => {
          if (isVideoRecordingRef.current && isConnectedRef.current && startMediaUploadSessionRef.current) {
            startMediaUploadSessionRef.current('video').catch(console.error)
          }
        }, 2000)
      } else if (recordingType === 'screen') {
        setScreenUploadStatus('error')
        uploadSessionsInitializedRef.current.screen = false
        // Try to reinitialize after a delay
        setTimeout(() => {
          if (isScreenRecordingRef.current && isConnectedRef.current && startMediaUploadSessionRef.current) {
            startMediaUploadSessionRef.current('screen').catch(console.error)
          }
        }, 2000)
      }
    } else if (message.type === 'media_chunk.ack') {
      // Chunk upload acknowledged
      const recordingType = message.recording_type
      if (recordingType === 'video' || recordingType === 'screen') {
        // Reset retry count on successful acknowledgment
        uploadRetryCountRef.current[recordingType] = 0
        // Update status to uploading if it was in error state
        if (recordingType === 'video' && videoUploadStatusRef.current === 'error') {
          setVideoUploadStatus('uploading')
        } else if (recordingType === 'screen' && screenUploadStatusRef.current === 'error') {
          setScreenUploadStatus('uploading')
        }
      }
    } else if (message.type === 'media_chunk.error') {
      // Chunk upload error
      const recordingType = message.recording_type
      console.error(`[Media Upload] Chunk upload error for ${recordingType}:`, message.message)
      if (recordingType === 'video') {
        setVideoUploadStatus('error')
      } else if (recordingType === 'screen') {
        setScreenUploadStatus('error')
      }
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

  const { isConnected, send, ws, sessionId } = useWebSocket({
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
    cameraStreamRef.current = cameraStream || null
  }, [cameraStream])

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
      // Initialize mixed audio context (for recording both user mic and AI audio)
      await initializeMixedAudioContext(stream)
      
      // Use mixed audio stream for recording (includes both user mic and AI audio)
      const recordingStream = mixedAudioStreamRef.current || stream
      console.log('[Recording] Starting mixed audio recording (user mic + AI audio)...')
      
      // Create MediaRecorder using mixed stream
      const mediaRecorder = new MediaRecorder(recordingStream, {
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
  }, [setupSilenceDetection, stopSilenceDetection, initializeMixedAudioContext])

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
    
    // Cleanup mixed audio nodes (but keep context for potential reuse)
    if (micSourceNodeRef.current) {
      micSourceNodeRef.current.disconnect()
      micSourceNodeRef.current = null
    }
    if (currentAISourceNodeRef.current) {
      currentAISourceNodeRef.current.disconnect()
      currentAISourceNodeRef.current = null
    }
    
    console.log('[Recording] AudioContext closed')
  }, [stopSilenceDetection])

  // Store stopRecording in ref
  useEffect(() => {
    stopRecordingRef.current = stopRecording
  }, [stopRecording])

  const handleEndInterview = async () => {
    if (!showEndConfirm) {
      setShowEndConfirm(true)
      return
    }

    // Stop all recordings
    stopRecording()
    stopVideoRecording()
    stopScreenRecording()

    // Stop media upload intervals
    stopMediaUploadIntervals()

    // Finalize all media uploads before closing
    finalizeAllMedia()

    // Wait a bit for finalization to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

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
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => {
            track.stop()
            track.enabled = false
          })
          screenStreamRef.current = null
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

  // Start media upload session (initialize binary upload)
  // Must be defined before startScreenRecording and startVideoRecording
  const startMediaUploadSession = useCallback(async (
    recordingType: 'video' | 'screen'
  ): Promise<boolean> => {
    if (!isConnected || !send) {
      console.warn(`[Media Upload] Cannot start ${recordingType} session - not connected`)
      return false
    }

    // Check if already initialized
    if (uploadSessionsInitializedRef.current[recordingType]) {
      console.log(`[Media Upload] ${recordingType} session already initialized`)
      return true
    }

    try {
      // Send start_media_upload message
      const message = {
        type: 'start_media_upload',
        recording_type: recordingType,
      }
      send(JSON.stringify(message))
      console.log(`[Media Upload] Started upload session for ${recordingType}`)
      
      // Mark as initialized optimistically (will be confirmed by backend response)
      // Backend will set _active_media_type which routes binary chunks correctly
      uploadSessionsInitializedRef.current[recordingType] = true
      
      // Small delay to allow backend to process the message
      // In practice, the backend processes this quickly, but we add a small buffer
      await new Promise(resolve => setTimeout(resolve, 50))
      
      return true
    } catch (error) {
      console.error(`[Media Upload] Error starting ${recordingType} upload session:`, error)
      uploadSessionsInitializedRef.current[recordingType] = false
      return false
    }
  }, [isConnected, send])
  
  // Store startMediaUploadSession in ref for use in error handlers
  useEffect(() => {
    startMediaUploadSessionRef.current = startMediaUploadSession
  }, [startMediaUploadSession])

  // Screen recording functions (must be defined before startScreenShare)
  const startScreenRecording = useCallback(async (stream: MediaStream) => {
    try {
      // Initialize upload session before starting recording
      if (isConnectedRef.current) {
        const initialized = await startMediaUploadSession('screen')
        if (!initialized) {
          console.error('[Screen Recording] Failed to initialize upload session')
          setScreenUploadStatus('error')
          return
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
      })

      screenRecorderRef.current = mediaRecorder
      screenChunksRef.current = []
      lastSentIndexRef.current.screen = 0
      uploadRetryCountRef.current.screen = 0

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          screenChunksRef.current.push(event.data)
          console.log(`[Screen Recording] Screen chunk available: ${event.data.size} bytes`)
        }
      }

      mediaRecorder.onerror = (error) => {
        console.error('[Screen Recording] MediaRecorder error:', error)
        setScreenUploadStatus('error')
      }

      mediaRecorder.onstop = () => {
        console.log('[Screen Recording] Screen recording stopped')
        setIsScreenRecording(false)
      }

      mediaRecorder.start(500) // Collect chunks every 500ms for more frequent uploads
      setIsScreenRecording(true)
      setScreenUploadStatus('uploading')
      console.log('[Screen Recording] Screen recording started')
    } catch (error) {
      console.error('[Screen Recording] Error starting screen recording:', error)
      setScreenUploadStatus('error')
    }
  }, [isConnected, send, startMediaUploadSession])

  const stopScreenRecording = useCallback(() => {
    if (screenRecorderRef.current && screenRecorderRef.current.state !== 'inactive') {
      screenRecorderRef.current.stop()
      console.log('[Screen Recording] Screen recording stopped')
      setIsScreenRecording(false)
    }
  }, [])

  // Screen sharing functions
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      screenStreamRef.current = stream
      setIsSharing(true)
      console.log('[Screen Share] Screen sharing started')

      // Start recording screen share
      await startScreenRecording(stream)

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare()
      })
    } catch (error) {
      console.error('[Screen Share] Error starting screen share:', error)
      setError('Failed to start screen sharing')
      setIsSharing(false)
      setScreenUploadStatus('error')
    }
  }, [startScreenRecording])

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop())
      screenStreamRef.current = null
    }
    setIsSharing(false)
    stopScreenRecording()
    console.log('[Screen Share] Screen sharing stopped')
  }, [stopScreenRecording])

  // Video recording functions
  const startVideoRecording = useCallback(async () => {
    if (!cameraStream) {
      console.warn('[Video Recording] No camera stream available')
      setVideoUploadStatus('error')
      return
    }

    try {
      // Initialize upload session before starting recording
      if (isConnectedRef.current) {
        const initialized = await startMediaUploadSession('video')
        if (!initialized) {
          console.error('[Video Recording] Failed to initialize upload session')
          setVideoUploadStatus('error')
          return
        }
      }

      const mediaRecorder = new MediaRecorder(cameraStream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      })

      videoRecorderRef.current = mediaRecorder
      videoChunksRef.current = []
      lastSentIndexRef.current.video = 0
      uploadRetryCountRef.current.video = 0

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          videoChunksRef.current.push(event.data)
          console.log(`[Video Recording] Video chunk available: ${event.data.size} bytes`)
        }
      }

      mediaRecorder.onerror = (error) => {
        console.error('[Video Recording] MediaRecorder error:', error)
        setVideoUploadStatus('error')
      }

      mediaRecorder.onstop = () => {
        console.log('[Video Recording] Video recording stopped')
        setIsVideoRecording(false)
      }

      mediaRecorder.start(500) // Collect chunks every 500ms for more frequent uploads
      setIsVideoRecording(true)
      setVideoUploadStatus('uploading')
      if (!recordingStartTimeRef.current) {
        recordingStartTimeRef.current = Date.now()
      }
      console.log('[Video Recording] Video recording started')
    } catch (error) {
      console.error('[Video Recording] Error starting video recording:', error)
      setVideoUploadStatus('error')
    }
  }, [cameraStream, isConnected, send, startMediaUploadSession])

  const stopVideoRecording = useCallback(() => {
    if (videoRecorderRef.current && videoRecorderRef.current.state !== 'inactive') {
      videoRecorderRef.current.stop()
      console.log('[Video Recording] Video recording stopped')
      setIsVideoRecording(false)
    }
  }, [])

  // Send media chunk via WebSocket (binary format for video/screen, base64 for audio)
  const sendMediaChunk = useCallback(async (
    recordingType: 'audio' | 'video' | 'screen',
    chunks: Blob[],
    isFinal: boolean = false
  ) => {
    if (!isConnected || !send) {
      return
    }
    
    // Allow empty chunks only if isFinal is true (for finalization signal)
    if (chunks.length === 0 && !isFinal) {
      return
    }

    try {
      // For video and screen, use binary uploads (more efficient)
      if (recordingType === 'video' || recordingType === 'screen') {
        // Ensure upload session is initialized
        if (!uploadSessionsInitializedRef.current[recordingType] && !isFinal && isConnectedRef.current) {
          const initialized = await startMediaUploadSession(recordingType)
          if (!initialized) {
            console.error(`[Media Upload] Failed to initialize ${recordingType} session`)
            if (recordingType === 'video') {
              setVideoUploadStatus('error')
            } else {
              setScreenUploadStatus('error')
            }
            return
          }
        }

        // For empty chunks with isFinal, send finalization message
        if (chunks.length === 0 && isFinal) {
          const message = {
            type: 'finalize_media',
            recording_type: recordingType,
          }
          send(JSON.stringify(message))
          console.log(
            `[Media Upload] Sent finalization signal for ${recordingType} (no chunks)`
          )
          return
        }

        // Combine chunks into a single blob
        const blob = new Blob(chunks, {
          type: recordingType === 'video'
            ? 'video/webm;codecs=vp8,opus'
            : 'video/webm;codecs=vp8'
        })

        // Convert to ArrayBuffer for binary upload
        const arrayBuffer = await blob.arrayBuffer()
        
        // Update upload status
        if (recordingType === 'video') {
          setVideoUploadStatus('uploading')
        } else {
          setScreenUploadStatus('uploading')
        }

        // Send binary data directly via WebSocket
        send(arrayBuffer)
        console.log(
          `[Media Upload] Sent ${recordingType} binary chunk: ${blob.size} bytes (final: ${isFinal})`
        )

        // If this is the final chunk, send finalization message after a short delay
        // to ensure the chunk is processed first
        if (isFinal) {
          setTimeout(() => {
            const finalizeMessage = {
              type: 'finalize_media',
              recording_type: recordingType,
            }
            send(JSON.stringify(finalizeMessage))
            console.log(
              `[Media Upload] Sent finalization message for ${recordingType}`
            )
            if (recordingType === 'video') {
              setVideoUploadStatus('complete')
            } else {
              setScreenUploadStatus('complete')
            }
          }, 100) // Small delay to ensure chunk is sent first
        }

        // Reset retry count on successful send
        uploadRetryCountRef.current[recordingType] = 0

      } else {
        // For audio, continue using base64 (legacy format)
        // For empty chunks with isFinal, send a minimal message to trigger finalization
        if (chunks.length === 0 && isFinal) {
          const message = {
            type: 'media_chunk',
            recording_type: recordingType,
            chunk: '', // Empty base64 string
            is_final: true,
          }
          send(JSON.stringify(message))
          console.log(
            `[Media Upload] Sent finalization signal for ${recordingType} (no chunks)`
          )
          return
        }

        // Combine chunks into a single blob
        const blob = new Blob(chunks, {
          type: 'audio/webm;codecs=opus'
        })

        // Convert to base64
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1]
            resolve(base64String)
          }
          reader.onerror = reject
        })
        reader.readAsDataURL(blob)

        const base64Data = await base64Promise

        // Send via WebSocket
        const message = {
          type: 'media_chunk',
          recording_type: recordingType,
          chunk: base64Data,
          is_final: isFinal,
        }

        send(JSON.stringify(message))
        console.log(
          `[Media Upload] Sent ${recordingType} chunk: ${blob.size} bytes (final: ${isFinal})`
        )
      }
    } catch (error) {
      console.error(`[Media Upload] Error sending ${recordingType} chunk:`, error)
      
      // Update error status
      if (recordingType === 'video') {
        setVideoUploadStatus('error')
      } else if (recordingType === 'screen') {
        setScreenUploadStatus('error')
      }

      // Retry logic for video/screen
      if ((recordingType === 'video' || recordingType === 'screen') && !isFinal) {
        const retryCount = uploadRetryCountRef.current[recordingType]
        if (retryCount < MAX_RETRIES) {
          uploadRetryCountRef.current[recordingType] = retryCount + 1
          console.log(
            `[Media Upload] Retrying ${recordingType} chunk upload (attempt ${retryCount + 1}/${MAX_RETRIES})`
          )
          // Retry after a short delay
          setTimeout(() => {
            sendMediaChunk(recordingType, chunks, isFinal)
          }, 1000 * (retryCount + 1)) // Exponential backoff
        } else {
          console.error(
            `[Media Upload] Failed to send ${recordingType} chunk after ${MAX_RETRIES} retries`
          )
        }
      }
    }
  }, [isConnected, send, startMediaUploadSession])

  // Start periodic media upload intervals (every 2 minutes)
  const startMediaUploadIntervals = useCallback(() => {
    const UPLOAD_INTERVAL_MS = 5 * 1000 // 5 seconds - send chunks more frequently

    // Clear any existing intervals
    if (mediaUploadIntervalsRef.current.audio) {
      clearInterval(mediaUploadIntervalsRef.current.audio)
    }
    if (mediaUploadIntervalsRef.current.video) {
      clearInterval(mediaUploadIntervalsRef.current.video)
    }
    if (mediaUploadIntervalsRef.current.screen) {
      clearInterval(mediaUploadIntervalsRef.current.screen)
    }

    // Audio upload interval
    mediaUploadIntervalsRef.current.audio = setInterval(() => {
      const chunks = audioChunksRef.current.slice(lastSentIndexRef.current.audio)
      if (chunks.length > 0) {
        sendMediaChunk('audio', chunks, false).then(() => {
          lastSentIndexRef.current.audio = audioChunksRef.current.length
        })
      }
    }, UPLOAD_INTERVAL_MS)

    // Video upload interval
    mediaUploadIntervalsRef.current.video = setInterval(() => {
      const chunks = videoChunksRef.current.slice(lastSentIndexRef.current.video)
      if (chunks.length > 0) {
        sendMediaChunk('video', chunks, false).then(() => {
          lastSentIndexRef.current.video = videoChunksRef.current.length
        })
      }
    }, UPLOAD_INTERVAL_MS)

    // Screen upload interval
    mediaUploadIntervalsRef.current.screen = setInterval(() => {
      const chunks = screenChunksRef.current.slice(lastSentIndexRef.current.screen)
      if (chunks.length > 0) {
        sendMediaChunk('screen', chunks, false).then(() => {
          lastSentIndexRef.current.screen = screenChunksRef.current.length
        })
      }
    }, UPLOAD_INTERVAL_MS)

    console.log('[Media Upload] Started periodic upload intervals (5 seconds)')
  }, [sendMediaChunk])

  // Stop media upload intervals
  const stopMediaUploadIntervals = useCallback(() => {
    if (mediaUploadIntervalsRef.current.audio) {
      clearInterval(mediaUploadIntervalsRef.current.audio)
      mediaUploadIntervalsRef.current.audio = null
    }
    if (mediaUploadIntervalsRef.current.video) {
      clearInterval(mediaUploadIntervalsRef.current.video)
      mediaUploadIntervalsRef.current.video = null
    }
    if (mediaUploadIntervalsRef.current.screen) {
      clearInterval(mediaUploadIntervalsRef.current.screen)
      mediaUploadIntervalsRef.current.screen = null
    }
    console.log('[Media Upload] Stopped periodic upload intervals')
  }, [])

  // Finalize all media uploads
  const finalizeAllMedia = useCallback(() => {
    if (!isConnected || !send) {
      return
    }

    // Send any remaining unsent chunks first, then finalize
    const finalize = async () => {
      // Send remaining audio chunks
      const remainingAudio = audioChunksRef.current.slice(lastSentIndexRef.current.audio)
      if (remainingAudio.length > 0) {
        await sendMediaChunk('audio', remainingAudio, true)
        lastSentIndexRef.current.audio = audioChunksRef.current.length
      } else {
        // Send final empty chunk to signal finalization
        await sendMediaChunk('audio', [], true)
      }

      // Send remaining video chunks
      const remainingVideo = videoChunksRef.current.slice(lastSentIndexRef.current.video)
      if (remainingVideo.length > 0) {
        await sendMediaChunk('video', remainingVideo, true)
        lastSentIndexRef.current.video = videoChunksRef.current.length
      } else {
        // Finalize video upload session (send empty final chunk)
        await sendMediaChunk('video', [], true)
      }

      // Send remaining screen chunks
      const remainingScreen = screenChunksRef.current.slice(lastSentIndexRef.current.screen)
      if (remainingScreen.length > 0) {
        await sendMediaChunk('screen', remainingScreen, true)
        lastSentIndexRef.current.screen = screenChunksRef.current.length
      } else {
        // Finalize screen upload session (send empty final chunk)
        await sendMediaChunk('screen', [], true)
      }

      // Send finalize all message
      send(JSON.stringify({ type: 'finalize_all_media' }))
      console.log('[Media Upload] Sent finalize_all_media message')
    }

    finalize().catch(console.error)
  }, [isConnected, send, sendMediaChunk])

  // Old uploadRecordings function removed - now using WebSocket streaming uploads via finalizeAllMedia()

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

  // Start video recording when interview starts
  useEffect(() => {
    if (isConnected && cameraStream) {
      startVideoRecording()
    }
    return () => {
      stopVideoRecording()
    }
  }, [isConnected, cameraStream, startVideoRecording, stopVideoRecording])

  // Recording duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isVideoRecording || isScreenRecording) {
      interval = setInterval(() => {
        if (recordingStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
          setRecordingDuration(elapsed)
        }
      }, 1000)
    } else {
      setRecordingDuration(0)
      recordingStartTimeRef.current = null
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isVideoRecording, isScreenRecording])

  // Start media upload intervals when connected
  useEffect(() => {
    if (isConnected) {
      startMediaUploadIntervals()
    }
    return () => {
      stopMediaUploadIntervals()
    }
  }, [isConnected, startMediaUploadIntervals, stopMediaUploadIntervals])

  // Browser close handlers
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Send finalize message if WebSocket is still open
      if (isConnected && send) {
        // Use sendBeacon as fallback for reliability
        const finalizeMessage = JSON.stringify({ type: 'finalize_all_media' })
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
        const sessionIdValue = sessionId
        
        if (sessionIdValue) {
          // Try to send via WebSocket first (synchronous)
          try {
            send(finalizeMessage)
          } catch (error) {
            console.error('[Media Upload] Error sending finalize on beforeunload:', error)
          }

          // Also try sendBeacon as backup
          try {
            navigator.sendBeacon(
              `${apiUrl}/api/v1/interview-session/${sessionIdValue}/media/finalize/`,
              finalizeMessage
            )
          } catch (error) {
            console.error('[Media Upload] Error sending beacon:', error)
          }
        }
      }
    }

    const handleVisibilityChange = () => {
      // When tab becomes hidden, send any pending chunks
      if (document.hidden && isConnected) {
        // Send pending chunks for each type
        const sendPending = async () => {
          const pendingAudio = audioChunksRef.current.slice(lastSentIndexRef.current.audio)
          if (pendingAudio.length > 0) {
            await sendMediaChunk('audio', pendingAudio, false)
            lastSentIndexRef.current.audio = audioChunksRef.current.length
          }

          const pendingVideo = videoChunksRef.current.slice(lastSentIndexRef.current.video)
          if (pendingVideo.length > 0) {
            await sendMediaChunk('video', pendingVideo, false)
            lastSentIndexRef.current.video = videoChunksRef.current.length
          }

          const pendingScreen = screenChunksRef.current.slice(lastSentIndexRef.current.screen)
          if (pendingScreen.length > 0) {
            await sendMediaChunk('screen', pendingScreen, false)
            lastSentIndexRef.current.screen = screenChunksRef.current.length
          }
        }
        sendPending().catch(console.error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isConnected, send, sessionId, sendMediaChunk])

  // Cleanup on unmount
  useEffect(() => {
    const videoElement = videoRef.current

    return () => {
      stopRecording()
      stopVideoRecording()
      stopScreenRecording()
      closeWebSocket()

      // Cleanup all media tracks - use refs for latest values
      try {
        if (cameraStreamRef.current) {
          console.log('[Cleanup] Stopping camera stream')
          cameraStreamRef.current.getTracks().forEach(track => {
            track.stop()
            track.enabled = false
          })
        }
        if (micStreamRef.current) {
          console.log('[Cleanup] Stopping mic stream')
          micStreamRef.current.getTracks().forEach(track => {
            track.stop()
            track.enabled = false
          })
        }
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => {
            track.stop()
            track.enabled = false
          })
          screenStreamRef.current = null
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
      // Cleanup mixed audio context
      if (micSourceNodeRef.current) {
        micSourceNodeRef.current.disconnect()
        micSourceNodeRef.current = null
      }
      if (currentAISourceNodeRef.current) {
        currentAISourceNodeRef.current.disconnect()
        currentAISourceNodeRef.current = null
      }
      if (aiAudioGainNodeRef.current) {
        aiAudioGainNodeRef.current.disconnect()
        aiAudioGainNodeRef.current = null
      }
      if (mixedAudioDestinationRef.current) {
        mixedAudioDestinationRef.current.disconnect()
        mixedAudioDestinationRef.current = null
      }
      if (mixedAudioContextRef.current && mixedAudioContextRef.current.state !== 'closed') {
        mixedAudioContextRef.current.close().catch(console.error)
        mixedAudioContextRef.current = null
      }
      mixedAudioStreamRef.current = null
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
  }, []) 

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
          onClick={() => {
            if (isSharing) {
              stopScreenShare()
            } else {
              startScreenShare()
            }
          }}
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