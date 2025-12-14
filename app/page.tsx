import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
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
        <div className="w-3/5 mx-auto">
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
    </div>
  );
}
