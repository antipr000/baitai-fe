"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    ColumnFiltersState,
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
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import { type MetadataOption } from "@/lib/api/server"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    children?: React.ReactNode
    hideHeaders?: boolean
    companyFilter?: string
    roles?: string[]
    experienceLevels?: MetadataOption[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
    children,
    hideHeaders,
    companyFilter = "",
    roles = [],
    experienceLevels = [],
}: DataTableProps<TData, TValue>) {
    const [globalFilter, setGlobalFilter] = useState("")
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    // Sync company filter prop into column filters
    useEffect(() => {
        setColumnFilters(prev => {
            const withoutCompany = prev.filter(f => f.id !== "companyName")
            if (!companyFilter) return withoutCompany
            return [...withoutCompany, { id: "companyName", value: companyFilter }]
        })
    }, [companyFilter])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            columnVisibility: { companyName: false, difficulty: false, duration: false, role: false, experienceLevel: false },
        },
        globalFilterFn: "includesString",
        state: {
            globalFilter,
            columnFilters,
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
    })

    const isFiltered = table.getState().columnFilters.some(f => f.id !== "companyName")
    const roleFilter = table.getColumn("role")?.getFilterValue() as string | undefined;
    const levelFilter = table.getColumn("experienceLevel")?.getFilterValue() as string | undefined;
    const diffFilter = table.getColumn("difficulty")?.getFilterValue() as string | undefined;

    return (
        <div className="space-y-4">
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Image src="/candidate/practice-inteviews/search.svg" alt="Search" width={20} height={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
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
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Role</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-56 max-h-[300px] overflow-y-auto">
                                <DropdownMenuCheckboxItem
                                    checked={!roleFilter}
                                    onCheckedChange={() => table.getColumn("role")?.setFilterValue(undefined)}
                                >
                                    All Roles
                                </DropdownMenuCheckboxItem>
                                {roles?.map(role => (
                                    <DropdownMenuCheckboxItem
                                        key={role}
                                        checked={roleFilter === role}
                                        onCheckedChange={() => table.getColumn("role")?.setFilterValue(role)}
                                    >
                                        {role}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Experience Level</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-56">
                                <DropdownMenuCheckboxItem
                                    checked={!levelFilter}
                                    onCheckedChange={() => table.getColumn("experienceLevel")?.setFilterValue(undefined)}
                                >
                                    All Experience Levels
                                </DropdownMenuCheckboxItem>
                                {experienceLevels?.map(level => (
                                    <DropdownMenuCheckboxItem
                                        key={level.value}
                                        checked={levelFilter === level.value}
                                        onCheckedChange={() => table.getColumn("experienceLevel")?.setFilterValue(level.value)}
                                    >
                                        {level.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Difficulty</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-40">
                                <DropdownMenuCheckboxItem
                                    checked={!diffFilter}
                                    onCheckedChange={() => table.getColumn("difficulty")?.setFilterValue(undefined)}
                                >
                                    All Difficulties
                                </DropdownMenuCheckboxItem>
                                {["Easy", "Medium", "Hard"].map((diff) => (
                                    <DropdownMenuCheckboxItem
                                        key={diff}
                                        checked={diffFilter === diff}
                                        onCheckedChange={() => table.getColumn("difficulty")?.setFilterValue(diff)}
                                    >
                                        {diff}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {isFiltered && (
                <div className="flex gap-2 min-h-8 items-center">
                    {table.getState().columnFilters
                        .filter(f => f.id !== "companyName")
                        .map((filter) => (
                            <Badge 
                                key={filter.id} 
                                variant="secondary" 
                                className="pl-3 py-1 font-normal bg-white border border-[rgba(58,63,187,0.2)] text-[rgba(17,24,39,0.8)] hover:bg-[rgba(58,63,187,0.05)] rounded-full"
                            >
                                <span className="capitalize">{filter.id}</span>: {filter.value as string}
                                <button 
                                    onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)} 
                                    className="ml-2 bg-transparent hover:bg-[rgba(0,0,0,0.1)] rounded-full p-0.5 transition-colors"
                                >
                                    <Image src="/cross.svg" alt="Cancel" width={10} height={10} className="opacity-60" />
                                </button>
                            </Badge>
                        ))}
                    
                    <Button
                        variant="ghost"
                        onClick={() => {
                            // Dynamically clear all filters EXCEPT companyName
                            table.setColumnFilters(prev => prev.filter(f => f.id === "companyName"))
                        }}
                        className="h-8 px-2 lg:px-3 text-xs text-[rgba(10,13,26,0.6)] hover:text-[rgba(58,63,187,1)] font-medium"
                    >
                        Reset
                        <span className="ml-2">×</span>
                    </Button>
                </div>
            )}

            {children}

            <div className="rounded-lg overflow-hidden bg-[rgba(245,247,255,1)]">
                <Table>
                    {!hideHeaders && (
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
                                                    ) as React.ReactNode}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                    )}
                    <TableBody className="bg-white">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    className="border border-[rgba(245,247,255,1)] bg-[rgba(245,247,255,1)] hover:bg-[rgba(245,247,255,0.4)] transition-colors"
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-5 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext()) as React.ReactNode}
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
