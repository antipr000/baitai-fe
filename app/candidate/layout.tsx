"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/authContext";
import { Loader2 } from "lucide-react";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
    const { preferencesSet, preferencesLoading, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !preferencesLoading && preferencesSet === false) {
            router.replace("/preferences");
        }
    }, [loading, preferencesLoading, preferencesSet, router]);

    if (loading || preferencesLoading) {
        return (
            <div className="min-h-screen bg-[rgba(248,250,255,1)] flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-[rgba(58,63,187,1)]" />
            </div>
        );
    }

    if (preferencesSet === false) {
        return (
            <div className="min-h-screen bg-[rgba(248,250,255,1)] flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-[rgba(58,63,187,1)]" />
            </div>
        );
    }

    return <>{children}</>;
}
