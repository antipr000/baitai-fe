import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { clientConfig, serverConfig } from "@/lib/auth/config";
import { BillingResultClient } from "./billing-result-client";

export default async function BillingResultPage() {
  const tokens = await getTokens(await cookies(), {
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    serviceAccount: serverConfig.serviceAccount,
  });

  return <BillingResultClient authToken={tokens?.token ?? undefined} />;
}
