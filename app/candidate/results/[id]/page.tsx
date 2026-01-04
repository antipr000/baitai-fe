"use client"

import { ArrowLeft, TrendingUp, Trophy, BarChart3, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import Link from "next/link"
import Image from "next/image"
import { BackButton } from "@/components/ui/back-button"

export default function ResultPage() {
    // Sample data - replace with actual data from API
    const score = 85
    const maxScore = 100
    const improvement = 13
    const bestScore = 85
    const average = 78
    const attempts = 5
    const pointsFromLast = 3
    const interviewTitle = "Software Engineer Interview - Practice"
    const performanceLevel = "Excellent Performance"

    const chartData = [{ name: "score", value: score, fill: "url(#scoreGradient)" }]
    const chartConfig = { score: { label: "Score", color: "" } }

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
                        <Button variant="outline" className="text-[rgba(104,100,247,1)] hover:text-[rgba(104,100,247,1)]">Back to Dashboard</Button>
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
                                    <span className="text-5xl font-bold text-[rgba(64,158,227,1)]">{score}</span>
                                    <span className="text-2xl font-semibold text-muted-foreground">/{maxScore}</span>
                                </div>

                                <p className="text-sm text-muted-foreground">{interviewTitle}</p>

                                <div className="flex items-center  text-sm ">
                                    <Image src="/candidate/results/up.svg" alt="Up" width={20} height={20} className="mr-1 mt-2 h-8 w-8" />
                                    <span className="text-[rgba(1,103,23,1)]">+{pointsFromLast} points from last attempt</span>
                                </div>
                            </div>

                            {/* Right - Circular Chart */}
                            <div className="relative">
                                <ChartContainer config={chartConfig} className="h-[180px] w-[180px]">
                                    <RadialBarChart
                                        data={chartData}
                                        startAngle={90}
                                        endAngle={90 + (score / maxScore) * 360}
                                        innerRadius={60}
                                        outerRadius={75}
                                    >
                                        <defs>
                                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="rgba(58, 63, 187, 0.81)" />
                                                <stop offset="100%" stopColor="rgba(0, 215, 255, 0.81)" />
                                            </linearGradient>
                                        </defs>
                                        <PolarAngleAxis type="number" domain={[0, maxScore]} tick={false} />
                                        <RadialBar dataKey="value" background cornerRadius={10} />
                                    </RadialBarChart>
                                </ChartContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-[linear-gradient(124.24deg,rgba(58,63,187,0.81)_-6.24%,rgba(0,215,255,0.81)_174.3%)]">{score}</div>
                                    <div className="text-xs text-muted-foreground">Score</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-25 mx-3">
                    {/* Improvement */}
                    <Card className="bg-[linear-gradient(104.37deg,rgba(246,251,255,0.1)_-20.97%,rgba(75,179,255,0.1)_129.56%)] border border-[rgba(75,179,255,0.5)]">
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Image src="/candidate/results/up2.svg" alt="Up" width={20} height={20} className="mr-1 mt-2 h-8 w-8" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Improvement</p>
                                    <p className="text-xl font-bold">+{improvement}%</p>
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
                                    <p className="text-xl font-bold">{bestScore}%</p>
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
                                    <p className="text-xl font-bold">{average}%</p>
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
                                    <p className="text-xl font-bold">{attempts}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
