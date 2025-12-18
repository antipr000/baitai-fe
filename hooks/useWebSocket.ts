import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketOptions {
    // url: string;
    onMessage?: (data: any) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
}

export const useWebSocket = ({
    // url,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
}: WebSocketOptions) => {
    const ws = useRef<WebSocket | null>(null);
    const hasCreatedSession = useRef(false);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);

    useEffect(() => {
        if (hasCreatedSession.current) return; // prevent duplicate creations (StrictMode / re-renders)
        hasCreatedSession.current = true;

        const createInterviewSession = async () => {
            // Connect to WebSocket
            const response = await fetch(
                `http://localhost:8000/api/v1/interview-session/${'it_nfrocm7aik9rr3y5'}/create/`,
                { 
                    method: 'POST',
                   // user id to be sent from the frontend
                }
            );

            const session = await response.json();
            console.log("Interview session :", session);
            const sessionId = session.id;
            const wsUrl = `ws://localhost:8000/ws/interview/${sessionId}/`;
            ws.current = new WebSocket(wsUrl);
            ws.current.binaryType = "arraybuffer";

            ws.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                onConnect?.();
            };

            ws.current.onmessage = (event) => {
                // const data = JSON.parse(event.data);
                setLastMessage(event.data);
                onMessage?.(event.data);
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                onError?.(error);
            };

            ws.current.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                onDisconnect?.();
            };

        }
        createInterviewSession();
        // Cleanup on unmount
        return () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, [onMessage, onConnect, onDisconnect, onError]); // also for url

    const send = useCallback((data: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(data);
        } else {
            console.warn('WebSocket is not connected');
        }
    }, []);

    return {
        isConnected,
        send,
        lastMessage,
        ws: ws.current,
    };
};