"use client"

import React from 'react'
import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'

export const Header = () => {
  return (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-2xl font-bold text-primary">New Interview</h1>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-full px-6 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary">
                Save Draft
            </Button>
            <Button className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white shadow-md">
                Publish
            </Button>
        </div>
    </div>
  )
}
