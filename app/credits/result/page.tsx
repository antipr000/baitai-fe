"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { verifyUserSession } from "@/lib/api/payments";

type ResultState = "verifying" | "paid" | "processing" | "cancelled" | "error";

const MAX_ATTEMPTS = 5;
const DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function CreditResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  const [state, setState] = useState<ResultState>(
    status === "cancelled" ? "cancelled" : "verifying"
  );
  const [credits, setCredits] = useState<number | null>(null);

  const verify = useCallback(async (sid: string, attempt = 1) => {
    try {
      const res = await verifyUserSession(sid);

      if (res.status === "paid") {
        setCredits(res.credits ?? null);
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
            <h1 className="text-2xl font-bold text-[rgba(10,13,26,0.9)]">Confirming Payment...</h1>
            <p className="text-sm text-[rgba(10,13,26,0.6)] leading-relaxed">
              Please wait while we verify your payment with Stripe.
            </p>
          </>
        )}

        {state === "paid" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-[#4fc238]" />
            <h1 className="text-2xl font-bold text-[rgba(10,13,26,0.9)]">Payment Successful!</h1>
            <p className="text-sm text-[rgba(10,13,26,0.6)] leading-relaxed">
              {credits
                ? `${credits} credits have been added to your account.`
                : "Your credits have been added to your account."}
            </p>
            <div className="flex gap-3 mt-4">
              <Link href="/candidate/dashboard">
                <Button className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,0.9)] text-white font-semibold px-6">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="font-semibold border-[rgba(58,63,187,0.3)] text-[rgba(58,63,187,1)]">
                  Buy More
                </Button>
              </Link>
            </div>
          </>
        )}

        {state === "processing" && (
          <>
            <Clock className="w-16 h-16 text-[rgba(58,63,187,0.7)]" />
            <h1 className="text-2xl font-bold text-[rgba(10,13,26,0.9)]">Payment Received</h1>
            <p className="text-sm text-[rgba(10,13,26,0.6)] leading-relaxed">
              Your payment was received but credits are still being processed. They will appear in your account shortly.
            </p>
            <Link href="/candidate/dashboard" className="mt-4">
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
              Your payment was not completed. No charges were made. You can try again anytime.
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
              <Link href="/candidate/dashboard">
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

export default function CreditResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[rgba(245,247,255,1)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[rgba(58,63,187,1)] animate-spin" />
      </div>
    }>
      <CreditResultContent />
    </Suspense>
  );
}
