"use client"

import { DataTable } from './data-table'
import { columns, Candidate } from './columns'

interface SessionTableProps {
    data: Candidate[]
}

export function SessionTable({ data }: SessionTableProps) {
    return <DataTable columns={columns} data={data} />
}
