import { Skeleton } from '@/components/ui/skeleton'

export function InterviewSkeleton() {
    return (
        // Mirrors: InterviewClient root div
        <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto flex gap-6 md:flex-row flex-col">

            {/* ── Left Section ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl text-center mx-auto w-[80%] md:w-[450px] shrink-0">
                {/* Back button row */}
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-[180px] rounded-md" />
                    </div>
                </div>

                <div className="flex">
                    <div className="w-full p-6 space-y-8">
                        {/* Title */}
                        <Skeleton className="h-5 w-3/4 text-left" />

                        {/* Progress Bar */}
                        <div className="w-full">
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>

                        <div className="space-y-6">
                            {/* Step 1: Upload Resume */}
                            <div className="flex items-center justify-between w-full p-4 rounded-lg border-2 border-transparent">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4 shrink-0" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                                <Skeleton className="h-7 w-7 rounded-full" />
                            </div>

                            {/* Step 2: Domain Expert Interview */}
                            <div className="flex items-center justify-between w-full p-4 rounded-lg border-2 border-transparent">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4 shrink-0" />
                                    <Skeleton className="h-4 w-44" />
                                </div>
                                <Skeleton className="h-7 w-7 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Section ──────────────────────────────────────────────── */}
            {/* Same as InterviewClient right wrapper: bg + flex-1 min-w-0 */}
            <div className="bg-[rgba(245,247,255,1)] flex-1 min-w-0">
                {/* InterviewSection inner wrapper is 'flex-2 px-24' — applied here */}
                <div className="px-8 md:px-12 lg:px-16">

                    {/* FAQ / Contact buttons — md:justify-end */}
                    <div className="flex items-center gap-3 md:justify-end justify-start px-6 py-4">
                        <Skeleton className="h-10 w-16 rounded-3xl" />
                        <Skeleton className="h-10 w-36 rounded-3xl" />
                    </div>

                    {/* Title + Badge + Subtitle */}
                    <div className="flex items-center px-6 py-4 justify-between mb-6">
                        <div>
                            <div className="relative mb-1 flex items-center gap-16">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-52 mt-1" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full px-6">
                        <div className="w-full max-w-4xl mx-auto">

                            {/* Video: bg-black, aspect-video, rounded-lg */}
                            <div className="w-full aspect-video bg-black/80 rounded-lg overflow-hidden">
                                <Skeleton className="w-full h-full rounded-none opacity-50" />
                            </div>

                            {/* 3-col device controls: grid-cols-3 gap-4 mt-5 mb-6 */}
                            <div className="grid grid-cols-3 gap-4 mt-5 mb-6">
                                {/* Mic */}
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full rounded-md" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                {/* Speaker */}
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full rounded-md" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                                {/* Camera */}
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full rounded-md" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>

                            {/* Keep Scrolling button */}
                            <div className="mb-8">
                                <Skeleton className="h-11 w-40 rounded-lg" />
                            </div>

                            {/* Before you begin */}
                            <div className="mb-8">
                                <Skeleton className="h-6 w-40 mb-6" />
                                <div className="space-y-4">
                                    {['w-72', 'w-80', 'w-64', 'w-72', 'w-76', 'w-80'].map((w, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="h-7 w-7 shrink-0" />
                                            <Skeleton className={`h-4 ${w}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Start Now button — full width */}
                            <div className="text-center mb-4">
                                <Skeleton className="w-full h-12 rounded-lg" />
                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}
