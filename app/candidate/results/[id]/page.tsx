"use client"

import { TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { RadialBarChart, RadialBar, PolarAngleAxis, LineChart, Line, XAxis, YAxis, BarChart, Bar, CartesianGrid, Cell } from "recharts"
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

    // Performance Trend Data
    const performanceTrendData = [
        { month: "Jan", score: 65 },
        { month: "Feb", score: 68 },
        { month: "Mar", score: 75 },
        { month: "Apr", score: 82 },
        { month: "May", score: 78 },
        { month: "Jun", score: 85 },
    ]

    // Skill Metrics Data
    const skillMetricsData = [
        { skill: "Technical", score: 76 },
        { skill: "Problem-Solving", score: 85 },
        { skill: "Communication", score: 90 },
        { skill: "Cultural Fit", score: 79 },
    ]

    // Skill Cards Data
    const skillCards = [
        { title: "Technical Skills", score: 76, description: "Excellent problem-solving approach and clean code", },
        { title: "Communication", score: 90, description: "Clear explanations, could be more concise", },
        { title: "Problem Solving", score: 85, description: "Strong analytical thinking and edge case handling", },
        { title: "Cultural Fit", score: 79, description: "Good alignment with team values", },
    ]

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
                                        {/* <RadialBar dataKey="value" background cornerRadius={10} /> */}
                                        <RadialBar dataKey="value" cornerRadius={10} />

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
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-25 mx-3">
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

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
                    {/* Performance Trend */}
                    <Card className="bg-[rgba(196,240,0,0.1)] border border-[rgba(196,240,0,0.05)]">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Image src="/candidate/results/trend.svg" alt="trend" width={20} height={20} className="mr-1 mt-2 h-6 w-6" />
                                Performance Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{ score: { label: "Score", color: "#3B82F6" } }} className="h-[200px] w-full">
                                <LineChart data={performanceTrendData}>
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="rgba(107,124,255,1)" />
                                            <stop offset="100%" stopColor="rgba(98,117,252,1)" />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "" }} />
                                    <YAxis hide domain={[50, 100]} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent className="bg-white! backdrop-blur-sm! !border-gray-200" />}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="url(#lineGradient)"
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                </LineChart>
                            </ChartContainer>
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
                            <ChartContainer
                                config={{
                                    Technical: { label: "Technical", color: "#818CF8" },
                                    "Problem-Solving": { label: "Problem-Solving", color: "#86EFAC" },
                                    Communication: { label: "Communication", color: "#F472B6" },
                                    "Cultural Fit": { label: "Cultural Fit", color: "#FDBA74" },
                                }}
                                className="h-[180px] w-full"
                            >
                                <BarChart data={skillMetricsData} barSize={16}>
                                    <defs>
                                        <linearGradient id="technicalGradient" x1="0" y1="1" x2="0" y2="0">
                                            <stop offset="0%" stopColor="#818CF8" />
                                            <stop offset="100%" stopColor="#C7D2FE" />
                                        </linearGradient>
                                        <linearGradient id="problemGradient" x1="0" y1="1" x2="0" y2="0">
                                            <stop offset="0%" stopColor="#86EFAC" />
                                            <stop offset="100%" stopColor="#D1FAE5" />
                                        </linearGradient>
                                        <linearGradient id="communicationGradient" x1="0" y1="1" x2="0" y2="0">
                                            <stop offset="0%" stopColor="#F472B6" />
                                            <stop offset="100%" stopColor="#FBCFE8" />
                                        </linearGradient>
                                        <linearGradient id="culturalGradient" x1="0" y1="1" x2="0" y2="0">
                                            <stop offset="0%" stopColor="#FDBA74" />
                                            <stop offset="100%" stopColor="#FED7AA" />
                                        </linearGradient>
                                    </defs>
                                    <YAxis hide domain={[0, 100]} />
                                    <XAxis dataKey="skill" hide />
                                    <ChartTooltip
                                        content={<ChartTooltipContent className="!bg-white !backdrop-blur-sm !border-gray-200" />}
                                    />
                                    <Bar dataKey="score" radius={[20, 20, 20, 20]} background={{ fill: "#FFFFFF", radius: 20 }}>
                                        {skillMetricsData.map((entry, index) => {
                                            const gradients = ["url(#technicalGradient)", "url(#problemGradient)", "url(#communicationGradient)", "url(#culturalGradient)"]
                                            return <Cell key={`cell-${index}`} fill={gradients[index]} />
                                        })}
                                    </Bar>
                                    <ChartLegend
                                        payload={[
                                            { value: "Technical", type: "rect", color: "#818CF8" },
                                            { value: "Problem-Solving", type: "rect", color: "#86EFAC" },
                                            { value: "Communication", type: "rect", color: "#F472B6" },
                                            { value: "Cultural Fit", type: "rect", color: "#FDBA74" },
                                        ]}
                                        content={<ChartLegendContent />}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Skill Cards Grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 p-8 px-10 rounded-3xl bg-[linear-gradient(94.46deg,rgba(119,198,255,0.3)_-27.34%,#F5F7FF_202.83%)]">
                    {skillCards.map((skill, index) => (
                        <Card key={index} className="bg-white border border-[rgba(75,179,255,0.1)]">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-[rgba(10,13,26,0.9)]">{skill.title}</h3>
                                    <span className="text-lg ">
                                        <span className="text-[rgba(45,166,255,0.9)] font-semibold">{skill.score}</span>
                                        <span className="text-[rgba(10,13,26,0.9)] font-semibold">/100</span>
                                    </span>
                                </div>
                                <Progress value={skill.score} indicatorColor="linear-gradient(90.14deg,rgba(45,166,255,0.9) -4.79%,#B9E1FF 161.26%)" className="h-2 mb-3" />
                                <p className="text-sm text-[rgba(10,13,26,0.46)]">{skill.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Key Strengths & Scope of Improvement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-15 mx-5 mt-12">
                    {/* Key Strengths */}
                    <Card className="bg-[rgba(5,187,54,0.05)] border-[rgba(25,192,71,0.5)]">
                        <CardContent className="p-8 px-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Image src="/candidate/results/fire.svg" alt="Key Strengths" width={20} height={20} />
                                <h3 className="text-lg font-semibold text-[rgba(3,187,52,0.9)]">Key Strengths</h3>
                            </div>
                            <ul className="space-y-3 text-sm text-[rgba(10,13,26,0.5)] font-medium">
                                <li className="flex items-start gap-2">
                                    <span className="mt-2 h-1 w-1 rounded-full bg-[rgba(10,13,26,0.7)] shrink-0" />
                                    Strong technical knowledge and problem-solving skills
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-2 h-1 w-1 rounded-full bg-[rgba(10,13,26,0.7)] shrink-0" />
                                    Good code quality and best practices
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-2 h-1 w-1 rounded-full bg-[rgba(10,13,26,0.7)] shrink-0" />
                                    Clear thinking process and logical approach
                                </li>
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
                                <li className="flex items-start gap-2">
                                    <span className="mt-2 h-1 w-1 rounded-full bg-[rgba(10,13,26,0.7)] shrink-0" />
                                    Consider edge cases earlier in the problem-solving process
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-2 h-1 w-1 rounded-full bg-[rgba(10,13,26,0.7)] shrink-0" />
                                    Be more concise in explanations
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-2 h-1 w-1 rounded-full bg-[rgba(10,13,26,0.7)] shrink-0" />
                                    Practice system design fundamentals
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center my-12  gap-6 pb-8 mx-18">
                    <Button className="p-6 flex-1  h-14 rounded-xl bg-[linear-gradient(92.27deg,rgba(62,84,251,0.82)_18.18%,rgba(143,164,255,0.738)_110.61%)] hover:opacity-80 text-[rgba(248,250,255,1)] font-semibold text-xl">
                        Retake Interview
                    </Button>
                    <Button variant="outline" className="p-6 flex-1 h-14 rounded-xl border-2 border-[rgba(58,76,207,0.5)] text-[rgba(58,76,207,1)] hover:bg-[rgba(58,76,207,1)] hover:text-[rgba(248,250,255,1)] hover:border-[rgba(58,76,207,1)]  font-semibold text-xl">
                        Try Another Interview
                    </Button>
                </div>
            </div>
        </div>
    )
}
