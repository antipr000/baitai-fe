

import { MobileNavBar } from "@/components/mobile-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { clientConfig, serverConfig } from "@/lib/auth/config";
import { BuyCreditsButton } from "@/components/pricing/buy-credits-button";
import { SubscribeButton } from "@/components/pricing/subscribe-button";

const plans = [
  {
    name: "Starter",
    planId: "pln_starter",
    price: "$29/month",
    highlight: false,
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
    highlight: true,
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
    highlight: false,
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



const creditPacks = [
  { credits: 10,   interviews: 3,   price: "$1.99",  planId: "ucpln_10_credits" },
  { credits: 25,   interviews: 8,   price: "$3.99",  planId: "ucpln_25_credits" },
  { credits: 50,   interviews: 15,  price: "$6.99",  planId: "ucpln_50_credits" },
  { credits: 100,  interviews: 30,  price: "$12.99", planId: "ucpln_100_credits", popular: true },
  { credits: 200,  interviews: 65,  price: "$24.99", planId: "ucpln_200_credits" },
  { credits: 350,  interviews: 100, price: "$39.99", planId: "ucpln_350_credits" },
  { credits: 500,  interviews: 150, price: "$54.99", planId: "ucpln_500_credits" },
  { credits: 1000, interviews: 300, price: "$99.99", planId: "ucpln_1000_credits" },
];

export default async function PricingPage() {
  const tokens = await getTokens(await cookies(), {
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    serviceAccount: serverConfig.serviceAccount,
  });

  return (
    <div className="min-h-screen bg-[rgba(245,247,255,1)] flex flex-col items-center py-10 px-2">
      <div className="max-w-7xl p-5 mx-auto w-full flex justify-between items-center mb-8">
        <div className="w-full ">
          <div className="flex sm:hidden mb-5 -translate-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image className="size-[20px]" src="/main/logo.png" alt="Bait AI Logo" width={40} height={40} />
              <span className="lg:text-3xl md:text-2xl text-base font-bold bg-clip-text text-transparent bg-[linear-gradient(106.63deg,rgba(16,81,171,1)_0%,rgba(28,15,111,1)_144.25%)]">bAIt</span>
            </Link>            <MobileNavBar isAuthenticated={!!tokens} />
          </div>
          <div className="justify-between  flex w-full">
            <div className="max-w-6xl">
              <h1 className=" md:text-4xl text-xl font-semibold  mb-2 text-transparent bg-clip-text bg-[linear-gradient(99.18deg,rgba(0,13,144,0.9)_-7.75%,#5D6BEE_98.02%)]">Choose your plan, evolve with AI</h1>
            </div>
            <div className="hidden sm:block">
              <Link href="/">
                <Button variant="default" className="bg-transparent hover:bg-transparent font-semibold  hover:opacity-80 border-2 border-[rgba(52,31,131,0.6)] hover:border-[rgba(52,31,131,0.6)] text-[rgba(52,31,131,1)]">Back Home</Button>
              </Link>
            </div>
          </div>
          <div className="flex gap-2 mb-4 max-w-7xl">

            <Tabs defaultValue="teams" className="w-full">
              <TabsList className="flex gap-2 mb-4">
                <TabsTrigger className="p-4 px-6 md:text-base text-sm" variant="hiring" value="teams">For Hiring Teams</TabsTrigger>
                <TabsTrigger className="p-4 px-6 md:text-base text-sm" variant="jobseeker" value="consumer">For Job Seekers</TabsTrigger>
              </TabsList>
              <TabsContent value="teams">
                <div className="w-full  ">
                  <div className=" flex lg:mx-20   lg:px-0 flex-col items-center md:flex-row flex-0 gap-4 shrink-0 justify-center md:items-start">
                    {plans.map((plan, idx) => (
                      <Card
                        key={plan.name}
                        className={cn(
                          "w-full  shadow-2xs bg-[rgba(58,63,187,1)] rounded-2xl border border-[rgba(58,63,187,0.2)] relative",
                        )}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex lg:flex-row md:flex-col flex-row items-center  justify-between">
                            <CardTitle className="sm:text-3xl text-xl font-semibold  text-[rgba(255,255,255,1)]">{plan.name}</CardTitle>
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
              </TabsContent>
              <TabsContent value="consumer">
                <div className="w-full">
                  <p className="text-sm font-medium text-[rgba(96,127,255,0.8)] mb-4 text-center">
                    Buy credits, practice interviews — no subscription needed.
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-6 bg-[rgba(245,255,199,0.9)] border border-[rgba(134,255,110,0.5)] rounded-full px-5 py-2 mx-auto w-fit">
                    <span className="text-sm font-semibold text-[#4fc238]">🎉 6 free credits at signup</span>
                    <span className="text-xs font-medium text-[rgba(32,5,117,0.6)]">— worth up to 2 free interviews</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:mx-10">
                    {creditPacks.map((pack) => (
                      <div
                        key={pack.credits}
                        className={cn(
                          "bg-[rgba(245,255,199,0.7)] rounded-2xl border border-[rgba(58,63,187,1)] p-5 flex flex-col items-center text-center relative",
                          "popular" in pack && pack.popular && "ring-2 ring-[rgba(107,124,255,1)]",
                        )}
                      >
                        {"popular" in pack && pack.popular && (
                          <span className="absolute -top-3 bg-[rgba(107,124,255,1)] text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Most Popular
                          </span>
                        )}
                        <span className="text-2xl sm:text-3xl font-bold text-[rgba(96,127,255,1)]">
                          {pack.credits}
                        </span>
                        <span className="text-xs font-medium text-[rgba(32,5,117,0.6)]">
                          credits
                        </span>
                        <span className="text-sm font-medium text-[rgba(32,5,117,1)] mt-2">
                          Up to {pack.interviews} interviews
                        </span>
                        <span className="text-xl font-bold text-[rgba(32,5,117,1)] mt-2">
                          {pack.price}
                        </span>
                        <BuyCreditsButton
                          planId={pack.planId}
                          className="w-full mt-3 text-sm border-2 bg-[rgba(107,124,255,1)] hover:bg-[rgba(107,124,255,1)] hover:opacity-80"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

      </div>

    </div>
  );
}
