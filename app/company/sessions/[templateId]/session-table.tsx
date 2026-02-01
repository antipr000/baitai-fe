"use client"

import { DataTable } from './data-table'
import { getColumns, Candidate } from './columns'

interface SessionTableProps {
    data: Candidate[]
    templateId: string
}

export function SessionTable({ data, templateId }: SessionTableProps) {
    const columns = getColumns(templateId)
    return <DataTable columns={columns} data={data} />
}
