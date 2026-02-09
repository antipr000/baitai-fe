import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Footer = () => {
  // TODO: Add links
  return (
    <footer className="w-full  lg:max-w-7xl md:max-w-4xl mx-auto bg-background py-10 lg:py-12 mb-30 mt-4">
      <div className=" px-5 md:px-7">
        <div className="flex flex-col lg:flex-row justify-around">

          {/* Left Column: Brand & Social */}
          <div className="flex flex-col gap-3 lg:gap-4 max-w-sm">
            <div className="flex items-center gap-2">
              <Image
                src="/main/logo.png"
                alt="Bait AI Logo"
                width={46}
                height={46}
                className="w-11 h-11"
              />
              <span className="text-3xl tracking-tight font-bold bg-clip-text text-transparent bg-[linear-gradient(106.63deg,rgba(16,81,171,1)_0%,rgba(28,15,111,1)_144.25%)]">
                bAIt
              </span>
            </div>

            <p className="text-[rgba(53,77,194,0.6)] leading-relaxed">
              Streamline recruitment and ace interviews with our AI-powered platform
            </p>

            <div className="flex items-center gap-6 my-2">
              <Link
                href="https://www.linkedin.com/company/bait-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/main/linkedin.svg"
                  alt="LinkedIn"
                  width={22}
                  height={22}
                  className="size-6"
                />
              </Link>
              <Link
                href="mailto:soham@baitai.club"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/main/gmail.svg"
                  alt="Gmail"
                  width={22}
                  height={22}
                  className="size-6"
                />
              </Link>
              <Link
                href="https://x.com/baitai_club"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/main/x.svg"
                  alt="X (Twitter)"
                  width={22}
                  height={22}
                  className="size-6 bg-black p-1 rounded-sm"
                />
              </Link>
              <Link
                href="https://www.instagram.com/baitai.club/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/main/instagram.svg"
                  alt="Instagram"
                  width={22}
                  height={22}
                  className="size-6"
                />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/main/facebook.svg"
                  alt="Facebook"
                  width={22}
                  height={22}
                  className="size-6"
                />
              </Link>
            </div>

            <div className=" text-black mt-2">
              Copyright © 2026 Bait AI | All Rights Reserved
            </div>
          </div>

          {/* Right Columns: Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-24">

            {/* Product */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-[rgba(17,24,39,0.9)]">Product</h3>
              <div className="flex flex-col gap-3">
                <Link href="#" className=" text-[rgba(17,24,39,0.6)] hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className=" text-[rgba(17,24,39,0.6)] hover:text-primary transition-colors">
                  Pricing
                </Link>
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-[rgba(17,24,39,0.9)]">Company</h3>
              <div className="flex flex-col gap-3">
                <Link href="/about" className="text-[rgba(17,24,39,0.6)] hover:text-primary transition-colors">
                  About
                </Link>
                <Link href="#" className="text-[rgba(17,24,39,0.6)] hover:text-primary transition-colors">
                  Founders
                </Link>
                <Link href="#" className="text-[rgba(17,24,39,0.6)] hover:text-primary transition-colors">
                  Careers
                </Link>
                <Link href="#" className="text-[rgba(17,24,39,0.6)] hover:text-primary transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-[rgba(17,24,39,0.9)]">Resources</h3>
              <div className="flex flex-col gap-3">
                <Link href="#" className="text-[rgba(17,24,39,0.6)] hover:text-primary transition-colors">
                  Help Center
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};
