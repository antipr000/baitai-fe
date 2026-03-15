import { serverFetch } from "@/lib/api/server";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { clientConfig, serverConfig } from "@/lib/auth/config";
import PreferencesClient from "./components/preferences-client";

interface PreferencesMetadata {
    roles: string[];
    experience_levels: { value: string; label: string }[];
}

export default async function PreferencesPage() {
    const [tokens, metadata] = await Promise.all([
        getTokens(await cookies(), {
            apiKey: clientConfig.apiKey,
            cookieName: serverConfig.cookieName,
            cookieSignatureKeys: serverConfig.cookieSignatureKeys,
            serviceAccount: serverConfig.serviceAccount,
        }),
        serverFetch<PreferencesMetadata>("/api/v1/user/preferences/metadata")
    ]);

    if (!metadata) {
        return <div>Loading...</div>; // Or some fallback
    }

    return <PreferencesClient metadata={metadata} authToken={tokens?.token} />;
}
