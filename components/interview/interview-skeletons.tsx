import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function InterviewSkeleton() {
    return (
        <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto flex gap-6 md:flex-row flex-col">
            {/* Left Section Skeleton (Sidebar) */}
            <div className="bg-white rounded-xl mx-auto w-[80%] md:w-[450px] shrink-0 h-fit">
                {/* Back Button Area */}
                <div className="flex items-center justify-between px-6 py-4">
                    <Skeleton className="h-10 w-48 rounded-md" />
                </div>

                <div className="flex">
                    <div className="w-full p-6 space-y-8">
                        {/* Title */}
                        <Skeleton className="h-7 w-3/4 mr-auto" />

                        {/* Progress Bar */}
                        <div className="w-full">
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>

                        <div className="space-y-6">
                            {/* Upload Resume Step Card */}
                            <div className="flex items-center justify-between w-full p-4 rounded-lg border-2 border-transparent bg-muted/10">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-5 w-5 rounded-sm" /> {/* Icon */}
                                    <div>
                                        <Skeleton className="h-5 w-32 mb-1" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-6 rounded-full" /> {/* Check/Circle */}
                            </div>

                            {/* Domain Expert Interview Step Card */}
                            <div className="flex items-center justify-between w-full p-4 rounded-lg border-2 border-transparent bg-muted/10">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-5 w-5 rounded-sm" />
                                    <div className="flex flex-col items-start gap-1">
                                        <Skeleton className="h-5 w-48" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section Skeleton (Main Content) */}
            <div className="bg-[rgba(245,247,255,1)] flex-1 min-w-0 rounded-xl px-24 py-6">
                {/* Top Buttons (FAQ / Contact) */}
                <div className="flex items-center gap-3 md:justify-end justify-start px-6 py-4 mb-6">
                    <Skeleton className="h-10 w-24 rounded-3xl" />
                    <Skeleton className="h-10 w-40 rounded-3xl" />
                </div>

                {/* Header Area */}
                <div className="flex items-center px-6 py-4 justify-between mb-6">
                    <div>
                        <div className="relative mb-2">
                            <Skeleton className="h-8 w-48 mb-1" /> {/* Title */}
                            <Skeleton className="absolute -right-24 top-0 h-6 w-20 rounded-full" /> {/* Badge */}
                        </div>
                        <Skeleton className="h-4 w-64" /> {/* Subtitle */}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full px-6">
                    <div className="w-full max-w-4xl mx-auto">
                        {/* Video Area */}
                        <div className="w-full aspect-video bg-black/5 rounded-lg overflow-hidden relative border border-black/5">
                            <Skeleton className="w-full h-full" />
                            {/* Play button placeholder in center */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Skeleton className="h-20 w-20 rounded-full opacity-20" />
                            </div>
                        </div>

                        {/* Controls (3 cols) */}
                        <div className="grid grid-cols-3 gap-4 mb-6 mt-5">
                            {/* Mic */}
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full rounded-md" />
                                <Skeleton className="h-3 w-24 text-center mx-auto" />
                            </div>
                            {/* Speaker */}
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full rounded-md" />
                                <Skeleton className="h-3 w-24 text-center mx-auto" />
                            </div>
                            {/* Camera */}
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full rounded-md" />
                                <Skeleton className="h-3 w-24 text-center mx-auto" />
                            </div>
                        </div>

                        {/* Keep Scrolling Button */}
                        <div className="mb-8 flex justify-start">
                            <Skeleton className="h-12 w-40 rounded-lg" />
                        </div>

                        {/* Before you begin section */}
                        <div className="mb-8 mt-12">
                            <Skeleton className="h-6 w-40 mb-6" /> {/* Title */}
                            <div className="space-y-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="h-5 w-5 rounded-sm shrink-0" />
                                        <Skeleton className="h-4 w-64" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Start Now Button */}
                        <div className="text-center mb-4 mt-8">
                            <Skeleton className="w-full h-14 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
