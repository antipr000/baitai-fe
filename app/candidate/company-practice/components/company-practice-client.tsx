"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DataTable } from './data-table'
import { columns, PracticeInterview } from './columns'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Company {
    name: string
    logo: string
}

interface CompanyPracticeClientProps {
    companies: Company[]
    interviews: PracticeInterview[]
    roles: string[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CompanyPracticeClient({ companies, interviews, roles }: CompanyPracticeClientProps) {
    const [selectedCompany, setSelectedCompany] = useState<string>("")

    return (
        <DataTable columns={columns} data={interviews} hideHeaders companyFilter={selectedCompany} roles={roles}>
            <ScrollArea className="w-full whitespace-nowrap">
                <ToggleGroup
                    type="single"
                    value={selectedCompany}
                    onValueChange={(val) => setSelectedCompany(val)}
                    className="flex gap-4 p-1"
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
                            value={company.name}
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
        </DataTable>
    )
}
