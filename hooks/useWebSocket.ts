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

    // Use refs to store the latest callbacks to avoid re-triggering the effect
    const onMessageRef = useRef(onMessage);
    const onConnectRef = useRef(onConnect);
    const onDisconnectRef = useRef(onDisconnect);
    const onErrorRef = useRef(onError);

    // Update refs whenever the callbacks change
    useEffect(() => {
        onMessageRef.current = onMessage;
        onConnectRef.current = onConnect;
        onDisconnectRef.current = onDisconnect;
        onErrorRef.current = onError;
    }, [onMessage, onConnect, onDisconnect, onError]);

    useEffect(() => {
        if (!sessionId) return;

        let isUnmounted = false;
        let keepaliveInterval: NodeJS.Timeout | null = null;

        const connectWebSocket = () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                console.error('NEXT_PUBLIC_API_URL is not defined');
                onErrorRef.current?.(new Event('config_error'));
                return;
            }
            const wsUrl = `${apiUrl.replace('http', 'ws')}/ws/interview/${sessionId}/`;
            console.log(`[WebSocket] Connecting to WebSocket: ${wsUrl}`);

            const socket = new WebSocket(wsUrl);
            ws.current = socket;
            socket.binaryType = "arraybuffer";

            socket.onopen = () => {
                if (isUnmounted) {
                    socket.close();
                    return;
                }
                console.log('[WebSocket] WebSocket connected');
                setIsConnected(true);
                onConnectRef.current?.();

                // Start keepalive ping every 30 seconds
                keepaliveInterval = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        try {
                            const pingMessage = JSON.stringify({ type: 'ping' });
                            socket.send(pingMessage);
                            console.log('[WebSocket] Sent keepalive ping');
                        } catch (error) {
                            console.error('[WebSocket] Error sending keepalive ping:', error);
                        }
                    } else {
                        console.warn('[WebSocket] Cannot send keepalive ping, socket not open');
                        if (keepaliveInterval) {
                            clearInterval(keepaliveInterval);
                            keepaliveInterval = null;
                        }
                    }
                }, 30000); // Send ping every 30 seconds
                console.log('[WebSocket] Started keepalive interval (30s)');
            };

            socket.onmessage = (event) => {
                if (isUnmounted) return;
                setLastMessage(event.data);
                onMessageRef.current?.(event.data);
            };

            socket.onerror = (error) => {
                if (isUnmounted) return;
                console.error('[WebSocket] WebSocket error:', error);
                onErrorRef.current?.(error);
            };

            socket.onclose = (event) => {
                if (isUnmounted) return;
                console.log('[WebSocket] WebSocket disconnected', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                setIsConnected(false);
                onDisconnectRef.current?.();

                // Clear keepalive interval
                if (keepaliveInterval) {
                    clearInterval(keepaliveInterval);
                    keepaliveInterval = null;
                    console.log('[WebSocket] Cleared keepalive interval');
                }

                // Reconnection logic could go here if needed, 
                // but we respect server-initiated closes 4000/4001
                if (event.code === 4000 || event.code === 4001) {
                    console.log('[WebSocket] Server closed connection, not reconnecting');
                }
            };
        }

        connectWebSocket();

        // Cleanup on unmount or sessionId change
        return () => {
            isUnmounted = true;
            if (keepaliveInterval) {
                clearInterval(keepaliveInterval);
                keepaliveInterval = null;
            }
            if (ws.current) {
                if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
                    console.log('[WebSocket] Closing WebSocket during cleanup');
                    ws.current.close();
                }
                ws.current = null;
            }
        };
    }, [sessionId]); // Only reconnect if sessionId changes

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