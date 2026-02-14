"use client";

import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

export function HeroVideo() {
    return (
        <div className="w-full rounded-lg overflow-hidden [&_.lty-playbtn]:hidden">
            <LiteYouTubeEmbed
                id="WIzDkQ-oOFQ"
                title="Bait AI Demo"
                poster="maxresdefault"
                webp
                noCookie
                params="rel=0&modestbranding=1"
            />
        </div>
    );
}