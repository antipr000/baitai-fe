"use client"

import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface BackButtonProps {
  className?: string
}

export function BackButton({ className = "" }: BackButtonProps) {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.back()}
      className={`bg-[rgba(98,117,252,0.82)] p-2 px-1 rounded-md hover:bg-[rgba(98,117,252,0.9)] transition-colors cursor-pointer ${className}`}
    >
      <Image src="/candidate/company-interviews/left-arrow.svg" alt="Back" width={20} height={20} />
    </button>
  )
}