/**
 * useMediaRecording Hook
 *
 * Manages video and screen recording with WebSocket upload.
 * Follows the reference pattern: refs for browser APIs, getState() for state access.
 */

import { useCallback, useEffect, useRef } from 'react'
import { useInterviewStore } from '../store'
import { registerMediaRecorderControls } from '../store/interviewActions'
import type { MediaType, UploadStatus } from '../store/types'

// ============================================================================
// Types
// ============================================================================

export interface UseMediaRecordingOptions {
  /** Session ID for the interview */
  sessionId: string
  /** Function to send data over WebSocket */
  sendBinary: (data: ArrayBuffer) => void
  /** Function to send text messages over WebSocket */
  sendText: (data: string) => void
  /** Whether WebSocket is connected */
  isConnected: boolean
}

export interface UseMediaRecordingReturn {
  // Video recording
  startVideoRecording: (stream: MediaStream) => Promise<void>
  stopVideoRecording: () => void
  isVideoRecording: boolean
  videoUploadStatus: UploadStatus

  // Screen recording
  startScreenRecording: (stream: MediaStream) => Promise<void>
  stopScreenRecording: () => void
  isScreenRecording: boolean
  screenUploadStatus: UploadStatus

  // Combined actions
  finalizeAllMedia: () => Promise<void>
  startUploadIntervals: () => void
  stopUploadIntervals: () => void
}

// ============================================================================
// Constants
// ============================================================================

const UPLOAD_INTERVAL_MS = 5000 // 5 seconds between uploads
const MAX_RETRIES = 3

// ============================================================================
// Hook Implementation
// ============================================================================

export function useMediaRecording(
  options: UseMediaRecordingOptions
): UseMediaRecordingReturn {
  const { sessionId, sendBinary, sendText, isConnected } = options
  const store = useInterviewStore

  // -------------------------------------------------------------------------
  // Refs for browser APIs and recording state (not in store)
  // -------------------------------------------------------------------------

  // MediaRecorder instances
  const videoRecorderRef = useRef<MediaRecorder | null>(null)
  const screenRecorderRef = useRef<MediaRecorder | null>(null)

  // Recorded chunks
  const videoChunksRef = useRef<Blob[]>([])
  const screenChunksRef = useRef<Blob[]>([])

  // Upload tracking
  const lastSentIndexRef = useRef<{ video: number; screen: number }>({
    video: 0,
    screen: 0,
  })

  // Retry counts
  const retryCountRef = useRef<{ video: number; screen: number }>({
    video: 0,
    screen: 0,
  })

  // Session initialization tracking
  const sessionsInitializedRef = useRef<{ video: boolean; screen: boolean }>({
    video: false,
    screen: false,
  })

  // Upload intervals
  const uploadIntervalsRef = useRef<{
    video: NodeJS.Timeout | null
    screen: NodeJS.Timeout | null
  }>({
    video: null,
    screen: null,
  })

  // -------------------------------------------------------------------------
  // Store state (read via hooks for reactive updates)
  // -------------------------------------------------------------------------

  const isVideoRecording = useInterviewStore((s) => s.video.isRecording)
  const isScreenRecording = useInterviewStore((s) => s.screen.isRecording)
  const videoUploadStatus = useInterviewStore((s) => s.video.uploadStatus)
  const screenUploadStatus = useInterviewStore((s) => s.screen.uploadStatus)

  // -------------------------------------------------------------------------
  // Internal Helpers
  // -------------------------------------------------------------------------

  /**
   * Initialize upload session for a media type
   */
  const initUploadSession = useCallback(
    async (mediaType: 'video' | 'screen'): Promise<boolean> => {
      if (!isConnected) {
        console.warn(
          `[Media Recording] Cannot start ${mediaType} session - not connected`
        )
        return false
      }

      if (sessionsInitializedRef.current[mediaType]) {
        console.log(
          `[Media Recording] ${mediaType} session already initialized`
        )
        return true
      }

      try {
        // Mark as initialized - backend will route binary data correctly
        sessionsInitializedRef.current[mediaType] = true

        // Small delay to allow backend to process
        await new Promise((resolve) => setTimeout(resolve, 50))

        return true
      } catch (error) {
        console.error(
          `[Media Recording] Error starting ${mediaType} session:`,
          error
        )
        sessionsInitializedRef.current[mediaType] = false
        return false
      }
    },
    [isConnected]
  )

  /**
   * Send media chunks via WebSocket
   */
  const sendMediaChunk = useCallback(
    async (
      mediaType: 'video' | 'screen',
      chunks: Blob[],
      isFinal: boolean = false
    ): Promise<void> => {
      if (!isConnected) {
        return
      }

      // Skip empty chunks unless finalizing
      if (chunks.length === 0 && !isFinal) {
        return
      }

      // Temporarily disabled - matching active-interview.tsx
      return

      /*
      try {
        // For empty chunks with isFinal, send finalization message
        if (chunks.length === 0 && isFinal) {
          const message = {
            type: 'finalize_media',
            recording_type: mediaType,
          }
          sendText(JSON.stringify(message))
          console.log(
            `[Media Recording] Sent finalization signal for ${mediaType} (no chunks)`
          )
          return
        }

        // Combine chunks into a single blob
        const blob = new Blob(chunks, {
          type:
            mediaType === 'video'
              ? 'video/webm;codecs=vp8,opus'
              : 'video/webm;codecs=vp8',
        })

        // Convert to ArrayBuffer for binary upload
        const arrayBuffer = await blob.arrayBuffer()

        // Update upload status based on media type
        if (mediaType === 'video') {
          store.getState().setVideoRecording({ uploadStatus: 'uploading' })
        } else {
          store.getState().setScreenRecording({ uploadStatus: 'uploading' })
        }

        // Send binary data directly
        sendBinary(arrayBuffer)
        console.log(
          `[Media Recording] Sent ${mediaType} binary chunk: ${blob.size} bytes (final: ${isFinal})`
        )

        // If final, send finalization message after a short delay
        if (isFinal) {
          setTimeout(() => {
            const finalizeMessage = {
              type: 'finalize_media',
              recording_type: mediaType,
            }
            sendText(JSON.stringify(finalizeMessage))
            console.log(
              `[Media Recording] Sent finalization message for ${mediaType}`
            )
            if (mediaType === 'video') {
              store.getState().setVideoRecording({ uploadStatus: 'complete' })
            } else {
              store.getState().setScreenRecording({ uploadStatus: 'complete' })
            }
          }, 100)
        }

        // Reset retry count on success
        retryCountRef.current[mediaType] = 0
      } catch (error) {
        console.error(
          `[Media Recording] Error sending ${mediaType} chunk:`,
          error
        )

        // Update error status based on media type
        if (mediaType === 'video') {
          store.getState().setVideoRecording({ uploadStatus: 'error' })
        } else {
          store.getState().setScreenRecording({ uploadStatus: 'error' })
        }

        // Retry logic
        if (!isFinal) {
          const retryCount = retryCountRef.current[mediaType]
          if (retryCount < MAX_RETRIES) {
            retryCountRef.current[mediaType] = retryCount + 1
            console.log(
              `[Media Recording] Retrying ${mediaType} chunk upload (attempt ${retryCount + 1}/${MAX_RETRIES})`
            )
            // Exponential backoff
            setTimeout(() => {
              sendMediaChunk(mediaType, chunks, isFinal)
            }, 1000 * (retryCount + 1))
          } else {
            console.error(
              `[Media Recording] Failed to send ${mediaType} chunk after ${MAX_RETRIES} retries`
            )
          }
        }
      }
      */
    },
    [isConnected, sendBinary, sendText, store]
  )

  // -------------------------------------------------------------------------
  // Video Recording
  // -------------------------------------------------------------------------

  const startVideoRecording = useCallback(
    async (stream: MediaStream): Promise<void> => {
      if (!stream) {
        console.warn('[Video Recording] No stream available')
        store.getState().setVideoRecording({ uploadStatus: 'error' })
        return
      }

      try {
        // Initialize upload session
        if (isConnected) {
          const initialized = await initUploadSession('video')
          if (!initialized) {
            console.error('[Video Recording] Failed to initialize upload session')
            store.getState().setVideoRecording({ uploadStatus: 'error' })
            return
          }
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8,opus',
        })

        videoRecorderRef.current = mediaRecorder
        videoChunksRef.current = []
        lastSentIndexRef.current.video = 0
        retryCountRef.current.video = 0

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            videoChunksRef.current.push(event.data)
            console.log(
              `[Video Recording] Chunk available: ${event.data.size} bytes`
            )
          }
        }

        mediaRecorder.onerror = (error) => {
          console.error('[Video Recording] MediaRecorder error:', error)
          store.getState().setVideoRecording({ uploadStatus: 'error' })
        }

        mediaRecorder.onstop = () => {
          console.log('[Video Recording] Recording stopped')
          store.getState().setVideoRecording({ isRecording: false })
        }

        mediaRecorder.start(500) // Collect chunks every 500ms
        store.getState().setVideoRecording({ isRecording: true, uploadStatus: 'uploading' })
        console.log('[Video Recording] Started')
      } catch (error) {
        console.error('[Video Recording] Error starting:', error)
        store.getState().setVideoRecording({ uploadStatus: 'error' })
      }
    },
    [isConnected, initUploadSession]
  )

  const stopVideoRecording = useCallback(() => {
    if (
      videoRecorderRef.current &&
      videoRecorderRef.current.state !== 'inactive'
    ) {
      videoRecorderRef.current.stop()
      console.log('[Video Recording] Stopped')
      store.getState().setVideoRecording({ isRecording: false })
    }
  }, [])

  // -------------------------------------------------------------------------
  // Screen Recording
  // -------------------------------------------------------------------------

  const startScreenRecording = useCallback(
    async (stream: MediaStream): Promise<void> => {
      try {
        // Initialize upload session
        if (isConnected) {
          const initialized = await initUploadSession('screen')
          if (!initialized) {
            console.error(
              '[Screen Recording] Failed to initialize upload session'
            )
            store.getState().setScreenRecording({ uploadStatus: 'error' })
            return
          }
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8',
        })

        screenRecorderRef.current = mediaRecorder
        screenChunksRef.current = []
        lastSentIndexRef.current.screen = 0
        retryCountRef.current.screen = 0

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            screenChunksRef.current.push(event.data)
            console.log(
              `[Screen Recording] Chunk available: ${event.data.size} bytes`
            )
          }
        }

        mediaRecorder.onerror = (error) => {
          console.error('[Screen Recording] MediaRecorder error:', error)
          store.getState().setScreenRecording({ uploadStatus: 'error' })
        }

        mediaRecorder.onstop = () => {
          console.log('[Screen Recording] Recording stopped')
          store.getState().setScreenRecording({ isRecording: false })
        }

        mediaRecorder.start(500) // Collect chunks every 500ms
        store.getState().setScreenRecording({ isRecording: true, uploadStatus: 'uploading' })
        console.log('[Screen Recording] Started')
      } catch (error) {
        console.error('[Screen Recording] Error starting:', error)
        store.getState().setScreenRecording({ uploadStatus: 'error' })
      }
    },
    [isConnected, initUploadSession]
  )

  const stopScreenRecording = useCallback(() => {
    if (
      screenRecorderRef.current &&
      screenRecorderRef.current.state !== 'inactive'
    ) {
      screenRecorderRef.current.stop()
      console.log('[Screen Recording] Stopped')
      store.getState().setScreenRecording({ isRecording: false })
    }
  }, [])  // store.getState() is used for fresh state, so no dependency needed

  // -------------------------------------------------------------------------
  // Upload Intervals
  // -------------------------------------------------------------------------

  const startUploadIntervals = useCallback(() => {
    // Clear any existing intervals
    if (uploadIntervalsRef.current.video) {
      clearInterval(uploadIntervalsRef.current.video)
    }
    if (uploadIntervalsRef.current.screen) {
      clearInterval(uploadIntervalsRef.current.screen)
    }

    /*
    // Video upload interval
    uploadIntervalsRef.current.video = setInterval(() => {
      const chunks = videoChunksRef.current.slice(
        lastSentIndexRef.current.video
      )
      if (chunks.length > 0) {
        sendMediaChunk('video', chunks, false).then(() => {
          lastSentIndexRef.current.video = videoChunksRef.current.length
        })
      }
    }, UPLOAD_INTERVAL_MS)

    // Screen upload interval
    uploadIntervalsRef.current.screen = setInterval(() => {
      const chunks = screenChunksRef.current.slice(
        lastSentIndexRef.current.screen
      )
      if (chunks.length > 0) {
        sendMediaChunk('screen', chunks, false).then(() => {
          lastSentIndexRef.current.screen = screenChunksRef.current.length
        })
      }
    }, UPLOAD_INTERVAL_MS)
    */

    console.log(
      `[Media Recording] Started upload intervals (${UPLOAD_INTERVAL_MS}ms)`
    )
  }, [sendMediaChunk])

  const stopUploadIntervals = useCallback(() => {
    if (uploadIntervalsRef.current.video) {
      clearInterval(uploadIntervalsRef.current.video)
      uploadIntervalsRef.current.video = null
    }
    if (uploadIntervalsRef.current.screen) {
      clearInterval(uploadIntervalsRef.current.screen)
      uploadIntervalsRef.current.screen = null
    }
    console.log('[Media Recording] Stopped upload intervals')
  }, [])

  // -------------------------------------------------------------------------
  // Finalize All Media
  // -------------------------------------------------------------------------

  const finalizeAllMedia = useCallback(async (): Promise<void> => {
    if (!isConnected) {
      return
    }

    // Stop intervals first
    stopUploadIntervals()

    /*
    // Temporarily disabled - matching active-interview.tsx
    // Send remaining video chunks
    const remainingVideo = videoChunksRef.current.slice(
      lastSentIndexRef.current.video
    )
    if (remainingVideo.length > 0) {
      await sendMediaChunk('video', remainingVideo, true)
      lastSentIndexRef.current.video = videoChunksRef.current.length
    } else if (sessionsInitializedRef.current.video) {
      // Send empty final chunk to finalize
      await sendMediaChunk('video', [], true)
    }

    // Send remaining screen chunks
    const remainingScreen = screenChunksRef.current.slice(
      lastSentIndexRef.current.screen
    )
    if (remainingScreen.length > 0) {
      await sendMediaChunk('screen', remainingScreen, true)
      lastSentIndexRef.current.screen = screenChunksRef.current.length
    } else if (sessionsInitializedRef.current.screen) {
      // Send empty final chunk to finalize
      await sendMediaChunk('screen', [], true)
    }
    */

    console.log('[Media Recording] Finalized all media uploads')
  }, [isConnected, sendMediaChunk, stopUploadIntervals])

  // -------------------------------------------------------------------------
  // Register Controls with Centralized Actions
  // -------------------------------------------------------------------------

  useEffect(() => {
    registerMediaRecorderControls({
      startVideo: startVideoRecording,
      stopVideo: stopVideoRecording,
      startScreen: startScreenRecording,
      stopScreen: stopScreenRecording,
      finalizeAll: finalizeAllMedia,
    })

    return () => {
      registerMediaRecorderControls(null)
    }
  }, [startVideoRecording, stopVideoRecording, startScreenRecording, stopScreenRecording, finalizeAllMedia])

  // -------------------------------------------------------------------------
  // Cleanup on unmount
  // -------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      stopUploadIntervals()
      stopVideoRecording()
      stopScreenRecording()
    }
  }, [stopUploadIntervals, stopVideoRecording, stopScreenRecording])

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  return {
    // Video recording
    startVideoRecording,
    stopVideoRecording,
    isVideoRecording,
    videoUploadStatus,

    // Screen recording
    startScreenRecording,
    stopScreenRecording,
    isScreenRecording,
    screenUploadStatus,

    // Combined actions
    finalizeAllMedia,
    startUploadIntervals,
    stopUploadIntervals,
  }
}
