import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SubscribeButton } from "@/components/pricing/subscribe-button";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { clientConfig, serverConfig } from "@/lib/auth/config";

const plans = [
  {
    name: "Starter",
    planId: "pln_starter",
    price: "$29/month",
    description: "For small teams hiring smarter with AI.",
    features: [
      { icon: "/pricing/person.svg", text: "1 recruiter seat" },
      { icon: "/pricing/template.svg", text: "5 active AI Templates" },
      { icon: "/pricing/brain.svg", text: "30–50 interviews per month" },
      { icon: "/pricing/chart.svg", text: "Scoring, analytics, and feedback" },
      { icon: "/pricing/puzzle.svg", text: "Basic integrations" },
      { icon: "/pricing/email.svg", text: "Email Support" },
    ],
    button: "Select Plan",
    href: null,
  },
  {
    name: "Pro",
    planId: "pln_pro",
    price: "$99/month",
    description: "For growing teams hiring at scale.",
    features: [
      { icon: "/pricing/person.svg", text: "5 recruiter seats" },
      { icon: "/pricing/template.svg", text: "50 active AI interview templates" },
      { icon: "/pricing/brain.svg", text: "150–200 interviews per month" },
      { icon: "/pricing/wheel.svg", text: "Custom interview rubrics & feedback design" },
      { icon: "/pricing/chart.svg", text: "Scoring, analytics, and feedback" },
      { icon: "/pricing/puzzle.svg", text: "Advanced analytics & reporting" },
      { icon: "/pricing/star.svg", text: "Priority support" },
    ],
    button: "Select Plan",
    href: null,
  },
  {
    name: "Enterprise",
    planId: null,
    price: "Custom",
    description: "For organizations building custom, large-scale AI interview systems.",
    features: [
      { icon: "/pricing/loop.svg", text: "Unlimited recruiter seats & templates" },
      { icon: "/pricing/wheel.svg", text: "Custom AI models & scoring logic" },
      { icon: "/pricing/laptop.svg", text: "Integrated coding IDE & design interview builder" },
      { icon: "/pricing/shield.svg", text: "SSO & enterprise-grade security" },
      { icon: "/pricing/person2.svg", text: "Dedicated success manager" },
      { icon: "/pricing/star.svg", text: "Custom integrations & SLA support" },
    ],
    button: "Chat with us",
    href: "https://cal.com/soham-mukherjee-8yzald/30min",
  },
];

export default async function CompanyPricingPage() {
  const tokens = await getTokens(await cookies(), {
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    serviceAccount: serverConfig.serviceAccount,
  });
  return (
    <div className="min-h-screen bg-[rgba(245,247,255,1)] flex flex-col items-center py-10 px-2">
      <div className="max-w-7xl p-5 mx-auto w-full mb-8">
        <div className="justify-between flex w-full mb-6">
          <div>
            <h1 className="md:text-4xl text-xl font-semibold mb-2 text-transparent bg-clip-text bg-[linear-gradient(99.18deg,rgba(0,13,144,0.9)_-7.75%,#5D6BEE_98.02%)]">
              Choose your plan
            </h1>
            <p className="text-sm md:text-base text-[rgba(10,13,26,0.5)]">
              Select a plan that fits your team&apos;s hiring needs.
            </p>
          </div>
          <div className="hidden sm:block">
            <Link href="/company/dashboard">
              <Button variant="default" className="bg-transparent hover:bg-transparent font-semibold hover:opacity-80 border-2 border-[rgba(52,31,131,0.6)] hover:border-[rgba(52,31,131,0.6)] text-[rgba(52,31,131,1)]">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex lg:mx-20 lg:px-0 flex-col items-center md:flex-row flex-0 gap-4 shrink-0 justify-center md:items-start">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "w-full shadow-2xs bg-[rgba(58,63,187,1)] rounded-2xl border border-[rgba(58,63,187,0.2)] relative",
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex lg:flex-row md:flex-col flex-row items-center justify-between">
                  <CardTitle className="sm:text-3xl text-xl font-semibold text-[rgba(255,255,255,1)]">{plan.name}</CardTitle>
                  <span className="sm:text-lg text-base font-semibold text-[rgba(255,255,255,0.9)]">{plan.price}</span>
                </div>
                <CardDescription className="text-xs mt-1 font-medium text-[rgba(255,255,255,0.9)]">{plan.description}</CardDescription>
                <div className="h-px w-full bg-[rgba(32,5,116,0.1)] mt-3" />
              </CardHeader>
              <CardContent className="pt-2 pb-0">
                <ul className="space-y-3 mb-4 mt-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 sm:text-sm text-xs text-[rgba(255,255,255,0.9)] font-medium">
                      <Image src={feature.icon} alt={feature.text} width={20} height={20} className="w-6 h-6 object-contain" aria-hidden />
                      <span className="sm:text-sm text-xs">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-6">
                {plan.href ? (
                  <Link href={plan.href} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button
                      className="w-full py-2 sm:text-base text-xs border-2 font-semibold border-[rgba(255,255,255,1)] text-white hover:text-white hover:opacity-80 bg-transparent hover:bg-transparent"
                    >
                      {plan.button}
                    </Button>
                  </Link>
                ) : plan.planId ? (
                  <SubscribeButton
                    planId={plan.planId}
                    authToken={tokens?.token ?? undefined}
                    className="w-full py-2 sm:text-base text-xs border-2 font-semibold border-[rgba(255,255,255,1)] text-white hover:text-white hover:opacity-80 bg-transparent hover:bg-transparent"
                  >
                    {plan.button}
                  </SubscribeButton>
                ) : (
                  <Button
                    className="w-full py-2 sm:text-base text-xs border-2 font-semibold border-[rgba(255,255,255,1)] text-white hover:text-white hover:opacity-80 bg-transparent hover:bg-transparent"
                  >
                    {plan.button}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
