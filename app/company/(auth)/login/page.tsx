//https://hackernoon.com/using-firebase-authentication-with-the-latest-nextjs-features



"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import api from "@/lib/api/client";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await auth.setPersistence(rememberMe ? browserLocalPersistence : browserSessionPersistence);
            const credentials = await signInWithEmailAndPassword(auth, email, password);

            const idToken = await credentials.user.getIdToken();
            await api.post('api/v1/company/login/', {
                token: idToken,
            });

            await fetch("/api/login", {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });
            // window.location.href forces a full page reload to ensure server components (Header) update
            window.location.href = "/company/dashboard";
        }
        catch (err) {
            console.log(err);
            setError("Something went wrong");
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);

        const provider = new GoogleAuthProvider();
        try {
            await auth.setPersistence(rememberMe ? browserLocalPersistence : browserSessionPersistence);
            const userCredential = await signInWithPopup(auth, provider);
            // Get the Firebase ID token
            const idToken = await userCredential.user.getIdToken();
            console.log(idToken)
            // Send token to backend
            await api.post('api/v1/company/login/', {
                token: idToken,
            });

            await fetch("/api/login", {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });
            toast.success("Successfully logged in! Redirecting...");

            // window.location.href forces a full page reload to ensure server components (Header) update
            window.location.href = "/company/dashboard";
        } catch (err) {
            console.log(err);
            setError("Google Sign-in failed");
            toast.error("Google Sign-in failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Illustration */}
            <div className="hidden rounded-r-3xl lg:flex lg:w-1/2 bg-[rgba(108,132,254,1)] relative overflow-hidden">
                {/* Radial gradient glow effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,0,0,0.5)_0%,transparent_70%)]"></div>

                <Link href="/" className="absolute top-8 left-8  flex items-center gap-2 text-white hover:opacity-80 transition-opacity z-10">
                    <div className="bg-white p-2 rounded-md">
                        <Image src="/auth/arrow.svg" alt="Back" width={20} height={20} className="w-4 h-2.5" />
                    </div>
                    <span className="text-sm font-semibold">Back to home</span>
                </Link>

                <div className="flex flex-col items-center justify-center w-full p-12 relative z-10">
                    <Image src="/auth/image2.png" className="w-[350px] h-[400px]" alt="Illustration" width={500} height={500} />
                    <h2 className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#EFF3FF_0%,#C8C7FF_100%)] text-3xl font-semibold mt-8 text-center">
                        Re-imagining Interviews with<br />AI Intelligence
                    </h2>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[rgba(248,250,255,1)]  ">
                <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-center mb-8 items-center gap-2">
                            <Image src="/auth/logo.svg" alt="Logo" width={50} height={50} className="w-8 h-8" />
                            <div className="bg-[linear-gradient(106.63deg,#1051AB_0%,#1C0F6F_144.25%)] bg-clip-text text-transparent font-bold text-2xl">
                                bAIt
                            </div>
                        </div>

                        {/* Welcome text */}
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-semibold text-[rgba(56,59,72,0.9)]">Welcome Back</h1>
                            <p className="text-muted-foreground font-medium">
                                <span className="font-medium text-[rgba(96,117,232,1)]">Sign in</span> to continue to Bait
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Image src="/auth/email.svg" alt="Email" width={20} height={20} className="w-5 h-5 text-[rgba(10,13,26,0.9)]" />
                                    Email
                                </label>
                                <Input
                                    placeholder="you@gmail.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Image src="/auth/lock.svg" alt="Password" width={20} height={20} className="w-5 h-5 text-[rgba(10,13,26,0.9)]" />
                                    Password
                                </label>
                                <Input
                                    placeholder="••••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            {/* Remember me & Forgot password */}
                            <div className="flex items-center justify-between">
                                {/* <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        checked={rememberMe}
                                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                    />
                                    <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                                        Keep me signed in
                                    </label>
                                </div> */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button type="button" className="text-sm text-[rgba(96,117,232,1)] hover:underline">
                                            Forgot your password?
                                        </button>
                                    </DialogTrigger>
                                    <ForgotPasswordModal />
                                </Dialog>
                            </div>


                            {/* Sign in button */}
                            <div className="flex justify-center mt-10">
                                <Button
                                    type="submit"
                                    className="w-fit px-25 py-6 bg-[linear-gradient(92.1deg,#5A6CDB_-8.11%,#8D9DFD_148.24%)] hover:bg-[linear-gradient(92.1deg,#5A6CDB_-8.11%,#8D9DFD_148.24%)] text-xl text-[rgba(224,244,255,0.9)] font-medium rounded-lg"
                                    disabled={loading}
                                >
                                    Sign in
                                </Button>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white font-bold text-gray-500">OR</span>
                            </div>
                        </div>

                        {/* Google Sign in */}
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                className="w-fit gap-3 px-15 py-6 text-base font-medium text-[rgba(92,111,224,1)] hover:bg-white hover:opacity-80 hover:text-[rgba(92,111,224,1)] border-[rgba(99,112,227,1)] "
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                type="button"
                            >
                                <Image src="/auth/google.svg" alt="Google" width={20} height={20} className="w-5 h-5 translate-y-0.5 text-[rgba(10,13,26,0.9)]" />
                                Sign in with Google
                            </Button>
                        </div>


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
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent. Check your inbox!");
            setEmail("");
        } catch (error) {
            console.log(error);
            toast.error("Failed to send reset email.");
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
                <Button className="bg-[linear-gradient(92.1deg,#5A6CDB_-8.11%,#8D9DFD_148.24%)] hover:bg-[linear-gradient(92.1deg,#5A6CDB_-8.11%,#8D9DFD_148.24%)] hover:opacity-80" onClick={handleResetPassword} disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Email"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}