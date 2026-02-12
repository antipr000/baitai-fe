import Image from "next/image";
import Link from "next/link";
import { AuthButtons } from "./auth-buttons";
import { MobileNavBar } from "./mobile-navbar";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { clientConfig, serverConfig } from "@/lib/auth/config";

export default async function Header() {
    const tokens = await getTokens(await cookies(), {
        apiKey: clientConfig.apiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
    });
    return (
        <header className="fixed top-0 left-0 right-0 z-50 sm:px-6 px-2 md:py-9 py-4 bg-[rgba(245,247,255,1)] border-b border-gray-200/20 shadow-sm w-screen max-w-full overflow-x-hidden ">
            <nav className="flex items-center justify-between w-full max-w-full md:max-w-7xl md:mx-auto overflow-x-hidden box-border m-0">
                <Link href="/" className="flex items-center space-x-2">
                    <Image className="md:size-[34px] lg:[size-40px] size-6" src="/main/logo.png" alt="Bait AI Logo" width={40} height={40} />
                    <span className="lg:text-3xl md:text-2xl text-base font-bold text-transparent bg-clip-text bg-[linear-gradient(106.63deg,#1051AB_0%,#1C0F6F_144.25%)]">bAIt</span>
                </Link>
                <div className="hidden md:flex items-center lg:space-x-10 space-x-4">
                    <Link href="/about" className="text-[rgba(69,94,255,0.8)] hover:opacity-70 font-medium">About us</Link>
                    <Link href="/#hiring-teams" className="text-[rgba(69,94,255,0.8)] hover:opacity-70 font-medium">For Hiring Teams</Link>
                    {/* check why not working when at top */}
                    <Link href="/#job-seekers" className="text-[rgba(69,94,255,0.8)] hover:opacity-70 font-medium">For Job Seekers</Link>
                    <Link href="/pricing" className="text-[rgba(69,94,255,0.8)] hover:opacity-70 font-medium">Pricing</Link >
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <AuthButtons isAuthenticated={!!tokens} />
                </div>
                <div className="md:hidden justify-around items-center">
                    <MobileNavBar isAuthenticated={!!tokens} />
                </div>

            </nav>

        </header>
    )
}