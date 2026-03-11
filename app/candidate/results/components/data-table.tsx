"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
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
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Image src="/candidate/practice-inteviews/search.svg" alt="Search" width={20} height={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by job role or company"
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-[rgba(58,63,187,0.3)] rounded-sm outline-none placeholder:text-[rgba(10,13,26,0.5)] text-sm font-medium focus:border-[rgba(58,63,187,1)] transition-colors"
                    />
                </div>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-[46px] px-6 border border-[rgba(138,152,253,0.1)] text-[rgba(10,13,26,0.7)] hover:bg-[rgba(245,247,255,1)] hover:text-[rgba(10,13,26,1)] rounded-sm font-medium text-sm flex items-center bg-white ">
                            <Image src="/candidate/practice-inteviews/filter.svg" alt="Filter" width={16} height={16} className="mr-2 opacity-70" />
                            Filter
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuItem onClick={() => table.getColumn("interviewType")?.setFilterValue("")}>
                            All
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => table.getColumn("interviewType")?.setFilterValue("Practice")}>
                            Practice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => table.getColumn("interviewType")?.setFilterValue("Interview")}>
                            Interview
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="rounded-lg overflow-hidden bg-[rgba(245,247,255,1)]">
                <Table className="bg-white border-collapse">
                    <TableHeader className="bg-[rgba(245,247,255,1)] opacity-90 border-b border-[rgba(245,247,255,1)]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-14 px-4 align-middle">
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
                    <TableBody className="bg-white">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    className="border-b border-[rgba(245,247,255,1)] hover:bg-[rgba(245,247,255,0.4)] transition-colors"
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-5 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="bg-white">
                                <TableCell colSpan={columns.length} className="h-24 text-center font-medium text-[rgba(10,13,26,0.6)]">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
