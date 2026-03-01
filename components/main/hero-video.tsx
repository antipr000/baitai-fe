"use client";

import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

export function HeroVideo() {
    return (
        <div className="w-full rounded-lg overflow-hidden [&_.lty-playbtn]:hidden">
            <LiteYouTubeEmbed
                id="po7Kj0HBKrg"
                title="Bait AI Demo"
                poster="maxresdefault"
                webp
                noCookie
                thumbnail="/main/hero3.webp"
                params="rel=0&modestbranding=1"
            />
        </div>
    );
}