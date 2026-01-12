import { useEffect, useRef, useState, useCallback } from 'react';
import api from '../lib/api/client';

interface WebSocketOptions {
    templateId: string;
    onMessage?: (data: any) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
}

export const useWebSocket = ({
    sessionId, // changed from templateId
    onMessage,
    onConnect,
    onDisconnect,
    onError,
}: {
    sessionId: string | null;
    onMessage?: (data: any) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
}) => {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);

    useEffect(() => {
        if (!sessionId) return;

        const connectWebSocket = () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                console.error('NEXT_PUBLIC_API_URL is not defined');
                onError?.(new Event('config_error'));
                return;
            }
            const wsUrl = `${apiUrl.replace('http', 'ws')}/ws/interview/${sessionId}/`;
            console.log(`[WebSocket] Connecting to WebSocket: ${wsUrl}`);

            ws.current = new WebSocket(wsUrl);
            ws.current.binaryType = "arraybuffer";

            ws.current.onopen = () => {
                console.log('[WebSocket] WebSocket connected');
                setIsConnected(true);
                onConnect?.();
            };

            ws.current.onmessage = (event) => {
                // const data = JSON.parse(event.data);
                setLastMessage(event.data);
                onMessage?.(event.data);
            };

            ws.current.onerror = (error) => {
                console.error('[WebSocket] WebSocket error:', error);
                onError?.(error);
            };

            ws.current.onclose = (event) => {
                console.log('[WebSocket] WebSocket disconnected', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                setIsConnected(false);
                onDisconnect?.();

                // Don't attempt reconnection if it was a clean close or server-initiated
                if (event.code === 4000 || event.code === 4001) {
                    console.log('[WebSocket] Server closed connection, not reconnecting');
                    return;
                }
            };
        }

        connectWebSocket();

        // Cleanup on unmount
        return () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, [sessionId, onMessage, onConnect, onDisconnect, onError]);

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