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
      className={`cursor-pointer`}
    >
      <Image src="/company/left-arrow.svg" alt="Back" width={26} height={26} />
    </button>
  )
}