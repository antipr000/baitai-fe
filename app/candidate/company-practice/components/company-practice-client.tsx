"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DataTable } from './data-table'
import { columns, PracticeInterview } from './columns'

import { type MetadataOption } from '@/lib/api/server'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Company {
    name: string
    logo: string
}

interface CompanyPracticeClientProps {
    companies: Company[]
    interviews: PracticeInterview[]
    roles: string[]
    experienceLevelsMetadata: MetadataOption[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CompanyPracticeClient({ companies, interviews, roles, experienceLevelsMetadata }: CompanyPracticeClientProps) {
    const searchParams = useSearchParams()
    const initialCompany = searchParams.get('company') || ""  // filter handles both capitalized and non capitalized cases
    const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany.toLowerCase())

    useEffect(() => {
        setSelectedCompany(initialCompany.toLowerCase())
    }, [initialCompany])

    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [showRightArrow, setShowRightArrow] = useState(false)

    const checkScroll = () => {
        const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]')
        if (viewport) {
            const { scrollLeft, scrollWidth, clientWidth } = viewport as HTMLElement
            // Show arrow if we haven't reached the end (with a small buffer)
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10)
        }
    }

    useEffect(() => {
        const viewport = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]')
        if (viewport) {
            viewport.addEventListener('scroll', checkScroll)
            // Initial check and also check on window resize
            checkScroll()
            window.addEventListener('resize', checkScroll)
            
            
            return () => {
                viewport.removeEventListener('scroll', checkScroll)
                window.removeEventListener('resize', checkScroll)
            }
        }
    }, [companies])

    return (
        <DataTable 
            columns={columns} 
            data={interviews} 
            hideHeaders 
            companyFilter={selectedCompany} 
            roles={roles}
            experienceLevels={experienceLevelsMetadata}
        >
            <div className="relative group/scroll">
                <ScrollArea ref={scrollRef} className="w-full whitespace-nowrap">
                    <ToggleGroup
                        type="single"
                        value={selectedCompany}
                        onValueChange={(val) => setSelectedCompany(val)}
                        className="flex gap-4 p-1 pb-3"
                        spacing={12}
                    >
                        <ToggleGroupItem
                            value=""
                            className="h-10 px-12 flex items-center justify-center gap-3 border border-[rgba(58,63,187,0.1)] rounded-full bg-white hover:bg-[rgba(245,247,255,1)] data-[state=on]:border-[rgba(58,63,187,1)] data-[state=on]:bg-[rgba(245,247,255,1)] transition-all shrink-0"
                        >
                            <div className="text-sm font-semibold">All</div>
                        </ToggleGroupItem>
                        {companies.map((company) => (
                            <ToggleGroupItem
                                key={company.name}
                                value={company.name.toLowerCase()}
                                className="h-10 px-6 flex items-center justify-center gap-3 border border-[rgba(58,63,187,0.1)] rounded-full bg-white hover:bg-[rgba(245,247,255,1)] data-[state=on]:border-[rgba(58,63,187,1)] data-[state=on]:bg-[rgba(245,247,255,1)] transition-all shrink-0"
                            >
                                <div className="relative w-5 h-5">
                                    <Image src={company.logo} alt={company.name} fill className="object-contain" />
                                </div>
                                <div className="text-sm font-semibold">{company.name}</div>
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
                
                {/* Right Gradient & Arrow */}
                {showRightArrow && (
                    <div className="absolute right-0 top-0 bottom-3 w-24 flex items-center justify-end pr-2 bg-linear-to-l from-white via-white/80 to-transparent pointer-events-none transition-opacity duration-300">
                        <div className="bg-white rounded-full p-1.5 shadow-md border border-[rgba(58,63,187,0.1)]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[rgba(58,63,187,1)]">
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </DataTable>
    )
}
