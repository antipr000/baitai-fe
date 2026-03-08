import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { TopHeader } from "./components/top-header"
import { Suspense } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Suspense fallback={<header className="h-[72px] bg-white border-b border-[#E2E8F0]" />}>
                <TopHeader />
            </Suspense>
            <SidebarProvider className="flex flex-1 min-h-0 overflow-hidden bg-[rgba(245,247,255,1)]">
                <AppSidebar />
                <SidebarInset className="flex w-full min-h-0 mb-4 flex-col bg-white overflow-y-auto">
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
