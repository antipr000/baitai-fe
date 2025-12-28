"use client"

import { Menu } from 'lucide-react'
import React, { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from './ui/separator';
import { WaitlistForm } from './waitlist-form';

export const MobileNavBar = () => {
    const [open, setOpen] = useState(false);
    return (<Sheet open={open} onOpenChange={setOpen}>
        <><SheetTrigger asChild className="">
            <Button variant="ghost" size="icon" className="text-[rgba(69,94,255,0.8)] ml-auto">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
            </Button>
        </SheetTrigger><SheetContent
            side="left"
            className="w-full p-10 min-h-screen bg-[linear-gradient(172.97deg,#E8F5FA_-6.95%,#F5F7FF_91.64%)]"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
        >
                <nav className="flex flex-col gap-6 px-5 mt-8">
                    <div className="flex items-center gap-4 border-[rgba(121,153,253,0.05)] border p-1 px-2 ">
                        <Image src="/main/nav/about.svg" alt="Bait AI Logo" width={15} height={15} />
                        <Link
                            href="/about"
                            className=" text-[rgba(10,13,26,0.7)] hover:opacity-70 font-medium py-2"
                            onClick={() => setOpen(false)}
                        >
                            About us
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 border-[rgba(121,153,253,0.05)] border p-1 px-2 ">
                        <Image src="/main/nav/briefcase.svg" alt="briefcase" width={15} height={15} />
                        <Link
                            href="/#hiring-teams"
                            className=" text-[rgba(10,13,26,0.7)] hover:opacity-70 font-medium py-2"
                            onClick={() => setOpen(false)}
                        >
                            For Hiring Teams
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 border-[rgba(121,153,253,0.05)] border p-1 px-2 ">
                        <Image src="/main/nav/people.svg" alt="people" width={15} height={15} />

                        <Link
                            href="/#job-seekers"
                            className=" text-[rgba(10,13,26,0.7)] hover:opacity-70 font-medium py-2"
                            onClick={() => setOpen(false)}
                        >
                            For Job Seekers
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 border-[rgba(121,153,253,0.05)] border p-1 px-2 ">
                        <Image src="/main/nav/money.svg" alt="money" width={15} height={15} />

                        <Link
                            href="/pricing"
                            className=" text-[rgba(10,13,26,0.7)] hover:opacity-70 font-medium py-2"
                            onClick={() => setOpen(false)}
                        >
                            Pricing
                        </Link>
                    </div>

                    <Separator className="my-2" />

                </nav>
                <div className="flex flex-col gap-4 border-[rgba(121,153,253,0.05)] border  px-2 p-1">
                    <WaitlistForm>
                        <Button variant="ghost" className="w-full bg-[linear-gradient(106.03deg,rgba(239,246,254,0.5)_0%,rgba(163,217,248,0.5)_238.47%)] text-[rgba(108,132,255,1)] hover:opacity-70 border font-medium border-[rgba(108,132,255,0.9)]">
                            Sign in
                        </Button>
                    </WaitlistForm>
                    <WaitlistForm>
                    <Button className="w-full  bg-[linear-gradient(106.03deg,#677CFF_0%,#A3D9F8_238.47%)] hover:opacity-70 text-[rgba(238,246,251,1)] font-medium">
                        Request a demo
                    </Button>
                    </WaitlistForm>
                </div>
            </SheetContent></>
    </Sheet>
    )
}
