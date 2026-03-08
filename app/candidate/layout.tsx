import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/candidate/navigation/app-sidebar"
import { TopHeader } from "@/components/candidate/navigation/top-header"
import { Suspense } from "react"
import ClientAuthWrapper from "./client-auth-wrapper"

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClientAuthWrapper>
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
        </ClientAuthWrapper>
    )
}
