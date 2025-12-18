"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

// Helper: downsample Float32 PCM to 16kHz Int16 PCM
function downsampleTo16k(input: Float32Array, inputSampleRate: number): Int16Array {
  if (inputSampleRate === 16000) {
    const out = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }

  const sampleRateRatio = inputSampleRate / 16000;
  const newLength = Math.round(input.length / sampleRateRatio);
  const output = new Int16Array(newLength);

  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < newLength) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;

    for (let i = offsetBuffer; i < nextOffsetBuffer && i < input.length; i++) {
      accum += input[i];
      count++;
    }

    const sample = accum / (count || 1);
    const s = Math.max(-1, Math.min(1, sample));
    output[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7fff;

    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }

  return output;
}

export default function MicStreamPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>("Idle");
  const [lastTranscript, setLastTranscript] = useState<string>("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      stopStreaming();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startStreaming = async () => {
    if (isRecording) return;

    try {
      setStatus("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);

      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      const ws = new WebSocket("ws://localhost:8000/ws/audio"); // TODO: adjust to your backend URL

      ws.onopen = () => {
        setStatus("Streaming audio to backend...");
      };

      ws.onclose = () => {
        setStatus("WebSocket closed");
      };

      ws.onerror = () => {
        setStatus("WebSocket error");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.transcript) {
            setLastTranscript(data.transcript as string);
          }
        } catch {
          // ignore non-JSON messages
        }
      };

      processor.onaudioprocess = (event) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const inputBuffer = event.inputBuffer.getChannelData(0);
        const pcm16 = downsampleTo16k(inputBuffer, audioContext.sampleRate);
        ws.send(pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      sourceNodeRef.current = source;
      processorRef.current = processor;
      wsRef.current = ws;

      setIsRecording(true);
      setStatus("Recording & streaming...");
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Failed to start microphone");
    }
  };

  const stopStreaming = () => {
    setIsRecording(false);

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (sourceNodeRef.current) {
      const tracks = sourceNodeRef.current.mediaStream.getTracks();
      tracks.forEach((t) => t.stop());
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }

    setStatus("Idle");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[rgba(245,247,255,1)] px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Live Audio Capture</h1>
          <p className="text-sm text-muted-foreground">
            Frontend captures microphone audio at 16kHz PCM16 and streams it to the backend over WebSocket for real-time transcription.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isRecording ? (
            <Button
              variant="destructive"
              size="lg"
              className="flex items-center gap-2"
              onClick={stopStreaming}
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex items-center gap-2 bg-[rgba(104,100,247,1)] hover:bg-[rgba(98,117,252,1)]"
              onClick={startStreaming}
            >
              <Mic className="w-4 h-4" />
              Start Mic
            </Button>
          )}
          <span className="text-sm text-muted-foreground">{status}</span>
        </div>

        <div className="border rounded-xl p-4 bg-[rgba(245,247,255,1)]">
          <h2 className="text-sm font-medium mb-1">Latest transcript</h2>
          <p className="text-sm text-muted-foreground min-h-[3rem] whitespace-pre-wrap">
            {lastTranscript || "Waiting for transcription from backend..."}
          </p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>🎤 Audio Capture: 16kHz PCM16 via Web Audio API.</p>
          <p>📡 Streaming: Audio chunks are streamed over WebSocket in real-time.</p>
          <p>📝 STT Processing: Backend can run transcription ~every 800ms on received audio.</p>
          <p>🔇 Silence Detection: Backend can use RMS-based silence detection to decide when speech ends.</p>
        </div>
      </div>
    </main>
  );
}
