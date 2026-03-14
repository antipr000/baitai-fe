"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function CompanyLogoutButton() {
    const router = useRouter()

    async function handleSignOut() {
        try {
            await signOut(auth)
            const response = await fetch("/api/logout")
            if (!response.ok) {
                toast.error("Logout failed")
                return
            }
            router.push("/")
        } catch {
            toast.error("Logout failed")
        }
    }

    return (
        <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="text-[rgba(58,63,187,1)] font-semibold border-[rgba(58,63,187,1)] h-10 px-7 rounded-md hover:text-[rgba(58,63,187,1)]"
        >
            Logout
        </Button>
    )
}
