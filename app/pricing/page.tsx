

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

const plans = [
  {
    name: "Starter",
    price: "$199/month",
    highlight: false,
    description: "For small teams hiring smarter with AI.",
    features: [
      { icon: "/pricing/person.svg", text: "1 recruiter seat" },
      { icon: "/pricing/template.svg", text: "5 active AI Templates" },
      { icon: "/pricing/brain.svg", text: "150 AI interview credits/month (≈ 30–50 interviews)" },
      { icon: "/pricing/chart.svg", text: "Scoring, analytics, and feedback" },
      { icon: "/pricing/puzzle.svg", text: "Basic integrations" },
      { icon: "/pricing/email.svg", text: "Email Support" },
    ],
    button: "Select Plan",
    note: null,
  },
  {
    name: "Pro",
    price: "$799/month",
    highlight: true,
    description: "For growing teams hiring at scale.",
    features: [
      { icon: "/pricing/person.svg", text: "5 recruiter seats" },
      { icon: "/pricing/template.svg", text: "50 active AI interview templates" },
      { icon: "/pricing/brain.svg", text: "1,000 AI interview credits/month (≈ 200–300 interviews)" },
      { icon: "/pricing/wheel.svg", text: "Custom interview rubrics & feedback design" },
      { icon: "/pricing/chart.svg", text: "Scoring, analytics, and feedback" },
      { icon: "/pricing/puzzle.svg", text: "Advanced analytics & reporting" },
      { icon: "/pricing/star.svg", text: "Priority support" },
    ],
    button: "Select Plan",
    note: {
      icon: "/pricing/card.svg",
      title: "Additional Credits",
      detail: "Buy more anytime at $79 per 100 credits (≈ 20–30 extra interviews)",
    },
  },
  {
    name: "Enterprise — Custom",
    price: "starting from $2,500/month",
    highlight: false,
    description: "For organizations building custom, large-scale AI interview systems.",
    features: [
      { icon: "/pricing/loop.svg", text: "Unlimited recruiter seats & templates" },
      { icon: "/pricing/brain.svg", text: "3,500+ AI interview credits/month (≈ 700–1,000 interviews)" },
      { icon: "/pricing/wheel.svg", text: "Custom AI models & scoring logic" },
      { icon: "/pricing/laptop.svg", text: "Integrated coding IDE & design interview builder" },
      { icon: "/pricing/shield.svg", text: "SSO & enterprise-grade security" },
      { icon: "/pricing/person2.svg", text: "Dedicated success manager" },
      { icon: "/pricing/star.svg", text: "Custom integrations & SLA support" },
    ],
    button: "Select Plan",

    note: {
      icon: "/pricing/card.svg",
      title: "Additional Credits",
      detail: "Buy more anytime at $69 per 100 credits (≈ 20–30 extra interviews)",
    },
  },
];



const consumerPlans = [
  {
    name: "Starter",
    price: "Free",
    highlight: false,
    description: "Get started with your first AI-powered mock interview — no credit card required.",
    features: [
      { icon: "/pricing/person3.svg", text: "1 free AI mock interview (worth 3 credits)" },
      { icon: "/pricing/note.svg", text: "Resume import" },
      { icon: "/pricing/hand.svg", text: "Interview feedback and scoring" },
    ],
    button: "Choose Plan",
    note: null,
  },
  {
    name: "Pro",
    price: "$19/month",
    highlight: true,
    description: "For those committed to leveling up their preparation.",
    features: [
      { icon: "/pricing/coin.svg", text: "30 credits included every month (≈ 6–10 interviews)" },
      { icon: "/pricing/note.svg", text: "Resume import and smart resume suggestions" },
      { icon: "/pricing/ai.svg", text: "AI-powered resume builder and tailoring" },
      { icon: "/pricing/chart.svg", text: "Detailed scoring and improvement feedback" },
      { icon: "/pricing/card.svg", text: "Buy extra credits anytime at flexible rates" },
    ],
    extra: {
      buyCredits: {
        title: "Buy Credits Anytime:",
        items: [
          "$10 → 15 credits (≈ 3–5 interviews)",
          "$25 → 50 credits (≈ 10–15 interviews)",
          "$75 → 200 credits (≈ 40–60 interviews)"
        ]
      },
      useCredits: {
        title: "Use Credits for:",
        items: [
          "Practice interviews",
          "Custom or role-specific mock interviews",
          "Resume scoring and optimization tools"
        ]
      }
    },
    button: "Choose Plan",
    note: null,
  },
];

export default async function PricingPage() {
  const tokens = await getTokens(await cookies(), {
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    serviceAccount: serverConfig.serviceAccount,
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(297.94deg,#E6FDFF_13.44%,#DDFBFE_108.79%)] flex flex-col items-center py-10 px-2">
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
                <Button variant="default" className="bg-[rgba(227,252,254,1)] font-semibold hover:bg-[rgba(227,252,254,1)] hover:opacity-80 border-2 border-[rgba(52,31,131,0.6)] hover:border-[rgba(52,31,131,0.6)] text-[rgba(52,31,131,1)]">Back Home</Button>
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
                          "w-full  shadow-2xs bg-[linear-gradient(156.96deg,rgba(211,251,31,0.7)_-3.8%,rgba(255,255,255,1)_118.22%)] rounded-2xl border border-[rgba(239,254,210,1)] relative",
                        )}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex lg:flex-row md:flex-col flex-row items-center  justify-between">
                            <CardTitle className="sm:text-3xl text-xl font-semibold  text-[rgba(96,127,255,1)]">{plan.name}</CardTitle>
                            <span className="sm:text-lg text-base font-semibold text-[rgba(32,5,117,1)]">{plan.price}</span>
                          </div>
                          <CardDescription className="text-xs mt-1 font-medium text-[rgba(96,127,255,0.6)]">{plan.description}</CardDescription>
                          <div className="h-px w-full bg-[rgba(32,5,116,0.1)] mt-3" />
                        </CardHeader>
                        <CardContent className="pt-2 pb-0">
                          <ul className="space-y-3 mb-4 mt-2">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-3 sm:text-sm text-xs text-[rgba(32,5,117,1)] font-medium">
                                <Image src={feature.icon} alt={feature.text} width={20} height={20} className="w-6 h-6 object-contain" aria-hidden />
                                <span className="sm:text-sm text-xs">{feature.text}</span>
                              </li>
                            ))}
                          </ul>
                          {plan.note && (
                            <div className="border rounded-2xl bg-transparent border-[rgba(32,5,117,1)] p-3 flex items-start gap-3 mt-4 text-sm">
                              <Image src={plan.note.icon} alt="credit card" width={24} height={24} className="w-6 h-6 object-contain mt-0.5" aria-hidden />
                              <div className="text-[rgba(32,5,117,0.9)]">
                                <div className="font-bold mb-1">{plan.note.title}</div>
                                <div className="sm:text-xs text-xs font-medium">{plan.note.detail}</div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="pt-6">
                          <Button
                            className="w-full py-2 sm:text-base text-xs border-2 hover:bg-[linear-gradient(93.76deg,#3E54FB_-30.83%,#C3CEFF_172.66%)] font-semibold border-[rgba(158,172,255,0.3)] text-white bg-[linear-gradient(93.76deg,#3E54FB_-30.83%,#C3CEFF_172.66%)]  btn-pricing "
                          >
                            {plan.button}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="consumer">
                <div className="w-full flex items-center justify-center text-sm">
                  <div className=" flex  lg:mx-25   lg:px-0  md:flex-col lg:flex-row flex-col justify-center md:gap-20 gap-5  lg:items-start ">
                    {consumerPlans.map((plan, idx) => (
                      <Card
                        key={plan.name}
                        className={cn(
                          "  shadow-2xs bg-[linear-gradient(150.84deg,#242995_8.25%,#595DC9_102.41%)] rounded-2xl border border-[rgba(140,157,255,0.2)] relative",
                        )}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="sm:text-3xl text-xl font-semibold text-white">{plan.name}</CardTitle>
                            <span className={cn("sm:text-lg text-base font-semibold ", plan.name === "Starter" ? "text-[rgba(134,255,110,1)]" : "text-white")}>{plan.price}</span>
                          </div>
                          <CardDescription className="text-xs mt-1 font-medium text-white/70">{plan.description}</CardDescription>
                          <div className="h-px w-3/4 mx-auto bg-[rgba(134,255,110,0.5)] mt-3" />
                        </CardHeader>
                        <CardContent className="pt-2 pb-0">
                          <ul className="space-y-3 mb-4 sm:px-15  lg:px-0 mt-2">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-3 sm:text-sm text-xs text-[rgba(32,5,117,1)] font-medium">
                                <Image src={feature.icon} alt={typeof feature.text === 'string' ? feature.text : ''} width={20} height={20} className="w-6 h-6 object-contain" />
                                <span className="text-white">{feature.text}</span>
                              </li>
                            ))}
                          </ul>
                          {/* Render extra sections for Pro plan */}
                          {plan.extra && plan.extra.buyCredits && (
                            <div className=" ml-10 mt-4">
                              <span className="font-semibold text-white">{plan.extra.buyCredits.title}</span>
                              <ul className="ml-6 mt-1 space-y-1 sm:text-sm text-xs text-white">
                                {plan.extra.buyCredits.items.map((item, idx) => (
                                  <li className="text-white" key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {plan.extra && plan.extra.useCredits && (
                            <div className=" ml-10 mt-4">
                              <span className="font-semibold text-white">{plan.extra.useCredits.title}</span>
                              <ul className="ml-6 mt-1 space-y-1 sm:text-sm text-xs text-white">
                                {plan.extra.useCredits.items.map((item, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-white">
                                    <Image src="/pricing/tick.svg" alt="check mark" width={16} height={16} className="w-4 h-4 object-contain" aria-hidden />
                                    <span className="">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        </CardContent>
                        <CardFooter className="pt-6">
                          <Button
                            className="w-full py-2 sm:text-base text-xs border-2 bg-transparent hover:bg-transparent  hover:opacity-80 "
                          >
                            {plan.button}
                          </Button>
                        </CardFooter>
                      </Card>
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
