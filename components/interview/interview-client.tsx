"use client"

import api from '@/lib/api/client';

import LeftSection from "@/components/interview/left-section"
import InterviewSection from "@/components/interview/interview-section"
import UploadSection from "@/components/interview/upload-section"
import ActiveInterview from "@/components/interview/active-interview"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"

type MediaDevice = MediaDeviceInfo;
type PermissionStatus = "pending" | "granted" | "denied";

// Interview template data type
export type InterviewTemplateData = {
    id: string
    title: string
    role: string
    duration: number
    difficulty_level: string,
    credits: number
}

interface InterviewClientProps {
    templateId: string
    templateData: InterviewTemplateData | null
}

export default function InterviewClient({ templateId, templateData }: InterviewClientProps) {
    const [activeSection, setActiveSection] = useState<'upload' | 'interview'>('upload')
    const [isInterviewActive, setIsInterviewActive] = useState(false)
    const [cameras, setCameras] = useState<MediaDevice[]>([]);
    const [microphones, setMicrophones] = useState<MediaDevice[]>([]);
    const [speakers, setSpeakers] = useState<MediaDevice[]>([]);

    const [permission, setPermission] = useState<PermissionStatus>("pending");
    const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
    const [selectedMic, setSelectedMic] = useState<string | null>(null);
    const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [micStream, setMicStream] = useState<MediaStream | null>(null);
    const [resumeUploaded, setResumeUploaded] = useState(false);

    // Use refs to track streams for cleanup on unmount only
    const cameraStreamRef = useRef<MediaStream | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    // Track if we've navigated away (pagehide fired) to prevent re-requesting media on back
    const hasNavigatedAwayRef = useRef(false);

    // Session state
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Keep refs in sync with state
    useEffect(() => {
        cameraStreamRef.current = cameraStream;
    }, [cameraStream]);

    useEffect(() => {
        micStreamRef.current = micStream;
    }, [micStream]);


    // Cleanup media streams ONLY when component unmounts (e.g., when navigating back)
    // Also handle browser back button via popstate and page unload
    useEffect(() => {
        const stopAllStreams = () => {
            // Stop camera stream using ref (has latest value)
            if (cameraStreamRef.current) {
                console.log('[Page Cleanup] Stopping camera stream');
                cameraStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                    track.enabled = false;
                });
                cameraStreamRef.current = null;
            }
            // Stop mic stream using ref (has latest value)
            if (micStreamRef.current) {
                console.log('[Page Cleanup] Stopping mic stream');
                micStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                    track.enabled = false;
                });
                micStreamRef.current = null;
            }
        };

        const handlePageHide = () => {
            console.log('[Page Cleanup] pagehide event - stopping streams');
            hasNavigatedAwayRef.current = true; // Mark that we've navigated away
            stopAllStreams();
        };


        window.addEventListener('pagehide', handlePageHide);

        return () => {
            window.removeEventListener('pagehide', handlePageHide);
            stopAllStreams();
        };
    }, []); // Empty dependency array - only runs on mount/unmount


    function saveSelection(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    useEffect(() => {
        async function initDevices() {
            // Don't re-request media if we've navigated away (page restored from cache)
            if (hasNavigatedAwayRef.current) {
                console.log('[Page] Skipping initDevices - page was navigated away from');
                return;
            }

            try {
                setPermission("pending");

                await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                setPermission("granted");
                const devices = await navigator.mediaDevices.enumerateDevices();
                setCameras(devices.filter(d => d.kind === "videoinput"));
                setMicrophones(devices.filter(d => d.kind === "audioinput"));
                setSpeakers(devices.filter(d => d.kind === "audiooutput"));

                setSelectedCamera(localStorage.getItem("cameraId") ?? "default");
                setSelectedMic(localStorage.getItem("micId") ?? "default");
                setSelectedSpeaker(localStorage.getItem("speakerId") ?? "default");
                console.log("Devices initialized");
                console.log(devices);

                const defaults = devices.filter(d => d.deviceId === "default");
                console.log(defaults);
            } catch (err) {
                console.error(err);
                setPermission("denied");

                // Handle specific error types with appropriate messages
                if (err instanceof DOMException) {
                    if (err.name === "NotAllowedError") {
                        const errorMsg = "Permission denied. Please allow camera & microphone access.";
                        console.warn(errorMsg);
                        toast.error(errorMsg);
                    } else if (err.name === "NotFoundError") {
                        const errorMsg = "No camera or microphone found.";
                        console.warn(errorMsg);
                        toast.error(errorMsg);
                    } else if (err.name === "OverconstrainedError") {
                        const errorMsg = "Camera constraints not supported. Try a different camera.";
                        console.warn(errorMsg);
                        toast.error(errorMsg);
                    } else if (err.name === "NotReadableError") {
                        const errorMsg = "Camera or microphone is already in use by another application.";
                        console.warn(errorMsg);
                        toast.error(errorMsg);
                    } else {
                        const errorMsg = "Unable to access media devices.";
                        console.warn(errorMsg);
                        toast.error(errorMsg);
                    }
                } else {
                    const errorMsg = "An unexpected error occurred while accessing media devices.";
                    console.warn(errorMsg);
                    toast.error(errorMsg);
                }
            }
        }
        initDevices();

    }, [])

    // Monitor permission changes - detect when user revokes access
    useEffect(() => {
        async function monitorPermissions() {
            try {
                // Warn if Permissions API is not supported (desktop-only app)
                if (!navigator.permissions) {
                    console.warn('Permissions API not supported. Please use Chrome or Edge for the best experience.');
                    return;
                }

                const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
                const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });

                const handlePermissionChange = () => {
                    if (cameraPermission.state === 'denied' || micPermission.state === 'denied') {
                        setPermission("denied");
                        const errorMsg = "Camera or microphone access was revoked. Please grant permissions again.";
                        console.warn(errorMsg);
                        toast.error(errorMsg);
                    } else if (cameraPermission.state === 'granted' && micPermission.state === 'granted') {
                        setPermission("granted");
                    }
                };

                cameraPermission.addEventListener('change', handlePermissionChange);
                micPermission.addEventListener('change', handlePermissionChange);

                return () => {
                    cameraPermission.removeEventListener('change', handlePermissionChange);
                    micPermission.removeEventListener('change', handlePermissionChange);
                };
            } catch (err) {
                console.error('Permission monitoring not supported:', err);
            }
        }

        monitorPermissions();
    }, [])




    const handleStartInterview = async () => {
        if (!templateId) {
            toast.error('Template ID is missing');
            return;
        }

        try {
            console.log('[Interview Client] Creating interview session for template:', templateId);
            const response = await api.post(`/api/v1/interview-session/${templateId}/create/`);
            const session = response.data;

            if (!session.id) {
                console.error('Session created but no ID returned:', session);
                toast.error('Failed to start interview: Invalid session data');
                return;
            }

            console.log('[Interview Client] Session created:', session.id);
            setSessionId(session.id);
            setIsInterviewActive(true);
        } catch (error: any) {
            if (error.response?.status === 402) {
                // Handled by global interceptor, but we can return early to prevent generic error
                return;
            }
            console.error('[Interview Client] Error creating session:', error);
            toast.error('Failed to start interview. Please try again.');
        }
    };

    if (isInterviewActive && permission === 'granted' && templateId && sessionId) {  // could check for resume uploaded also if want to make it mandatory
        return <ActiveInterview cameraStream={cameraStream} micStream={micStream} templateId={templateId} sessionId={sessionId} />
    }

    return (
        <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto flex gap-6 md:flex-row flex-col">
            <div className="bg-white rounded-xl text-center mx-auto w-[80%] md:w-[450px] shrink-0">
                <LeftSection
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    title={templateData?.title}
                    duration={templateData?.duration}
                />
            </div>
            <div className="bg-[rgba(245,247,255,1)] flex-1 min-w-0">
                {activeSection === 'upload' ? (
                    <UploadSection onUploadComplete={() => {
                        setResumeUploaded(true);
                        setActiveSection('interview');
                    }} />
                ) : (
                    <InterviewSection
                        cameras={cameras}
                        microphones={microphones}
                        speakers={speakers}
                        selectedCamera={selectedCamera}
                        selectedMic={selectedMic}
                        selectedSpeaker={selectedSpeaker}
                        setSelectedCamera={setSelectedCamera}
                        setSelectedMic={setSelectedMic}
                        setSelectedSpeaker={setSelectedSpeaker}
                        saveSelection={saveSelection}
                        startInterview={handleStartInterview}
                        onCameraStream={setCameraStream}
                        onMicStream={setMicStream}
                        keepCameraStreamOnUnmount
                        keepMicStreamOnUnmount
                        permission={permission}
                        title={templateData?.title}
                        duration={templateData?.duration}
                    />
                )}
            </div>


        </div>
    )
}
