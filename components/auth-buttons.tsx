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
                        <Button variant="ghost" className="rounded-md lg:h-10 h-9 px-6 lg:text-base text-sm border border-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,1)] hover:text-white font-medium transition-colors">
                            Dashboard
                        </Button>
                    </Link>
                    <Button onClick={handleLogout} className="rounded-md lg:h-10 h-9 px-6 lg:text-base text-sm border border-[rgba(58,63,187,1)] bg-[rgba(58,63,187,1)] hover:bg-white hover:text-[rgba(58,63,187,1)] font-medium transition-colors">
                        Logout
                    </Button>
                </>
            ) : (
                <>
                    <Link href="/login">
                        <Button variant="ghost" className="rounded-md lg:h-10 h-9 px-6 lg:text-base text-sm border border-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,1)] hover:text-white font-medium transition-colors">
                            Login
                        </Button>
                    </Link>
                    <Link href="https://cal.com/soham-mukherjee-8yzald/30min" target="_blank" rel="noopener noreferrer">
                        <Button className="rounded-md lg:h-10 h-9 px-6 lg:text-base text-sm border border-[rgba(58,63,187,1)] bg-[rgba(58,63,187,1)] hover:bg-white hover:text-[rgba(58,63,187,1)] font-medium transition-colors">
                            Request a Demo
                        </Button>
                    </Link>
                </>
            )}
        </>
    );
}
