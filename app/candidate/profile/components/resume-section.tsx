"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { uploadResume, UserResumeDTO } from "@/lib/api/resume"
import axios from "axios"
import { toast } from "sonner"
import { FileText, Loader2, XCircle } from "lucide-react"

interface ResumeSectionProps {
    initialResume: UserResumeDTO | null
    authToken?: string
}

export function ResumeSection({ initialResume, authToken }: ResumeSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [currentResume, setCurrentResume] = useState<UserResumeDTO | null>(initialResume)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file')
            return
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('File size must be less than 10MB')
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        try {
            const uploadedResume = await uploadResume(file, authToken, (progressEvent) => {
                if (progressEvent.lengthComputable && progressEvent.total) {
                    const percentComplete = (progressEvent.loaded / progressEvent.total) * 100
                    setUploadProgress(percentComplete)
                }
            })
            setCurrentResume(uploadedResume)
            toast.success("Resume uploaded successfully")
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const serverMessage = error.response?.data?.error
                toast.error(serverMessage || 'Upload failed. Please try again.')
            } else {
                toast.error('An error occurred during upload. Please try again.')
            }
            console.error('Upload error:', error)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="space-y-3 pt-2">
            <Label className="text-[13px] font-semibold text-[rgba(17,24,39,0.8)]">Resume</Label>
            <div className="border md:col-span-2 border-[rgba(58,63,187,0.2)] rounded-xl flex flex-col items-center justify-center p-8 min-h-[184px] bg-white text-center">

                {isUploading ? (
                    <div className="w-full max-w-xs space-y-4">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-[rgba(58,63,187,1)]" />
                            <p className="text-sm font-medium text-gray-700">Uploading... {Math.round(uploadProgress)}%</p>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                    </div>
            ) :currentResume ? (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex flex-col items-center gap-2 bg-[rgba(58,63,187,0.02)] p-6 rounded-lg border border-[rgba(58,63,187,0.1)] w-full max-w-sm text-center">
                            <FileText className="h-8 w-8 text-[rgba(58,63,187,1)] mb-1" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate px-2">{currentResume.file_name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Uploaded {new Date(currentResume.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleButtonClick}
                            className="text-[rgba(58,63,187,1)] hover:text-[rgba(58,63,187,1)] hover:opacity-90 mt-1 border-[rgba(58,63,187,1)] font-medium text-sm"
                        >
                            Upload a different resume
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <Button
                            onClick={handleButtonClick}
                            className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,1)] hover:opacity-90 text-white rounded-lg px-8 h-10 flex items-center gap-2 font-medium"
                        >
                            <Image src="/doc.svg" alt="Upload" width={16} height={16} className="brightness-0 invert text-sm" />
                            Choose Files
                        </Button>
                        <p className="text-xs text-[rgba(17,24,39,0.6)]">PDF format, max 10MB</p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>
        </div>
    )
}
