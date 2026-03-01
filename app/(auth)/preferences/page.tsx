"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api/client";
import { useAuth } from "@/lib/auth/authContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ROLES = [
    { value: "software_engineer", label: "Software Engineer" },
    { value: "frontend_engineer", label: "Frontend Engineer" },
    { value: "backend_engineer", label: "Backend Engineer" },
    { value: "fullstack_engineer", label: "Fullstack Engineer" },
    { value: "data_scientist", label: "Data Scientist" },
    { value: "data_engineer", label: "Data Engineer" },
    { value: "ml_engineer", label: "ML Engineer" },
    { value: "devops_engineer", label: "DevOps Engineer" },
    { value: "mobile_engineer", label: "Mobile Engineer" },
    { value: "qa_engineer", label: "QA Engineer" },
    { value: "product_manager", label: "Product Manager" },
    { value: "designer", label: "Designer" },
    { value: "other", label: "Other" },
] as const;

const EXPERIENCE_LEVELS = [
    { value: "entry_level", label: "Entry Level" },
    { value: "mid_level", label: "Mid Level" },
    { value: "senior", label: "Senior" },
    { value: "staff", label: "Staff" },
    { value: "principal", label: "Principal" },
    { value: "manager", label: "Manager" },
    { value: "director", label: "Director" },
    { value: "vp", label: "VP" },
    { value: "c_level", label: "C-Level" },
] as const;

export default function PreferencesPage() {
    const router = useRouter();
    const { setPreferencesStatus } = useAuth();
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!role) {
            toast.error("Please select your role.");
            return;
        }
        if (!experience) {
            toast.error("Please select your experience level.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/v1/user/preferences/", { role, experience });
            setPreferencesStatus(true);
            toast.success("Preferences saved!");
            router.push("/candidate/dashboard");
        } catch {
            toast.error("Failed to save preferences. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[rgba(245,247,255,1)] flex flex-col relative w-full font-sans">
            {/* Back Home Button */}
            <div className="absolute top-8 left-8 pb-2">
                <Link href="/">
                    <Button
                        variant="outline"
                        className="hidden md:flex gap-2 border-[rgba(58,63,187,0.2)] text-[rgba(10,13,26,1)] hover:bg-gray-50 px-6"
                    >
                        Back Home
                    </Button>
                    <Image
                        src="/home.svg"
                        alt="Home"
                        width={20}
                        height={20}
                        className="w-5 h-5 md:hidden"
                    />
                </Link>
            </div>

            {/* Top gradient separator */}
            <Separator className="absolute top-20 border-gray-200/20 left-0 w-full h-[2px]!" />

            <div className="flex-1 flex flex-col mt-26 items-center lg:justify-center p-4 py-0 md:py-4">
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
                    <span className="md:text-3xl text-2xl font-semibold text-transparent bg-clip-text bg-[linear-gradient(106.63deg,#1051AB_0%,#1C0F6F_144.25%)]">
                        bAlt
                    </span>
                </div>

                {/* Card Container */}
                <Card className="w-full md:max-w-[520px] max-w-[420px] border-none shadow-sm bg-[rgba(236,239,255,1)] rounded-xl overflow-hidden">
                    <CardContent className="md:p-8 p-5 w-full flex flex-col items-center">
                        <h1 className="md:text-2xl text-xl font-semibold text-center mb-2 text-[rgba(10,13,26,1)]">
                            Tell us about <span className="text-[rgba(107,124,255,1)]">Yourself</span>
                        </h1>
                        <p className="md:text-base text-sm text-[rgba(10,13,26,0.7)] text-center mb-8">
                            Help us personalize your experience
                        </p>

                        <form onSubmit={handleSubmit} className="w-full space-y-5">
                            {/* Role */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 md:text-base text-sm font-medium text-[rgba(10,13,26,1)]">
                                    <Image
                                        src="/auth/user2.svg"
                                        alt="Role"
                                        width={20}
                                        height={20}
                                    />
                                    Your Role
                                </label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="w-full md:h-12 h-11 bg-[rgba(245,247,255,1)] border-[rgba(58,63,187,0.2)] text-sm md:text-base">
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map((r) => (
                                            <SelectItem key={r.value} value={r.value}>
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Experience */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 md:text-base text-sm font-medium text-[rgba(10,13,26,1)]">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-[rgba(10,13,26,0.8)]"
                                    >
                                        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                                        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                                        <path d="M12 2v2" />
                                        <path d="M12 22v-2" />
                                        <path d="m17 20.66-1-1.73" />
                                        <path d="M11 10.27 7 3.34" />
                                        <path d="m20.66 17-1.73-1" />
                                        <path d="m3.34 7 1.73 1" />
                                        <path d="M14 12h8" />
                                        <path d="M2 12h2" />
                                        <path d="m20.66 7-1.73 1" />
                                        <path d="m3.34 17 1.73-1" />
                                        <path d="m17 3.34-1 1.73" />
                                        <path d="m11 13.73-4 6.93" />
                                    </svg>
                                    Experience Level
                                </label>
                                <Select value={experience} onValueChange={setExperience}>
                                    <SelectTrigger className="w-full md:h-12 h-11 bg-[rgba(245,247,255,1)] border-[rgba(58,63,187,0.2)] text-sm md:text-base">
                                        <SelectValue placeholder="Select your experience level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXPERIENCE_LEVELS.map((exp) => (
                                            <SelectItem key={exp.value} value={exp.value}>
                                                {exp.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full md:h-14 h-12 bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white flex items-center justify-center gap-2 md:text-base text-sm font-medium rounded-md transition-colors duration-200 mt-4"
                                disabled={loading || !role || !experience}
                            >
                                {loading ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <>
                                        Continue
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-arrow-right"
                                        >
                                            <path d="M5 12h14" />
                                            <path d="m12 5 7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
