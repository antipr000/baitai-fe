import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hiringFeatures } from "@/app/home-data";

export function HiringFeaturesSection() {
    return (
        <section id="hiring-teams" className="scroll-mt-[100px] lg:py-13 px-6 md:px-12 lg:px-13 bg-[rgba(247,249,255,1)]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-13">
                    {/* Badge */}
                    <div className="inline-flex items-center justify-center mb-6">
                        <Badge className="text-base md:text-lg bg-transparent border-2 border-[rgba(107,124,255,1)] text-[rgba(58,63,187,1)] font-semibold tracking-wide rounded-full uppercase hover:bg-transparent py-2.5 px-8 md:px-12">
                            FOR HIRING TEAMS
                        </Badge>
                    </div>

                    {/* Main Heading */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 tracking-tight text-[#0B1F3B]">
                        Supercharge Your <span className="text-[rgba(170,208,2,1)]">Recruitment</span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-[rgba(11,31,59,0.7)] max-w-4xl mx-auto tracking-tighter leading-relaxed">
                        AI-powered interviews that analyzes thousands of candidates in minutes, surfaces top candidates, and eliminates hiring bias — so you can focus on what matters.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {hiringFeatures.map((feature, index) => (
                        <Card key={index} className="bg-white border border-[rgba(58,63,187,0.5)] shadow-none rounded-2xl w-full h-full">
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full">
                                <div className="mb-6 h-14 flex items-center justify-center">
                                    <Image
                                        src={feature.icon}
                                        alt={feature.title}
                                        width={56}
                                        height={56}
                                        className="w-10 h-10 object-contain"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-[rgba(58,63,187,1)] mb-3 leading-snug">
                                    {feature.title}
                                </h3>
                                <p className="text-sm md:text-base text-[rgba(11,31,59,0.6)] leading-relaxed tracking-tighter">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
