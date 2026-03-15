import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/candidate/navigation/app-sidebar"
import { TopHeader } from "@/components/candidate/navigation/top-header"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { serverFetch, getCachedUserProfile, UserProfile } from "@/lib/api/server"
import { Skeleton } from "@/components/ui/skeleton"

async function SidebarWithProfile({ userProfile }: { userProfile: UserProfile | null }) {
    return <AppSidebar userProfile={userProfile} />
}

export default async function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const userProfile = await getCachedUserProfile()

    if (userProfile?.preferences_set === false) {
        redirect("/preferences")
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Suspense fallback={<header className="h-[72px] bg-white border-b border-[#E2E8F0]" />}>
                <TopHeader />
            </Suspense>
            <SidebarProvider className="flex flex-1 min-h-0 overflow-hidden bg-[rgba(245,247,255,1)]">
                <Suspense fallback={
                    <div className="flex flex-col justify-between h-full w-[var(--sidebar-width)] shrink-0 border-r border-[#E2E8F0] bg-white px-3 py-4">
                        <div className="flex flex-col gap-2">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                        </div>
                        <div className="flex flex-col gap-2 py-6">
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    </div>
                }>
                    <SidebarWithProfile userProfile={userProfile} />
                </Suspense>
                <SidebarInset className="flex w-full min-h-0 mb-4 flex-col bg-white overflow-y-auto">
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
