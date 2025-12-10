import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, HelpCircle, MessageCircle, CheckCircle2, FileText, MessageSquare, Mic, Video, Volume2, ChevronDown } from "lucide-react"
import Image from "next/image"
import LeftSection from "@/components/interview/left-section"
import RightSection from "@/components/interview/right-section"

export default function InterviewPage() {
    return (
        <div className="min-h-screen max-w-7xl m-auto flex  bg-white">
            <LeftSection />
            <RightSection />
        </div>
    )
}
