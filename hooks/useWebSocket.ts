import { useEffect, useRef, useState, useCallback } from 'react';

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

            const url = `http://127.0.0.1:8000/api/v1/interview-session/${templateId}/create/`;

            console.log(`[WebSocket] Creating interview session for template: ${templateId}`);
            console.log(`[WebSocket] POST ${url}`);

            try {
                // Connect to WebSocket
                const response = await fetch(url, {
                    method: 'POST',
                   
                    // user id to be sent from the frontend
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    console.error(`[WebSocket] Failed to create session: ${response.status}`, errorData);
                    onError?.(new Event('session_creation_failed'));
                    return;
                }

                const session = await response.json();
                console.log("[WebSocket] Interview session created:", session);

                if (!session.id) {
                    console.error("[WebSocket] Session created but no ID returned:", session);
                    onError?.(new Event('session_creation_failed'));
                    return;
                }

                const sessionId = session.id;
                const wsUrl = `ws://127.0.0.1:8000/ws/interview/${sessionId}/`;
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