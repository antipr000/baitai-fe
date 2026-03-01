import Image from "next/image";
import { hiringFeatures, hiringTeamSteps } from "@/app/home-data";
import * as motion from "motion/react-client";

export function HiringTeamsSection() {
    return (
        <section className="bg-[rgba(236,239,255,1)] py-15 lg:py-18 md:px-17 px-5 overflow-hidden">
            <div className="max-w-7xl mx-auto relative">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center max-w-3xl mx-auto mb-4 md:mb-9 "
                >
                    <h3 className="text-[rgba(83,118,219,1)] font-medium uppercase  lg:text-xl md:text-base text-xs mb-7">How it works</h3>
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-semibold mb-4 text-[rgba(10,13,26,1)] tracking-tight">
                        Four <span className="text-[rgba(107,124,255,1)]">steps</span> to better hiring
                    </h2>
                    <p className="text-sm md:text-base lg:text-xl text-[rgba(11,31,59,0.7)] tracking-tighter lg:leading-relaxed lg:w-full md:w-3/4  mx-auto leading-loose ">
                        Transform your hiring process in four simple steps. Save time, reduce bias, and find the best candidates faster.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 lg:gap-4">
                    {hiringTeamSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.6, delay: 0.1 + index * 0.2, ease: "easeOut" }}
                        >
                            <div className="bg-[rgba(245,247,255,1)] shadow-sm rounded-xl py-8 px-6 border border-[rgba(58,63,187,0.6)] h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <Image
                                        src={step.icon}
                                        alt={step.title}
                                        width={50}
                                        height={50}
                                        className="lg:size-12 md:size-11 size-6 object-contain rounded-full "
                                    />
                                    <span className="md:text-xl text-base font-semibold text-[rgba(107,124,255,1)] ">{step.number}</span>
                                </div>

                                <h3 className="lg:text-xl md:text-base text-sm font-semibold text-[rgba(10,13,26,1)] mb-1">{step.title}</h3>
                                <p className="lg:text-base md:text-sm text-xs text-[rgba(10,13,26,0.6)]  tracking-tighter">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
