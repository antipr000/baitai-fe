"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function HeroVideo() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handlePause = () => {
        if (videoRef.current?.seeking) return;
        setIsPlaying(false);
    };

    const handleEnded = () => {
        setIsPlaying(false);
    };

    return (
        <div className="relative w-full cursor-pointer" onClick={!isPlaying ? handlePlay : undefined}>
            {/* Video Element */}
            <video
                ref={videoRef}
                src="https://storage.googleapis.com/bait-asset/demo.mkv"
                playsInline
                controls={isPlaying}
                onPause={handlePause}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                className={`w-full h-auto object-cover rounded-lg ${isPlaying ? "block" : "hidden"}`}
            />

            {/* Poster + Play Button Overlay (shown when not playing) */}
            {!isPlaying && (
                <div className="relative w-full">
                    <Image
                        src="/main/hero.webp"
                        alt="hero"
                        width={800}
                        height={500}
                        priority
                        className="w-full h-auto object-cover rounded-lg"
                    />
                </div>
            )}
        </div>
    );
}