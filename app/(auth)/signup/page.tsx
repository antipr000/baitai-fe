'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, browserLocalPersistence, browserSessionPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import api from "@/lib/api/client";

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                router.push("/candidate/dashboard");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!agreedToTerms) {
            setError("You must agree to the terms and conditions.");
            toast.error("You must agree to the terms and conditions.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            toast.error("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password should be at least 6 characters long.");
            toast.error("Password should be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            await auth.setPersistence(rememberMe ? browserLocalPersistence : browserSessionPersistence);
            // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await api.post('api/v1/user/signup/', {
                email: email.trim(),
                password,
                full_name: fullName.trim()
            });
            await signInWithEmailAndPassword(auth, email.trim(), password);
            toast.success("Account created successfully!");
            router.push("/candidate/dashboard");
        } catch (err) {
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
            toast.success("Successfully signed up! Redirecting...");
            router.push("/candidate/dashboard");
        } catch (err) {
            console.log(err);
            setError("Google Sign-up failed");
            toast.error("Google Sign-up failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Right Panel - Illustration */}
            <div className="hidden rounded-l-3xl lg:flex lg:w-1/2 bg-[rgba(108,132,254,1)] relative overflow-hidden order-2">
                {/* Radial gradient glow effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,0,0,0.5)_0%,transparent_70%)]"></div>
                <div className="flex flex-col items-center justify-center w-full p-12 relative z-10">
                    <Image src="/auth/image2.png" className="w-[350px] h-[400px]" alt="Illustration" width={500} height={500} />
                    <h2 className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#EFF3FF_0%,#C8C7FF_100%)] text-3xl font-semibold mt-8 text-center">
                        Re-imagining Interviews with<br />AI Intelligence
                    </h2>
                </div>
            </div>

            {/* Left Panel - Form */}
            <div className="flex-1 relative flex items-center justify-center p-8 bg-[rgba(248,250,255,1)] order-1">
                <Link href="/" className="flex absolute top-8 left-8 items-center gap-2 text-[rgba(96,117,232,1)] hover:opacity-80 transition-opacity mb-4">
                    <div className="bg-[rgba(98,117,252,0.82)] p-2 rounded-md border border-gray-200">
                        <Image src="/auth/arrow2.svg" alt="Back" width={20} height={20} className="w-4 h-2.5" />
                    </div>
                    <span className="text-sm font-semibold">Back to home</span>
                </Link>
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
                            <h1 className="text-3xl font-semibold text-[rgba(56,59,72,0.9)]">Get Started Now</h1>
                            <p className="text-muted-foreground font-medium">
                                <span className="font-medium text-[rgba(96,117,232,1)]">Sign up</span> to continue to Bait
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSignup} className="space-y-5">
                            {/* Full Name Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Image src="/auth/user.svg" alt="Full Name" width={20} height={20} className="w-5 h-5 text-[rgba(10,13,26,0.9)]" />
                                    Full Name
                                </label>
                                <Input
                                    placeholder="John Smith"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

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

                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Image src="/auth/lock.svg" alt="Confirm Password" width={20} height={20} className="w-5 h-5 text-[rgba(10,13,26,0.9)]" />
                                    Confirm Password
                                </label>
                                <Input
                                    placeholder="••••••••••"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            {/* Terms and conditions */}
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="terms"
                                    checked={agreedToTerms}
                                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                                    I have read and agree to the terms and conditions
                                </label>
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                />
                                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                                    Keep me signed in
                                </label>
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            {/* Sign up button */}
                            <div className="flex justify-center mt-10">
                                <Button
                                    type="submit"
                                    className="w-fit px-25 py-6 bg-[linear-gradient(92.1deg,#5A6CDB_-8.11%,#8D9DFD_148.24%)] hover:bg-[linear-gradient(92.1deg,#5A6CDB_-8.11%,#8D9DFD_148.24%)] text-xl text-[rgba(224,244,255,0.9)] font-medium rounded-lg"
                                    disabled={loading}
                                >
                                    {loading ? "Signing up..." : "Sign up"}
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

                        {/* Sign in link */}
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[rgba(96,117,232,1)] hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}