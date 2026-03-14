import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CompanyLogoutButton } from './logout-button'

export function CompanyHeader({ credits }: { credits: number }) {
    return (
        <header className="h-[72px] bg-white border-b-2 border-[rgba(245,247,255,1)] shrink-0 z-50 relative w-full px-6">
            <div className='max-w-7xl mx-auto flex items-center justify-between w-full h-full'>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="bAIt logo" width={40} height={40} className="object-contain" />
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-[linear-gradient(106.63deg,#1051AB_0%,#1C0F6F_144.25%)]">bAIt</span>
                </Link>

                <div className="flex items-center gap-4">
                    {/* <button className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <Image src="/candidate/dashboard/notifcation.svg" alt="Notifications" width={24} height={24} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button> */}

                    <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(58,63,187,1)] rounded-md text-white font-medium">
                        <Image src="/candidate/dashboard/coin.svg" alt="Credits" width={24} height={24} />
                        <span className="text-sm">{credits} Credits</span>
                    </div>

                    <CompanyLogoutButton />

                </div>
            </div>
        </header>
    )
}
