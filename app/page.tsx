"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [open, setOpen] = useState(false);
  const hiringFeatures = [
    {
      bgColor: "bg-[rgba(253,203,80,0.3)]",
      borderColor: "border-[rgba(192,237,245,0.3)]",
      icon: "/main/book.gif",
      title: "Better Quality",
      description: "Go beyond resumes to assess real skills and fit"
    },
    {
      bgColor: "bg-[rgba(51,204,204,0.2)]",
      borderColor: "border-[rgba(192,237,245,0.3)]",
      icon: "/main/balance.gif",
      title: "Reduce Bias",
      description: "Fair, consistent evaluation criteria for every candidate"
    },
    {
      bgColor: "bg-[rgba(177,217,82,0.3)]",
      borderColor: "border-[rgba(183,228,79,0.31)]",
      icon: "/main/time.gif",
      title: "Save Time",
      description: "Automate initial screening and focus on the best candidates"
    },
    {
      bgColor: "bg-[rgba(39,162,204,0.2)]",
      borderColor: "border-[rgba(192,237,245,0.3)]",
      icon: "/main/people.gif",
      title: "Scale Easily",
      description: "Interview hundreds of candidates without adding resources"
    }
  ];

  const jobSeekerSteps = [
    {
      number: "1",
      title: "Mock Interview",
      description: "Our AI coach helps you get comfortable with conversational, unlimited mock interviews.",
      image: "/main/mock_interview.png",
      imageAlt: "Mock Interview",
      hasImageContainer: true
    },
    {
      number: "2",
      title: "Instant Feedback",
      description: "Receive your interview performance score, strengths, weaknesses, and improvement tips instantly.",
      image: "/main/feedback.png",
      imageAlt: "Feedback",
      hasImageContainer: false
    },
    {
      number: "3",
      title: "Actual Interview",
      description: "When you're ready, start your official interview — just like a real hiring round.",
      image: "/main/interview2.png",
      imageAlt: "Interview",
      hasImageContainer: false
    }
  ];

  const jobSeekerFeatures = [
    {
      bgColor: "bg-[rgba(51,204,204,0.1)]",
      borderColor: "border-[rgba(192,237,245,0.3)]",
      icon: "/main/24.gif",
      title: "Practice Anytime",
      description: "24/7 access to mock interviews—no scheduling hassles"
    },
    {
      bgColor: "bg-[rgba(253,96,80,0.1)]",
      borderColor: "border-[rgba(246,225,220,1)]",
      icon: "/main/score.gif",
      title: "Instant Scores",
      description: "Get your interview score based on your performance within a few minutes"
    },
    {
      bgColor: "bg-[rgba(51,204,204,0.1)]",
      borderColor: "border-[rgba(192,237,245,0.3)]",
      icon: "/main/eye.gif",
      title: "Realistic Scenarios",
      description: "Practice with interview questions from your industry"
    },
    {
      bgColor: "bg-[rgba(177,217,82,0.1)]",
      borderColor: "border-[rgba(238,245,229,1)]",
      icon: "/main/progress.gif",
      title: "Track your Progress",
      description: "Get detailed insights on your performance"
    }
  ];

  const hiringTeamSteps = [
    {
      number: "1",
      bgColor: "bg-[rgba(58,63,187,1)]",
      borderColor: "border-[rgba(58,63,187,1)]",
      title: "Design Your Flow",
      description: "Create interview sections with custom configurations and AI guidelines",
      image: "/main/getting-started.png",
      imageAlt: "Getting Started Illustration",
      hasImageContainer: true
    },
    {
      number: "2",
      bgColor: "bg-[rgba(58,63,187,1)]",
      borderColor: "border-[rgba(58,63,187,1)]",
      title: "Conduct AI Interviews",
      description: "AI-powered interviews with real-time adaptation and candidate interaction",
      image: "/main/candidate.png",
      imageAlt: "Candidate Illustration",
      hasImageContainer: false
    },
    {
      number: "3",
      bgColor: "bg-[rgba(58,63,187,1)]",
      borderColor: "border-[rgba(58,63,187,1)]",
      title: "Get Insights",
      description: "Review interview scores, transcripts, and performance analytics for better decisions",
      image: "/main/meet.png",
      imageAlt: "Insights Illustration",
      hasImageContainer: false
    }
  ];

  return (
    <div className="min-h-screen  flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 sm:px-6 px-2 md:py-4 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200/20 shadow-sm w-screen max-w-full overflow-x-hidden box-border">
        <nav className="flex items-center justify-between w-full max-w-full md:max-w-7xl md:mx-auto overflow-x-hidden box-border m-0">
          <div className="flex items-center space-x-2">
            <Image className="md:size-[34px] lg:[size-40px] size-6" src="/main/logo.png" alt="Bait AI Logo" width={40} height={40} />
            <span className="lg:text-3xl md:text-2xl text-base font-bold bg-clip-text text-transparent bg-[linear-gradient(106.63deg,rgba(16,81,171,1)_0%,rgba(28,15,111,1)_144.25%)]">bAIt</span>
          </div>
          <div className="hidden md:flex items-center lg:space-x-8 space-x-4">
            <Link href="#" className="text-[rgba(69,94,255,0.8)] hover:opacity-70 font-medium">About us</Link>
            <Link href="#" className="text-[rgba(69,94,255,0.8)] hover:opacity-70 font-medium">For Hiring Teams</Link>
            <Link href="#" className="text-[rgba(69,94,255,0.8)] hover:opacity-70 font-medium">For Job Seekers</Link>
            <Link href="#" className="text-[rgba(69,94,255,0.8)] hover:opacity-70 font-medium">Pricing</Link >
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="lg:text-base rounded-full text-sm bg-[linear-gradient(106.03deg,rgba(239,246,254,0.5)_0%,rgba(163,217,248,0.5)_238.47%)]  text-[rgba(108,132,255,1)] hover:opacity-70 border font-medium  border-[rgba(108,132,255,0.9)]">Sign in</Button>
            <Button className="flex rounded-full items-center overflow-hidden p-5 lg:text-base text-sm  bg-[linear-gradient(106.03deg,#677CFF_0%,#A3D9F8_238.47%)] hover:opacity-70 text-[rgba(238,246,251,1)] font-medium ">
              Request a demo
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-[rgba(69,94,255,0.8)] ml-auto">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full p-10 min-h-screen bg-[linear-gradient(172.97deg,#E8F5FA_-6.95%,#F5F7FF_91.64%)]"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <nav className="flex flex-col gap-6 px-5 mt-8">
                <div className="flex items-center gap-4 border-[rgba(121,153,253,0.05)] border p-1 px-2 ">
                  <Image src="/main/nav/about.svg" alt="Bait AI Logo" width={15} height={15} />
                  <Link
                    href="#"
                    className=" text-[rgba(10,13,26,0.7)] hover:opacity-70 font-medium py-2"
                    onClick={() => setOpen(false)}
                  >
                    About us
                  </Link>
                </div>

                <div className="flex items-center gap-4 border-[rgba(121,153,253,0.05)] border p-1 px-2 ">
                  <Image src="/main/nav/briefcase.svg" alt="briefcase" width={15} height={15} />
                  <Link
                    href="#"
                    className=" text-[rgba(10,13,26,0.7)] hover:opacity-70 font-medium py-2"
                    onClick={() => setOpen(false)}
                  >
                    For Hiring Teams
                  </Link>
                </div>

                <div className="flex items-center gap-4 border-[rgba(121,153,253,0.05)] border p-1 px-2 ">
                  <Image src="/main/nav/people.svg" alt="people" width={15} height={15} />

                  <Link
                    href="#"
                    className=" text-[rgba(10,13,26,0.7)] hover:opacity-70 font-medium py-2"
                    onClick={() => setOpen(false)}
                  >
                    For Job Seekers
                  </Link>
                </div>

                <div className="flex items-center gap-4 border-[rgba(121,153,253,0.05)] border p-1 px-2 ">
                  <Image src="/main/nav/money.svg" alt="money" width={15} height={15} />

                  <Link
                    href="#"
                    className=" text-[rgba(10,13,26,0.7)] hover:opacity-70 font-medium py-2"
                    onClick={() => setOpen(false)}
                  >
                    Pricing
                  </Link>
                </div>

                <Separator className="my-2" />
               
              </nav>
               <div className="flex flex-col gap-4 border-[rgba(121,153,253,0.05)] border  px-2 p-1">
                  <Button variant="ghost" className="w-full bg-[linear-gradient(106.03deg,rgba(239,246,254,0.5)_0%,rgba(163,217,248,0.5)_238.47%)] text-[rgba(108,132,255,1)] hover:opacity-70 border font-medium border-[rgba(108,132,255,0.9)]">
                    Sign in
                  </Button>
                  <Button className="w-full  bg-[linear-gradient(106.03deg,#677CFF_0%,#A3D9F8_238.47%)] hover:opacity-70 text-[rgba(238,246,251,1)] font-medium">
                    Request a demo
                  </Button>
                </div>
            </SheetContent>
          </Sheet>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="w-full px-6 py-6 md:pt-28 pt-20 bg-[linear-gradient(95.57deg,#E7F5FF_7.28%,#F5F7FF_100.24%)]">
        <div className="lg:max-w-7xl md:max-w-4xl w-full mx-auto text-center">
          {/* AI Badge */}
          <Badge className="bg-[linear-gradient(91deg,rgba(15,2,53,1)_-107.69%,rgba(43,5,155,1)_80.08%)] text-white px-6 py-2 mb-8 mt-5 text-sm">
            <Image src="/main/lightning.svg" alt="AI Badge" width={14} height={14} className="inline-block mr-2" />
            <span className="text-[rgba(213,220,255,0.9)] ">AI-powered interview</span>
          </Badge>

          {/* Main Heading */}
          <h1 className="lg:text-4xl md: md:text-3xl text-2xl font-semibold lg:mb-6 md:mb-4 ">
            <span className="text-[rgba(58,63,187,1)]">Train Talent,Transform Hiring</span>
          </h1>

          {/* Subtitle */}
          <p className="lg:text-2xl md:text-xl text-[rgba(53,77,194,0.5)] text-sm mb-16 max-w-3xl mx-auto">
            Streamline recruitment and ace interviews with our AI-powered platform
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-12 justify-start lg:max-w-6xl md:max-w-4xl mx-auto">
            {/* Interview Section */}
            <div className="text-center">
              <Image src="/main/interview.png" alt="Interview Illustration" width={300} height={200} className="mx-auto mb-6 lg:w-[300px] md:w-[200px] w-[200px]" />
              <h2 className="lg:text-3xl md:text-2xl text-base whitespace-nowrap font-semibold text-gray-800 mb-4">
                <span className="text-[rgba(69,94,255,1)] ">Interview <span className=" bg-[linear-gradient(64.98deg,#173D7E_26.21%,#C3E1FC_99.03%)] bg-clip-text">effortlessly</span></span>
              </h2>
              <Button size="lg" className="bg-[rgba(58,63,187,1)] text-[rgba(233,244,255,1)] font-medium md:px-8 md:py-3 px-5 py-2 rounded-lg lg:text-lg md:text-base text-sm hover:shadow-lg">
                Take interviews
              </Button>
            </div>

            {/* Hire Section */}
            <div className="text-center">
              <Image src="/main/hire.png" alt="Hire Illustration" width={300} height={200} className="mx-auto mb-6 lg:w-[300px] md:w-[200px] w-[200px]" />
              <h2 className="lg:text-3xl md:text-2xl text-base whitespace-nowrap font-semibold text-gray-800 mb-4">
                <span className="text-[rgba(69,94,255,1)] ">Hire</span> <span className=" bg-[linear-gradient(64.98deg,#173D7E_26.21%,#C3E1FC_99.03%)] bg-clip-text">Smarter</span>
              </h2>
              <Button size="lg" className="bg-[rgba(58,63,187,1)] text-[rgba(233,244,255,1)] font-medium md:px-8 md:py-3 px-5 py-2 rounded-lg lg:text-lg md:text-base text-sm hover:shadow-lg">
                Schedule a demo
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Section */}
      <section className="mt-2 bg-[linear-gradient(68.04deg,rgba(58,63,187,0.9)_-8.15%,rgba(107,124,255,0.9)_66.87%)] text-white lg:py-20 md:py-10 lg:px-6 md:px-20  px-10 py-8">
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

      {/* Features Section */}
      <section className="py-10 lg:px-6 md:px-10 px-5 bg-[linear-gradient(106.66deg,#DCF4FF_3.3%,#E6F5FF_98.34%)]">
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
          <div className="flex flex-col md:flex-row w-6/10 md:w-full mx-auto justify-between items-start gap-8 mb-12">
            {hiringTeamSteps.map((step, index) => (
              <div key={index} className="flex-1">
                <Card className={`${step.bgColor} p-0  border ${step.borderColor} rounded-3xl lg:mb-3 md:mb-1`}>
                  <CardContent className="flex items-center justify-center lg:p-4 md:p-3 p-2">
                    <div className="flex items-center justify-center gap-4">
                      <div className="md:w-12 md:h-12 h-6 w-6 rounded-full bg-[rgba(224,245,255,1)] border border-[rgba(94, 114, 255, 0.5)] border-2 border-[rgba(108,132,255,1)] flex items-center justify-center">
                        <span className="lg:text-lg md:text-base text-sm font-bold text-[rgba(58,63,187,1)] ">{step.number}</span>
                      </div>
                      <h3 className="lg:text-lg md:text-base text-sm  font-semibold text-[rgba(224,245,255,1)]">{step.title}</h3>
                    </div>
                  </CardContent>
                </Card>
                <p className="text-center text-[rgba(6,15,100,0.9)] md:text-sm text-xs lg:text-base  p-2">
                  {step.description}
                </p>
                {step.hasImageContainer ? (
                  <div className="m-4 rounded-2xl md:py-12 lg:py-17 py-10 lg:w-[350px]      shadow-md px-5 bg-[rgba(249,255,255,1)]">
                    <Image className="rounded-lg" src={step.image} alt={step.imageAlt} width={330} height={110} />
                  </div>
                ) : (
                  <Image className="rounded-2xl m-4" src={step.image} alt={step.imageAlt} width={350} height={230} />
                )}
              </div>
            ))}
          </div>
        </div>


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
                <Button className="rounded-xl px-8 lg:py-6 md:py-4  lg:text-2xl  md:text-xl font-semibold bg-[rgba(0,12,134,0.9)] hover:bg-[rgba(0,12,134,0.9)] hover:opacity-90 border-2 border-[rgba(99,112,227,1)] hover:text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.08)] text-[rgba(224,244,255,0.9)]">
                  Schedule a Demo
                </Button>
                <Button className="rounded-xl px-8 lg:py-6 md:py-4 lg:text-2xl md:text-xl  font-semibold hover:opacity-90 hover:text-white bg-[rgba(68,102,198,1)] border-2 border-[rgba(224,244,255,1)] text-[rgba(224,244,255,0.9)] hover:bg-[rgba(255,255,255,0.1)]">
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        </section>

      </section>
      <section className="bg-[rgba(243,255,190,0.15)]">
        {/* Job Seekers Section */}
        <section className="mt-15 bg-[linear-gradient(91.27deg,rgba(231,255,125,0.6)_2.28%,rgba(243,255,191,0.6)_108.31%)] text-white md:py-12 py-8 px-6">
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


          <div className="max-w-7xl mx-auto  min-h-36">
            <div className="flex flex-col-reverse  md:items-center  md:flex-row  gap-4">
              {/* Left Content - Feature Cards */}
              <div className="flex-1 flex flex-col gap-6">
                {jobSeekerFeatures.map((feature, index) => (
                  <Card key={index} className={`${feature.bgColor} p-0 rounded-4xl border ${feature.borderColor}`}>
                    <CardContent className="lg:p-6 md:p-5">
                      <div className="flex items-start p-2 space-x-4">
                        <Image src={feature.icon} alt={feature.title} className="rounded-full" width={40} height={40} />
                        <div>
                          <h3 className="lg:text-lg md:text-base text-sm  font-semibold text-[rgba(116,130,248,1)]  mb-2">{feature.title}</h3>
                          <p className="lg:text-base md:text-sm text-xs text-[rgba(116,130,248,0.7)] font-semibold ">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="space-y-4 my-4">
                <div className="max-w-xl md:max-w-2xl w-full mt-2 mx-0 md:ml-0 text-left md:text-right">
                  <p className="text-base font-semibold leading-tight text-[rgba(116,130,248,0.85)] lg:text-4xl md:text-2xl">
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
        <section className="  bg-[rgba(243,255,190,0.15)]]">


          <div className="lg:text-4xl md:text-2xl text-base md:mb-4 mb-0 text-center text-[rgba(58,63,187,1)]">How it works</div>

          <div className="md:w-xl w-[200px] mx-auto p-4 mb-2">
            <Separator className="bg-[rgba(201,231,81,0.7)]" />
          </div>



          <div className="md:max-w-6xl   mx-auto">
            {/* Steps Container */}
            <div className="flex  flex-col md:flex-row md:w-full w-6/10 mx-auto justify-between items-start gap-8 mb-12 lg:max-w-6xl md:max-w-3xl">
              {jobSeekerSteps.map((step, index) => (
                <div key={index} className="flex-1">
                  <Card className="bg-[rgba(107,124,255,1)] p-0  border border-[rgba(107,124,255,1)] rounded-3xl mb-6">
                    <CardContent className="flex items-center justify-center lg:p-4 md:p-3 p-2">
                      <div className="flex items-center justify-center gap-4">
                        <div className="md:w-12 md:h-12 h-6 w-6 rounded-full bg-[rgba(224,245,255,1)]  border-2 border-[rgba(107,124,255,1)] flex items-center justify-center">
                          <span className="lg:text-lg md:text-base text-sm font-medium text-[rgba(107,124,255,1)]">{step.number}</span>
                        </div>
                        <h3 className="lg:text-lg md:text-base text-sm font-semibold text-[rgba(245,248,245,1)]">{step.title}</h3>
                      </div>
                    </CardContent>
                  </Card>
                  <p className="text-center text-[rgba(6,15,100,0.5)] text-sm font-semibold">
                    {step.description}
                  </p>
                  {step.hasImageContainer ? (
                    <div className="flex items-center justify-center my-4 rounded-4xl py-6 h-[220px] shadow-md px-2 bg-[rgba(249,255,255,1)]">
                      <Image className="rounded-lg" src={step.image} alt={step.imageAlt} width={300} height={450} />
                    </div>
                  ) : (
                    <Image className="rounded-4xl m-4" src={step.image} alt={step.imageAlt} width={350} height={230} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="w-full bg-[linear-gradient(92.04deg,rgba(230,255,128,0.7)_-5.1%,rgba(229,255,123,0.7)_106.14%)]  px-0 md:py-10 py-6">
          <div className="w-full">
            <div className="flex flex-col items-center text-center gap-6">
              <div>
                <h2 className="md:text-2xl t mb-2 lg:text-[32px] text-transparent bg-clip-text bg-[linear-gradient(271.56deg,#86A5FF_-14.72%,#4569D1_128.95%)] font-semibold tracking-tight">
                  Start Your Free Practice Today
                </h2>
                <p className="bg-clip-text text-transparent font-semibold bg-[linear-gradient(271.56deg,rgba(134,165,255,0.5)_-14.72%,rgba(69,105,209,0.5)_128.95%)] max-w-2xl lg:text-2xl md:text-xl text-sm">
                  No payment required. Start practicing in under 2 minutes.
                </p>

              </div>
              <div className="flex flex-row gap-4 mt-2">
                <Button className="rounded-xl px-8 lg:py-6 md:py-4   lg:text-2xl  md:text-xl font-semibold bg-[rgba(83,118,219,1)] hover:bg-[rgba(83,118,219,1)] hover:opacity-90 border-[rgba(99,112,227,1)]  text-[rgba(234,253,161,1)]">
                  Create a free account
                </Button>
                <Button className="rounded-xl px-8 lg:py-6 md:py-4  lg:text-2xl  md:text-xl font-semibold hover:opacity-90 hover:bg-[rgba(234,253,161,1)]   bg-[rgba(234,253,161,1)]  border-2 border-[rgba(83,118,219,1)] text-[rgba(83,118,219,1)] ">
                  How it works
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full   px-0 lg:py-15 md:py-8 py-8">
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

      </section>

    </div>
  );
}
