"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { subscribeCompany } from "@/lib/api/payments";
import { useAuth } from "@/lib/auth/authContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SubscribeButtonProps {
  planId: string;
  className?: string;
  children: React.ReactNode;
}

export function SubscribeButton({ planId, className, children }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const returnUrl = `${window.location.origin}/billing/result`;
      const { payment_url } = await subscribeCompany(planId, returnUrl);
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
