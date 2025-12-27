"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface WaitlistFormProps {
  children: React.ReactNode;
}

export function WaitlistForm({ children }: WaitlistFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/v1/waitlist/', { name, email });
      toast.success("Successfully joined the waitlist!");
      setName("");
      setEmail("");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="items-center">
          <DialogTitle className="text-2xl font-bold text-center mb-2 text-[rgba(58,63,187,1)]">Join Early Access</DialogTitle>
          <DialogDescription className="text-center font-medium mb-4">
            Join the waitlist and get <span className="text-blue-600 font-semibold">5 extra credits—up to 2 interviews</span>,<br />
            available only to our earliest users
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4 mt-2 w-full max-w-md mx-auto" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1 text-left">
            <label htmlFor="waitlist-name" className="font-medium flex items-center gap-2">
              <Image src="/main/waitlist/user.svg" alt="User Icon" width={20} height={20} />
              <span className="-translate-y-px text-[rgba(10,13,26,0.9)]">Full Name</span>
            </label>
            <Input
              className="border md:placeholder:text-base placeholder:text-sm border-[rgba(107,124,255,0.2)]"
              id="waitlist-name"
              name="name"
              type="text"
              placeholder="John Smith"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <label htmlFor="waitlist-email" className="font-medium flex items-center gap-2">
              <Image src="/main/waitlist/mail.svg" alt="Mail Icon" width={20} height={20} />
              <span className="-translate-y-px text-[rgba(10,13,26,0.9)]">Email</span>
            </label>
            <Input
              className="border md:placeholder:text-base placeholder:text-sm border-[rgba(107,124,255,0.2)]"
              id="waitlist-email"
              name="email"
              type="email"
              placeholder="you@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full bg-[rgba(58,63,187,1)] hover:bg-[rgba(69,94,255,0.9)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-md py-3 text-lg transition-colors"
          >
            {isSubmitting ? "Joining..." : "Join Waitlist"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}