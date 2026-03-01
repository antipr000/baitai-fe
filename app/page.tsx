import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import * as motion from "motion/react-client";
import { Footer } from "@/components/footer";
import { HiringTeamsSection } from "@/components/main/hiring-teams-section";
import { HiringFeaturesSection } from "@/components/main/hiring-features-section";
import { jobSeekerSteps } from "@/app/home-data";
import Header from "@/components/header";
import { JobSeekersSection } from "@/components/main/job-seekers-section";
import { HeroVideo } from "@/components/main/hero-video";

export default async function Home() {

  return (
    <div className="min-h-screen bg-[rgba(245,247,255,1)]  flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="relative w-full px-7 md:px-17 lg:pt-32 lg:pb-25 md:py-15 py-6 ">
        {/* Content */}
        <div className="relative z-10 lg:max-w-7xl  md:max-w-4xl w-full mx-auto py-2">
          {/* Grid Overlay */}
          <div
            className="
      pointer-events-none
      absolute inset-0
      
      bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)]
      bg-size-[80px_80px]
      mask-[radial-gradient(circle_at_center,black_60%,transparent_100%)]
      "
          />

          <div className="flex flex-col lg:flex-row lg:gap-0 gap-9 mt-18 lg:mt-10 lg:items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-center lg:text-left flex flex-col items-center lg:items-start w-full"
            >
              {/* AI Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                <Badge className="bg-[rgba(196,240,0,1)] z-30 text-[rgba(58,63,187,1)] px-7 py-3 mb-5 md:text-sm text-xs lg:text-base font-medium border-none rounded-full">
                  <Image
                    src="/main/lightning2.svg"
                    alt="AI Badge"
                    width={13}
                    height={18}
                    className="inline-block mr-2"
                  />
                  AI-Powered Interviews
                </Badge>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              >
                <h1 className="xl:text-5xl md:text-4xl text-2xl font-semibold leading-tight mb-5 tracking-tight">
                  <span className="text-[rgba(107,124,255,1)]">Redefining</span>{" "}
                  <span className="text-black">How</span>
                  <br />
                  <span className="text-[rgba(107,124,255,1)]">Hiring</span>{" "}
                  <span className="text-black">Works</span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                <p className="xl:text-xl md:text-base text-sm  text-[rgba(10,13,26,0.7)] mb-10 lg:max-w-lg md:max-w-120 lg:leading-tight leading-relaxed mx-auto lg:mx-0">
                  Design once, interview thousands. Give candidates the practice they need and hiring teams the insights they deserve.
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                className="w-full"
              >
                <div className="flex  md:gap-4 gap-2 justify-center lg:justify-start w-full">
                  <Link href="/candidate/dashboard">
                    <Button
                      size="lg"
                      className="bg-[rgba(58,63,187,1)] border border-[rgba(58,63,187,0.9)] hover:bg-white hover:text-[rgba(58,63,187,1)] text-white font-medium px-8  md:py-6 py-4 rounded-md xl:text-xl md:text-base text-sm  flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      Take Interviews
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-current"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M14.7077 9.37508L10.6587 5.44877L11.5288 4.55139L17.1478 10.0001L11.5288 15.4487L10.6587 14.5514L14.7077 10.6251H2.5V9.37508H14.7077Z"
                          fill="currentColor"
                        />
                      </svg>
                    </Button>
                  </Link>

                  <Link href="https://cal.com/soham-mukherjee-8yzald/30min" target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      className="bg-white hover:bg-[rgba(58,63,187,1)] text-[rgba(58,63,187,1)] hover:text-white border border-[rgba(58,63,187,1)] font-medium px-8  md:py-6 py-4 rounded-md xl:text-xl md:text-base text-sm  flex items-center gap-2 transition-colors duration-200 w-full sm:w-auto justify-center"
                    >
                      Request Demo
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-current w-4 h-4 ml-1"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M17.439 8.96715L3.86972 0.22212C3.06472 -0.211451 2.14258 -0.166444 2.14258 1.38998V18.61C2.14258 20.0329 3.13186 20.2572 3.86972 19.7779L17.439 11.0328C17.9976 10.4621 17.9976 9.53786 17.439 8.96715Z"
                          fill="currentColor"
                        />
                      </svg>
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 ml-4 text-[rgba(10,13,26,0.6)] tracking-tighter text-center lg:text-left lg:text-base md:text-sm text-xs w-full">
                  Includes 6 Free Trial Credits <span className="mx-1 text-[rgba(10,13,26,0.7)]">|</span> Worth 2 Interviews
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
              className="w-full "
            >
              <HeroVideo />
            </motion.div>
          </div>
        </div>
      </main>



      <HiringFeaturesSection />

      <HiringTeamsSection />

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-[rgba(107,124,255,1)] px-6 md:px-15 lg:px-42 py-7 md:py-20 lg:py-25 xl:py-30 md:rounded-2xl rounded-sm mx-4 md:mx-15 lg:mx-15   my-15"
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center gap-8 md:gap-10">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            >
              <h2 className="text-lg md:text-3xl lg:text-4xl xl:text-5xl text-[rgba(245,247,255,1)] font-semibold tracking-tight md:w-full w-3/4 mx-auto">
                Excited to revolutionize your hiring process?
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            >
              <p className="md:w-full w-4/5 mx-auto text-xs md:text-base lg:text-xl xl:text-2xl text-[rgba(245,247,255,0.9)] font-medium max-w-2xl ">
                Join leading companies who are already hiring smarter with AI
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
          >
            <div className="flex gap-7 lg:mt-7 md:mt-4 ">
              <Link href="https://cal.com/soham-mukherjee-8yzald/30min" target="_blank" rel="noopener noreferrer">
                <Button className="md:rounded-xl rounded-sm px-3 py-2 md:px-6 md:py-5 lg:px-6 lg:py-6 border-2 border-[rgba(107,124,255,1)] hover:border-[rgba(245,247,255,1)] text-sm md:text-base lg:text-lg xl:text-xl font-medium bg-[rgba(245,247,255,1)] hover:bg-transparent hover:opacity-90 text-[rgba(107,124,255,1)] hover:text-[rgba(245,247,255,1)]">
                  Schedule a Demo
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="md:rounded-xl rounded-sm px-3 py-2 md:px-6 md:py-5 lg:px-6 lg:py-6 text-sm md:text-base lg:text-lg xl:text-xl   border-[rgba(245,247,255,1)] font-medium bg-transparent hover:bg-[rgba(245,247,255,1)] hover:opacity-90 border-2  text-[rgba(245,247,255,1)] hover:text-[rgba(107,124,255,1)]">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section>
        {/* Job Seekers Section */}
        <JobSeekersSection />



        {/* How it Works */}
        <section id="how-it-works" className="scroll-mt-[120px] bg-[rgba(253,255,245,1)] py-8 md:py-12 lg:py-16 mb-[20px]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

            {/* Section Header */}
            <div className="text-center mb-6 md:mb-10">
              <p className="text-sm md:text-base lg:text-lg font-medium text-[rgba(58,63,187,1)] uppercase tracking-tight mb-3">
                How It Works
              </p>
              <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-5xl font-semibold mb-2 mt-5">
                <span className="text-[rgba(10,13,26,1)]">How It Works for </span>
                <span className="text-[rgba(107,124,255,1)]">Job Seekers</span>
              </h2>
              <p className="md:w-3/4 mx-auto text-sm md:text-base lg:text-xl text-[rgba(10,13,26,0.7)] mt-3 max-w-4xl leading-relaxed">
                Prepare like never before. Practice with AI, get data-backed insights, and walk into interviews with confidence.
              </p>
            </div>

            {/* Steps - Removed flex/space-y to ensure sticky context works natively */}
            <div className="relative pb-[5vh]">
              {jobSeekerSteps.map((step, index) => {

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                    className="sticky mb-10 md:mb-16"
                    style={{
                      top: `calc(7rem + ${index * 1.5}rem)`, // Start sticking 7rem from top, stack 1.5rem down
                    }}
                  >
                    <Card
                      className="border-2 border-[rgba(58,63,187,1)] md:px-6 px-3 rounded-2xl overflow-hidden bg-white md:w-3/4 mx-auto lg:w-full "
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row lg:items-left items-center gap-4">

                          {/* Left Side - Content */}
                          <div className="flex-1 px-15 flex items-center">
                            <div className="text-center max-w-xs">
                              {/* Step Number + Icon */}
                              <div className="flex items-center justify-center gap-3 mb-2">
                                <span className="text-base md:text-xl font-semibold text-[rgba(107,124,255,1)]">
                                  0{step.number}
                                </span>
                                <Image
                                  src={step.icon}
                                  alt="step"
                                  width={50}
                                  height={50}
                                  className=" size-4 md:size-12 object-contain"
                                />
                              </div>

                              {/* Title */}
                              <h3 className="text-lg md:text-xl font-semibold text-[rgba(10,13,26,1)] mt-7 mb-2 ">
                                {step.title}
                              </h3>

                              {/* Description */}
                              <p className="text-xs md:text-sm lg:text-base text-[rgba(10,13,26,0.6)] tracking-tight">
                                {step.description}
                              </p>
                            </div>
                          </div>

                          {/* Right Side - Image */}
                          <div className="flex-1 p-0 md:p-4 flex items-center justify-center">
                            <div className="w-full max-w-xl">
                              <Image
                                src={step.image}
                                alt={step.imageAlt}
                                width={420}
                                height={220}
                                className="rounded-md w-full h-auto object-contain"
                              />
                            </div>
                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

          </div>
        </section>


        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-[rgba(245,255,199,1)] px-6 md:px-12 lg:px-28 xl:px-42 py-7 md:py-20 lg:py-25 xl:py-30 md:rounded-2xl rounded-sm mx-4 md:mx-10 lg:mx-15 xl:mx-20 my-15"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center gap-8 md:gap-10">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              >
                <h2 className="text-lg md:text-3xl lg:text-4xl xl:text-5xl text-[rgba(83,118,219,1)] font-semibold tracking-tight md:w-full w-3/4 mx-auto">
                  Start your free practice today
                </h2>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              >
                <p className="md:w-full w-4/5 mx-auto text-xs md:text-base lg:text-xl xl:text-2xl text-[rgba(11,31,59,0.6)] font-medium max-w-2xl">
                  No payment required. Start practicing in under 2 minutes.
                </p>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
            >
              <div className="flex gap-5 md:gap-7 lg:mt-7 md:mt-4">
                <Link href="/login">
                  <Button
                    className="flex items-center justify-center gap-2 md:rounded-xl rounded-sm px-5 py-2.5 md:px-8 md:py-5 lg:px-10 lg:py-6 border-2 border-[rgba(58,63,187,0.9)] text-sm md:text-base lg:text-lg xl:text-xl font-medium bg-[rgba(58,63,187,1)] hover:bg-transparent hover:opacity-90 text-white hover:text-[rgba(58,63,187,1)]">
                    Sign up
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="fill-current"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.7077 9.37508L10.6587 5.44877L11.5288 4.55139L17.1478 10.0001L11.5288 15.4487L10.6587 14.5514L14.7077 10.6251H2.5V9.37508H14.7077Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>
                </Link>
                <Link href="/#how-it-works">
                  <Button className="flex items-center justify-center md:rounded-xl rounded-sm px-5 py-2.5 md:px-8 md:py-5 lg:px-10 lg:py-6 text-sm md:text-base lg:text-lg xl:text-xl border-[rgba(58,63,187,0.9)] font-medium bg-transparent hover:bg-[rgba(58,63,187,1)] border-2 text-[rgba(83,118,219,1)] hover:text-white">
                    How it works
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>
        <Footer />
      </section>

    </div >
  );
}
