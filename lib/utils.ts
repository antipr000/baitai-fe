import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Root domain for subdomain routing (e.g., "baitai.club")
export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

export function formatDuration(minutes: number | string | null | undefined): string {
  if (!minutes) return "0m"
  const val = typeof minutes === "string" ? parseFloat(minutes) : minutes
  const totalMinutes = Math.round(val)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
