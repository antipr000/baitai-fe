import { Footer } from "@/components/footer";
import Header from "@/components/header";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Bait AI",
  description:
    "Learn how Bait AI collects, uses, and protects your data, including our use of PostHog analytics.",
};

export default async function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[rgba(245,247,255,1)] flex flex-col">
      <Header />

      <main className="w-full max-w-4xl mx-auto px-6 md:px-10 lg:px-16 pt-32 md:pt-40 pb-16">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[rgba(10,13,26,1)] mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-10">
          Last updated: February 18, 2026
        </p>

        <div className="space-y-8 text-[rgba(10,13,26,0.8)]">
          <section className="space-y-3">
            <p className="text-sm md:text-base leading-relaxed">
              Bait AI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
              operates the baitai.club platform. We collect account, interview,
              usage, and device data to provide and improve our services.
              We do not sell your personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-[rgba(10,13,26,1)]">
              Analytics
            </h2>
            <p className="text-sm md:text-base leading-relaxed">
              We use{" "}
              <Link
                href="https://posthog.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgba(69,94,255,0.8)] underline hover:opacity-70"
              >
                PostHog
              </Link>{" "}
              for product analytics including page views, feature usage, and
              session recordings (all text inputs are masked).Data is processed on
              US-based infrastructure.
            </p>
            <p className="text-sm md:text-base leading-relaxed">
              PostHog is <span className="font-medium">not loaded</span> for
              users in the EU/EEA, UK, Switzerland, Norway, Iceland, or
              Liechtenstein. No analytics cookies or tracking scripts run in
              these regions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold text-[rgba(10,13,26,1)]">
              Your Rights &amp; Contact
            </h2>
            <p className="text-sm md:text-base leading-relaxed">
              You may request access, correction, or deletion of your data at
              any time by contacting{" "}
              <Link
                href="mailto:soham@baitai.club"
                className="text-[rgba(69,94,255,0.8)] underline hover:opacity-70"
              >
                soham@baitai.club
              </Link>
              . We may update this policy and will reflect changes with a new
              &quot;Last updated&quot; date above.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
