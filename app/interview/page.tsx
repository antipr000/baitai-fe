"use client"

import LeftSection from "@/components/interview/left-section"
import InterviewSection from "@/components/interview/interview-section"
import UploadSection from "@/components/interview/upload-section"
import ActiveInterview from "@/components/interview/active-interview"
import { useEffect, useState } from "react"


type MediaDevice = MediaDeviceInfo;
type PermissionStatus = "pending" | "granted" | "denied";


export default function InterviewPage() {
    const [activeSection, setActiveSection] = useState<'upload' | 'interview'>('upload')
    const [isInterviewActive, setIsInterviewActive] = useState(false)
    const [cameras, setCameras] = useState<MediaDevice[]>([]);
    const [microphones, setMicrophones] = useState<MediaDevice[]>([]);
    const [speakers, setSpeakers] = useState<MediaDevice[]>([]);

    const [permission, setPermission] = useState<PermissionStatus>("pending");
    const [error, setError] = useState<string | null>(null);
    const [selectedCamera, setSelectedCamera] = useState<string>("default");
    const [selectedMic, setSelectedMic] = useState<string>("default");
    const [selectedSpeaker, setSelectedSpeaker] = useState<string>("default");


    function saveSelection(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    useEffect(() => {
        async function initDevices() {
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
                setPermission("denied");  /// Need to show error to user appropriately
                if (err instanceof DOMException) {
                    if (err.name === "NotAllowedError") {
                        setError("Permission denied. Please allow camera & microphone access.");
                    } else if (err.name === "NotFoundError") {
                        setError("No camera or microphone found.");
                    } else {
                        setError("Unable to access media devices.");
                    }
                }
            }
        }
        initDevices();

    }, [])
    
    if (isInterviewActive) {
        return <ActiveInterview />
    }
    
    return (
        <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto flex gap-6 md:flex-row flex-col">
            <div className="bg-white rounded-xl text-center mx-auto w-[80%] md:w-[450px] shrink-0">
                <LeftSection activeSection={activeSection} setActiveSection={setActiveSection} />
            </div>
            <div className="bg-[rgba(245,247,255,1)] flex-1 min-w-0">
                {activeSection === 'upload' ? <UploadSection /> : <InterviewSection cameras={cameras} microphones={microphones} speakers={speakers} selectedCamera={selectedCamera} selectedMic={selectedMic} selectedSpeaker={selectedSpeaker} setSelectedCamera={setSelectedCamera} setSelectedMic={setSelectedMic} setSelectedSpeaker={setSelectedSpeaker} saveSelection={saveSelection} startInterview={() => setIsInterviewActive(true)} />}
            </div>


        </div>
    )
}
