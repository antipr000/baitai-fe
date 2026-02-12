"use client"

import { Menu } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface MobileNavBarProps {
    isAuthenticated: boolean;
}

export const MobileNavBar = ({ isAuthenticated }: MobileNavBarProps) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function handleLogout() {
        try {
            await signOut(auth);
            await fetch("/api/logout");
            setOpen(false);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            router.push("/login");
        }
    }

    const navItems = [
        { name: 'About us', href: '/about', icon: '/main/doc.svg' },
        { name: 'For Hiring Teams', href: '/#hiring-teams', icon: '/main/briefcase.svg' },
        { name: 'For Job Seekers', href: '/#job-seekers', icon: '/main/group.svg' },
        { name: 'Pricing', href: '/pricing', icon: '/main/money.svg' },
    ];

    return (
        <Sheet modal={false} open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[rgba(69,94,255,0.8)] ml-auto">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="left"
                className="w-full p-4 bg-[rgba(248,250,255,1)] flex flex-col h-full"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <VisuallyHidden.Root>
                    <SheetTitle>Mobile Menu</SheetTitle>
                    <SheetDescription>Navigation links and actions</SheetDescription>
                </VisuallyHidden.Root>

                <nav className="flex flex-col gap-3 mt-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-4 bg-[#F5F7FF] p-4 rounded-lg group transition-colors hover:bg-white border border-transparent hover:border-[#E0E7FF]"
                        >
                            <Image src={item.icon} alt={item.name} width={20} height={20} className="w-5 h-5 text-[rgba(88,63,187,1)]" />
                            <span className="text-[rgba(10,13,26,1)] font-medium text-base">
                                {item.name}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto flex flex-col gap-3 mb-8">
                    {isAuthenticated ? (
                        <>
                            <Link href="/candidate/dashboard" onClick={() => setOpen(false)}>
                                <Button className="w-full bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-medium h-12 rounded-lg text-base">
                                    Dashboard
                                </Button>
                            </Link>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="w-full bg-white border-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.05)] hover:text-[rgba(58,63,187,1)] font-medium h-12 rounded-lg text-base"
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={() => setOpen(false)}>
                                <Button
                                    variant="outline"
                                    className="w-full bg-white border-2 border-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.05)] hover:text-[rgba(58,63,187,1)] font-medium h-12 rounded-lg text-base"
                                >
                                    Sign in
                                </Button>
                            </Link>

                            <Link href="https://cal.com/soham-mukherjee-8yzald/30min" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                                <Button className="w-full bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-medium h-12 rounded-lg text-base">
                                    Request a demo
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
