"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { purchaseUserCredits } from "@/lib/api/payments";
import { useAuth } from "@/lib/auth/authContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BuyCreditsButtonProps {
  planId: string;
  className?: string;
}

export function BuyCreditsButton({ planId, className }: BuyCreditsButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleBuy = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const returnUrl = `${window.location.origin}/credits/result`;
      const { payment_url } = await purchaseUserCredits(planId, returnUrl);
      window.location.href = payment_url;
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBuy}
      disabled={loading}
      className={className}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buy"}
    </Button>
  );
}
