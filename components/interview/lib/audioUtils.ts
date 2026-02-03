/**
 * Audio Utilities
 *
 * Helper functions for audio processing:
 * - WebM to PCM conversion
 * - AudioBuffer manipulation
 * - MixedAudioContext for recording mic + AI audio together
 */

// ============================================
// Types
// ============================================

export interface AudioConversionOptions {
  targetSampleRate?: number
  targetChannels?: number
}

// ============================================
// AudioBuffer to PCM Conversion
// ============================================

/**
 * Convert AudioBuffer to raw PCM (16-bit, mono, 16kHz)
 */
export async function audioBufferToRawPCM(
  buffer: AudioBuffer,
  targetSampleRate: number = 16000
): Promise<ArrayBuffer> {
  let processedBuffer = buffer

  // Resample to target sample rate if needed
  if (buffer.sampleRate !== targetSampleRate) {
    const offlineContext = new OfflineAudioContext(
      1,
      Math.floor((buffer.length * targetSampleRate) / buffer.sampleRate),
      targetSampleRate
    )
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
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
    view.setInt16(i * 2, intSample, true) // true = little-endian
  }

  return pcmBuffer
}

// ============================================
// WebM to PCM Conversion
// ============================================

/**
 * Convert WebM audio chunks to raw PCM
 */
export async function convertWebMToRawPCM(
  webmChunks: Blob[],
  targetSampleRate: number = 16000
): Promise<ArrayBuffer> {
  if (webmChunks.length === 0) {
    throw new Error('No audio chunks to convert')
  }

  // Filter out empty chunks
  const validChunks = webmChunks.filter((chunk) => chunk && chunk.size > 0)
  if (validChunks.length === 0) {
    throw new Error('No valid audio chunks to convert (all chunks are empty)')
  }

  // Combine all WebM chunks into a single Blob
  const webmBlob = new Blob(validChunks, { type: 'audio/webm;codecs=opus' })

  if (webmBlob.size === 0) {
    throw new Error('Combined WebM blob is empty')
  }

  console.log(
    `[Audio Conversion] Converting WebM blob: ${webmBlob.size} bytes from ${validChunks.length} chunks`
  )

  // Decode WebM audio using Web Audio API
  const arrayBuffer = await webmBlob.arrayBuffer()
  const audioContext = new AudioContext()

  let audioBuffer: AudioBuffer
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  } catch (error) {
    console.error('[Audio Conversion] Failed to decode WebM audio:', error)
    throw new Error(
      `Failed to decode audio data: ${error instanceof Error ? error.message : 'Unknown error'}. The audio stream may be corrupted or incomplete.`
    )
  } finally {
    await audioContext.close()
  }



  //DEBUG
  // Calculate RMS of the decoded buffer to check for silence
  let totalSumSq = 0
  let totalSamples = 0
  
  // Check first channel only for efficiency
  const channelData = audioBuffer.getChannelData(0)
  for (let i = 0; i < channelData.length; i++) {
    totalSumSq += channelData[i] * channelData[i]
  }
  totalSamples = channelData.length
  
  const rms = Math.sqrt(totalSumSq / totalSamples)
  console.log(
    `[Audio Conversion] Decoded WebM stats: Duration=${audioBuffer.duration}s, Channels=${audioBuffer.numberOfChannels}, Rate=${audioBuffer.sampleRate}, RMS=${rms.toFixed(6)}`
  )
  
  if (rms === 0) {
    console.warn('[Audio Conversion] WARNING: Decoded audio is absolute silence (RMS=0)')
  }

  // DEBUG ENDS

  // Convert AudioBuffer to raw PCM
  const pcmBuffer = await audioBufferToRawPCM(audioBuffer, targetSampleRate)
  console.log(
    `[Audio Conversion] Successfully converted to PCM: ${pcmBuffer.byteLength} bytes`
  )

  return pcmBuffer
}

// ============================================
// Mixed Audio Context (Singleton)
// ============================================

/**
 * MixedAudioContext - Records both microphone input and AI audio output
 *
 * Uses the Web Audio API to create a mixed stream that includes:
 * - Microphone input (user's voice)
 * - AI audio output (for recording the full conversation)
 *
 * This is a singleton to ensure consistent audio routing across the application.
 */
export class MixedAudioContext {
  private static instance: MixedAudioContext | null = null

  private audioContext: AudioContext | null = null
  private micSource: MediaStreamAudioSourceNode | null = null
  private micGainNode: GainNode | null = null
  private aiGainNode: GainNode | null = null
  private mixerNode: GainNode | null = null
  private destinationNode: MediaStreamAudioDestinationNode | null = null
  private mixedStream: MediaStream | null = null
  private initialized: boolean = false

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): MixedAudioContext {
    if (!MixedAudioContext.instance) {
      MixedAudioContext.instance = new MixedAudioContext()
    }
    return MixedAudioContext.instance
  }

  /**
   * Check if an instance exists
   */
  static hasInstance(): boolean {
    return MixedAudioContext.instance !== null
  }

  /**
   * Destroy the singleton instance
   */
  static destroyInstance(): void {
    if (MixedAudioContext.instance) {
      MixedAudioContext.instance.destroy()
      MixedAudioContext.instance = null
    }
  }

  /**
   * Initialize the mixed audio context with microphone stream
   */
  async initialize(
    micStream: MediaStream,
    sampleRate: number = 16000
  ): Promise<MediaStream> {
    // Check if current mic source is dead
    if (this.initialized && this.micSource) {
      const storedStream = (this.micSource as any).mediaStream as MediaStream | undefined
      const isAlive = storedStream?.getAudioTracks().some(t => t.readyState === 'live')
      
      if (!isAlive) {
        console.log('[MixedAudioContext] Stored mic stream is dead, reinitializing...')
        this.destroy()
      }
    }

    if (this.initialized && this.mixedStream) {
      console.log('[MixedAudioContext] Already initialized, returning existing stream')
      return this.mixedStream
    }

    try {
      console.log('[MixedAudioContext] Initializing...')

      // Create audio context
      this.audioContext = new AudioContext({ sampleRate })

      // Resume if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Create microphone source
      this.micSource = this.audioContext.createMediaStreamSource(micStream)

      // Create gain nodes for mixing
      this.micGainNode = this.audioContext.createGain()
      this.micGainNode.gain.value = 1.0

      this.aiGainNode = this.audioContext.createGain()
      this.aiGainNode.gain.value = 0.7 // Slightly lower AI audio

      // Create mixer node
      this.mixerNode = this.audioContext.createGain()
      this.mixerNode.gain.value = 1.0

      // Create destination for recording
      this.destinationNode = this.audioContext.createMediaStreamDestination()

      // Connect the audio graph:
      // micSource -> micGainNode -> mixerNode -> destinationNode
      // aiGainNode (external audio) -> mixerNode -> destinationNode
      this.micSource.connect(this.micGainNode)
      this.micGainNode.connect(this.mixerNode)
      this.aiGainNode.connect(this.mixerNode)
      this.mixerNode.connect(this.destinationNode)

      this.mixedStream = this.destinationNode.stream
      this.initialized = true

      console.log('[MixedAudioContext] Initialized successfully')
      return this.mixedStream
    } catch (error) {
      console.error('[MixedAudioContext] Initialization error:', error)
      this.destroy()
      throw error
    }
  }

  /**
   * Get the audio context (for AI audio playback routing)
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext
  }

  /**
   * Get the AI gain node (for connecting AI audio sources)
   */
  getAIGainNode(): GainNode | null {
    return this.aiGainNode
  }

  /**
   * Get the mixed stream
   */
  getMixedStream(): MediaStream | null {
    return this.mixedStream
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Destroy the context and clean up resources
   */
  destroy(): void {
    console.log('[MixedAudioContext] Destroying...')

    // Disconnect nodes
    try {
      this.micSource?.disconnect()
      this.micGainNode?.disconnect()
      this.aiGainNode?.disconnect()
      this.mixerNode?.disconnect()
    } catch (e) {
      // Ignore disconnection errors
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(console.error)
    }

    // Stop mixed stream tracks
    if (this.mixedStream) {
      this.mixedStream.getTracks().forEach((track) => track.stop())
    }

    // Reset all references
    this.audioContext = null
    this.micSource = null
    this.micGainNode = null
    this.aiGainNode = null
    this.mixerNode = null
    this.destinationNode = null
    this.mixedStream = null
    this.initialized = false

    console.log('[MixedAudioContext] Destroyed')
  }
}

// ============================================
// Exports
// ============================================

export default {
  audioBufferToRawPCM,
  convertWebMToRawPCM,
  MixedAudioContext,
}
