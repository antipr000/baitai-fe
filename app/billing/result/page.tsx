"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { verifyCompanySession } from "@/lib/api/payments";

type ResultState = "verifying" | "paid" | "processing" | "cancelled" | "error";

const MAX_ATTEMPTS = 5;
const DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function BillingResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  const [state, setState] = useState<ResultState>(
    status === "cancelled" ? "cancelled" : "verifying"
  );

  const verify = useCallback(async (sid: string, attempt = 1) => {
    try {
      const res = await verifyCompanySession(sid);

      if (res.status === "paid") {
        setState("paid");
        localStorage.removeItem("pending_money_in_id");
        return;
      }

      if (attempt < MAX_ATTEMPTS) {
        await sleep(DELAY_MS);
        return verify(sid, attempt + 1);
      }

      setState("processing");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (status === "success" && sessionId) {
      verify(sessionId);
    } else if (status !== "cancelled") {
      setState("error");
    }
  }, [status, sessionId, verify]);

  return (
    <div className="min-h-screen bg-[rgba(245,247,255,1)] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[rgba(58,63,187,0.15)] p-8 md:p-12 max-w-md w-full text-center flex flex-col items-center gap-4">

        {state === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 text-[rgba(58,63,187,1)] animate-spin" />
            <h1 className="text-2xl font-bold text-[rgba(10,13,26,0.9)]">Confirming Subscription...</h1>
            <p className="text-sm text-[rgba(10,13,26,0.6)] leading-relaxed">
              Please wait while we verify your payment with Stripe.
            </p>
          </>
        )}

        {state === "paid" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-[#4fc238]" />
            <h1 className="text-2xl font-bold text-[rgba(10,13,26,0.9)]">Subscription Active!</h1>
            <p className="text-sm text-[rgba(10,13,26,0.6)] leading-relaxed">
              Your subscription is now active. Your team can start using all the features included in your plan.
            </p>
            <Link href="/company/dashboard" className="mt-4">
              <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold px-6">
                Go to Dashboard
              </Button>
            </Link>
          </>
        )}

        {state === "processing" && (
          <>
            <Clock className="w-16 h-16 text-[rgba(58,63,187,0.7)]" />
            <h1 className="text-2xl font-bold text-[rgba(10,13,26,0.9)]">Payment Received</h1>
            <p className="text-sm text-[rgba(10,13,26,0.6)] leading-relaxed">
              Your payment was received but the subscription is still being activated. It will be ready shortly.
            </p>
            <Link href="/company/dashboard" className="mt-4">
              <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold px-6">
                Go to Dashboard
              </Button>
            </Link>
          </>
        )}

        {state === "cancelled" && (
          <>
            <XCircle className="w-16 h-16 text-[rgba(220,60,60,0.8)]" />
            <h1 className="text-2xl font-bold text-[rgba(10,13,26,0.9)]">Payment Cancelled</h1>
            <p className="text-sm text-[rgba(10,13,26,0.6)] leading-relaxed">
              Your subscription was not completed. No charges were made. You can try again anytime.
            </p>
            <Link href="/pricing" className="mt-4">
              <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold px-6">
                Back to Pricing
              </Button>
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="w-16 h-16 text-[rgba(220,60,60,0.8)]" />
            <h1 className="text-2xl font-bold text-[rgba(10,13,26,0.9)]">Something Went Wrong</h1>
            <p className="text-sm text-[rgba(10,13,26,0.6)] leading-relaxed">
              We couldn&apos;t verify your payment. Please check your dashboard or contact support.
            </p>
            <div className="flex gap-3 mt-4">
              <Link href="/company/dashboard">
                <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold px-6">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" className="font-semibold border-[rgba(58,63,187,0.3)] text-[rgba(58,63,187,1)]">
                  Contact Support
                </Button>
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function BillingResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[rgba(245,247,255,1)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[rgba(58,63,187,1)] animate-spin" />
      </div>
    }>
      <BillingResultContent />
    </Suspense>
  );
}
