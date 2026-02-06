
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";
import Header from "@/components/header";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[linear-gradient(110deg,#6B7CFF_-18.65%,#3A3FBB_143.99%)] relative overflow-hidden">
            <Header />




            {/* Main Content Container */}
            <div className="z-10 w-full max-w-6xl px-6 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-4 relative">

                {/* Stars */}

                {/* Text Section (Centered-ish relative to screen, but left relative to image) */}
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="absolute -z-10 inset-0 overflow-hidden pointer-events-none">
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute bg-white rounded-full opacity-60"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    width: `3px`,
                                    height: `3px`,
                                }}
                            />
                        ))}
                    </div>
                    {/* 4 0 4 Text */}
                    <div className="relative lg:block hidden translate-y-1/4">
                        <Image
                            src="/404/404.svg"
                            alt="404"
                            width={500}
                            height={500}
                            className="size-[300px] "
                        />
                    </div>
                    <div className="relative lg:hidden block translate-y-1/4">
                        <Image
                            src="/404/404-sm.svg"
                            alt="404"
                            width={500}
                            height={500}
                            className="md:size-[250px] size-[200px]"
                        />
                    </div>

                    {/* Message */}
                    <div className="">
                        <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-wide">
                            Page not found
                        </h2>
                        <p className="text-white/80 text-lg md:text-sm font-light">
                            This page didn't meet the selection criteria
                        </p>
                    </div>

                    {/* Button */}
                    <div className="pt-6">
                        <Link href="/candidate/dashboard">
                            <Button
                                size="lg"
                                className="rounded-full border-2 border-white bg-transparent  hover:bg-white hover:text-[#6B7CFF] text-white px-10 py-6 text-lg font-medium transition-all"
                            >
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Image Section (To the right, slightly overlapping or distinct) */}
                <div className="absolute right-0 top-[65%] md:top-1/2 -translate-y-1/2 sm:mb-4 translate-x-8 md:translate-x-5 lg:translate-x-0">
                    <motion.div
                        animate={{ y: [-50, 20, -50] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative w-full h-full"
                    >
                        {/* Using logo as placeholder for astronaut */}
                        <Image
                            src="/404/astronaut.svg"
                            alt="Astronaut"
                            width={400}
                            height={400}
                            className="l
                        xl:size-[350px] md:size-[250px] size-[150px] "
                        />
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
