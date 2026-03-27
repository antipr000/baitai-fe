import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import Image from "next/image"
import { BackButton } from "@/components/ui/back-button"
import { ScoreChart, PerformanceTrendChart, SkillMetricsChart } from "./result-charts"
import { serverFetch } from "@/lib/api/server"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ResultDetailSkeleton } from "@/components/candidate/results/results-skeletons"

// API Response Types
interface PerformanceTrendItem {
    session_id: string
    score: number
    date: string
}

interface CategoryScore {
    category: string
    score: number
    reason: string
}

interface AggregatesResponse {
    session_id: string
    template_id: string
    interview_title: string
    current_score: number
    improvement_percent: number
    improvement_points: number
    best_score: number
    average_score: number
    total_attempts: number
    performance_trend: PerformanceTrendItem[]
    category_scores: CategoryScore[]
    key_strengths: string[]
    areas_for_improvement: string[]
}

function getPerformanceLevel(score: number): string {
    if (score >= 90) return "Excellent Performance"
    if (score >= 80) return "Great Performance"
    if (score >= 70) return "Good Performance"
    if (score >= 60) return "Fair Performance"
    return "Needs Improvement"
}

function formatDateToMonth(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCategoryName(category: string): string {
    return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

// ─── Async content component ─────────────────────────────────────────────────

async function ResultContent({ id }: { id: string }) {
    const data = await serverFetch<AggregatesResponse>(`/api/v1/user/interview/results/${id}/aggregates/`)
    if (!data) {
        notFound()
    }
    const maxScore = 100
    const performanceLevel = getPerformanceLevel(data.current_score)

    // Transform performance trend data for chart
    const performanceTrendData = data.performance_trend.map(item => ({
        month: formatDateToMonth(item.date),
        score: item.score
    }))

    // Transform category scores for skill metrics chart
    const skillMetricsData = data.category_scores.map(cat => ({
        skill: formatCategoryName(cat.category),
        score: cat.score
    }))

    // Transform category scores for skill cards
    const skillCards = data.category_scores.map(cat => ({
        title: formatCategoryName(cat.category),
        score: cat.score,
        reason: cat.reason
    }))

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-2xl font-semibold text-[rgba(58,63,187,1)]">
                            Interview Results
                        </h1>
                    </div>
                    <Link href="/candidate/dashboard">
                        <Button variant="outline" className="text-[rgba(10,13,26,1)] font-medium hover:bg-white border-[rgba(58,63,187,1)] hover:border-[rgba(58,63,187,0.6)] hover:opacity-80 hover:text-[rgba(10,13,26,1)]">Back to Dashboard</Button>
                    </Link>
                </div>

                {/* Main Score Card */}
                <Card className="bg-[rgba(250,251,255,1)] border-[rgba(107,124,255,0.1)]">
                    <CardContent className="p-8 ">
                        <div className="flex items-center justify-around">
                            {/* Left - Score Info */}
                            <div className="space-y-3">
                                <Badge className="bg-[rgba(1,195,43,0.05)] border border-[rgba(1,195,43,0.3)] text-[rgba(1,195,43,0.9)]">
                                    <Image src="/candidate/results/medal.svg" alt="Medal" width={20} height={20} className="mr-1 h-3 w-3" />
                                    {performanceLevel}
                                </Badge>

                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold text-[rgba(58,63,187,1)]">{data.current_score}</span>
                                    <span className="text-2xl font-bold text-[rgba(10,13,26,1)]">/{maxScore}</span>
                                </div>

                                <p className="text-sm text-[rgba(10,13,26,0.7)]">{data.interview_title}</p>

                                {data.total_attempts > 1 && data.improvement_points !== null && (
                                    <div className="flex items-center ">
                                        {data.improvement_points >= 0 ? (
                                            <Image src="/candidate/results/up.svg" alt="Up" width={20} height={20} className="mr-1 mt-2 h-8 w-8" />
                                        ) : (
                                            <TrendingDown className="mr-2 mt-1 h-7 w-7 text-red-500" />
                                        )}
                                        <span className={data.improvement_points >= 0 ? "text-[rgba(1,103,23,1)]" : "text-red-500"}>{data.improvement_points >= 0 ? '+' : ''}{data.improvement_points} points from last attempt</span>
                                    </div>
                                )}

                            </div>

                            {/* Right - Circular Chart */}
                            <ScoreChart score={data.current_score} maxScore={maxScore} />
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards Row */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-25 mx-3">
                    {/* Improvement */}
                    <Card className="border border-[rgba(107,124,255,1)] bg-white">
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Image src="/candidate/results/up2.svg" alt="Up" width={20} height={20} className="mr-1 mt-2 size-5" />
                                <div>
                                    <p className="text-base font-medium text-[rgba(10,13,26,0.9)]">Improvement</p>
                                    <p className="text-2xl text-[rgba(10,13,26,1)] font-bold">
                                        {data.total_attempts > 1 && data.improvement_percent !== null
                                            ? `${data.improvement_percent >= 0 ? '+' : ''}${data.improvement_percent}%`
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Best Score */}
                    <Card className="border border-[rgba(107,124,255,1)] bg-white">
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Image src="/candidate/results/note2.svg" alt="note" width={20} height={20} className="mr-1 mt-2 size-5" />
                                <div>
                                    <p className="text-base font-medium text-[rgba(10,13,26,0.9)]">Best Score</p>
                                    <p className="text-2xl text-[rgba(10,13,26,1)] font-bold">{data.best_score}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Average */}
                    <Card className="border border-[rgba(107,124,255,1)] bg-white">
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Image src="/candidate/results/graph.svg" alt="graph" width={20} height={20} className="mr-1 mt-2 size-5" />
                                <div>
                                    <p className="text-base font-medium text-[rgba(10,13,26,0.9)]">Average</p>
                                    <p className="text-2xl text-[rgba(10,13,26,1)] font-bold">{data.average_score}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attempts */}
                    <Card className="border border-[rgba(107,124,255,1)] bg-white">
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Image src="/candidate/results/thunder.svg" alt="attempt" width={20} height={20} className="mr-1 mt-2 size-5" />
                                <div>
                                    <p className="text-base font-medium text-[rgba(10,13,26,0.9)]">Attempts</p>
                                    <p className="text-2xl text-[rgba(10,13,26,1)] font-bold">{data.total_attempts}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mt-12">
                    {/* Performance Trend */}
                    <Card className="bg-white border border-[rgba(58,63,187,0.05)]">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Image src="/candidate/results/trend.svg" alt="trend" width={20} height={20} className="mr-1 mt-2 h-6 w-6" />
                                Performance Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PerformanceTrendChart data={performanceTrendData} />
                        </CardContent>
                    </Card>

                    {/* Skill Metrics */}
                    <Card className="bg-white border-[rgba(58,63,187,0.05)] shadow-xs">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Image src="/candidate/results/trend.svg" alt="trend" width={20} height={20} className="mr-1 mt-2 h-6 w-6" />
                                Skill Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SkillMetricsChart data={skillMetricsData} />
                        </CardContent>
                    </Card>
                </div>

                {/* Skill Cards Grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 p-8 px-10 rounded-3xl shadow-xs ">
                    {skillCards.map((skill, index) => (
                        <Card key={index} className="bg-white border border-[rgba(58,63,187,0.7)]">
                            <CardContent className="p-6 px-12">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-[rgba(10,13,26,0.9)]">{skill.title}</h3>
                                    <span className="text-lg ">
                                        <span className="text-[rgba(58,63,187,1)] font-semibold">{skill.score}</span>
                                        <span className="text-[rgba(10,13,26,0.9)] font-semibold">/100</span>
                                    </span>
                                </div>
                                <Progress value={skill.score} indicatorColor="rgba(58,63,187,1)" className="h-[5px]" />
                                {skill.reason && (
                                    <p className="mt-4 text-xs text-[rgba(10,13,26,0.7)]">
                                        {skill.reason}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Key Strengths & Scope of Improvement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-18 mx-10 mt-12">
                    {/* Key Strengths */}
                    <Card className="bg-[rgba(246,255,248,1)] border-[rgba(25,192,71,0.1)] shadow-xs">
                        <CardContent className="p-8 px-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Image src="/candidate/results/fire.svg" alt="Key Strengths" width={20} height={20} />
                                <h3 className="text-lg font-semibold text-[rgba(10,13,26,1)]">Key Strengths</h3>
                            </div>
                            <ul className="space-y-3 text-sm text-[rgba(10,13,26,1)] ">
                                {data.key_strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="mt-2 h-1 w-1 rounded-full bg-[rgba(10,13,26,1)] text-sm shrink-0" />
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Scope of Improvement */}
                    <Card className="bg-[rgba(255,248,250,1)] border-[rgba(255,60,73,0.1)] shadow-xs">
                        <CardContent className="p-8 px-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Image src="/candidate/results/improve.svg" alt="Scope of Improvement" className="w-6 h-6" width={24} height={24} />
                                <h3 className="text-lg font-semibold text-[rgba(10,13,26,1)]">Scope of Improvement</h3>
                            </div>
                            <ul className="space-y-3 text-sm text-[rgba(10,13,26,1)] ">
                                {data.areas_for_improvement.map((area, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="mt-2 h-1 w-1 rounded-full bg-[rgba(10,13,26,1)] shrink-0" />
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center my-12  gap-16 pb-8 mx-18">
                    <Link href={`/interview/${data.template_id}`} className="flex-1">
                        <Button className="p-6 w-full h-14 rounded-sm bg-[rgba(58,63,187,1)] text-lg hover:bg-white hover:border hover:border-[rgba(58,63,187,1)] hover:text-[rgba(58,76,207,1)] text-[rgba(248,250,255,1)] font-medium ">
                            Retake Interview
                        </Button>
                    </Link>
                    <Link href="/candidate/practice-interviews" className="flex-1">
                        <Button variant="outline" className="p-6 w-full h-14 rounded-sm border text-lg border-[rgba(58,63,187,1)] text-[rgba(58,76,207,1)] hover:bg-[rgba(58,76,207,1)] hover:text-[rgba(248,250,255,1)]  font-medium ">
                            Try Another Interview
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ResultPage({ params }: PageProps) {
    const { id } = await params

    return (
        <Suspense fallback={<ResultDetailSkeleton />}>
            <ResultContent id={id} />
        </Suspense>
    )
}
