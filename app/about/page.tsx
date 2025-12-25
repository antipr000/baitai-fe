
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
                    <Link href="/" className="flex items-center mx-7 gap-2"><Image src="/about/arrow.svg" alt="back" width={10} height={10} /><span>Back to home</span></Link>
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
            <div className="w-full bg-[#eafdff] py-12 flex flex-col items-center gap-10">
                <h2 className="text-2xl md:text-4xl font-bold text-[#6b7cff] mb-10 text-center">WHY<br /> CHOOSE US ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full  px-20">
                    {whyChooseUsCards.map((card, idx) => (
                        <Card key={idx} className="flex flex-col items-center bg-[rgba(107,124,255,1)] rounded-2xl p-6 text-white relative min-h-80">
                            <Image src={card.icon} alt={card.alt} width={100} height={100} className="absolute -top-10" />
                            <div className="font-bold text-xl mt-20 mx-3 mb-1 text-center">{card.title}</div>
                            <div className="text-sm text-center mx-10 opacity-90">{card.desc}</div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* SOLUTIONS & SERVICES Section */}
            <div className="w-full  max-w-7xl mx-auto bg-[linear-gradient(112.45deg,#F5F7FF_11.62%,#E0F2FF_124.08%)] py-12 flex flex-col items-center">
                <h2 className="text-2xl md:text-4xl  font-bold text-[#3d4fcf] mb-10 text-center">Solutions & Services</h2>
                <div className="flex justify-between  w-full max-w-7xl mx-auto px-4">
                    {/* For Hiring Teams */}
                    <Card className="bg-transparent border-none shadow-none">
                        <CardHeader className="flex flex-row items-center gap-3 bg-transparent pb-2">
                            <Image src="/about/teams.svg" alt="team Icon" width={60} height={60} className="rounded-md" />
                            <CardTitle className="text-[rgba(58,63,187,1)] text-3xl font-bold"><div>For</div>
                                <div>Hiring Teams</div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ul className="flex flex-col gap-3">
                                <li>
                                    <span className="font-semibold text-xl text-[#3d4fcf]">• Custom AI Interviewer</span>
                                    <div className=" text-[rgba(58,63,187,1)] px-8">Hiring teams can create and customize interview sections, guiding the AI to conduct realistic, human-like interviews.</div>
                                </li>
                                <li>
                                    <CardDescription className="font-semibold text-xl text-[#3d4fcf]">• Skill-Based Screening</CardDescription>
                                    <div className=" text-[rgba(58,63,187,1)] px-8">Identify true talent beyond resumes, reduce bias, and make faster, smarter hiring decisions.</div>
                                </li>
                                <li>
                                    <CardDescription className="font-semibold text-xl text-[#3d4fcf]">• Actionable Metrics</CardDescription>
                                    <div className=" text-[rgba(58,63,187,1)] px-8">Receive detailed performance metrics to help select the best candidates.</div>
                                </li>
                                <li>
                                    <CardDescription className="font-semibold text-xl text-[#3d4fcf]">• Efficient & Scalable</CardDescription>
                                    <div className=" text-[rgba(58,63,187,1)] px-8">Save time and cost spent on unqualified candidates.</div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                    {/* For Candidates */}
                    <Card className="bg-transparent border-none shadow-none">
                        <CardHeader className="flex flex-row items-center gap-3 bg-transparent pb-2">
                            <Image src="/about/candidates.svg" alt="candidates Icon" width={60} height={60} className="rounded-md" />
                            <CardTitle className="text-[rgba(58,63,187,1)] text-3xl font-bold"><div>For</div>
                                <div>Candidates</div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ul className="flex flex-col gap-3">
                                <li>
                                    <span className="font-semibold text-xl text-[#3d4fcf]">• AI-powered Mock Interviews</span>
                                    <div className=" text-[rgba(58,63,187,1)] px-8">Practice real interview scenarios with problem-solving and reasoning challenges.</div>
                                </li>
                                <li>
                                    <span className="font-semibold text-xl text-[#3d4fcf]">• Instant Feedback & Insights</span>
                                    <div className=" text-[rgba(58,63,187,1)] px-8">Gain actionable guidance to improve skills and boost confidence.</div>
                                </li>
                                <li>
                                    <span className="font-semibold text-xl text-[#3d4fcf]">• Enhanced Resumes & Video Resumes</span>
                                    <div className=" text-[rgba(58,63,187,1)] px-8">Create video resumes, get resume feedback, and improve traditional resumes for better chances.</div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex w-full p-10 text-[rgba(239,245,255,1)] text-4xl font-bold items-center justify-center bg-[linear-gradient(9deg,#3A3FBB_0%,#6B7CFF_100%)]">
                <span>Our Vision</span>
            </div>

            <div className="p-10 py-15 flex items-center w-1/2 gap-2 mx-auto justify-center">
                <Image
                    src="/about/bulb.svg"
                    alt="Our Vision Illustration"
                    width={300}
                    height={300}
                    className="w-[380px] h-[380px] flex-2 "
                />
                <div className="flex-1 text-xl">
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

             <section className="w-full   px-0 lg:py-5   md:py-8 py-8">
                      <div className="w-full">
                        <div className="flex flex-col items-center text-center gap-6">
                          <div className="flex items-center space-x-2 mb-2">
                            <Image className="md:size-[34px] lg:[size-40px] size-[20px]" src="/main/logo.png" alt="Bait AI Logo" width={40} height={40} />
                            <span className="text-3xl font-bold bg-clip-text text-transparent bg-[linear-gradient(106.63deg,rgba(16,81,171,1)_0%,rgba(28,15,111,1)_144.25%)]">bAIt</span>
                          </div>
                          <div className="flex items-center space-x-6">
                            <Image className="md:size-6 lg:[size-30px] size-5" src="/main/linkedin.svg" alt=" Linkedin Logo" width={30} height={30} />
                            <Image className="md:size-6 lg:[size-30px] size-5" src="/main/gmail.svg" alt="Gmail Logo" width={30} height={30} />
                            <Image className="bg-black  md:size-5 lg:[size-26px] size-4 p-1" src="/main/x.svg" alt="X Logo" width={26} height={26} />
                            <Image className="md:size-6 lg:[size-30px] size-5" src="/main/instagram.svg" alt="Instagram Logo" width={30} height={30} />
                            <Image className="md:size-6 lg:[size-30px] size-5" src="/main/facebook.svg" alt="Facebook Logo" width={30} height={30} />
                          </div>
            
                          <div className="text-primary lg:text-base text-xs  md:text-sm">
                            Copyright © 2025 Bait AI | All Rights Reserved
                          </div>
                        </div>
                      </div>
                    </section>
            

        </div>
    );
}
