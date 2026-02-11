import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobSeekerFeatures } from "@/app/home-data";

export function JobSeekersSection() {
    return (
        <section id="job-seekers" className="scroll-mt-[120px] py-14 px-20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    {/* Badge */}
                    <div className="inline-flex items-center justify-center mb-3">
                        <Badge className="text-lg bg-transparent border-2 border-[rgba(107,124,255,1)] text-[rgba(58,63,187,1)] font-semibold tracking-tight rounded-full uppercase hover:bg-transparent p-3 px-20">
                            FOR JOB SEEKERS
                        </Badge>
                    </div>

                    {/* Main Heading */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 tracking-tight">
                        <span className="text-[rgba(10,13,26,1)]">Ace Every </span>
                        <span className="text-[rgba(170,208,2,1)]">Interview</span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-base md:text-lg text-[rgba(10,13,26,0.6)] max-w-4xl mx-auto">
                        Practice smarter with AI. Get the insights and confidence you need to land your dream role.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="flex  justify-center gap-10">
                    {jobSeekerFeatures.map((feature, index) => (
                        <Card key={index} className="bg-white border border-[rgba(58,63,187,0.5)] shadow-none rounded-2xl w-full ">
                            <CardContent className="flex flex-col items-center justify-start  py-7 text-center">
                                <div className="mb-4 h-12 flex items-center justify-center">
                                    <Image
                                        src={feature.icon}
                                        alt={feature.title}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-contain"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-[rgba(58,63,187,1)] mb-2 leading-snug">
                                    {feature.title}
                                </h3>
                                <p className="text-base text-[rgba(10,13,26,0.6)] ">
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
