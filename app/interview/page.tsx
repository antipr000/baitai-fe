"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, HelpCircle, MessageCircle, CheckCircle2, FileText, MessageSquare, Mic, Video, Volume2, ChevronDown } from "lucide-react"
import Image from "next/image"
import LeftSection from "@/components/interview/left-section"
import InterviewSection from "@/components/interview/interview-section"
import UploadSection from "@/components/interview/upload-section"
import { useState } from "react"

export default function InterviewPage() {
    const [activeSection, setActiveSection] = useState<'upload' | 'interview'>('upload')

    return (
        <div className="min-h-screen max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-7xl mx-auto flex gap-6 md:flex-row flex-col">
            <div className="bg-white rounded-xl text-center mx-auto w-[80%] md:w-[450px] shrink-0">
                <LeftSection activeSection={activeSection} setActiveSection={setActiveSection} />
            </div>
            <div className="bg-[rgba(245,247,255,1)] flex-1 min-w-0">
                {activeSection === 'upload' ? <UploadSection /> : <InterviewSection />}
            </div>
        </div>
    )
}
