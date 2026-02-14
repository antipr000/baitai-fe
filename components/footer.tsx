import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Footer = () => {
  // TODO: Add links
  return (
    <footer className="  mx-auto py-3 md:py-10 lg:py-20 md:mb-20 lg:mb-20 md:mt-20">
      <div className="px-4 mx-auto md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row gap-10 justify-between">

          {/* Left Column: Brand & Social */}
          <div className="flex flex-col gap-2 lg:gap-4 items-center md:items-start md:justify-start justify-center md:mx-0 mx-auto md:w-auto w-3/4 md:text-left text-center max-w-sm">
            <div className="flex items-center gap-2">
              <Image
                src="/main/logo.png"
                alt="Bait AI Logo"
                width={46}
                height={46}
                className="lg:size-11 md:size-6 size-5"
              />
              <span className="lg:text-3xl md:text-2xl text-xl tracking-tight font-bold bg-clip-text text-transparent bg-[linear-gradient(106.63deg,rgba(16,81,171,1)_0%,rgba(28,15,111,1)_144.25%)]">
                bAIt
              </span>
            </div>

            <p className="lg:text-base md:text-sm text-xs text-[rgba(53,77,194,0.6)] leading-relaxed">
              Streamline recruitment and ace interviews with our AI-powered platform
            </p>

            <div className="flex items-center gap-7 my-2">
              <Link
                href="https://www.linkedin.com/company/bait-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/main/linkedin.svg"
                  alt="LinkedIn"
                  width={30}
                  height={30}
                  className="lg:size-6 md:size-5 size-4"
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
                  width={30}
                  height={30}
                  className="lg:size-6  md:size-5 size-4"
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
                  width={30}
                  height={30}
                  className="lg:size-6 size-4 md:size-5 bg-black p-1 rounded-sm"
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
                  width={30}
                  height={30}
                  className="lg:size-6 md:size-5 size-4"
                />
              </Link>
              {/* <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/main/facebook.svg"
                  alt="Facebook"
                  width={30}
                  height={30}
                  className="lg:size-6 md:size-5 size-4"
                />
              </Link> */}
            </div>

            <div className="lg:text-base md:text-sm text-xs text-black w mt-2">
              Copyright © 2026 Bait AI | All Rights Reserved
            </div>
          </div>

          {/* Right Columns: Links */}
          <div className="grid md:text-base text-xs mt-1 md:mt-0 grid-cols-3 gap-2 md:gap-10 lg:gap-15 justify-center px-10">

            {/* Product */}
            <div className=" flex flex-col items-center  gap-4 ">
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
                <Link href="/founders" className="text-[rgba(17,24,39,0.6)] hover:text-primary transition-colors">
                  Founders
                </Link>
                {/* <Link href="#" className="text-[rgba(17,24,39,0.6)] hover:text-primary transition-colors">
                  Careers
                </Link>
                <Link href="mailto:soham@baitai.club"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgba(17,24,39,0.6)] hover:text-primary transition-colors">
                  Contact
                </Link> */}
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
