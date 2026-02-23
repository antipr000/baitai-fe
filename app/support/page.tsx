import { MobileNavBar } from "@/components/mobile-navbar";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { clientConfig, serverConfig } from "@/lib/auth/config";

const faqs = [
  {
    q: "How do credits work?",
    a: "Credits are used to take AI-powered interviews. Each interview costs a certain number of credits depending on the type and duration. You can purchase credit packs anytime from the pricing page.",
  },
  {
    q: "How do I get started?",
    a: "Sign up for free and you'll receive 6 credits to get started — enough for up to 2 practice interviews. No credit card required.",
  },
  {
    q: "Can I get a refund?",
    a: "Unused credits do not expire and are non-refundable. If you experience a technical issue during an interview, please contact us and we'll review your case.",
  },
  {
    q: "How do hiring teams set up interviews?",
    a: "Hiring teams can create custom AI interview templates, define scoring rubrics, and invite candidates — all from the company dashboard.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use enterprise-grade encryption and follow industry best practices for data security. Your interview data is private and never shared without your consent.",
  },
];

export default async function SupportPage() {
  const tokens = await getTokens(await cookies(), {
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    serviceAccount: serverConfig.serviceAccount,
  });

  return (
    <div className="min-h-screen bg-[rgba(245,247,255,1)] flex flex-col">
      {/* Mobile header */}
      <div className="flex sm:hidden px-5 pt-8 mb-2">
        <Link href="/" className="flex items-center space-x-2">
          <Image className="size-[20px]" src="/main/logo.png" alt="Bait AI Logo" width={40} height={40} />
          <span className="lg:text-3xl md:text-2xl text-base font-bold bg-clip-text text-transparent bg-[linear-gradient(106.63deg,rgba(16,81,171,1)_0%,rgba(28,15,111,1)_144.25%)]">bAIt</span>
        </Link>
        <MobileNavBar isAuthenticated={!!tokens} />
      </div>

      {/* Hero banner */}
      <div className="bg-[rgba(58,63,187,1)] py-8 md:py-12 px-8">
        <div className="max-w-5xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white">Help Center & Support</h1>
            <p className="text-sm md:text-base text-white/80 mt-2 max-w-2xl">
              Have a question or need assistance? We&apos;re here to help.
            </p>
          </div>
          <div className="hidden sm:block shrink-0 mt-1">
            <Link href="/">
              <Button variant="default" className="bg-transparent hover:bg-transparent font-semibold hover:opacity-80 border-2 border-white/60 hover:border-white text-white">Back Home</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-5 md:px-8 py-10 md:py-16 flex flex-col gap-12 lg:gap-16">

        {/* Contact cards */}
        <section>
          <h2 className="text-lg md:text-2xl font-semibold text-[rgba(58,63,187,1)] mb-6">Contact Us</h2>
          <div className="max-w-sm mx-auto">
            <div className="bg-white rounded-2xl border border-[rgba(58,63,187,0.15)] p-6 flex flex-col items-center text-center gap-3">
              <div className="bg-[rgba(58,63,187,0.08)] rounded-full p-3">
                <Mail className="w-6 h-6 text-[rgba(58,63,187,1)]" />
              </div>
              <h3 className="font-semibold text-[rgba(10,13,26,0.9)]">Email</h3>
              <Link href="mailto:soham@baitai.club" className="text-sm text-[rgba(58,63,187,1)] hover:opacity-80 break-all">
                soham@baitai.club
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section>
          <h2 className="text-lg md:text-2xl font-semibold text-[rgba(58,63,187,1)] mb-6">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-[rgba(58,63,187,0.15)] px-6 py-5"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none text-sm md:text-base font-semibold text-[rgba(10,13,26,0.9)]">
                  {faq.q}
                  <span className="ml-4 text-[rgba(58,63,187,1)] transition-transform group-open:rotate-180">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[rgba(10,13,26,0.6)] leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[rgba(58,63,187,1)] rounded-2xl px-6 md:px-12 py-10 md:py-14 text-center">
          <h2 className="text-lg md:text-2xl font-semibold text-white mb-3">Still need help?</h2>
          <p className="text-sm md:text-base text-white/80 mb-6 max-w-md mx-auto">
            Book a call with our team and we&apos;ll get you sorted.
          </p>
          <Link href="https://cal.com/soham-mukherjee-8yzald/30min" target="_blank" rel="noopener noreferrer">
            <Button className="bg-white text-[rgba(58,63,187,1)] hover:bg-white/90 font-semibold px-8 py-3 rounded-md text-sm md:text-base">
              Schedule a Call
            </Button>
          </Link>
        </section>

      </div>

      <Footer />
    </div>
  );
}
