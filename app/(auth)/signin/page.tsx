"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPageV2() {
    const [email, setEmail] = useState("");
    const [step, setStep] = useState<"signin" | "login" | "register">("signin");

    // Registration state
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleGoogleSignIn = () => {
        // Placeholder for Google Sign In logic
        console.log("Google Sign In clicked");
    };

    // Dummy function — replace with actual API call later
    const checkEmailExists = async (email: string): Promise<boolean> => {
        // TODO: Replace with actual backend call
        // For now, always returns true (email exists) so you can build the login component
        return false;
    };

    const handleEmailContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        const exists = await checkEmailExists(email);
        if (exists) {
            setStep("login");
        } else {
            setStep("register");
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login: ", { email, password });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (!agreedToTerms) {
            alert("Please agree to the terms and conditions");
            return;
        }
        console.log("Register: ", { email, name, password });
    };

    return (
        <div className="min-h-screen  bg-[rgba(245,247,255,1)] flex flex-col relative w-full font-sans">
            {/* Back Home Button */}
            <div className="absolute top-8 left-8 pb-2 ">
                <Link href="/">
                    <Button variant="outline" className="hidden md:flex gap-2 border-[rgba(58,63,187,0.2)] text-[rgba(10,13,26,1)] hover:bg-gray-50 px-6">
                        Back Home
                    </Button>
                    {/* Mobile Home Icon */}
                    <Image src="/home.svg" alt="Home" width={20} height={20} className="w-5 h-5 md:hidden" />
                </Link>
            </div>

            {/* Top gradient separator */}
            <Separator className="absolute top-20 border-gray-200/20 left-0 w-full h-[2px]! " />

            <div className="flex-1 flex flex-col mt-26  items-center lg:justify-center   p-4 py-0 md:py-4">
                {/* Logo */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="md:size-11 size-6 relative">
                        <Image
                            src="/auth/logo.svg"
                            alt="bAIt Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="md:text-3xl text-2xl font-semibold text-transparent bg-clip-text bg-[linear-gradient(106.63deg,#1051AB_0%,#1C0F6F_144.25%)]">bAlt</span>
                </div>

                {/* Card Container */}
                <Card className="w-full md:max-w-[520px] max-w-[420px] border-none shadow-sm bg-[rgba(236,239,255,1)] rounded-xl overflow-hidden">
                    <CardContent className="md:p-8 p-5 w-full flex flex-col items-center">

                        {step === "signin" ? (
                            <>
                                <h1 className="md:text-2xl text-xl font-semibold text-center mb-2 text-[rgba(10,13,26,1)]">
                                    Welcome to <span className="text-[rgba(107,124,255,1)]">Bait AI</span>
                                </h1>
                                <p className="md:text-base text-sm text-[rgba(10,13,26,0.7)] text-center mb-10">
                                    Sign in to your account or create a new one
                                </p>

                                <div className="w-full space-y-6">
                                    {/* Google Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full md:h-14 h-12 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 text-base font-normal shadow-sm"
                                        onClick={handleGoogleSignIn}
                                    >
                                        <Image src="/auth/google.svg" alt="Google" className="text-[rgba(10,13,26,1)] md:text-sm text-xs md:w-5 w-4" width={24} height={24} />
                                        Continue with Google
                                    </Button>

                                    {/* Divider */}
                                    <div className="relative flex items-center justify-center my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-gray-300"></span>
                                        </div>
                                        <div className="relative bg-[#F3F4FE] px-4">
                                            <span className="md:text-base text-sm text-gray-500 uppercase tracking-widest">OR</span>
                                        </div>
                                    </div>

                                    {/* Email Form */}
                                    <form onSubmit={handleEmailContinue} className="space-y-6">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Image src="/auth/email2.svg" alt="Email" width={20} height={20} className="text-gray-400 opacity-60" />
                                            </div>
                                            <Input
                                                type="email"
                                                placeholder="enter your email address"
                                                className="pl-12 md:h-14 h-12 bg-white border-[rgba(58,63,187,0.2)] lg:text-base text-sm md:placeholder:text-base placeholder:text-sm placeholder:text-[rgba(10,13,26,0.3)]"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full md:h-14 h-12 bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white flex items-center justify-center gap-2 md:text-base text-sm font-medium rounded-md transition-colors duration-200"
                                        >
                                            Continue with Email
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                        </Button>
                                    </form>
                                </div>

                                <p className="mt-8 md:text-sm text-xs text-center text-[rgba(10,13,26,0.7)] max-w-md leading-relaxed">
                                    By continuing, you agree to our <Link href="#" className="text-[rgba(58,63,187,1)] hover:underline">Terms of Service</Link> and <Link href="#" className="text-[rgba(58,63,187,1)] hover:underline">Privacy Policy</Link>
                                </p>
                            </>
                        ) : step === "login" ? (
                            <div className="w-full">
                                {/* Back button to sign-in step */}
                                <button
                                    type="button"
                                    onClick={() => setStep("signin")}
                                    className="self-start mb-5 flex font-medium items-center gap-1 text-sm text-[rgba(58,63,187,1)] hover:underline transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                    Back
                                </button>

                                <h1 className="md:text-2xl text-xl font-semibold text-center mb-3 text-[rgba(10,13,26,1)]">
                                    Welcome <span className="text-[rgba(107,124,255,1)]">Back</span>
                                </h1>
                                <p className="md:text-base text-sm text-[rgba(10,13,26,0.7)] text-center mb-3">
                                    Sign in with your password
                                </p>
                                <p className="text-sm text-[rgba(58,63,187,1)] font-medium text-center mb-10">
                                    {email}
                                </p>

                                <form onSubmit={handleLogin} className="w-full space-y-6">
                                    {/* Password */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 md:text-base text-sm font-medium text-[rgba(10,13,26,1)]">
                                            <Image src="/auth/lock2.svg" alt="Lock" width={20} height={20} className="" />
                                            Password
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••••"
                                            className="w-full md:h-14 h-12 bg-[rgba(245,247,255,1)] border-[rgba(58,63,187,0.2)] lg:text-base text-sm md:placeholder:text-base placeholder:text-sm placeholder:text-[rgba(10,13,26,0.3)]"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Sign In Button */}
                                    <Button
                                        type="submit"
                                        className="w-full md:h-14 h-12 bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white flex items-center justify-center gap-2 md:text-base text-sm font-medium rounded-md transition-colors duration-200 mt-4"
                                    >
                                        Sign In
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                    </Button>

                                    <div className="text-center">
                                        <Link href="#" className="text-sm text-[rgba(58,63,187,1)] hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <>
                                {/* Back button to sign-in step */}
                                <button
                                    type="button"
                                    onClick={() => setStep("signin")}
                                    className="self-start mb-5 flex font-medium items-center gap-1 text-sm text-[rgba(58,63,187,1)] hover:underline transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                    Back
                                </button>

                                <h1 className="md:text-2xl text-xl font-semibold text-center mb-2 text-[rgba(10,13,26,1)]">
                                    Create your <span className="text-[rgba(107,124,255,1)]">Account</span>
                                </h1>
                                <p className="md:text-base text-sm text-[rgba(10,13,26,0.7)] text-center mb-8">
                                    Fill in the details to get started
                                </p>

                                <form onSubmit={handleRegister} className="w-full space-y-5">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 md:text-base text-sm font-medium text-[rgba(10,13,26,1)]">
                                            <Image src="/auth/user2.svg" alt="User" width={20} height={20} className="" />
                                            Full Name
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="John Smith"
                                            className="md:h-13 h-11 bg-[rgba(245,247,255,1)] border-[rgba(58,63,187,0.2)] lg:text-base text-sm md:placeholder:text-base placeholder:text-sm placeholder:text-[rgba(10,13,26,0.3)]"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 md:text-base text-sm font-medium text-[rgba(10,13,26,1)]">
                                            <Image src="/auth/lock2.svg" alt="Lock" width={20} height={20} className="" />
                                            Password
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••••"
                                            className="md:h-13 h-11 bg-[rgba(245,247,255,1)] border-[rgba(58,63,187,0.2)] lg:text-base text-sm md:placeholder:text-base placeholder:text-sm placeholder:text-[rgba(10,13,26,0.3)]"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 md:text-base text-sm font-medium text-[rgba(10,13,26,1)]">
                                            <Image src="/auth/lock2.svg" alt="Lock" width={20} height={20} className="" />
                                            Confirm Password
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••••"
                                            className="md:h-13 h-11 bg-[rgba(245,247,255,1)] border-[rgba(58,63,187,0.2)] lg:text-base text-sm md:placeholder:text-base placeholder:text-sm placeholder:text-[rgba(10,13,26,0.3)]"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Agree to Terms */}
                                    <div className="flex items-start gap-3 mt-6">
                                        <Checkbox
                                            id="terms"
                                            checked={agreedToTerms}
                                            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                                            className="mt-0.5 md:size-5 size-4 border-[rgba(58,63,187,0.3)] data-[state=checked]:bg-[rgba(58,63,187,1)] data-[state=checked]:border-[rgba(58,63,187,1)]"
                                        />
                                        <label htmlFor="terms" className="md:text-sm text-xs text-[rgba(10,13,26,0.7)] leading-relaxed cursor-pointer">
                                            I have agreed to the <Link href="#" className="text-[rgba(58,63,187,1)] hover:underline">terms and conditions</Link>
                                        </label>
                                    </div>

                                    {/* Register Button */}
                                    <Button
                                        type="submit"
                                        className="w-full md:h-14 h-12 bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white flex items-center justify-center gap-2 md:text-base text-sm font-medium rounded-md transition-colors duration-200 mt-4"
                                    >
                                        Create Account
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                    </Button>
                                </form>
                            </>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
