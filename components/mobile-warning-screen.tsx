import Image from "next/image";
import React from "react";

export function MobileWarningScreen() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[linear-gradient(287.43deg,#F5F7FF_1.19%,#DCF4FF_115.27%)] p-6 text-center">
            {/* Icon Placeholder */}
            <div className="mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-white">
              <Image src="/bulb.gif" alt="Icon" width={100} height={100} />
            </div>

            {/* Main Text */}
            <h1 className="mb-4 text-xl sm:text-2xl  font-bold leading-tight tracking-tight md:text-3xl">
                {/* <span className="bg-[linear-gradient(91.74deg,rgba(0,215,255,0.9)_-12.71%,rgba(83,94,221,0.9)_61.45%,rgba(58,63,187,0.9)_135.63%)] bg-clip-text text-transparent">
                    Your phone is great,
                </span> */}
                <br />
                <span className="font-semibold tracking-tighter bg-[linear-gradient(91.74deg,rgba(0,215,255,0.9)_-12.71%,rgba(83,94,221,0.9)_61.45%,rgba(58,63,187,0.9)_135.63%)] bg-clip-text text-transparent">
                    This page prefers a little more space.
                </span>
            </h1>

            {/* Subtext */}
            <p className="font-semibold text-[#0A0D1AE5]">Please switch to desktop</p>
        </div>
    );
}
