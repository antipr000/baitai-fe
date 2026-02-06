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
            {/* Header and Controls */}
            <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-6">
                <h2 className="text-2xl font-semibold text-[rgba(56,59,72,0.9)]">All Interviews</h2>

                <div className="flex gap-4 items-center w-fit md:w-auto">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-white text-[rgba(10,13,26,0.5)] font-semibold border-none rounded-md h-10 px-4 min-w-[100px] shadow-sm">
                                <Filter className="h-4 w-4 text-[rgba(125,141,253,1)]" />
                                Status
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

                    <InputGroup className="bg-white w-full md:w-[350px] border-none shadow-sm rounded-md h-10">
                        <InputGroupAddon>
                            <div className="pl-3">
                                <Image src="/candidate/practice-interviews/search.svg" alt="Search" width={20} height={20} className="text-[rgba(125,141,253,0.9)]" />
                            </div>
                        </InputGroupAddon>
                        <InputGroupInput placeholder="Search interviews"
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="font-medium text-[rgba(10,13,26,0.6)] placeholder:text-[rgba(10,13,26,0.3)] border-none focus-visible:ring-0 h-9"
                        />
                    </InputGroup>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-[rgba(104,100,247,0.15)] bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-[rgba(125,141,253,0.08)] border-b border-[rgba(125,141,253,0.2)]">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-14 py-4 px-2 font-semibold text-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
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
                                <TableRow className="border-b border-gray-100 last:border-0 hover:bg-[rgba(248,250,255,1)] transition-colors"
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-5 px-2">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center font-medium text-muted-foreground">
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
