import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const founders = [
    {
        name: "Debarati Roy",
        role: "CO-FOUNDER & CEO",
        image: "/founders/pic1.png",
        bio: "A UI/UX designer, with 4+ years of experience across design, program management, and education. At Bait AI, she wears multiple hats— driving product, growth, partnerships, and strategy ensuring our platform redefines how hiring works.",
        socials: {

             linkedin: "https://www.linkedin.com/in/debarati-roy-75359b1b3/",
            twitter: "https://x.com/DebaratiRo39396"
        }
    },
    {
        name: "Soham Mukherjee",
        role: "CO-FOUNDER & CTO",
        image: "/founders/pic2.jpg",
        bio: "Former tech lead at Mercor, Soham has spent over 5+ years building scalable platforms. After witnessing firsthand how inefficient traditional hiring can be, he set out to explore a fairer, AI-driven approach to recruitment.",
        socials: {
            linkedin: "https://www.linkedin.com/in/antipr000/",
            twitter: "https://x.com/sohammu25344956"
        }
    }
]

export default function FoundersPage() {
    return (
        <div className="min-h-screen bg-[rgba(245,247,255,1)]">
            {/* Header */}
            <header className="w-full bg-[rgba(245,247,255,1)] shadow-md border-b-2 border-gray-200">
                <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-7 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image className="md:size-[34px] lg:[size-46px] size-8" src="/main/logo.png" alt="Bait AI Logo" width={40} height={40} />
                        <span className="lg:text-3xl md:text-2xl text-xl font-bold text-transparent bg-clip-text bg-[linear-gradient(106.63deg,#1051AB_0%,#1C0F6F_144.25%)]">bAIt</span>
                    </Link>
                    <Link href="/">
                        <Button
                            variant="outline"
                            className="rounded-md border border-[rgba(10,13,26,1)] text-[rgba(10,13,26,1)] hover:bg-gray-50 font-medium text-sm px-5 py-2.5"
                        >
                            Back Home
                        </Button>
                    </Link>
                </div>
            </header>
            {/* Main Content */}
            <div className='bg-[rgba(236,239,255,1)] '>
                <main className="max-w-7xl mx-auto px-6 md:px-10  lg:px-16 pt-14 md:pt-20 pb-20 md:pb-28">
                    {/* Hero Section */}
                    <div className="text-center mb-14 md:mb-10">
                        <p className="text-[rgba(58,63,187,1)] font-medium tracking-tight uppercase text-xs md:text-lg mb-5">
                            FOUNDERS
                        </p>
                        <h1 className="text-3xl lg:text-5xl font-semibold text-[rgba(10,13,26,1)] mb-5">
                            Meet the <span className="text-[rgba(107,124,255,1)] ">founders</span>
                        </h1>
                        <p className="text-[rgba(10,13,26,0.7)] text-base md:text-xl max-w-4xl mx-auto leading-relaxed">
                            We&apos;re a team united by one goal — making hiring fairer, faster, and smarter for everyone.
                        </p>
                    </div>

                    {/* Founders Grid */}
                    <div className="grid grid-cols-1 lg:w-full md:w-3/4 w-full lg:grid-cols-2 gap-6 lg:gap-10 max-w-6xl mx-auto">
                        {founders.map((founder, index) => (
                            <div
                                key={index}
                                className="bg-white/60 border-2 border-[rgba(58,63,187,0.5)] rounded-xl px-8 pt-10 pb-8 md:px-10 md:pt-14 md:pb-10 flex flex-col items-center text-center"
                            >
                                {/* Photo */}
                                <div className="relative w-[120px] h-[120px] md:w-[150px] md:h-[150px] mb-8 rounded-full overflow-hidden ring-[3px] ring-white shadow-md">
                                    <Image
                                        src={founder.image}
                                        alt={founder.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Role */}
                                <p className="text-[rgba(58,63,187,1)] font-semibold text-xs md:text-lg tracking-tight uppercase mb-1.5">
                                    {founder.role}
                                </p>

                                {/* Name */}
                                <h2 className="text-sm md:text-base font-semibold text-[rgba(10,13,26,1)] mb-5">
                                    {founder.name}
                                </h2>

                                {/* Bio */}
                                <p className="text-[rgba(10,13,26,0.6)] text-xs md:text-sm leading-normal mb-8 max-w-[340px]">
                                    {founder.bio}
                                </p>

                                {/* Socials */}
                                <div className="flex items-center gap-2 mt-auto">
                                    <Link href={founder.socials.linkedin} target="_blank" rel="noopener noreferrer">
                                        <Image
                                            src="/founders/linkedin.svg"
                                            alt="LinkedIn"
                                            width={25}
                                            height={25}
                                            className='lg:size-7 size-6'
                                        />
                                    </Link>
                                    <Link href={founder.socials.twitter} target="_blank" rel="noopener noreferrer">
                                        <Image
                                            src="/founders/x.svg"
                                            alt="X (Twitter)"
                                            width={23}
                                            height={23}
                                            className='lg:size-7 size-6'
                                        />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    )
}
