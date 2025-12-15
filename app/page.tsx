import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full  ">
      {/* Header */}
      <header className="px-6 py-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Image src="/main/logo.png" alt="Bait AI Logo" width={40} height={40} />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-[linear-gradient(106.63deg,rgba(16,81,171,1)_0%,rgba(28,15,111,1)_144.25%)]">bAIt</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-[rgba(69,94,255,0.8)] hover:opacity-70">About us</Link>
            <Link href="#" className="text-[rgba(69,94,255,0.8)] hover:opacity-70">For Hiring Teams</Link>
            <Link href="#" className="text-[rgba(69,94,255,0.8)] hover:opacity-70">For Job Seekers</Link>
            <Link href="#" className="text-[rgba(69,94,255,0.8)] hover:opacity-70">Pricing</Link >
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="bg-[linear-gradient(106.03deg,rgba(239,246,254,0.5)_0%,rgba(163,217,248,0.5)_238.47%)]  text-[rgba(108,132,255,1)] hover:opacity-70 border font-medium  border-[rgba(108,132,255,0.9)]">Sign in</Button>
            <Button className="rounded-full bg-[linear-gradient(106.03deg,#677CFF_0%,#A3D9F8_238.47%)] hover:opacity-70  text-[rgba(238,246,251,1)]  font-medium ">
              Request a demo
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-6 bg-[linear-gradient(95.57deg,#E7F5FF_7.28%,#F5F7FF_100.24%)]">
        <div className="max-w-7xl mx-auto text-center">
          {/* AI Badge */}
          <Badge className="bg-[linear-gradient(91deg,rgba(15,2,53,1)_-107.69%,rgba(43,5,155,1)_80.08%)] text-white px-6 py-2 mb-8 text-sm">
            <Image src="/main/lightning.svg" alt="AI Badge" width={14} height={14} className="inline-block mr-2" />
            <span className="text-[rgba(213,220,255,0.9)]">AI-powered interview</span>
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl font-semibold mb-6">
            <span className="bg-[linear-gradient(90deg,rgba(49,56,217,0.79)_-46.65%,rgba(71,84,236,0.79)_0.59%,rgba(0,215,255,0.79)_43.6%,rgba(186,228,0,0.79)_69.68%,rgba(59,81,254,0.79)_88.72%)] text-transparent bg-clip-text">Train Talent,Transform Hiring</span>
          </h1>

          {/* Subtitle */}
          <p className="md:text-2xl text-xl text-[rgba(53,77,194,0.5)] mb-16 max-w-3xl mx-auto">
            Streamline recruitment and ace interviews with our AI-powered platform
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-12 justify-start max-w-6xl mx-auto">
            {/* Interview Section */}
            <div className="text-center">
              <Image src="/main/interview.png" alt="Interview Illustration" width={300} height={200} className="mx-auto mb-6" />
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                <span className="text-[rgba(69,94,255,1)]">Interview</span> <span className="bg-[linear-gradient(55.21deg,#173D7E_34.16%,#C3E1FC_93.59%)] text-transparent bg-clip-text">effortlessly</span>
              </h2>
              <Button size="lg" className="bg-[linear-gradient(91.23deg,rgba(198,232,73,0.9)_-28.19%,rgba(0,215,255,0.9)_134.02%)] text-[rgba(53,77,194,1)] font-medium px-8 py-3 rounded-full text-lg hover:shadow-lg">
                Take interviews
              </Button>
            </div>

            {/* Hire Section */}
            <div className="text-center">
              <Image src="/main/hire.png" alt="Hire Illustration" width={300} height={200} className="mx-auto mb-6" />
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                <span className="text-[rgba(69,94,255,1)]">Hire</span> <span className="bg-[linear-gradient(55.21deg,#173D7E_34.16%,#C3E1FC_93.59%)] text-transparent bg-clip-text">Smarter</span>
              </h2>
              <Button size="lg" className="px-8 py-3 rounded-full text-lg bg-[linear-gradient(90deg,#3A3FBB_0%,#00D7FF_100%)] text-[rgba(217,246,255,1)] font-medium">
                Schedule a demo
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Section */}
      <section className="mt-2 bg-[linear-gradient(68.04deg,rgba(58,63,187,0.9)_-8.15%,rgba(107,124,255,0.9)_66.87%)] text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl  mb-4">
                For <span className=""><span className="font-bold">Hiring Teams</span></span>
              </h2>
            </div>
            <div>
              <h3 className="text-4xl  text-[rgba(255,255,255,0.3)] leading-tight">
                What if your next hire
              </h3>

              <h3 className="text-4xl ml-20 text-[rgba(255,255,255,0.3)] leading-tight">came twice as fast?</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 px-6 bg-[linear-gradient(106.66deg,#DCF4FF_3.3%,#E6F5FF_98.34%)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center  md:flex-row gap-8">
            {/* Left Content */}
            <div className="flex-1  space-y-6">
              <h2 className="text-4xl  bg-[linear-gradient(103.06deg,rgba(0,13,144,0.5)_8.76%,rgba(93,107,238,0.5)_59.41%)] text-transparent bg-clip-text font-semibold">
                Our AI interview platform integrates seamlessly into your existing workflow, helping you identify top talent faster and more accurately.
              </h2>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Better Quality Card */}
              <Card className="bg-[rgba(253,203,80,0.3)] p-0 rounded-4xl border border-[rgba(192,237,245,0.3)]">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Image src="/main/book.gif" alt="Better Quality Icon" className="rounded-full" width={40} height={40} />
                    <div>
                      <h3 className="text-lg font-semibold text-[rgba(116,130,248,1)]  mb-2">Better Quality</h3>
                      <p className="text-[rgba(116,130,248,0.7)] font-semibold ">Go beyond resumes to assess real skills and fit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reduce Bias Card */}
              <Card className="bg-[rgba(51,204,204,0.2)] p-0  rounded-4xl border border-[rgba(192,237,245,0.3)]">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Image src="/main/balance.gif" alt="Reduce Bias Icon" className="rounded-full" width={40} height={40} />
                    <div>
                      <h3 className="text-lg font-semibold text-[rgba(116,130,248,1)]  mb-2">Reduce Bias</h3>
                      <p className="text-[rgba(116,130,248,0.7)] font-semibold ">Fair, consistent evaluation criteria for every candidate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Time Card */}
              <Card className="bg-[rgba(177,217,82,0.3)] p-0  rounded-4xl border border-[rgba(183,228,79,0.31)]">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Image src="/main/time.gif" alt="Save Time Icon" className="rounded-full" width={40} height={40} />
                    <div>
                      <h3 className="text-lg font-semibold text-[rgba(116,130,248,1)] mb-2">Save Time</h3>
                      <p className="text-[rgba(116,130,248,0.7)] font-semibold ">Automate initial screening and focus on the best candidates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scale Easily Card */}
              <Card className="bg-[rgba(39,162,204,0.2)] p-0  rounded-4xl border border-[rgba(192,237,245,0.3)]">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Image src="/main/people.gif" alt="Scale Easily Icon" className="rounded-full" width={40} height={40} />
                    <div>
                      <h3 className="text-lg font-semibold text-[rgba(116,130,248,1)] mb-2">Scale Easily</h3>
                      <p className="text-[rgba(116,130,248,0.7)] font-semibold ">Interview hundreds of candidates without adding resources</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex items-center   w-fit border-b border-[rgba(120,130,237,0.6)] my-4 pb-2">
            <p className="text-4xl font-semibold my-4 tracking-widest text-semibold text-transparent bg-clip-text bg-[linear-gradient(94.46deg,#6772E6_-13.88%,#8791F4_113.71%)]">
              Journey made easy
            </p>
          </div>
        </div>

      </section>

      {/* Workflow and CTA Section */}
      <section className="  bg-[linear-gradient(106.66deg,#DCF4FF_3.3%,#E6F5FF_98.34%)]">
        <div className="max-w-6xl mx-auto ">

          {/* Steps Container */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
            {/* Step 1 */}
            <div className="flex-1">
              <Card className="bg-[rgba(174,237,250,1)] p-0  border border-[rgba(184,254,195,1)] rounded-3xl mb-6">
                <CardContent className="flex items-center justify-center p-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[rgba(224,245,255,1)] border border-[rgba(94, 114, 255, 0.5)] border-2 border-[rgba(108,132,255,1)] flex items-center justify-center">
                      <span className="text-lg font-medium text-transparent bg-clip-text bg-[linear-gradient(93.61deg,#3A3FBB_-27.79%,#6B7CFF_125.55%)] ">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-[linear-gradient(90deg,#455EFF_0%,#7988FF_100%)]">Design Your Flow</h3>
                  </div>
                </CardContent>
              </Card>
              <p className="text-center text-[rgba(108,132,255,0.7)] text-sm font-medium">
                Create interview sections with custom configurations and AI guidelines
              </p>
              {/* Placeholder for image */}
              <div className="m-3 rounded-4xl py-15 shadow-md px-2 bg-[rgba(249,255,255,1)]">
                  <Image className="rounded-lg" src="/main/getting-started.png" alt="Getting Started Illustration" width={320} height={110} />
              </div>
            </div>

            {/* Connector 1 */}
            {/* <div className="hidden lg:flex items-center justify-center h-2 w-12 bg-gradient-to-r from-[rgba(198,232,73,0.9)] to-[rgba(0,215,255,0.9)]"></div> */}

            {/* Step 2 */}
            <div className="flex-1">
              <Card className="bg-[rgba(169,237,249,0.9)] p-0 border border-[rgba(168,237,249,1)] rounded-3xl mb-6">
                <CardContent className="flex items-center justify-center p-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[rgba(224,245,255,1)] border border-[rgba(94, 114, 255, 0.5)] border-2 border-[rgba(108,132,255,1)] flex items-center justify-center">
                      <span className="text-lg font-medium text-transparent bg-clip-text bg-[linear-gradient(93.61deg,#3A3FBB_-27.79%,#6B7CFF_125.55%)] ">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-[linear-gradient(90deg,#455EFF_0%,#7988FF_100%)]">Conduct AI Interviews</h3>
                  </div>
                </CardContent>
              </Card>
              <p className="text-center text-[rgba(108,132,255,0.7)] text-sm font-medium">
                AI-powered interviews with real-time adaptation and candidate interaction
              </p>
              {/* Placeholder for image */}
              <Image className="rounded-4xl m-3" src="/main/candidate.png" alt="Candidate Illustration" width={350} height={230} />
            </div>

            {/* Connector 2 */}
            {/* <div className="hidden lg:flex items-center justify-center h-2 w-12 bg-gradient-to-r from-[rgba(0,215,255,0.6)] to-[rgba(255,192,203,0.6)]"></div> */}

            {/* Step 3 */}
            <div className="flex-1">
              <Card className="bg-[rgba(174,237,250,1)] p-0 border border-[#95eafb] rounded-3xl mb-6">
                <CardContent className="flex items-center justify-center p-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[rgba(224,245,255,1)] border border-[rgba(94, 114, 255, 0.5)] border-2 border-[rgba(108,132,255,1)] flex items-center justify-center">
                      <span className="text-lg font-medium text-transparent bg-clip-text bg-[linear-gradient(93.61deg,#3A3FBB_-27.79%,#6B7CFF_125.55%)] ">3</span>
                    </div>
                    <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-[linear-gradient(90deg,#455EFF_0%,#7988FF_100%)]">Get Insights</h3>
                  </div>
                </CardContent>
              </Card>
              <p className="text-center text-[rgba(108,132,255,0.7)] text-sm font-medium">
                Review interview scores, transcripts, and performance analytics for better decisions
              </p>
              {/* Placeholder for image */}
              <Image className="rounded-4xl m-3" src="/main/meet.png" alt="Insights Illustration" width={350} height={230} />
            </div>
          </div>
        </div>


      {/* CTA Section */}
      <section className="w-full bg-[linear-gradient(92.11deg,rgba(2,32,132,0.7)_0.33%,rgba(0,50,216,0.7)_110.42%)] rounded-t-3xl px-0 py-6">
        <div className="w-full">
            <div className="flex flex-col items-center text-center gap-6">
            <div>
                 <h2 className="text-2xl mb-2 md:text-3xl text-transparent bg-clip-text bg-[linear-gradient(90deg,#EFF3FF_0%,#C8C7FF_100%)] font-semibold tracking-tight">
                Excited to revolutionize your hiring process?
              </h2>
              <p className="text-[rgba(206,241,248,0.3)] max-w-2xl text-2xl">
                Join leading companies who are already hiring smarter with AI
              </p>

            </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Button className="rounded-full p-7 text-xl bg-[rgba(0,12,134,0.9)] hover:bg-[rgba(0,12,134,0.9)] hover:opacity-70 hover:text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.08)] text-[rgba(224,244,255,0.9)]">
                  Schedule a Demo
                </Button>
                <Button variant="outline" className="rounded-full p-7 text-xl hover:opacity-70 hover:text-white bg-[rgba(68,102,198,1)] border-2 border-[rgba(217,226,255,0.7)] font-semibold text-[rgba(224,244,255,0.9)] hover:bg-[rgba(255,255,255,0.1)]">
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
      </section>

      </section>


    </div>
  );
}
