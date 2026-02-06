/**
 * WebSocket Manager for Interview Module
 *
 * This class encapsulates all WebSocket connection logic:
 * - Connection management with automatic reconnection
 * - Keepalive pings
 * - Binary and text message handling
 * - Send queue for messages during connection
 * - Connection state tracking
 *
 * Replaces the useWebSocket hook with a more controllable class-based approach
 * that integrates better with the Zustand store.
 */

import type {
  ConnectionStatus,
  WebSocketMessageType,
  WebSocketTextMessage,
} from '../store/types'

// ============================================
// Types
// ============================================

export interface WebSocketManagerConfig {
  /** Session ID for the interview */
  sessionId: string
  /** API base URL (will be converted to ws/wss) */
  apiUrl?: string
  /** Keepalive interval in ms (default: 30000) */
  keepaliveInterval?: number
  /** Whether to auto-reconnect on disconnect (default: false) */
  autoReconnect?: boolean
  /** Max reconnection attempts (default: 3) */
  maxReconnectAttempts?: number
  /** Reconnection delay in ms (default: 2000) */
  reconnectDelay?: number
  /** Timeout for waiting for pong response in ms (default: 10000) */
  pongTimeout?: number
}

export interface WebSocketManagerCallbacks {
  /** Called when connection is established */
  onConnect?: () => void
  /** Called when connection is closed */
  onDisconnect?: (code?: number, reason?: string) => void
  /** Called on connection error */
  onError?: (error: Event | Error) => void
  /** Called when a text message is received */
  onTextMessage?: (message: WebSocketTextMessage) => void
  /** Called when binary audio data is received */
  onBinaryMessage?: (data: ArrayBuffer) => void
  /** Called when connection status changes */
  onStatusChange?: (status: ConnectionStatus) => void
}

// ============================================
// WebSocketManager Class
// ============================================

export class WebSocketManager {
  private ws: WebSocket | null = null
  private config: Required<WebSocketManagerConfig>
  private callbacks: WebSocketManagerCallbacks
  private keepaliveTimer: NodeJS.Timeout | null = null
  private pingTimeoutTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private isDestroyed = false
  private status: ConnectionStatus = 'disconnected'
  private sendQueue: (string | ArrayBuffer)[] = []

  constructor(
    config: WebSocketManagerConfig,
    callbacks: WebSocketManagerCallbacks = {}
  ) {
    this.config = {
      sessionId: config.sessionId,
      apiUrl: config.apiUrl || process.env.NEXT_PUBLIC_API_URL || '',
      keepaliveInterval: config.keepaliveInterval ?? 30000,
      autoReconnect: config.autoReconnect ?? false,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 3,
      reconnectDelay: config.reconnectDelay ?? 2000,
      pongTimeout: config.pongTimeout ?? 5000,
    }
    this.callbacks = callbacks
  }

  // ============================================
  // Connection Management
  // ============================================

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.isDestroyed) {
      console.warn('[WebSocketManager] Cannot connect - manager is destroyed')
      return
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.warn('[WebSocketManager] Already connected or connecting')
      return
    }

    if (!this.config.apiUrl) {
      console.error('[WebSocketManager] API URL is not configured')
      this.callbacks.onError?.(new Error('API URL is not configured'))
      this.setStatus('error')
      return
    }

    if (!this.config.sessionId) {
      console.error('[WebSocketManager] Session ID is not configured')
      this.callbacks.onError?.(new Error('Session ID is not configured'))
      this.setStatus('error')
      return
    }

    this.setStatus('connecting')

    const wsUrl = `${this.config.apiUrl.replace('http', 'ws')}/ws/interview/${this.config.sessionId}/`
    console.log(`[WebSocketManager] Connecting to: ${wsUrl}`)

    try {
      this.ws = new WebSocket(wsUrl)
      this.ws.binaryType = 'arraybuffer'

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
    } catch (error) {
      console.error('[WebSocketManager] Failed to create WebSocket:', error)
      this.callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
      this.setStatus('error')
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.stopKeepalive()
    this.stopReconnectTimer()

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        console.log('[WebSocketManager] Closing WebSocket connection')
        this.ws.close(1000, 'Client disconnect')
      }
      this.ws = null
    }

    this.setStatus('disconnected')
  }

  /**
   * Destroy the manager and cleanup all resources
   */
  destroy(): void {
    this.isDestroyed = true
    this.disconnect()
    this.sendQueue = []
    this.callbacks = {}
  }

  // ============================================
  // Event Handlers
  // ============================================

  private handleOpen(): void {
    if (this.isDestroyed) {
      this.ws?.close()
      return
    }

    console.log('[WebSocketManager] Connected')
    this.setStatus('connected')
    this.reconnectAttempts = 0
    this.startKeepalive()
    this.flushSendQueue()
    this.callbacks.onConnect?.()
  }

  private handleMessage(event: MessageEvent): void {
    if (this.isDestroyed) return

    const { data } = event

    if (data instanceof ArrayBuffer) {
      // Binary audio data
      this.callbacks.onBinaryMessage?.(data)
    } else if (typeof data === 'string') {
      // JSON text message
      try {
        const message = JSON.parse(data) as WebSocketTextMessage

        // Intercept pong messages for keepalive
        if (message.type === 'pong') {
          // console.log('[WebSocketManager] Received pong - connection healthy')
          if (this.pingTimeoutTimer) {
            clearTimeout(this.pingTimeoutTimer)
            this.pingTimeoutTimer = null
          }
          // Don't propagate pong to listeners, it's internal
          return
        }

        this.callbacks.onTextMessage?.(message)
      } catch (e) {
        console.error('[WebSocketManager] Failed to parse message:', e)
      }
    }
  }

  private handleError(error: Event): void {
    if (this.isDestroyed) return

    console.error('[WebSocketManager] Error:', error)
    this.callbacks.onError?.(error)
  }

  private handleClose(event: CloseEvent): void {
    if (this.isDestroyed) return

    console.log('[WebSocketManager] Disconnected', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
    })

    this.stopKeepalive()
    this.setStatus('disconnected')
    this.callbacks.onDisconnect?.(event.code, event.reason)

    // Don't reconnect for server-initiated closes (interview ended, auth failure, etc.)
    const noReconnectCodes = [4000, 4001, 4002, 4003]
    if (noReconnectCodes.includes(event.code)) {
      console.log('[WebSocketManager] Server closed connection, not reconnecting')
      return
    }

    // Attempt reconnection if enabled
    if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  // ============================================
  // Keepalive
  // ============================================

  private startKeepalive(): void {
    this.stopKeepalive()

    this.keepaliveTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }))
          console.log('[WebSocketManager] Sent keepalive ping')

          // Start ping timeout timer
          // If we don't get a pong back within pongTimeout, we consider the connection dead
          if (this.pingTimeoutTimer) clearTimeout(this.pingTimeoutTimer)

          this.pingTimeoutTimer = setTimeout(() => {
            console.warn(`[WebSocketManager] Ping timed out after ${this.config.pongTimeout}ms - forcing disconnect`)
            // Force close with a custom code to indicate timeout
            // This will trigger onclose -> handleClose -> scheduleReconnect
            this.ws?.close(4999, 'Ping timeout')
          }, this.config.pongTimeout)

        } catch (error) {
          console.error('[WebSocketManager] Failed to send keepalive:', error)
        }
      }
    }, this.config.keepaliveInterval)

    console.log(`[WebSocketManager] Started keepalive (${this.config.keepaliveInterval}ms)`)
  }

  private stopKeepalive(): void {
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer)
      this.keepaliveTimer = null
    }
    if (this.pingTimeoutTimer) {
      clearTimeout(this.pingTimeoutTimer)
      this.pingTimeoutTimer = null
    }
  }

  // ============================================
  // Reconnection
  // ============================================

  private scheduleReconnect(): void {
    this.stopReconnectTimer()
    this.reconnectAttempts++

    const delay = this.config.reconnectDelay * this.reconnectAttempts
    console.log(`[WebSocketManager] Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect()
      }
    }, delay)
  }

  private stopReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // ============================================
  // Sending Messages
  // ============================================

  /**
   * Send data through the WebSocket
   * If not connected, queues the message for later
   */
  send(data: string | ArrayBuffer | object): boolean {
    if (this.isDestroyed) {
      console.warn('[WebSocketManager] Cannot send - manager is destroyed')
      return false
    }

    // Convert objects to JSON string
    const payload = typeof data === 'object' && !(data instanceof ArrayBuffer)
      ? JSON.stringify(data)
      : data

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(payload as string | ArrayBuffer)
        return true
      } catch (error) {
        console.error('[WebSocketManager] Failed to send:', error)
        return false
      }
    } else {
      // Queue for later
      console.log('[WebSocketManager] Queueing message (not connected)')
      this.sendQueue.push(payload as string | ArrayBuffer)
      return false
    }
  }

  /**
   * Send audio data as binary
   */
  sendAudio(audioData: ArrayBuffer): boolean {
    return this.send(audioData)
  }

  /**
   * Send end_of_turn signal
   */
  sendEndOfTurn(): boolean {
    console.log('[WebSocketManager] Sending end_of_turn')
    return this.send({ type: 'end_of_turn' })
  }

  /**
   * Start a media upload session
   */
  sendStartMediaUpload(recordingType: 'video' | 'screen' | 'audio'): boolean {
    console.log(`[WebSocketManager] Starting ${recordingType} upload session`)
    return this.send({
      type: 'media_upload.start',
      recording_type: recordingType,
    })
  }

  /**
   * Send a media chunk
   */
  sendMediaChunk(
    recordingType: 'video' | 'screen' | 'audio',
    chunkIndex: number,
    data: string, // base64 encoded
    isFinal: boolean = false
  ): boolean {
    return this.send({
      type: 'media_chunk',
      recording_type: recordingType,
      chunk_index: chunkIndex,
      data,
      is_final: isFinal,
    })
  }

  /**
   * Send a finalize media message
   */
  sendFinalizeMedia(recordingType: 'video' | 'screen' | 'audio'): boolean {
    console.log(`[WebSocketManager] Finalizing ${recordingType} upload`)
    return this.send({
      type: 'media_upload.finalize',
      recording_type: recordingType,
    })
  }

  /**
   * Flush queued messages
   */
  private flushSendQueue(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return

    while (this.sendQueue.length > 0) {
      const data = this.sendQueue.shift()
      if (data) {
        try {
          this.ws.send(data)
        } catch (error) {
          console.error('[WebSocketManager] Failed to flush queued message:', error)
          // Put it back at the front
          this.sendQueue.unshift(data)
          break
        }
      }
    }
  }

  // ============================================
  // Status
  // ============================================

  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status
      this.callbacks.onStatusChange?.(status)
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Get the raw WebSocket instance (use with caution)
   */
  getWebSocket(): WebSocket | null {
    return this.ws
  }

  /**
   * Update callbacks after construction
   */
  setCallbacks(callbacks: Partial<WebSocketManagerCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }
}

// ============================================
// Factory Function
// ============================================

/**
 * Create a new WebSocketManager instance
 */
export function createWebSocketManager(
  config: WebSocketManagerConfig,
  callbacks?: WebSocketManagerCallbacks
): WebSocketManager {
  return new WebSocketManager(config, callbacks)
}
