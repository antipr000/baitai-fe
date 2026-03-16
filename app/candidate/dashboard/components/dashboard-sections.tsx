import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function formatDueDate(dueDate: string): string {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
}

function formatDateAgo(dateString: string): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
}

function getDifficultyColor(difficulty: string): string {
    const d = difficulty?.toLowerCase()
    if (d === 'easy') return 'border-[rgba(3,231,41,1)] text-[rgba(3,231,41,1)]'
    if (d === 'medium') return 'border-[rgba(231,90,3,1)] text-[rgba(231,90,3,1)]'
    return 'border-[rgba(255,35,35,1)] text-[rgba(255,35,35,1)]'
}

export function InterviewInvitesCard({ items }: { items: any[] }) {
    return (
        <Card className="border-[rgba(212,217,255,1)] bg-[rgba(245,247,255,1)] shadow-sm flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="font-semibold text-[rgba(10,13,26,1)] flex items-center gap-2">
                    <Image src="/candidate/dashboard/doc.svg" alt="doc" width={18} height={18} />
                    Interview Invites
                </CardTitle>
                <Link href="/candidate/company-interviews">
                    <Button variant="outline" className="border-[rgba(58,63,187,1)] text-[rgba(10,13,26,1)] h-8 px-4 font-semibold">View all</Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <p className="text-[rgba(10,13,26,0.7)] text-sm">No pending invites.</p>
                        <Link href="/candidate/practice-interviews">
                            <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold text-xs rounded-sm px-8">
                                Try Practice Interviews
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 px-6 ">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-4 border border-[rgba(107,124,255,1)] rounded-lg">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-medium text-[rgba(10,13,26,1)] leading-snug">{item.company_name}</h4>
                                        <span className="px-3 py-0.5 w-max rounded-full border border-[rgba(255,20,20,1)] text-[rgba(255,20,20,1)] text-[11px] font-medium ">
                                            {formatDueDate(item.end_date)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[rgba(10,13,26,0.7)] mt-1.5">{item.role || item.title}</p>
                                </div>
                                <Link href={`/interview/${item.template_id}`}>
                                    <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold text-xs rounded-sm px-8">
                                        Start Interview
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const DASHBOARD_COMPANIES = [
    { name: 'Google', logo: '/candidate/company-practice/google.svg' },
    { name: 'Meta', logo: '/candidate/company-practice/meta.svg' },
    { name: 'Amazon', logo: '/candidate/company-practice/amazon.svg' },
    { name: 'Microsoft', logo: '/candidate/company-practice/microsoft.svg' },
    { name: 'Apple', logo: '/candidate/company-practice/apple.svg' },
]

export function CompanyPracticeCard({ items }: { items: { companyName: string, count: number }[] }) {
    const displayItems = items.map((item) => {
        const logo = DASHBOARD_COMPANIES.find(c => c.name.toLowerCase() === item.companyName.toLowerCase())?.logo || '/candidate/dashboard/company.svg'
        return {
            companyName: item.companyName,
            logo,
            count: item.count
        }
    })

    return (
        <Card className="border-[rgba(212,217,255,1)] bg-[rgba(245,247,255,1)] shadow-sm flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between   px-6 ">
                <CardTitle className=" font-semibold text-[rgba(10,13,26,1)] flex items-center gap-2">
                    <Image src="/candidate/dashboard/company.svg" alt="company" width={18} height={18} />
                    Company-specific Practice Interviews
                </CardTitle>
                <Link href="/candidate/company-practice">
                    <Button variant="outline" className="border-[rgba(58,63,187,1)] text-[rgba(10,13,26,1)] h-8 px-4 font-semibold">View all</Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1 ">
                {displayItems.length === 0 ? (
                    <div className="flex items-center justify-center p-8 text-[rgba(10,13,26,0.7)] text-sm">No company-specific practice interviews.</div>
                ) : (
                    <div className="flex flex-col gap-3 px-6 pb-6">
                        {displayItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-4 border border-[rgba(107,124,255,1)] rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-5 h-5 shrink-0">
                                        <Image src={item.logo} alt={item.companyName} fill className="object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-[rgba(10,13,26,1)] leading-snug mb-1 capitalize">{item.companyName}</h4>
                                        <div className="flex items-center gap-2 text-sm text-[rgba(10,13,26,0.7)]">
                                            <span className="flex items-center gap-1 text-xs">
                                                {item.count} {item.count === 1 ? 'Interview' : 'Interviews'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Link href={`/candidate/company-practice?company=${encodeURIComponent(item.companyName)}`}>
                                    <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold text-xs rounded-sm px-8">
                                        View List
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function PracticeInterviewsCard({ items }: { items: any[] }) {
    return (
        <Card className="border-[rgba(212,217,255,1)] bg-[rgba(245,247,255,1)] shadow-sm flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="font-semibold text-[rgba(10,13,26,1)] flex items-center gap-2">
                    <Image src="/candidate/dashboard/target.svg" alt="target" width={18} height={18} />
                    Practice Interviews
                </CardTitle>
                <Link href="/candidate/practice-interviews">
                    <Button variant="outline" className="border-[rgba(58,63,187,1)] text-[rgba(10,13,26,1)] h-8 px-4 font-semibold">View all</Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1">
                {items.length === 0 ? (
                    <div className="flex items-center justify-center p-8 text-[rgba(10,13,26,0.7)] text-sm">No practice interviews.</div>
                ) : (
                    <div className="flex flex-col gap-3 px-6 pb-6">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-4 border border-[rgba(107,124,255,1)] rounded-lg">
                                <div>
                                    <h4 className="font-medium text-[rgba(10,13,26,1)] leading-snug mb-1">{item.title}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-medium capitalize ${getDifficultyColor(item.difficulty_level)}`}>
                                            {item.difficulty_level}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-[rgba(10,13,26,0.7)] shrink-0">
                                            <Image src="/candidate/dashboard/time.svg" alt="time" width={14} height={14} />
                                            {item.duration || 30} min
                                        </div>
                                    </div>
                                </div>
                                <Link href={`/interview/${item.id}`}>
                                    <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold text-xs rounded-sm px-8">
                                        Start Interview
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function LatestResultsCard({ items }: { items: any[] }) {
    return (
        <Card className="border-[rgba(212,217,255,1)] bg-[rgba(245,247,255,1)] shadow-sm flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between px-6">
                <CardTitle className="font-semibold text-[rgba(10,13,26,1)] flex items-center gap-2">
                    <Image src="/candidate/dashboard/score.svg" alt="score" width={18} height={18} />
                    Latest Results
                </CardTitle>
                <Link href="/candidate/results">
                    <Button variant="outline" className="border-[rgba(58,63,187,1)] text-[rgba(10,13,26,1)] h-8 px-4 font-semibold">View all</Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <p className="text-[rgba(10,13,26,0.7)] text-sm">No recent results.</p>
                        <Link href="/candidate/practice-interviews">
                            <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold text-xs rounded-sm px-8">
                                Try Practice Interviews
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 px-6 pb-6">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-4 border border-[rgba(107,124,255,1)] rounded-lg">
                                <div>
                                    <h4 className="font-medium text-[rgba(10,13,26,1)] mb-1">{item.template_title || item.title}</h4>
                                    <p className="text-sm text-[rgba(10,13,26,0.7)]">{formatDateAgo(item.date || item.ended_at || item.completed_at || item.created_at)}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[rgba(58,63,187,1)] font-medium text-lg">{item.score ?? '0'}%</span>
                                        <span className="text-[rgba(10,13,26,0.7)] text-xs">Score</span>
                                    </div>
                                    <Link href={`/results/${item.session_id}`}>
                                        <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold text-xs rounded-sm px-8">
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
