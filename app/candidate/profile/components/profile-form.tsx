"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type UserProfile, type PreferencesMetadata } from "@/lib/api/server"
import api from "@/lib/api/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { z } from "zod"

const profileSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    phoneNumber: z.union([
        z.literal(""),
        z.string().trim().regex(/^\+?[\d\s\-()]{7,20}$/, "Please enter a valid phone number (e.g. +1 555-555-5555)")
    ]).optional(),
    website: z.union([
        z.literal(""),
        z.string().trim().url("Please enter a valid URL (e.g. https://example.com)")
    ]).optional(),
})


interface ProfileFormProps {
    initialData: UserProfile | null
    authToken?: string
    metadata: PreferencesMetadata
}

export function ProfileForm({ initialData, authToken, metadata }: ProfileFormProps) {
    const router = useRouter()
    const [firstName, setFirstName] = useState(initialData?.first_name || "")
    const [lastName, setLastName] = useState(initialData?.last_name || "")
    const [phoneNumber, setPhoneNumber] = useState(initialData?.phone_number || "")
    const [location, setLocation] = useState(initialData?.location || "")
    const [website, setWebsite] = useState(initialData?.website || "")
    const [role, setRole] = useState(initialData?.role || "")
    const [experience, setExperience] = useState(initialData?.experience || "")

    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const isFirstNameChanged = firstName !== (initialData?.first_name || "")
        const isLastNameChanged = lastName !== (initialData?.last_name || "")
        const isPhoneNumberChanged = phoneNumber !== (initialData?.phone_number || "")
        const isLocationChanged = location !== (initialData?.location || "")
        const isWebsiteChanged = website !== (initialData?.website || "")
        const isRoleChanged = role !== (initialData?.role || "")
        const isExperienceChanged = experience !== (initialData?.experience || "")

        setHasChanges(isFirstNameChanged || isLastNameChanged || isPhoneNumberChanged || isLocationChanged || isWebsiteChanged || isRoleChanged || isExperienceChanged)
    }, [firstName, lastName, phoneNumber, location, website, role, experience, initialData])

    const handleSave = async () => {
        const validationResult = profileSchema.safeParse({
            firstName,
            lastName,
            phoneNumber,
            website,
        })

        if (!validationResult.success) {
            validationResult.error.issues.forEach(err => {
                toast.error(err.message)
            })
            return
        }

        setIsSaving(true)
        try {
            const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
            await api.patch('/api/v1/user/me/', {
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
                location: location,
                website: website,
                role: role || null,
                experience: experience || null
            }, { headers })

            toast.success("Profile updated successfully")
            setHasChanges(false)
            router.refresh()
        } catch (error) {
            toast.error("Failed to update profile. Please try again.")
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="relative pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-[rgba(17,24,39,0.8)]">First Name</Label>
                    <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="h-11 border-[rgba(58,63,187,0.2)] rounded-lg shadow-sm font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-[rgba(17,24,39,0.8)]">Last Name</Label>
                    <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="h-11 border-[rgba(58,63,187,0.2)] rounded-lg shadow-sm font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-[rgba(17,24,39,0.8)]">Email ID</Label>
                    <Input
                        defaultValue={initialData?.email}
                        placeholder="johndoe@gmail.com"
                        readOnly
                        className="h-11 border-[rgba(58,63,187,0.2)] rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-[rgba(17,24,39,0.8)]">Phone Number</Label>
                    <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+15550000000"
                        className="h-11 border-[rgba(58,63,187,0.2)] rounded-lg shadow-sm font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-[rgba(17,24,39,0.8)]">Location</Label>
                    <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="San Francisco, CA "
                        className="h-11 border-[rgba(58,63,187,0.2)] rounded-lg shadow-sm font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-[rgba(17,24,39,0.8)]">Website/Portfolio URL</Label>
                    <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourportfolio.com"
                        className="h-11 border-[rgba(58,63,187,0.2)] rounded-lg shadow-sm font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-[rgba(17,24,39,0.8)]">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="w-full h-11 border-[#E2E8F0] rounded-lg shadow-sm  bg-transparent text-sm ">
                            <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                            {metadata.roles.map((r) => (
                                <SelectItem key={r} value={r}>
                                    {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-[13px] font-semibold text-[rgba(17,24,39,0.8)]">Experience Level</Label>
                    <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger className="w-full h-11 border-[#E2E8F0] rounded-lg shadow-sm  bg-transparent text-sm ">
                            <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                            {metadata.experience_levels.map((exp) => (
                                <SelectItem key={exp.value} value={exp.value}>
                                    {exp.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="absolute -bottom-4 right-0 flex gap-4">
                {hasChanges && (
                    <Button
                        variant="outline"
                        className="border-[rgba(58,63,187,0.2)] text-[rgba(10,13,26,1)] h-10 px-6 font-medium text-sm"
                        onClick={() => {
                            setFirstName(initialData?.first_name || "")
                            setLastName(initialData?.last_name || "")
                            setPhoneNumber(initialData?.phone_number || "")
                            setLocation(initialData?.location || "")
                            setWebsite(initialData?.website || "")
                            setRole(initialData?.role || "")
                            setExperience(initialData?.experience || "")
                        }}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    className="bg-[rgba(58,63,187,1)] disabled:bg-[rgba(58,63,187,0.95)] hover:bg-[rgba(58,63,187,0.9)] hover:opacity-90 text-white h-10 px-6 font-medium text-sm"
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                >
                    {isSaving ? "Saving..." : "Save changes"}
                </Button>
            </div>
        </div>
    )
}
