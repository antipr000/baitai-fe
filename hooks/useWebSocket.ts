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
    templateId,
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
            if (!templateId) {
                console.error('[WebSocket] No templateId provided');
                onError?.(new Event('no_template_id'));
                return;
            }

            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/interview-session/${templateId}/create/`;

            console.log(`[WebSocket] Creating interview session for template: ${templateId}`);
            console.log(`[WebSocket] POST ${url}`);

            try {
                // Create interview session
                const response = await api.post(`/api/v1/interview-session/${templateId}/create/`)

                const session = response.data;
                console.log("[WebSocket] Interview session created:", session);

                if (!session.id) {
                    console.error("[WebSocket] Session created but no ID returned:", session);
                    onError?.(new Event('session_creation_failed'));
                    return;
                }

                const sessionId = session.id;
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                if (!apiUrl) {
                    throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables');
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

                ws.current.onclose = () => {
                    console.log('[WebSocket] WebSocket disconnected');
                    setIsConnected(false);
                    onDisconnect?.();
                };

            } catch (error) {
                console.error('[WebSocket] Error creating interview session:', error);
                onError?.(new Event('session_creation_failed'));
                return;
            }

        }
        createInterviewSession();
        // Cleanup on unmount
        return () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, [templateId, onMessage, onConnect, onDisconnect, onError]);

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