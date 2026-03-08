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

const navItems = [
    {
        title: "Dashboard",
        url: "/candidate/dashboard2",
        icon: "/candidate/dashboard2/dashboard.svg",
    },
    {
        title: "Interview Invites",
        url: "/candidate/company-interviews2",
        icon: "/candidate/dashboard2/doc.svg",
    },
    {
        title: "Company Practice Interviews",
        url: "/candidate/practice-interviews2",
        icon: "/candidate/dashboard2/company.svg",
    },
    {
        title: "Practice Interviews",
        url: "/candidate/practice-interviews2",
        icon: "/candidate/dashboard2/target.svg",
    },
    {
        title: "Results",
        url: "/results2",
        icon: "/candidate/dashboard2/score.svg",
    },
]

const bottomNavItems = [
    {
        title: "Profile",
        url: "/candidate/profile",
        icon: "/candidate/dashboard2/profile.svg",
    },
    {
        title: "Sign out",
        url: "/logout",
        icon: "/candidate/dashboard2/sign-out.svg",
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

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
                    {bottomNavItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild className="flex items-center gap-3 px-3 py-5 rounded-xl text-[#0A0D1A] font-medium hover:bg-[#F1F3FB]">
                                <Link href={item.url}>
                                    <div className="w-5 h-5 flex items-center justify-center relative">
                                        <Image src={item.icon} alt={item.title} fill className="object-contain" />
                                    </div>
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
