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

async function getAggregates(sessionId: string): Promise<AggregatesResponse | null> {
    return await serverFetch<AggregatesResponse>(`/api/v1/user/interview/results/${sessionId}/aggregates/`)
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ResultPage({ params }: PageProps) {
    const { id } = await params
    const data = await getAggregates(id)
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
        <div className="min-h-screen bg-[rgba(245,247,255,1)]">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-2xl font-semibold bg-[linear-gradient(91.24deg,#3E54FB_-35.23%,#C3CEFF_202.55%)] bg-clip-text text-transparent">
                            Interview Results
                        </h1>
                    </div>
                    <Link href="/candidate/dashboard">
                        <Button variant="outline" className="text-[rgba(104,100,247,1)] font-semibold hover:bg-white border-[rgba(142,158,254,0.6)] hover:border-[rgba(142, 158, 254, 0.6)] hover:opacity-80 hover:text-[rgba(104,100,247,1)]">Back to Dashboard</Button>
                    </Link>
                </div>

                {/* Main Score Card */}
                <Card className="bg-[linear-gradient(95.63deg,rgba(236,252,255,0.1)_-32.56%,rgba(0,215,255,0.1)_114.78%)]!">
                    <CardContent className="p-8 ">
                        <div className="flex items-center justify-around">
                            {/* Left - Score Info */}
                            <div className="space-y-3">
                                <Badge className="bg-[rgba(1,195,43,0.05)] border border-[rgba(1,195,43,0.3)] text-[rgba(1,195,43,0.9)]">
                                    <Image src="/candidate/results/medal.svg" alt="Medal" width={20} height={20} className="mr-1 h-3 w-3" />
                                    {performanceLevel}
                                </Badge>

                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold text-[rgba(64,158,227,1)]">{data.current_score}</span>
                                    <span className="text-2xl font-semibold text-muted-foreground">/{maxScore}</span>
                                </div>

                                <p className="text-sm text-muted-foreground">{data.interview_title}</p>

                                {data.total_attempts > 1 && data.improvement_points !== null && (
                                    <div className="flex items-center  text-sm ">
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
                    <Card className="bg-[linear-gradient(104.37deg,rgba(246,251,255,0.1)_-20.97%,rgba(75,179,255,0.1)_129.56%)] border border-[rgba(75,179,255,0.5)]">
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Image src="/candidate/results/up2.svg" alt="Up" width={20} height={20} className="mr-1 mt-2 h-8 w-8" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Improvement</p>
                                    <p className="text-xl font-bold">
                                        {data.total_attempts > 1 && data.improvement_percent !== null
                                            ? `${data.improvement_percent >= 0 ? '+' : ''}${data.improvement_percent}%`
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Best Score */}
                    <Card className="bg-[linear-gradient(109.41deg,rgba(255,250,242,0.3)_-15.66%,rgba(252,183,50,0.1)_119.55%)] border border-[rgba(252,183,50,0.5)]">
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Image src="/candidate/results/note2.svg" alt="note" width={20} height={20} className="mr-1 mt-2 h-8 w-8" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Best Score</p>
                                    <p className="text-xl font-bold">{data.best_score}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Average */}
                    <Card className="bg-[linear-gradient(109.41deg,rgba(242,255,255,0.15)_-15.66%,rgba(51,204,204,0.15)_119.55%)] border border-[rgba(51,204,204,0.5)]">
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Image src="/candidate/results/graph.svg" alt="graph" width={20} height={20} className="mr-1 mt-2 h-8 w-8" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Average</p>
                                    <p className="text-xl font-bold">{data.average_score}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attempts */}
                    <Card className="bg-[linear-gradient(109.41deg,rgba(244,255,240,0.1)_-15.66%,rgba(106,175,80,0.15)_34.39%)] border border-[rgba(106,175,80,0.5)]">
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Image src="/candidate/results/thunder.svg" alt="attempt" width={20} height={20} className="mr-1 mt-2 h-8 w-8" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Attempts</p>
                                    <p className="text-xl font-bold">{data.total_attempts}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mt-12">
                    {/* Performance Trend */}
                    <Card className="bg-[rgba(196,240,0,0.1)] border border-[rgba(196,240,0,0.05)]">
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
                    <Card className="bg-[rgba(107,124,255,0.05)] border-[rgba(102,120,253,0.1)]">
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
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 p-8 px-10 rounded-3xl bg-[linear-gradient(94.46deg,rgba(119,198,255,0.3)_-27.34%,#F5F7FF_202.83%)]">
                    {skillCards.map((skill, index) => (
                        <Card key={index} className="bg-white border border-[rgba(75,179,255,0.1)]">
                            <CardContent className="p-6 px-12">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-[rgba(10,13,26,0.9)]">{skill.title}</h3>
                                    <span className="text-lg ">
                                        <span className="text-[rgba(45,166,255,0.9)] font-semibold">{skill.score}</span>
                                        <span className="text-[rgba(10,13,26,0.9)] font-semibold">/100</span>
                                    </span>
                                </div>
                                <Progress value={skill.score} indicatorColor="linear-gradient(90.14deg,rgba(45,166,255,0.9) -4.79%,#B9E1FF 161.26%)" className="h-[6px]" />
                                {skill.reason && (
                                    <p className="mt-4 text-sm text-[rgba(10,13,26,0.5)]">
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
                    <Card className="bg-[rgba(5,187,54,0.05)] border-[rgba(25,192,71,0.5)]">
                        <CardContent className="p-8 px-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Image src="/candidate/results/fire.svg" alt="Key Strengths" width={20} height={20} />
                                <h3 className="text-lg font-semibold text-[rgba(3,187,52,0.9)]">Key Strengths</h3>
                            </div>
                            <ul className="space-y-3 text-sm text-[rgba(10,13,26,0.5)] font-medium">
                                {data.key_strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="mt-2 h-1 w-1 rounded-full bg-[rgba(10,13,26,0.7)] shrink-0" />
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Scope of Improvement */}
                    <Card className="bg-[rgba(253,125,160,0.05)] border-[rgba(253,125,160,0.5)]">
                        <CardContent className="p-8 px-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Image src="/candidate/results/improve.svg" alt="Scope of Improvement" className="w-6 h-6" width={24} height={24} />
                                <h3 className="text-lg font-semibold text-[rgba(220,80,120,1)]">Scope of Improvement</h3>
                            </div>
                            <ul className="space-y-3 text-sm text-[rgba(10,13,26,0.5)] font-medium">
                                {data.areas_for_improvement.map((area, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="mt-2 h-1 w-1 rounded-full bg-[rgba(10,13,26,0.7)] shrink-0" />
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
                        <Button className="p-6 w-full h-14 rounded-xl bg-[linear-gradient(92.27deg,rgba(62,84,251,0.82)_18.18%,rgba(143,164,255,0.738)_110.61%)] hover:opacity-80 text-[rgba(248,250,255,1)] font-semibold text-xl">
                            Retake Interview
                        </Button>
                    </Link>
                    <Link href="/candidate/practice-interviews" className="flex-1">
                        <Button variant="outline" className="p-6 w-full h-14 rounded-xl border-2 border-[rgba(58,76,207,0.5)] text-[rgba(58,76,207,1)] hover:bg-[rgba(58,76,207,1)] hover:text-[rgba(248,250,255,1)] hover:border-[rgba(58,76,207,1)]  font-semibold text-xl">
                            Try Another Interview
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
