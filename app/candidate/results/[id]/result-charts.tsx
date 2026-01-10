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
    return (
        <ChartContainer config={{ score: { label: "Score", color: "#3B82F6" } }} className="h-[200px] w-full">
            <LineChart data={data} margin={{ left: 10, right: 10 }}>
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(107,124,255,1)" />
                        <stop offset="100%" stopColor="rgba(98,117,252,1)" />
                    </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} padding={{ left: 20, right: 20 }} />
                <YAxis hide domain={[50, 100]} />
                <ChartTooltip
                    content={<ChartTooltipContent className="" />}
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
    )
}

interface SkillMetricsChartProps {
    data: { skill: string; score: number }[]
}

export function SkillMetricsChart({ data }: SkillMetricsChartProps) {
    return (
        <ChartContainer
            config={{
                Technical: { label: "Technical", color: "#818CF8" },
                "Problem-Solving": { label: "Problem-Solving", color: "#86EFAC" },
                Communication: { label: "Communication", color: "#F472B6" },
                "Cultural Fit": { label: "Cultural Fit", color: "#FDBA74" },
            }}
            className="h-[180px] w-full"
        >
            <BarChart data={data} barSize={16}>
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
                    content={<ChartTooltipContent className="" />}
                />
                <Bar dataKey="score" radius={[20, 20, 20, 20]} background={{ fill: "#FFFFFF", radius: 20 }}>
                    {data.map((entry, index) => {
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
    )
}
