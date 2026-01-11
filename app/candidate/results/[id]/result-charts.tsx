"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { RadialBarChart, RadialBar, PolarAngleAxis, LineChart, Line, XAxis, YAxis, BarChart, Bar, Cell } from "recharts"

interface ScoreChartProps {
    score: number
    maxScore: number
}

export function ScoreChart({ score, maxScore }: ScoreChartProps) {
    const chartData = [{ name: "score", value: score, fill: "url(#scoreGradient)" }]
    const chartConfig = { score: { label: "Score", color: "" } }

    return (
        <div className="relative">
            <ChartContainer config={chartConfig} className="h-[180px] w-[180px]">
                <RadialBarChart
                    data={chartData}
                    startAngle={90}
                    endAngle={-270}
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
                    <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#ffffff" }} />
                </RadialBarChart>
            </ChartContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-[linear-gradient(124.24deg,rgba(58,63,187,0.81)_-6.24%,rgba(0,215,255,0.81)_174.3%)]">{score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
            </div>
        </div>
    )
}

interface PerformanceTrendChartProps {
    data: { month: string; score: number }[]
}

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
    // Added a starting point at 0 to show growth
    const chartData = [{ month: "Start", score: 0 }, ...data]

    return (
        <ChartContainer config={{ score: { label: "Score", color: "#3B82F6" } }} className="h-[200px] w-full">
            <LineChart data={chartData} margin={{ left: 10, right: 10 }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(107,124,255,1)" />
                        <stop offset="100%" stopColor="rgba(98,117,252,1)" />
                    </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} padding={{ left: 20, right: 20 }} />
                <YAxis hide domain={[0, 100]} />
                <ChartTooltip
                    content={<ChartTooltipContent className="" />}
                />
                <Line
                    type="monotone"
                    dataKey="score"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={true}
                />
            </LineChart>
        </ChartContainer>
    )
}

interface SkillMetricsChartProps {
    data: { skill: string; score: number }[]
}

export function SkillMetricsChart({ data }: SkillMetricsChartProps) {
    // Define colors for each bar
    const colors = ["#818CF8", "#86EFAC", "#F472B6", "#FDBA74"]
    const gradientColors = [
        { start: "#818CF8", end: "#C7D2FE" },
        { start: "#86EFAC", end: "#D1FAE5" },
        { start: "#F472B6", end: "#FBCFE8" },
        { start: "#FDBA74", end: "#FED7AA" },
    ]

    // Build dynamic config from data
    const config = data.reduce((acc, item, index) => {
        acc[item.skill] = { label: item.skill, color: colors[index % colors.length] }
        return acc
    }, {} as Record<string, { label: string; color: string }>)

    // Build dynamic legend payload from data
    const legendPayload = data.map((item, index) => ({
        value: item.skill,
        type: "rect" as const,
        color: colors[index % colors.length],
    }))

    return (
        <ChartContainer
            config={config}
            className="h-[180px] w-full"
        >
            <BarChart data={data} barSize={16}>
                <defs>
                    {data.map((_, index) => (
                        <linearGradient key={`gradient-${index}`} id={`barGradient${index}`} x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor={gradientColors[index % gradientColors.length].start} />
                            <stop offset="100%" stopColor={gradientColors[index % gradientColors.length].end} />
                        </linearGradient>
                    ))}
                </defs>
                <YAxis hide domain={[0, 100]} />
                <XAxis dataKey="skill" hide />
                <ChartTooltip
                    content={<ChartTooltipContent className="" />}
                />
                <Bar dataKey="score" radius={[20, 20, 20, 20]} background={{ fill: "#FFFFFF", radius: 20 }}>
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#barGradient${index})`} />
                    ))}
                </Bar>
                <ChartLegend
                    payload={legendPayload}
                    content={<ChartLegendContent />}
                />
            </BarChart>
        </ChartContainer>
    )
}
