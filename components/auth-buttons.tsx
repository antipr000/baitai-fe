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
            await fetch("/api/logout", { method: "POST" });
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            router.push("/login");
            toast.error("Logout failed");
        }
    }
    
    return (
        <>
            {isAuthenticated ? (
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="lg:text-base rounded-full text-sm hover:bg-[linear-gradient(106.03deg,rgba(239,246,254,0.5)_0%,rgba(163,217,248,0.5)_238.47%)] hover:opacity-80 bg-[linear-gradient(106.03deg,rgba(239,246,254,0.5)_0%,rgba(163,217,248,0.5)_238.47%)] text-[rgba(108,132,255,1)] hover:text-[rgba(108,132,255,1)] border font-medium border-[rgba(108,132,255,0.9)] p-5"
                >
                    Logout
                </Button>
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
