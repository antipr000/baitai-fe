"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    async function handleLogout() {
        try {
            await signOut(auth);
            // Call logout API and wait for it to complete
            const response = await fetch("/api/logout");
            if (response.ok) {
                // Hard reload to clear all cached pages and redirect to company login
                window.location.href = "/company/login";
            }
            else {
                toast.error("Logout failed");
            }
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed");
            // Still try to redirect even if error
            window.location.href = "/company/login";
        }
    }

    return (
        <Button
            variant="ghost"
            onClick={handleLogout}
            size="lg"
            className="bg-[linear-gradient(93.21deg,rgba(62,84,251,0.9)_-31.21%,rgba(195,206,255,0.9)_174.4%)] hover:opacity-80 hover:text-white text-white flex items-center gap-2 rounded-lg px-6"
        >
            <LogOut className="h-14 w-14" />
            <span className="text-xl font-medium">Logout</span>
        </Button>
    );
}
