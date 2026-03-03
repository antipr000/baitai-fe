"use client"

import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface BackButtonProps {
  className?: string
}

export function BackButton2({ className = "" }: BackButtonProps) {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.back()}
      className={`bg-[rgba(98,117,252,0.82)] p-2 rounded-full hover:bg-[rgba(98,117,252,0.9)] transition-colors cursor-pointer ${className}`}
    >
      <Image src="/company/dashboard/back.svg" alt="Back" width={15} height={15} />
    </button>
  )
}