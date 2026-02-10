import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { MobileNavBar } from "@/components/mobile-navbar";
import { Footer } from "@/components/footer";
import * as motion from "motion/react-client";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { clientConfig, serverConfig } from "@/lib/auth/config";
import { AuthButtons } from "@/components/auth-buttons";
import { hiringFeatures, jobSeekerSteps, jobSeekerFeatures, hiringTeamSteps } from "@/lib/home-data";
import { WaitlistForm } from "@/components/waitlist-form";
import Header from "@/components/header";

export default async function Home() {

  return (
    <div className="min-h-screen  flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="relative w-full px-6 py-6 md:pt-28 pt-20 bg-[linear-gradient(95.57deg,#E7F5FF_7.28%,#F5F7FF_100.24%)]">


        {/* Content */}
        <div className="relative z-10 lg:max-w-7xl md:max-w-4xl w-full mx-auto text-center">
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

          {/* AI Badge */}
          <Badge className="bg-[linear-gradient(91deg,rgba(15,2,53,1)_-107.69%,rgba(43,5,155,1)_80.08%)] text-white px-6 py-2 mb-3 mt-2 text-sm">
            <Image
              src="/main/lightning.svg"
              alt="AI Badge"
              width={14}
              height={14}
              className="inline-block mr-2"
            />
            <span className="text-[rgba(213,220,255,0.9)]">
              AI-powered interview
            </span>
          </Badge>

          {/* Main Heading */}
          <h1 className="lg:text-4xl md:text-3xl text-2xl font-semibold lg:mb-1.5  -tracking-tightest">
            <span className="text-[rgba(58,63,187,1)]">
              Redefining How Hiring Works
            </span>
          </h1>

          {/* Subtitle */}
          <p className="lg:text-2xl md:text-xl text-[rgba(53,77,194,0.5)] text-sm mb-8 max-w-5xl mx-auto">
            Streamline recruitment and ace interviews with our AI-powered platform
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-12 justify-start lg:max-w-6xl md:max-w-4xl mx-auto pb-5">

            {/* Interview Section */}
            <div className="text-center relative">
              <Image
                src="/main/ellipse.svg"
                alt="Interview Illustration"
                width={300}
                height={200}
                className="absolute inset-0 mx-auto lg:w-[300px] md:w-[200px] w-[200px] z-[-1]"
              />
              <Image
                src="/main/interview.png"
                alt="Interview Illustration"
                width={300}
                height={200}
                className="mx-auto mb-6 lg:w-[300px] md:w-[200px] w-[200px] relative"
              />
              <h2 className="lg:text-3xl md:text-2xl text-base whitespace-nowrap font-semibold text-gray-800 mb-4">
                <span className="text-[rgb(69,94,255)] flex items-center justify-center gap-1">
                  <span>Interview</span>

                  <motion.div className="overflow-hidden lg:h-[37px] md:h-[31px]  h-[25px]">
                    <motion.div
                      animate={{ y: ["0%", "-100%", "-200%", "0%"] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex flex-col lg:h-[37px] md:h-[31px]  h-[25px]"
                    >
                      <span className="text-transparent bg-[linear-gradient(55.21deg,#173D7E_34.16%,#C3E1FC_93.59%)] bg-clip-text">
                        anytime
                      </span>
                      <span className="text-transparent bg-[linear-gradient(55.21deg,#173D7E_34.16%,#C3E1FC_93.59%)] bg-clip-text">
                        anywhere
                      </span>
                      <span className="text-transparent bg-[linear-gradient(55.21deg,#173D7E_34.16%,#C3E1FC_93.59%)] bg-clip-text">
                        effortlessly
                      </span>
                    </motion.div>
                  </motion.div>
                </span>
              </h2>
              <Link href="/candidate/dashboard">
                <Button
                  size="lg"
                  className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,1)] hover:opacity-80 text-[rgba(233,244,255,1)] font-medium md:px-8 md:py-3 px-5 py-2 rounded-lg lg:text-lg md:text-base text-sm hover:shadow-lg"
                >
                  Take interviews
                </Button>
              </Link>

            </div>

            {/* Hire Section */}
            <div className="text-center relative">
              <Image
                src="/main/ellipse2.svg"
                alt="Hire Illustration"
                width={300}
                height={200}
                className="absolute inset-0 mx-auto lg:w-[300px] md:w-[200px] w-[200px] z-[-1]"
              />
              <Image
                src="/main/hire.png"
                alt="Hire Illustration"
                width={300}
                height={200}
                className="mx-auto mb-6 lg:w-[300px] md:w-[200px] w-[200px] relative"
              />

              <h2 className="lg:text-3xl md:text-2xl text-base whitespace-nowrap font-semibold text-gray-800 mb-4">
                <span className="text-[rgba(69,94,255,1)] flex items-center justify-center gap-1">
                  <span>Hire</span>
                  <motion.div className="overflow-hidden lg:h-[37px] md:h-[31px]  h-[25px]">
                    <motion.div
                      animate={{ y: ["0%", "-100%", "-200%", "0%"] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex flex-col lg:h-[37px] md:h-[31px]  h-[25px]"
                    >
                      <span className="text-transparent bg-[linear-gradient(55.21deg,#173D7E_34.16%,#C3E1FC_93.59%)] bg-clip-text">
                        faster
                      </span>
                      <span className="text-transparent bg-[linear-gradient(55.21deg,#173D7E_34.16%,#C3E1FC_93.59%)] bg-clip-text">
                        fairer
                      </span>
                      <span className="text-transparent bg-[linear-gradient(55.21deg,#173D7E_34.16%,#C3E1FC_93.59%)] bg-clip-text">
                        smarter
                      </span>
                    </motion.div>
                  </motion.div>
                </span>
              </h2>

              <Link href="https://cal.com/soham-mukherjee-8yzald/30min" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-[rgba(58,63,187,1)] hover:bg-[rgba(58,63,187,1)] hover:opacity-80 text-[rgba(233,244,255,1)] font-medium md:px-8 md:py-3 px-5 py-2 rounded-lg lg:text-lg md:text-base text-sm hover:shadow-lg"
                >
                  Schedule a demo
                </Button>
              </Link>

            </div>

          </div>
        </div>
      </main>


      {/* Bottom Section */}
      <section className=" bg-[linear-gradient(68.04deg,rgba(58,63,187,0.9)_-8.15%,rgba(107,124,255,0.9)_66.87%)] text-white lg:py-20 md:py-10 lg:px-6 md:px-20  px-10 py-8">
        <div className="max-w-6xl mx-auto whitespace-nowrap">
          <div className="grid grid-cols-2 md:gap-12 gap-6 items-center">
            <div>
              <h2 className="lg:text-4xl md:text-2xl mb-4">
                For <span className=""><span className="font-bold">Hiring Teams</span></span>
              </h2>
            </div>
            <div>
              <h3 className="lg:text-4xl md:text-2xl  text-[rgba(255,255,255,0.3)] leading-tight">
                What if your next hire
              </h3>

              <h3 className="lg:text-4xl md:text-2xl md:ml-20 ml-10 text-[rgba(255,255,255,0.3)] leading-tight">came twice as fast?</h3>
            </div>
          </div>
        </div>
      </section>

      {/* For Hiring Teams Section */}
      <section id="hiring-teams" className="scroll-mt-[120px] py-10 lg:px-6 md:px-10 px-5 bg-[linear-gradient(106.66deg,#DCF4FF_3.3%,#E6F5FF_98.34%)]">
        <div className="lg:max-w-6xl md:max-w-3xl mx-auto">
          <div className="flex flex-col items-center  md:flex-row gap-8">
            {/* Left Content */}
            <div className="flex-1  space-y-6">
              <h2 className="lg:text-4xl md:text-xl md:w-full w-4/5  bg-[linear-gradient(103.06deg,rgba(58,63,187,0.9)_8.76%,rgba(93,107,238,0.9)_59.41%)] text-transparent bg-clip-text font-semibold">
                Our AI interview platform integrates seamlessly into your existing workflow, helping you identify top talent faster and more accurately.
              </h2>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="flex-1 flex flex-col gap-6 min-h-36">
              {hiringFeatures.map((feature, index) => (
                <Card key={index} className={`${feature.bgColor} p-0 rounded-4xl border ${feature.borderColor}`}>
                  <CardContent className="lg:p-6 md:p-5">
                    <div className="flex items-start p-2 space-x-4">
                      <Image src={feature.icon} alt={feature.title} className="rounded-full" width={40} height={40} />
                      <div>
                        <h3 className="lg:text-lg md:text-base text-sm font-semibold text-[rgba(58,63,187,1)]  mb-2">{feature.title}</h3>
                        <p className="lg:text-base md:text-sm text-xs text-[rgba(58,63,187,0.7)] font-medium ">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* Workflow and CTA Section */}
      <section className="  bg-[rgba(255, 255, 255, 1)] ">
        <div className="lg:max-w-6xl md:max-w-3xl mx-auto  px-3 p-2">
          <div className="flex items-center mx-5   my-8 w-fit border-b border-[rgba(120,130,237,0.6)]  lg:pb-2">
            <p className="lg:text-4xl md:text-2xl text-lg font-semibold my-4 md:tracking-[6px] tracking-[2px] text-semibold text-transparent bg-clip-text bg-[linear-gradient(94.46deg,#6772E6_-13.88%,#8791F4_113.71%)]">
              Journey made easy
            </p>
          </div>
          {/* Steps Container */}
          <div className="max-w-6xl mx-auto mb-12 px-4">
            <div className="flex flex-col md:flex-row lg:items-start items-center justify-between gap-12">

              {hiringTeamSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center relative"
                >
                  {/* Header + Connector Wrapper */}
                  <div className="relative flex items-center justify-center w-full">

                    {/* Step Card */}
                    <Card
                      className={`${step.bgColor} ${step.borderColor} border rounded-3xl 
            w-[280px] h-[72px] `}
                    >
                      <CardContent className="flex items-center justify-center h-full px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[rgba(224,245,255,1)] border-2 border-[rgba(108,132,255,1)] flex items-center justify-center">
                            <span className="text-sm font-bold text-[rgba(58,63,187,1)]">
                              {step.number}
                            </span>
                          </div>
                          <h3 className="text-sm md:text-base font-semibold text-[rgba(224,245,255,1)] whitespace-nowrap">
                            {step.title}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Connector Line */}
                    {index < hiringTeamSteps.length - 1 && (
                      <div className="hidden xl:block absolute right-[-57px] top-1/2 -translate-y-1/2 xl:w-20 w-[65px]">
                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                          <motion.div
                            className="h-full bg-[linear-gradient(90deg,#00D7FF,#3A3FBB)] origin-left"
                            initial={{ scaleX: 0.2 }}
                            animate={{ scaleX: [0.2, 0.5, 1, 0.2] }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>


                  {/* Description */}
                  <p className="text-center text-[rgba(6,15,100,0.5)] text-sm font-semibold mt-4">
                    {step.description}
                  </p>

                  {/* Image */}
                  <div className="mt-10 w-full flex justify-center">
                    <div className="rounded-2xl shadow-md bg-white p-4">
                      {step.hasImageContainer ? (
                        <div className=" rounded-2xl md:py-12 lg:py-12 py-10 lg:w-[300px]      shadow-md px-5 bg-[rgba(249,255,255,1)]">
                          <Image className="rounded-lg" src={step.image} alt={step.imageAlt} width={330} height={150} />
                        </div>
                      ) : (
                        <Image
                          src={step.image}
                          alt={step.imageAlt}
                          width={350}
                          height={230}
                          className="rounded-xl object-contain"
                        />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/*  */}


        {/* CTA Section */}
        <section className="w-full px-5 bg-[linear-gradient(95.83deg,rgba(0,13,137,0.9)_-2.79%,rgba(0,50,216,0.9)_104.99%)] rounded-t-3xl md:px-0 py-10">
          <div className="w-full">
            <div className="flex flex-col items-center text-center gap-6">
              <div>
                <h2 className="lg:text-[32px] md:mb-2 mb-3 md:text-2xl text-transparent bg-clip-text bg-[linear-gradient(90deg,#EFF3FF_0%,#C8C7FF_100%)] font-semibold tracking-tight">
                  Excited to revolutionize your hiring process?
                </h2>
                <p className="text-[rgba(206,241,248,0.3)] max-w-2xl lg:text-2xl md:text-xl">
                  Join leading companies who are already hiring smarter with AI
                </p>

              </div>
              <div className="flex  gap-4 mt-2 md:max-w-3xl lg:max-w-6xl">
                <Link href="https://cal.com/soham-mukherjee-8yzald/30min" target="_blank" rel="noopener noreferrer">
                  <Button className="rounded-xl px-8 lg:py-6 md:py-4  lg:text-2xl  md:text-xl font-semibold bg-[rgba(0,12,134,0.9)] hover:bg-[rgba(0,12,134,0.9)] hover:opacity-90 border-2 border-[rgba(99,112,227,1)] hover:text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.08)] text-[rgba(224,244,255,0.9)]">
                    Schedule a Demo
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button className="rounded-xl px-8 lg:py-6 md:py-4 lg:text-2xl md:text-xl  font-semibold hover:opacity-90 hover:text-white bg-[rgba(68,102,198,1)] border-2 border-[rgba(224,244,255,1)] text-[rgba(224,244,255,0.9)] hover:bg-[rgba(255,255,255,0.1)]">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </section>
      <section className="bg-[rgba(243,255,190,0.15)]">
        {/* Job Seekers Section */}
        <section id="job-seekers" className="scroll-mt-[120px] mt-15 bg-[linear-gradient(91.27deg,rgba(231,255,125,0.6)_2.28%,rgba(243,255,191,0.6)_108.31%)] text-white md:py-12 py-8 px-6">
          <div className="lg:max-w-5xl md:max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
              <div className="">
                <h2 className="text-5xl md:mb-4 mb-0">
                  <span className="block  lg:text-4xl md:text-3xl text-base text-[rgba(166,203,29,0.5)]">Getting a job</span>
                  <span className="block text-[rgba(166,203,29,0.5)] lg:text-4xl md:text-3xl text-sm font-semibold md:mt-2 mt-0 md:ml-10 ml-5">Just got easier</span>
                </h2>
              </div>
              <div>
                <h3 className="lg:text-4xl md:text-3xl text-sm bg-[linear-gradient(271.56deg,#86A5FF_-14.72%,#4569D1_128.95%)] text-transparent bg-clip-text leading-tight">
                  <span className="">For</span> <span className="font-bold">Job Seekers</span>
                </h3>
              </div>
            </div>
          </div>
        </section>


        {/* Features Grid */}
        <section className="py-10 px-6 bg-[rgba(243,255,190,0.15)]">


          <div className="max-w-7xl mx-auto   min-h-36">
            <div className="flex flex-col-reverse  md:items-center  md:flex-row  gap-4">
              {/* Left Content - Feature Cards */}
              <div className="flex-1 flex flex-col gap-6">
                {jobSeekerFeatures.map((feature, index) => (
                  <Card key={index} className={`${feature.bgColor} p-0 rounded-4xl border ${feature.borderColor}`}>
                    <CardContent className="lg:p-6 md:p-5">
                      <div className="flex items-start p-2 space-x-4">
                        <Image src={feature.icon} alt={feature.title} className="rounded-full" width={40} height={40} />
                        <div>
                          <h3 className="lg:text-lg md:text-base text-sm font-semibold text-[rgba(58,63,187,1)]  mb-2">{feature.title}</h3>
                          <p className="lg:text-base md:text-sm text-xs text-[rgba(58,63,187,0.7)] font-medium ">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="space-y-4 my-4">
                <div className="max-w-xl md:max-w-2xl w-full mt-2 mx-0 md:ml-0 text-left md:text-right">
                  <p className="text-base font-semibold leading-tight text-[rgba(116,130,248,0.85)] lg:text-[32px] md:text-2xl">
                    <span className="block">Prepare for</span>
                    <span className="block">any interview—</span>
                    <span className="block">AI-powered or traditional</span>
                    <span className="block">with unlimited, adaptive practice</span>
                    <span className="block">sessions tailored to your needs and skills.</span>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>



        {/* How it Works */}
        <section id="how-it-works" className=" scroll-mt-[120px] bg-[rgba(243,255,190,0.15)]]">
          <div className="lg:max-w-6xl md:max-w-3xl mx-auto px-3 p-2">

            <div className="lg:text-4xl md:text-2xl text-base md:mb-4 mb-0 text-center text-[rgba(58,63,187,1)]">How it works</div>

            <div className="md:w-xl w-[200px] mx-auto p-4 mb-2">
              <Separator className="bg-[rgba(201,231,81,0.7)]" />
            </div>

            <div className="max-w-6xl mx-auto mb-12 px-4">
              <div className="flex flex-col md:flex-row lg:items-start items-center justify-between gap-12">
                {jobSeekerSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center relative"
                  >
                    {/* Header + Connector Wrapper */}
                    <div className="relative flex items-center justify-center w-full">

                      {/* Step Card */}
                      <Card
                        className={`${step.bgColor} ${step.borderColor} border rounded-3xl 
            w-[280px] h-[72px] `}
                      >
                        <CardContent className="flex items-center justify-center h-full px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[rgba(224,245,255,1)] border-2 border-[rgba(108,132,255,1)] flex items-center justify-center">
                              <span className="text-sm font-bold text-[rgba(107,124,255,1)]">
                                {step.number}
                              </span>
                            </div>
                            <h3 className="text-sm md:text-base font-semibold text-[rgba(224,245,255,1)] whitespace-nowrap">
                              {step.title}
                            </h3>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Connector Line */}
                      {index < jobSeekerSteps.length - 1 && (
                        <div className="hidden xl:block absolute right-[-57px] top-1/2 -translate-y-1/2 xl:w-20 w-[65px]">
                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                            <motion.div
                              className="h-full bg-[linear-gradient(90deg,#00D7FF,#3A3FBB)] origin-left"
                              initial={{ scaleX: 0.2 }}
                              animate={{ scaleX: [0.2, 0.5, 1, 0.2] }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-center text-[rgba(6,15,100,0.5)] text-sm font-semibold mt-4">
                      {step.description}
                    </p>

                    {/* Image */}
                    <div className="mt-10 w-full flex justify-center">
                      <div className="rounded-2xl shadow-md bg-white p-4">
                        {step.hasImageContainer ? (
                          <div className=" rounded-2xl md:py-12 lg:py-12 py-10 lg:w-[300px]      shadow-md px-5 bg-[rgba(249,255,255,1)]">
                            <Image className="rounded-lg" src={step.image} alt={step.imageAlt} width={330} height={150} />
                          </div>
                        ) : (
                          <Image
                            src={step.image}
                            alt={step.imageAlt}
                            width={350}
                            height={230}
                            className="rounded-xl object-contain"
                          />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        <section className="bg-[rgba(245,255,199,1)] px-6 md:px-8 lg:px-12 py-20 md:py-24 lg:py-30 rounded-3xl mx-4 md:mx-6 lg:mx-10 my-8">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center gap-8 md:gap-10">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl lg:text-5xl text-[rgba(83,118,219,1)] font-semibold tracking-tight">
                  Start your free practice today
                </h2>
                <p className="text-base md:text-lg lg:text-xl text-[rgba(11,31,59,0.6)] font-medium max-w-2xl mx-auto">
                  No payment required. Start practicing in under 2 minutes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/signup">
                  <Button className="rounded-xl px-10 py-4 md:px-12 md:py-5 lg:px-14 lg:py-6 border-2 border-[rgba(58,63,187,0.9)] text-lg md:text-xl lg:text-2xl font-semibold bg-[rgba(58,63,187,1)] hover:bg-transparent hover:opacity-90 text-white hover:text-[rgba(58,63,187,1)]">
                    Sign up
                  </Button>
                </Link>
                <Link href="/#how-it-works">
                  <Button className="rounded-xl px-10 py-4 md:px-12 md:py-5 lg:px-14 lg:py-6 text-lg md:text-xl lg:text-2xl   border-[rgba(58,63,187,0.9)]font-semibold bg-transparent hover:bg-[rgba(58,63,187,1)] hover:opacity-90 border-2 border-[rgba(58,63,187,1)] text-[rgba(83,118,219,1)] hover:text-white">
                    How it works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </section>

    </div >
  );
}
