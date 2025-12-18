'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Video, VideoOff, Phone, ScreenShare } from 'lucide-react'
import { useWebSocket } from '@/hooks/useWebSocket'



export default  function InterviewPage() {
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
            <Image
              src="/interview/person.png"
              alt="Your Video"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-4 flex justify-center gap-4">
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
       <h2 className="text-lg font-bold">
          <span className={`ml-2 text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </span>
        </h2>
    </div>
  )
}
