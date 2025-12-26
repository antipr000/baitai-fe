import { Footer } from "@/components/footer";
import { MobileNavBar } from "@/components/mobile-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

import Link from "next/link";
import { ViewMore } from "@/components/about/view-more";

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
                <Button variant="ghost" className="mb-6 sm:flex justify-start hidden text-[rgba(93,111,223,1)] font-semibold" asChild>
                    <Link href="/" className="flex items-center mx-7 gap-2"><Image src="/about/arrow.svg" alt="back" width={10} height={10} /><span>Back to home</span></Link>
                </Button>
                <div className="w-full px-5">
                    <div className="flex sm:hidden  mb-5">
                        <Image src="/pricing/home.svg" alt="Home" width={20} height={20} />

                        <MobileNavBar />
                    </div>
                </div>
                <div className="bg-[#3d4fcf] py-8 px-8 ">
                    <h1 className="md:text-2xl lg:text-4xl font-bold text-base text-[rgba(239,245,255,1)]">The AI-driven way to HIRE and PREPARE</h1>
                </div>


                <Card className="flex flex-col items-center p-6 bg-white pb-10">
                    < Image
                        src="/about/hero.png"
                        alt="AI Interview Illustration"
                        width={800}
                        height={800}
                        className="rounded-lg lg:w-[720px] lg:h-[482px] w-[360px] h-[250px] object-cover mb-6"
                    />

                    <ViewMore />
                  
                    <p className="md:text-xl sm:block hidden max-w-6xl text-sm text-center text-[rgba(58,63,187,1)]">
                        <span className="font-bold text-[#3d4fcf]">Bait AI</span> is an <span className="font-bold">AI-interview</span > platform designed to make hiring faster, fairer, and more effective. We help organizations streamline screening and identify high-quality candidates through intelligent, structured AI interviews, while empowering candidates to practice and prepare with realistic mock interviews, instant feedback, and performance insights. By reducing bias, saving recruiter and interviewer time, and improving candidate readiness, BAIT AI bridges the gap between talent and opportunity—turning interviews into a skill-first, confidence-driven experience where true potential stands out.
                    </p>
                </Card>
            </div>

            {/* WHY CHOOSE US Section */}
            <div className="w-full bg-[#eafdff] py-12 flex flex-col items-center gap-10">
                <h2 className="md:text-2xl lg:text-4xl text-xl font-bold text-[#6b7cff] mb-10 text-center">WHY<br /> CHOOSE US ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-6 gap-14 w-full  lg:px-15 px-10 ">
                    {whyChooseUsCards.map((card, idx) => (
                        <Card key={idx} className="flex flex-col items-center bg-[rgba(107,124,255,1)] rounded-2xl md:p-6 p-3 text-white relative min-h-80">
                            <Image src={card.icon} alt={card.alt} width={100} height={100} className="lg:w-[100px] lg:h-[100px] md:w-[75px] md:h-[75px] h-[70px] w-[70px] absolute -top-10" />
                            <div className="font-bold md:text-xl text-base mt-20 mx-3 mb-1 text-center">{card.title}</div>
                            <div className="md:text-sm text-xs text-center mx-10 opacity-90">{card.desc}</div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* SOLUTIONS & SERVICES Section */}
            <div className="w-full   mx-auto bg-[linear-gradient(112.45deg,#F5F7FF_11.62%,#E0F2FF_124.08%)] py-12 flex flex-col items-center">
                <h2 className="md:text-2xl lg:text-4xl text-xl  font-bold text-[#3d4fcf] mb-10 text-center">Solutions & Services</h2>
                <div className="flex justify-between md:flex-row flex-col  w-full max-w-7xl mx-auto px-4">
                    {/* For Hiring Teams */}
                    <Card className="bg-transparent border-none shadow-none">
                        <CardHeader className="flex flex-row items-center gap-3 bg-transparent pb-2">
                            <Image src="/about/teams.svg" alt="team Icon" width={60} height={60} className="rounded-md lg:w-[70px] md:w-[50px] w-10" />
                            <CardTitle className="text-[rgba(58,63,187,1)] lg:text-3xl md:text-xl text-base font-bold"><div>For</div>
                                <div>Hiring Teams</div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ul className="flex flex-col gap-3">
                                <li>
                                    <span className="font-semibold lg:text-xl md:text-base text-sm text-[rgba(58,63,187,1)]">• Custom AI Interviewer</span>
                                    <div className=" text-[rgba(58,63,187,1)] px-8 lg:text-base text-xs">Hiring teams can create and customize interview sections, guiding the AI to conduct realistic, human-like interviews.</div>
                                </li>
                                <li>
                                    <CardDescription className="font-semibold lg:text-xl md:text-base text-sm text-[rgba(58,63,187,1)]">• Skill-Based Screening</CardDescription>
                                    <div className=" text-[rgba(58,63,187,1)] px-8  lg:text-base text-xs">Identify true talent beyond resumes, reduce bias, and make faster, smarter hiring decisions.</div>
                                </li>
                                <li>
                                    <CardDescription className="font-semibold lg:text-xl md:text-base text-sm text-[rgba(58,63,187,1)]">• Actionable Metrics</CardDescription>
                                    <div className=" text-[rgba(58,63,187,1)] px-8  lg:text-base text-xs">Receive detailed performance metrics to help select the best candidates.</div>
                                </li>
                                <li>
                                    <CardDescription className="font-semibold lg:text-xl md:text-base text-sm text-[rgba(58,63,187,1)]">• Efficient & Scalable</CardDescription>
                                    <div className=" text-[rgba(58,63,187,1)] px-8 text-xs">Save time and cost spent on unqualified candidates.</div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                    {/* For Candidates */}
                    <Card className="bg-transparent border-none shadow-none">
                        <CardHeader className="flex flex-row items-center gap-3 bg-transparent pb-2">
                            <Image src="/about/candidates.svg" alt="candidates Icon" width={60} height={60} className="rounded-md lg:w-[70px] md:w-[50px] w-10" />
                            <CardTitle className="text-[rgba(58,63,187,1)] lg:text-3xl md:text-xl text-base font-bold"><div>For</div>
                                <div>Candidates</div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ul className="flex flex-col gap-2">
                                <li>
                                    <span className="font-semibold lg:text-xl md:text-base text-sm text-[rgba(58,63,187,1)]">• AI-powered Mock Interviews</span>
                                    <div className=" text-[rgba(58,63,187,1)] px-8 lg:text-base text-xs">Practice real interview scenarios with problem-solving and reasoning challenges.</div>
                                </li>
                                <li>
                                    <span className="font-semibold lg:text-xl md:text-base text-sm text-[rgba(58,63,187,1)]">• Instant Feedback & Insights</span>
                                    <div className=" text-[rgba(58,63,187,1)] px-8 lg:text-base text-xs">Gain actionable guidance to improve skills and boost confidence.</div>
                                </li>
                                <li>
                                    <span className="font-semibold lg:text-xl md:text-base text-sm text-[rgba(58,63,187,1)]">• Enhanced Resumes & Video Resumes</span>
                                    <div className=" text-[rgba(58,63,187,1)] px-8 lg:text-base text-xs">Create video resumes, get resume feedback, and improve traditional resumes for better chances.</div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex w-full md:p-10 p-6 text-[rgba(239,245,255,1)] lg:text-4xl md:text-2xl text-xl font-bold items-center justify-center bg-[linear-gradient(9deg,#3A3FBB_0%,#6B7CFF_100%)]">
                <span>Our Vision</span>
            </div>

            <div className="md:p-10 p-5 w-full py-15 flex items-center lg:w-1/2 sm:w-3/4 gap-3 justify-center">
                <Image
                    src="/about/bulb.svg"
                    alt="Our Vision Illustration"
                    width={300}
                    height={300}
                    className="lg:size-[380px] size-[100px] md:size-[250px] md:flex-2 "
                />
                <div className="flex-1 lg:text-xl md:text-base text-xs ">
                    <span>To become the global standard
                        for skill-based hiring—where</span><span className="font-bold"> AI
                            conducts fair, human-like
                            interviews at scale, </span>enabling
                    companies to hire with
                    confidence and candidates to
                    showcase real ability beyond
                    resumes.
                </div>
            </div>

            <Footer />


        </div>
    );
}
