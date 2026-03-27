import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { serverFetch } from '@/lib/api/server'

export async function TopHeader() {
    let credits = 0;
    try {
        const response = await serverFetch<{ credits: number }>('/api/v1/user/credits/')
        credits = response?.credits ?? 0
    } catch (e) {
        // failed to fetch credits
        console.error('Failed to fetch credits:', e)
    }

    return (
        <header className="h-[72px] bg-white border-b-2 border-[rgba(245,247,255,1)] flex items-center justify-between px-6 shrink-0 z-50 relative">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="bAIt logo" width={32} height={32} className="object-contain" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-[linear-gradient(106.63deg,#1051AB_0%,#1C0F6F_144.25%)]">bAIt</span>
            </Link>
            <div className="flex items-center gap-4">
                {/* <button className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Image src="/candidate/dashboard/notifcation.svg" alt="Notifications" width={24} height={24} />
                </button> */}
                <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(58,63,187,1)] rounded-md text-white font-medium">
                    <Image src="/candidate/dashboard/coin.svg" alt="Credits" width={24} height={24} />
                    <span className="text-sm">{credits} credits left</span>
                </div>
                <Link href="/pricing">
                    <Button variant="outline" className="text-[rgba(10,13,26,1)] border-[rgba(58,63,187,1)]  h-10 px-6 rounded-md">
                        Purchase Credits
                    </Button>
                </Link>
            </div>
        </header>
    )
}
