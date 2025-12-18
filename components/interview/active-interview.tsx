'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Video, VideoOff, Phone, ScreenShare } from 'lucide-react'
import { useWebSocket } from '@/hooks/useWebSocket'

type ActiveInterviewProps = {
  cameraStream?: MediaStream | null
  micStream?: MediaStream | null
}

export default function ActiveInterview({ cameraStream, micStream }: ActiveInterviewProps) {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isSharing, setIsSharing] = useState(false)

  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');

  const { isConnected, send } = useWebSocket({
    // url: 'ws://localhost:8000/ws/chat/basic/',
    onMessage: (data) => {
      console.log('Received:', data);
      console.log(typeof data);
      // setMessages((prev) => [...prev, data]);
    },
    onConnect: () => {
      console.log('Connected to WebSocket');
    },
    onDisconnect: () => {
      console.log('Disconnected from WebSocket');
    },
    onError: (error) => {
      console.error('Error:', error);
    },
  });

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // send({ message: inputValue });
      setInputValue('');
    }
  };


  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      // attach the incoming camera stream to this page's video element
      videoRef.current.srcObject = cameraStream
      videoRef.current.play().catch((error) => {
        console.error('Error playing video:', error)
        // Show a toast/notification etc to the user
      })
    }
  }, [cameraStream])

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center relative bg-gray-800 ">
        <div className=" relative">
          <Image
            src="/interview/logo.svg"
            alt="Interviewer"
            height={100}
            width={100}
            className="object-cover"
            priority
          />

          <div className="fixed bottom-30 right-6 w-60 h-50 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
            {cameraStream ? (
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
                <p>No camera stream yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-4 items-center flex justify-center gap-4">
        {/* Mute Button */}
        <Button
          onClick={() => setIsMicOn(!isMicOn)}
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
          className={cn(
            'rounded-full w-14 h-14 flex items-center justify-center bg-red-600 hover:bg-red-700 transition-all'
          )}
          title="End Call"
        >
          <Phone className="w-6 h-6 text-white rotate-135" />
        </Button>
      </div>

      <h2 className="text-lg font-bold fixed bottom-1 left-4">
        <span className={`ml-2 text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </span>
      </h2>
    </div>
  )
}
