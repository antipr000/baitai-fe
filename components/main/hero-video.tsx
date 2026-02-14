"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export function HeroVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showVideo, setShowVideo] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = useCallback(() => {
        if (!showVideo) {
            setShowVideo(true);
        } else if (videoRef.current) {
            videoRef.current.play();
        }
    }, [showVideo]);

    // Auto-play once the video element mounts
    useEffect(() => {
        if (showVideo && videoRef.current) {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(() => {
                // Autoplay may be blocked by browser
                setIsPlaying(false);
            });
        }
    }, [showVideo]);

    const handlePause = () => {
        if (videoRef.current?.seeking) return;
        setIsPlaying(false);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setShowVideo(false);
    };

    return (
        <div className="relative w-full cursor-pointer" onClick={!isPlaying ? handlePlay : undefined}>
            {showVideo ? (
                /* Video Element - only rendered when user clicks play */
                <video
                    ref={videoRef}
                    src="https://storage.googleapis.com/bait-asset/demo.mkv"
                    playsInline
                    preload="none"
                    controls={isPlaying}
                    onPause={handlePause}
                    onEnded={handleEnded}
                    onPlay={() => setIsPlaying(true)}
                    className="w-full h-auto object-cover rounded-lg"
                />
            ) : (
                /* Poster Image - shown by default, no video download until clicked */
                <div className="relative w-full aspect-video">
                    <Image
                        src="/main/hero3.png"
                        alt="hero"
                        fill
                        priority
                        className="object-cover rounded-xl"
                    />
                </div>
            )}
        </div>
    );
}
