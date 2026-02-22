"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    browserLocalPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail,
    sendEmailVerification,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "@/lib/api/client";
import { toast } from "sonner";

export default function LoginPageV2() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [step, setStep] = useState<"email" | "password" | "register" | "verify">("email");

    // Registration state
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Shared state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Check if email exists in backend
    const checkEmailExists = async (email: string): Promise<{ exists: boolean; provider: string | null }> => {
        try {
            const response = await api.post("/api/v1/user/auth/exists/", { email });
            return { exists: response.data.exists, provider: response.data.provider };
        } catch (error) {
            console.error("Error checking email existence:", error);
            return { exists: false, provider: null };
        }
    };

    const handleEmailContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await checkEmailExists(email);
        if (result.exists) {
            if (result.provider === "google.com") {
                toast.warning("This email is linked to Google Sign-In. Please use 'Continue with Google' instead.");
            } else {
                setStep("password");
            }
        } else {
            setStep("register");
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);

        const provider = new GoogleAuthProvider();
        try {
            await auth.setPersistence(browserLocalPersistence);
            const userCredential = await signInWithPopup(auth, provider);
            const idToken = await userCredential.user.getIdToken();

            // Send token to backend
            await api.post("api/v1/user/auth/token/", {
                token: idToken,
            });

            await fetch("/api/login", {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });
            toast.success("Successfully logged in! Redirecting...");
            window.location.href = "/candidate/dashboard";
        } catch (err: any) {
            console.log(err);
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.detail || "Google Sign-in failed";
                setError(message);
                toast.error(message);
            } else {
                setError("Google Sign-in failed");
                toast.error("Google Sign-in failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await auth.setPersistence(browserLocalPersistence);
            const credentials = await signInWithEmailAndPassword(auth, email, password);
            if (credentials.user.emailVerified) {
                const idToken = await credentials.user.getIdToken();
                await fetch("/api/login", {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
                window.location.href = "/candidate/dashboard";
            } else {
                toast.error("Please verify your email before signing in.");
            }
        } catch (err: any) {
            console.log(err);
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.detail || "Something went wrong";
                setError(message);
                toast.error(message);
            } else if (
                err?.code === "auth/wrong-password" ||
                err?.code === "auth/invalid-credential" ||
                err?.code === "auth/user-not-found"
            ) {
                setError("Incorrect email or password.");
                toast.error("Incorrect email or password.");
            } else if (err?.code === "auth/too-many-requests") {
                setError("Too many failed attempts. Please try again later.");
                toast.error("Too many failed attempts. Please try again later.");
            } else {
                setError("Something went wrong");
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!agreedToTerms) {
            toast.error("You must agree to the terms and conditions.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password should be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            await auth.setPersistence(browserLocalPersistence);
            // Create user via backend
            await api.post("api/v1/user/signup/", {
                email: email.trim(),
                password,
                full_name: name.trim(),
            });

            // Sign in with Firebase to send verification email
            const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
            await sendEmailVerification(credential.user);
            setStep("verify");
        } catch (err: any) {
            console.log(err);
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.detail || "Something went wrong";
                setError(message);
                toast.error(message);
            } else {
                setError("Something went wrong");
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
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

                        {step === "email" ? (
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
                                        className="w-full md:h-13 h-11 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 text-base font-normal shadow-sm"
                                        onClick={handleGoogleSignIn}
                                        disabled={loading}
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
                                                className="pl-12 md:h-13 h-11 bg-white border-[rgba(58,63,187,0.2)] lg:text-base text-sm md:placeholder:text-base placeholder:text-sm placeholder:text-[rgba(10,13,26,0.3)]"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full md:h-14 h-12 bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white flex items-center justify-center gap-2 md:text-base text-sm font-medium rounded-md transition-colors duration-200"
                                            disabled={loading}
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
                        ) : step === "password" ? (
                            <div className="w-full">
                                {/* Back button to sign-in step */}
                                <button
                                    type="button"
                                    onClick={() => setStep("email")}
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
                                            className="w-full md:h-12 h-11 bg-[rgba(245,247,255,1)] border-[rgba(58,63,187,0.2)] lg:text-base text-sm md:placeholder:text-base placeholder:text-sm placeholder:text-[rgba(10,13,26,0.3)]"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* Sign In Button */}
                                    <Button
                                        type="submit"
                                        className="w-full md:h-14 h-12 bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white flex items-center justify-center gap-2 md:text-base text-sm font-medium rounded-md transition-colors duration-200 mt-4"
                                        disabled={loading}
                                    >
                                        Sign In
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                    </Button>

                                    <div className="text-center">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button type="button" className="text-sm text-[rgba(58,63,187,1)] hover:underline">
                                                    Forgot password?
                                                </button>
                                            </DialogTrigger>
                                            <ForgotPasswordModal />
                                        </Dialog>
                                    </div>
                                </form>
                            </div>
                        ) : step === "register" ? (
                            <>
                                {/* Back button to sign-in step */}
                                <button
                                    type="button"
                                    onClick={() => setStep("email")}
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
                                            className="md:h-12 h-11 bg-[rgba(245,247,255,1)] border-[rgba(58,63,187,0.2)] lg:text-base text-sm md:placeholder:text-base placeholder:text-sm placeholder:text-[rgba(10,13,26,0.3)]"
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
                                            className="md:h-12 h-11 bg-[rgba(245,247,255,1)] border-[rgba(58,63,187,0.2)] lg:text-base text-sm md:placeholder:text-base placeholder:text-sm placeholder:text-[rgba(10,13,26,0.3)]"
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
                                            className="md:h-12 h-11 bg-[rgba(245,247,255,1)] border-[rgba(58,63,187,0.2)] lg:text-base text-sm md:placeholder:text-base placeholder:text-sm placeholder:text-[rgba(10,13,26,0.3)]"
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
                                        disabled={loading}
                                    >
                                        Create Account
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                    </Button>
                                </form>
                            </>
                        ) : step === "verify" ? (
                            <div className="w-full flex flex-col items-center">
                                {/* Back button */}
                                <button
                                    type="button"
                                    onClick={() => setStep("email")}
                                    className="self-start mb-5 flex font-medium items-center gap-1 text-sm text-[rgba(58,63,187,1)] hover:underline transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                    Back
                                </button>

                                <div className="w-16 h-16 bg-[rgba(58,63,187,0.1)] rounded-full flex flex-col items-center justify-center mb-6">
                                    <Image src="/auth/email2.svg" alt="Email" width={32} height={32} className="opacity-80" />
                                </div>

                                <h1 className="md:text-2xl text-xl font-semibold text-center mb-2 text-[rgba(10,13,26,1)]">
                                    Check your <span className="text-[rgba(107,124,255,1)]">Inbox</span>
                                </h1>
                                <p className="md:text-base text-sm text-[rgba(10,13,26,0.7)] text-center mb-10">
                                    We've sent a verification email to <br />
                                    <span className="font-medium text-[rgba(10,13,26,1)] block my-1">{email}</span>
                                    Please verify your email to Login.
                                </p>

                                <Button
                                    type="button"
                                    className="w-full md:h-12 h-11 bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white flex items-center justify-center gap-2 md:text-base text-sm font-medium rounded-md transition-colors duration-200"
                                    onClick={() => setStep("email")}
                                >
                                    Return to login
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Button>
                            </div>
                        ) : null}

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ForgotPasswordModal() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        setLoading(true);
        try {
            // Check if user signed up with Google
            const response = await api.post("/api/v1/user/auth/exists/", { email });
            if (response.data.exists && response.data.provider === "google.com") {
                toast.warning("This account uses Google Sign-In. Password reset is not available.");
                return;
            }

            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent. Check your inbox!");
            setEmail("");
        } catch (err: any) {
            console.log(err);
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.detail || "Failed to send reset email.";
                toast.error(message);
            } else {
                const message = err.message || "Failed to send reset email.";
                toast.error(message.replace("Firebase: ", ""));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reset your password</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
                <Input
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    disabled={loading}
                />
            </div>

            <DialogFooter className="mt-4">
                <Button
                    className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)]"
                    onClick={handleResetPassword}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send Reset Email"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
