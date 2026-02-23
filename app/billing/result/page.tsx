"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

function BillingResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-[rgba(245,247,255,1)] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-[rgba(58,63,187,0.15)] p-8 md:p-12 max-w-md w-full text-center flex flex-col items-center gap-4">
        {isSuccess ? (
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
        ) : (
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
      </div>
    </div>
  );
}

export default function BillingResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[rgba(245,247,255,1)] flex items-center justify-center">
        <div className="text-[rgba(58,63,187,1)] font-medium">Loading...</div>
      </div>
    }>
      <BillingResultContent />
    </Suspense>
  );
}
