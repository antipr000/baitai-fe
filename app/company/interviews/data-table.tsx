"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    ColumnFiltersState,
    SortingState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"
import { useRouter } from "next/navigation"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const router = useRouter()
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: "includesString",
        state: {
            globalFilter,
            columnFilters,
            sorting,
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
    })

    return (
        <div className="space-y-6">
            {/* Header and Controls */}
            <div className="flex flex-col md:flex-row  items-start md:items-center gap-6">
                <h2 className="text-2xl font-semibold text-[rgba(10,13,26,1)]">All Interviews</h2>

                <div className="flex gap-4 items-center w-full md:w-auto">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-white text-[rgba(10,13,26,0.6)] font-medium border border-[rgba(229,231,235,1)] rounded-md h-10 px-4 min-w-[110px] shadow-sm hover:bg-gray-50">
                                <Image src="/company/interviews/filter.svg" alt="Filter" width={15} height={15} />
                                <span>Status</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("")}>
                                All
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Active")}>
                                Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Archived")}>
                                Archived
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Draft")}>
                                Draft
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <InputGroup className="bg-white w-full md:w-[320px] border border-[rgba(229,231,235,1)] shadow-sm rounded-md h-10">
                        <InputGroupAddon>
                            <div className="pl-3 flex items-center">
                                <Image src="/company/interviews/search.svg" alt="Search" width={15} height={15} />
                            </div>
                        </InputGroupAddon>
                        <InputGroupInput placeholder="Search interviews"
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="font-medium text-[rgba(10,13,26,0.8)] placeholder:text-[rgba(10,13,26,0.4)] border-none focus-visible:ring-0 h-9"
                        />
                    </InputGroup>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[rgba(229,231,235,1)] bg-white shadow-sm transition-all duration-200">
                <Table>
                    <TableHeader className="bg-[rgba(249,250,251,1)]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-[rgba(229,231,235,1)]">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-12 py-3 px-4 first:pl-6 last:pr-6">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow className="border-b border-[rgba(243,244,246,1)] last:border-0 hover:bg-[rgba(249,250,251,0.5)] transition-colors cursor-pointer group"
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => router.push(`/company/sessions/${(row.original as TData & { template_id: string }).template_id}`)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4 px-4 first:pl-6 last:pr-6">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center font-medium text-[rgba(107,114,128,1)]">
                                    No interviews found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
