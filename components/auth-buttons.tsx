"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AuthButtonsProps {
    isAuthenticated: boolean;
}

export function AuthButtons({ isAuthenticated }: AuthButtonsProps) {
    const router = useRouter();
    async function handleLogout() {
        try {
            await signOut(auth);
            // Call logout API and wait for it to complete
            const response = await fetch("/api/logout");
            if (response.ok) {
                // Hard reload to clear all cached pages
                window.location.href = "/login";
            }
            else {
                toast.error("Logout failed");
            }
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed");
            window.location.href = "/login";
        }
    }

    return (
        <>
            {isAuthenticated ? (
                <>
                    <Link href="/candidate/dashboard">
                        <Button className="flex rounded-full items-center overflow-hidden p-5 lg:text-base text-sm bg-[linear-gradient(106.03deg,#677CFF_0%,#A3D9F8_238.47%)] hover:opacity-70 text-[rgba(238,246,251,1)] font-medium">
                            Go to Dashboard
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="lg:text-base rounded-full text-sm hover:bg-[linear-gradient(106.03deg,rgba(239,246,254,0.5)_0%,rgba(163,217,248,0.5)_238.47%)] hover:opacity-80 bg-[linear-gradient(106.03deg,rgba(239,246,254,0.5)_0%,rgba(163,217,248,0.5)_238.47%)] text-[rgba(108,132,255,1)] hover:text-[rgba(108,132,255,1)] border font-medium border-[rgba(108,132,255,0.9)] p-5"
                    >
                        Logout
                    </Button>
                </>
            ) : (
                <>
                    <Link href="/login">
                        <Button className="flex rounded-full items-center overflow-hidden p-5 lg:text-base text-sm bg-[linear-gradient(106.03deg,#677CFF_0%,#A3D9F8_238.47%)] hover:opacity-70 text-[rgba(238,246,251,1)] font-medium">
                            Login
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button variant="ghost" className="lg:text-base rounded-full text-sm hover:bg-[linear-gradient(106.03deg,rgba(239,246,254,0.5)_0%,rgba(163,217,248,0.5)_238.47%)] hover:opacity-80 bg-[linear-gradient(106.03deg,rgba(239,246,254,0.5)_0%,rgba(163,217,248,0.5)_238.47%)] text-[rgba(108,132,255,1)] hover:text-[rgba(108,132,255,1)] border font-medium border-[rgba(108,132,255,0.9)]">
                            Sign up
                        </Button>
                    </Link>
                </>
            )}
        </>
    );
}
