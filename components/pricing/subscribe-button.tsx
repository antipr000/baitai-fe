"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { subscribeCompany } from "@/lib/api/payments";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SubscribeButtonProps {
  planId: string;
  authToken?: string;
  className?: string;
  children: React.ReactNode;
}

export function SubscribeButton({ planId, authToken, className, children }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const returnUrl = `${window.location.origin}/billing/result`;
      const { payment_url, money_in_id } = await subscribeCompany(planId, returnUrl, authToken);
      localStorage.setItem("pending_money_in_id", money_in_id);
      window.location.href = payment_url;
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className={className}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </Button>
  );
}
