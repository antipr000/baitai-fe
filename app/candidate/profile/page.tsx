import { Suspense } from 'react'
import { getTokens } from "next-firebase-auth-edge"
import { cookies } from "next/headers"
import { clientConfig, serverConfig } from "@/lib/auth/config"
import { ProfileHeader } from './components/profile-header'
import { ProfileForm } from './components/profile-form'
import { ResumeSection } from './components/resume-section'
import { serverFetch, getUserProfile, getPreferencesMetadata, UserProfile } from '@/lib/api/server'
import { Skeleton } from '@/components/ui/skeleton'

import { ResumeCheckResponse } from '@/lib/api/resume'

async function ProfileContent() {
    const [tokens, userProfile, resumeCheck, preferences] = await Promise.all([
        getTokens(await cookies(), {
            apiKey: clientConfig.apiKey,
            cookieName: serverConfig.cookieName,
            cookieSignatureKeys: serverConfig.cookieSignatureKeys,
            serviceAccount: serverConfig.serviceAccount,
        }),
        getUserProfile(),
        serverFetch<ResumeCheckResponse>('/api/v1/resume/check/').catch(() => null),
        getPreferencesMetadata()
    ])

    return (
        <div className="mt-8 space-y-6">
            <ProfileForm 
                initialData={userProfile} 
                authToken={tokens?.token} 
                metadata={preferences || { roles: [], experience_levels: [] }} 
            />
            <ResumeSection initialResume={resumeCheck?.resume || null} authToken={tokens?.token} />
        </div>
    )
}

function ProfileSkeleton() {
    return (
        <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-11 w-full rounded-lg" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-11 w-full rounded-lg" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-11 w-full rounded-lg" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-11 w-full rounded-lg" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-11 w-full rounded-lg" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-11 w-full rounded-lg" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-11 w-full rounded-lg" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-11 w-full rounded-lg" /></div>
            </div>
            <div className="space-y-3 pt-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-[184px] w-full rounded-xl" />
            </div>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <div className="min-h-screen w-full p-8 lg:p-10 pb-20 max-w-4xl mx-auto flex justify-center">
            <div className="w-full max-w-3xl">
                <ProfileHeader />
                <Suspense fallback={<ProfileSkeleton />}>
                    <ProfileContent />
                </Suspense>
            </div>
        </div>
    )
}
