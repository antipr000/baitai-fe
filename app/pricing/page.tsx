




import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Image from "next/image";

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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(297.94deg,#E6FDFF_13.44%,#DDFBFE_108.79%)] flex flex-col items-center py-10 px-2">
      <div className="max-w-5xl w-full flex justify-between items-center mb-8">
        
{/* <Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger variant="hiring" value="account">For Hiring Teams</TabsTrigger>
    <TabsTrigger variant="jobseeker" value="password">For Job Seekers</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Make changes to your account here.</TabsContent>
  <TabsContent value="password">Change your password here.</TabsContent>
</Tabs> */}
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-center mb-2 text-transparent bg-clip-text bg-[linear-gradient(99.18deg,rgba(0,13,144,0.9)_-7.75%,#5D6BEE_98.02%)]">Choose your plan, evolve</h1>
          <h1 className="text-3xl md:text-4xl font-semibold text-left mb-2 text-transparent bg-clip-text bg-[linear-gradient(99.18deg,rgba(0,13,144,0.9)_-7.75%,#5D6BEE_98.02%)]">with AI</h1>
          <div className="flex gap-2 mb-4">
            <Button variant="default" className="bg-[rgba(33,6,117,0.9)] border border-[rgba(84,106,252,0.6)] text-[rgba(226,229,255,0.9)]">For hiring teams</Button>
            <Button variant="outline" className="text-[rgba(84,106,252,0.7)] hover:text-[rgba(84,106,252,0.7)] hover:opacity-80 border hover:bg-transparent bg-transparent border-[rgba(84,106,252,0.6)]">For Job Seekers</Button>
          </div>
        </div>
        <div>
          <Button variant="default" className="bg-[rgba(227,252,254,1)] hover:bg-[rgba(227,252,254,1)] hover:opacity-80 border-2 border-[rgba(52,31,131,0.6)] hover:border-[rgba(52,31,131,0.6)] text-[rgba(52,31,131,1)]">Back Home</Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl justify-center">
        {plans.map((plan, idx) => (
          <Card
            key={plan.name}
            className={cn(
              "flex-1  max-w-sm shadow-2xs bg-[linear-gradient(297.94deg,rgba(211,251,31,0.7)_13.44%,rgba(255,255,255,1)_108.79%)] rounded-2xl border border-[rgba(239,254,210,1)] relative",
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-semibold text-[rgba(96,127,255,1)]">{plan.name}</CardTitle>
                <span className="text-lg font-semibold text-[rgba(32,5,117,1)]">{plan.price}</span>
              </div>
              <CardDescription className="text-xs mt-1 font-medium text-[rgba(96,127,255,0.6)]">{plan.description}</CardDescription>
              <div className="h-px w-full bg-[rgba(32,5,116,0.1)] mt-3" />
            </CardHeader>
            <CardContent className="pt-2 pb-0">
              <ul className="space-y-3 mb-4 mt-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[rgba(32,5,117,1)] font-medium">
                    <Image src={feature.icon} alt={feature.text} width={20} height={20} className="w-6 h-6 object-contain" aria-hidden />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              {plan.note && (
                <div className="border rounded-2xl bg-transparent border-[rgba(32,5,117,1)] p-3 flex items-start gap-3 mt-4 text-sm">
                  <Image src={plan.note.icon} alt="credit card" width={24} height={24} className="w-6 h-6 object-contain mt-0.5" aria-hidden />
                  <div className="text-[rgba(32,5,117,0.9)]">
                    <div className="font-bold mb-1">{plan.note.title}</div>
                    <div className="text-xs font-medium">{plan.note.detail}</div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-6">
              <Button // fix transtion state has black in between
                className=
                  "w-full py-2 text-base border-2 hover:bg-[linear-gradient(93.76deg,#3E54FB_-30.83%,#C3CEFF_172.66%)] font-semibold border-[rgba(158,172,255,0.3)] text-white bg-[linear-gradient(93.76deg,#3E54FB_-30.83%,#C3CEFF_172.66%)]  btn-pricing "
              >
                {plan.button}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
