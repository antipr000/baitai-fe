"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const navItems = [
    {
        title: "Dashboard",
        url: "/candidate/dashboard",
        icon: "/candidate/dashboard/dashboard.svg",
    },
    {
        title: "Interview Invites",
        url: "/candidate/company-interviews",
        icon: "/candidate/dashboard/doc.svg",
    },
    {
        title: "Company Practice Interviews",
        url: "/candidate/company-practice",
        icon: "/candidate/dashboard/company.svg",
    },
    {
        title: "Practice Interviews",
        url: "/candidate/practice-interviews",
        icon: "/candidate/dashboard/target.svg",
    },
    {
        title: "Results",
        url: "/candidate/results",
        icon: "/candidate/dashboard/graph-up.svg",
    },
]

interface UserProfile {
    first_name: string
    last_name: string
    profile_picture_url: string | null
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    userProfile?: UserProfile | null
}

export function AppSidebar({ userProfile, ...props }: AppSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const user = userProfile ?? null

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

    const initials = user
        ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
        : "?"

    return (
        <Sidebar collapsible="icon" className="top-[72px]! h-[calc(100svh-72px)]! border-r border-[#E2E8F0] bg-white" {...props}>
            <SidebarContent className="px-3 gap-2 py-4">
                <SidebarMenu className="gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.url
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-6 rounded-xl hover:bg-[#F1F3FB] transition-colors",
                                        isActive ? "bg-[#F1F3FB] text-[#1D215E] font-medium" : "text-[#64748B]"
                                    )}
                                >
                                    <Link href={item.url}>
                                        <div className="w-5 h-5 flex items-center justify-center relative">
                                            <Image src={item.icon} alt={item.title} fill className={cn("object-contain", isActive ? "" : "opacity-70 grayscale")} />
                                        </div>
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="py-6 px-3">
                <SidebarMenu className="gap-2">
                    {/* Profile row */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === "/candidate/profile"}
                            className={cn(
                                "flex items-center gap-3 px-3 py-5 rounded-xl transition-colors",
                                pathname === "/candidate/profile" ? "bg-[#F1F3FB] text-[#1D215E] font-medium" : "text-[#0A0D1A] font-medium hover:bg-[#F1F3FB]"
                            )}
                        >
                            <Link href="/candidate/profile">
                                <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-[#1D215E] text-white text-xs font-bold shrink-0">
                                    {user?.profile_picture_url ? (
                                        <Image src={user.profile_picture_url} alt="Profile" width={32} height={32} className="object-cover w-full h-full" />
                                    ) : (
                                        <span>{initials}</span>
                                    )}
                                </div>
                                <span>{user ? `${user.first_name} ${user.last_name}` : "Profile"}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {/* Sign out */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="flex items-center gap-3 px-3 py-5 rounded-xl text-[rgba(10,13,26,1)] font-medium hover:bg-[#F1F3FB] cursor-pointer"
                            onClick={handleSignOut}
                        >
                            <div className="w-6 h-6 flex items-center justify-center relative">
                                <Image src="/candidate/dashboard/sign-out.svg" alt="Sign out" fill className="object-contain " />
                            </div>
                            <span>Sign out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
