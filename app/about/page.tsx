
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

import Link from "next/link";

const whyChooseUsCards = [
  {
    icon: "/about/tool.svg",
    alt: "tool Icon",
    title: (<><span>Custom</span><br />AI Interviewer</>),
    desc: "Companies design and control interviews, guiding AI with their own criteria and expectations."
  },
  {
    icon: "/about/signal.svg",
    alt: "signal Icon",
    title: (<><span>Real Interviews,</span><br />Real Signals</>),
    desc: "BAIT AI mirrors real interviews—thinking out loud, problem-solving, and communication—on both candidate and company sides."
  },
  {
    icon: "/about/scale.svg",
    alt: "scale Icon",
    title: (<><span>Scalable & Fair</span></>),
    desc: "Human-quality interviews at AI scale—without bias, high costs, or availability constraints"
  },
  {
    icon: "/about/graph.svg",
    alt: "graph Icon",
    title: (<><span>Two-Sided Advantage</span></>),
    desc: "Companies get high-signal metrics for faster decisions; candidates get structured preparation and feedback."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(112.45deg,#F5F7FF_11.62%,#E0F2FF_124.08%)] flex flex-col items-center  py-8">
      <div className="w-full bg-[linear-gradient(112.45deg,#F5F7FF_11.62%,#E0F2FF_124.08%)]">
        <Button variant="ghost" className="mb-6 text-[rgba(93,111,223,1)] font-semibold" asChild>
          <Link href="/" className="flex items-center gap-2"><Image src="/about/arrow.svg" alt="back" width={10} height={10} /><span>Back to home</span></Link>
        </Button>
        <div className="bg-[#3d4fcf] py-8 px-8 ">
          <h1 className="text-2xl md:text-4xl font-bold text-[rgba(239,245,255,1)]">The AI-driven way to HIRE and PREPARE</h1>
        </div>
        <Card className="flex flex-col items-center p-6 bg-white pb-10">
          < Image
            src="/about/hero.png"
            alt="AI Interview Illustration"
            width={200}
            height={200}
            className="rounded-lg w-full max-w-md object-cover mb-6"
          />
          <p className="text-xl max-w-6xl md:text-lg text-center text-[rgba(58,63,187,1)]">
            <span className="font-bold text-[#3d4fcf]">Bait AI</span> is an <span className="font-bold">AI-interview</span > platform designed to make hiring faster, fairer, and more effective. We help organizations streamline screening and identify high-quality candidates through intelligent, structured AI interviews, while empowering candidates to practice and prepare with realistic mock interviews, instant feedback, and performance insights. By reducing bias, saving recruiter and interviewer time, and improving candidate readiness, BAIT AI bridges the gap between talent and opportunity—turning interviews into a skill-first, confidence-driven experience where true potential stands out.
          </p>
        </Card>
      </div>

      {/* WHY CHOOSE US Section */}
      <div className="w-full bg-[#eafdff] py-12 flex flex-col items-center">
        <h2 className="text-2xl md:text-4xl font-bold text-[#6b7cff] mb-10 text-center">WHY<br/> CHOOSE US ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full  px-20">
          {whyChooseUsCards.map((card, idx) => (
            <Card key={idx} className="flex flex-col items-center bg-[rgba(107,124,255,1)] rounded-2xl p-6 text-white relative min-h-[320px]">
              <Image src={card.icon} alt={card.alt} width={100} height={100} className="absolute -top-10" />
              <div className="font-bold text-xl mt-20 mx-3 mb-1 text-center">{card.title}</div>
              <div className="text-sm text-center mx-10 opacity-90">{card.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
