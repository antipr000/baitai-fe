import Image from "next/image";
import { hiringFeatures, hiringTeamSteps } from "@/app/home-data";

export function HiringTeamsSection() {
    return (
        <section className="bg-[rgba(236,239,255,1)] py-15 lg:py-21 px-17 overflow-hidden">
            <div className="max-w-7xl mx-auto relative">

                <div className="text-center max-w-3xl mx-auto mb-4 md:mb-9 ">
                    <h3 className="text-[rgba(83,118,219,1)] font-medium uppercase  text-xl mb-5">How it works</h3>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-[rgba(10,13,26,1)] tracking-tight">
                        Four <span className="text-[rgba(107,124,255,1)]">steps</span> to better hiring
                    </h2>
                    <p className="text-lg md:text-xl text-[rgba(11,31,59,0.7)] tracking-tighter leading-relaxed ">
                        Transform your hiring process in four simple steps. Save time, reduce bias, and find the best candidates faster.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    {hiringTeamSteps.map((step, index) => (
                        <div key={index} className="bg-[rgba(245,247,255,1)] shadow-sm rounded-3xl py-8 px-6 border border-[rgba(58,63,187,0.6)]">
                            <div className="flex items-center gap-3 mb-6">
                                    <Image
                                        src={step.icon}
                                        alt={step.title}
                                        width={50}
                                        height={50}
                                        className="w-12 h-12 object-contain rounded-full "
                                    />
                                <span className="text-xl font-semibold text-[rgba(107,124,255,1)] ">{step.number}</span>
                            </div>

                            <h3 className="text-xl font-semibold text-[rgba(10,13,26,1)] mb-1">{step.title}</h3>
                            <p className="text-base text-[rgba(10,13,26,0.6)]  tracking-tighter">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
