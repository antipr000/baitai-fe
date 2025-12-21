"use client"

import React, { useRef, useState } from 'react'
import axios from 'axios'
import { Button } from '../ui/button'
import Image from 'next/image'
import { motion } from "motion/react"
import { Progress } from '../ui/progress'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import api from '@/lib/api/client'

type UploadSectionProps = {
    onUploadComplete?: () => void
}

export default function UploadSection({ onUploadComplete }: UploadSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (file.type !== 'application/pdf') {
                setUploadError('Please upload a PDF file')
                return
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setUploadError('File size must be less than 10MB')
                return
            }
            setSelectedFile(file)
            setUploadError(null)
            setUploadSuccess(false)
        }
    }


    const handleUpload = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        setUploadProgress(0)
        setUploadError(null)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('type', 'resume')
            

            // needs to be changed to actual backend URL
            await api.post(
                '/api/v1/upload/resume/', 
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.lengthComputable && progressEvent.total !== undefined) {
                            const percentComplete = (progressEvent.loaded / progressEvent.total) * 100
                            setUploadProgress(percentComplete)
                        }
                    },
                }
            )

            setUploadSuccess(true)
            setUploadProgress(100)
                onUploadComplete?.()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setUploadError(error.message ||'Upload failed. Please try again.')
            } else {
                setUploadError('An error occurred during upload. Please try again.')
            }
            console.log('Upload error:', error)   
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='flex-2 px-24 '
        >
            <div>
                <div className="flex items-center gap-3 md:justify-end justify-start px-6 py-4">
                    <Button variant="outline" size="lg" className="bg-transparent rounded-3xl text-[rgba(104,100,247,1)] font-semibold border-[rgba(142,158,254,0.6)] px-15" >FAQ</Button>
                    <Button variant="outline" size="lg" className="bg-transparent rounded-3xl text-[rgba(104,100,247,1)] font-semibold border-[rgba(142,158,254,0.6)] " >Contact Support</Button>
                </div>

                <div className="flex items-center px-6 py-4 justify-between mb-6">
                    <div>
                        <div className="relative">
                            <h2 className="text-3xl font-semibold bg-linear-to-r from-[rgba(0,13,144,0.9)] to-[rgba(93,107,238,1)] bg-clip-text text-transparent mb-1">Upload Resume</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">Please upload your resume to initiate your application and help us assess your fit.</p>
                    </div>
                </div>
                {/* Main Content Area */}
                <div className="w-full px-6">
                    <div className="w-full max-w-4xl mx-auto">

                        {/* Upload Area */}
                        <div className="w-full bg-white rounded-lg border p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
                            {!selectedFile && !uploadSuccess ? (
                                <>
                                    <Button
                                        onClick={handleButtonClick}
                                        disabled={isUploading}
                                        className="bg-[rgba(104,100,247,1)] hover:bg-[rgba(98,117,252,1)] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
                                    >
                                        <Image src="/interview/fileplus.svg" alt="upload" width={20} height={20} />
                                        Choose Files
                                    </Button>
                                    <p className="text-sm text-muted-foreground">PDF format, max 10MB</p>
                                </>
                            ) : uploadSuccess ? (
                                <div className="flex flex-col items-center gap-4">
                                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                                    <p className="text-lg font-semibold text-green-600">Upload Successful!</p>
                                    <p className="text-sm text-muted-foreground">Redirecting to interview...</p>
                                </div>
                            ) : (
                                <div className="w-full space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Image src="/interview/file.svg" alt="file" width={24} height={24} />
                                            <div>
                                                <p className="font-medium">{selectedFile?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(selectedFile?.size || 0) / 1024 / 1024} MB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedFile(null)
                                                setUploadProgress(0)
                                                setUploadError(null)
                                            }}
                                            disabled={isUploading}
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {isUploading && (
                                        <div className="space-y-2">
                                            <Progress value={uploadProgress} className="h-2" />
                                            <p className="text-sm text-center text-muted-foreground">
                                                Uploading... {Math.round(uploadProgress)}%
                                            </p>
                                        </div>
                                    )}

                                    {uploadError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-600">{uploadError}</p>
                                        </div>
                                    )}

                                    {!isUploading && (
                                        <div className="flex gap-4 justify-center">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedFile(null)
                                                    setUploadProgress(0)
                                                    setUploadError(null)
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleUpload}
                                                className="bg-[rgba(104,100,247,1)] hover:bg-[rgba(98,117,252,1)] text-white"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    'Upload Resume'
                                                )}
                                            </Button>
                                        </div>
                                    )}
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
                </div>
            </div>
        </motion.div>
    )
}
