"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import api from "@/lib/api/client";
import Image from "next/image";

interface WaitlistFormProps {
  children: React.ReactNode;
  templateId: string;
  authToken?: string;
}

export function InviteForm({ children, templateId, authToken }: WaitlistFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const emailList = emails.split(',').map(e => e.trim()).filter(e => e.length > 0);

      if (emailList.length === 0) {
        toast.error("Please enter at least one valid email address");
        setIsSubmitting(false);
        return;
      }

      await api.post('/api/v1/company/interviews/invites/', {
        template_id: templateId,
        emails: emailList,
        message
      }, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
      });

      toast.success("Invites sent successfully!");
      setEmails("");
      setMessage("");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send invites. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="items-start text-left">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 rounded-sm">
              <Image src="/company/candidates/mail2.svg" width={20} height={20} alt="Mail" className="h-5 w-5 " />
            </div>
            <DialogTitle className="text-xl font-semibold text-[rgba(10,13,26,0.9)]">Send Interview Invites</DialogTitle>
          </div>
          <DialogDescription className="text-[rgba(10,13,26,0.6)] text-sm">
            Invite candidates to take the "Software Engineer Interview" interview.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-6 mt-4" onSubmit={handleSubmit}>

          <div className="flex flex-col gap-2">
            <label htmlFor="emails" className="text-sm font-semibold text-gray-900">
              Email Addresses
            </label>
            <Input
              id="emails"
              className="bg-blue-50/30 border-blue-100 focus-visible:ring-[rgba(107,124,255,1)] placeholder:text-gray-400"
              placeholder="Enter email address"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              disabled={isSubmitting}
              autoComplete="off"
            />
            <p className="text-xs text-gray-500">
              Press Enter or comma to add. Paste multiple emails separated by commas.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-semibold text-gray-900">
              Custom Message (Optional)
            </label>
            <Textarea
              id="message"
              className="min-h-[120px] bg-blue-50/30 border-blue-100 focus-visible:ring-[rgba(107,124,255,1)] placeholder:text-gray-400 resize-none"
              placeholder="Add a personalized message to include in the invitation email"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="flex gap-3 sm:justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-[rgba(220,123,6,1)] text-[rgba(220,123,6,1)] hover:bg-[rgba(220,123,6,0.7)] hover:text-white   w-full sm:w-auto px-8"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!emails || isSubmitting}
              className="bg-[rgba(84,104,252,1)] border  hover:border-[rgba(68,84,252,1)] hover:bg-white text-white hover:text-[rgba(84,104,252,1)] w-full sm:w-auto px-6 gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                <path d="M19.8982 0.0741936C19.8092 -0.00389305 19.6825 -0.0220096 19.5751 0.027796L0.172992 9.04256C0.068538 9.09111 0.00127346 9.19533 1.78559e-05 9.31049C-0.00123775 9.42564 0.0638146 9.53129 0.167253 9.58206L5.65801 12.2767C5.7587 12.3262 5.87876 12.315 5.96869 12.2478L11.3072 8.25769L7.11625 12.5686C7.05646 12.6301 7.02597 12.7144 7.03254 12.7999L7.44982 18.2342C7.45909 18.3546 7.53981 18.4576 7.65455 18.4953C7.68522 18.5053 7.71673 18.5102 7.74788 18.5102C7.83332 18.5102 7.91643 18.4736 7.97425 18.4066L10.8886 15.0295L14.4913 16.7509C14.5695 16.7883 14.66 16.7898 14.7394 16.7553C14.8189 16.7207 14.8794 16.6533 14.9054 16.5707L19.9863 0.388513C20.0218 0.275509 19.9872 0.15228 19.8982 0.0741936Z" fill="currentColor" />
              </svg>
              Send Invites
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}