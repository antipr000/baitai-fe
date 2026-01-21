"use client"

import React from 'react'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'

export const Header = () => {
  return (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-[linear-gradient(91.24deg,#3E54FB_35.23%,#C3CEFF_202.55%)]">New Interview</h1>
        </div>
        <div className="flex items-center gap-3">
            <Button size={"lg"} variant="outline" className="rounded-full px-6 bg-clip-text font-semibold text-transparent bg-[linear-gradient(91.24deg,#3E54FB_35.23%,#C3CEFF_202.55%)] hover:text-transparent hover:opacity-80  border border-[#7082FD] ">
                Save Draft
            </Button>
            <Button size={"lg"} className="rounded-full px-6 bg-[rgba(84,104,252,1)] font-semibold hover:bg-[rgba(84,104,252,1)] opacity-80 text-white shadow-md">
                Publish
            </Button>
        </div>
    </div>
  )
}
