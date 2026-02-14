import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { jobSeekerFeatures } from "@/app/home-data";

export function JobSeekersSection() {
    return (
        <section id="job-seekers" className="scroll-mt-[120px] py-10 md:py-12 lg:py-13 px-4 md:px-25 lg:px-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    {/* Badge */}
                    <div className="inline-flex items-center justify-center mb-4 md:mb-6">
                        <Badge className="text-xs md:text-sm lg:text-base bg-transparent border-2 border-[rgba(107,124,255,1)] text-[rgba(58,63,187,1)] font-semibold tracking-wide rounded-full uppercase hover:bg-transparent py-2 px-6 md:px-12">
                            FOR JOB SEEKERS
                        </Badge>
                    </div>

                    {/* Main Heading */}
                    <h2 className="text-xl md:text-2xl lg:text-5xl font-semibold mb-3 md:mb-4 tracking-tight text-[rgba(10,13,26,1)]">
                        <span className="text-[rgba(10,13,26,1)]">Ace Every </span>
                        <span className="text-[rgba(170,208,2,1)]">Interview</span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-sm lg:text-xl md:text-base text-[rgba(11,31,59,0.7)] max-w-4xl mx-auto lg:tracking-tighter leading-loose">
                        Practice smarter with AI. Get the insights and confidence you need to land your dream role.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="xl:max-w-7xl lg:max-w-5xl md:max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-10 lg:gap-13 ">
                    {jobSeekerFeatures.map((feature, index) => (
                        <Card key={index} className="bg-white border border-[rgba(58,63,187,0.5)] p-0 lg:py-17 md:py-9  py-3  px-[2px] lg:px-3  gap-0 shadow-none rounded-lg w-full h-full ">
                            <CardContent className="flex flex-col items-center justify-center p-0 m-0 text-center h-full">
                                <Image
                                    src={feature.icon}
                                    alt={feature.title}
                                    width={56}
                                    height={56}
                                    className="w-8 h-8 md:w-9 md:h-9 object-contain"
                                />
                                <h3 className="lg:text-xl mt-2 md:text-base text-xs font-semibold text-[rgba(58,63,187,1)] mb-2 md:mb-3 leading-snug">
                                    {feature.title}
                                </h3>
                                <p className="md:text-sm mt-1 text-xs lg:text-base text-[rgba(11,31,59,0.6)] leading-tight tracking-tighter ">
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
