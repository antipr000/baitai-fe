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
        <div className="space-y-4">
            {/* Header and Controls */}
            <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-4">
                <h2 className="text-2xl font-semibold text-[rgba(56,59,72,0.9)]">All Candidates</h2>

                <div className="flex gap-4 items-center w-fit md:w-auto">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-white text-[rgba(75,85,99,1)] border-gray-200 hover:bg-gray-50 h-10 px-4 min-w-[100px]">
                                <Filter className="h-4 w-4 text-[rgba(138,152,253,1)]" />
                                Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("")}>
                                All
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Completed")}>
                                Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("In Progress")}>
                                In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue("Pending")}>
                                Pending
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <InputGroup className="bg-white w-full md:w-[300px] border border-gray-200 rounded-md h-10">
                        <InputGroupAddon>
                            <div className="pl-1">
                                <Image src="/candidate/practice-interviews/search.svg" alt="Search" width={18} height={18} className="text-[rgba(125,141,253,0.9)]" />
                            </div>
                        </InputGroupAddon>
                        <InputGroupInput placeholder="Search..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="font-medium placeholder:text-muted-foreground/50 border-none focus-visible:ring-0 h-9"
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
                                        <TableHead key={header.id} className="h-14 px-6 font-semibold text-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
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
                                        <TableCell key={cell.id} className="py-5 px-6">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center font-medium text-muted-foreground">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
