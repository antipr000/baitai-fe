import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bait AI ",
  description: "Launching Soon - Bait AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
          <body suppressHydrationWarning={true}
     className={`font-sans ${inter.variable} antialiased bg-white`}>
            <div className="fixed left-0 top-0 lg:h-[80vh] md:h-[70vh] lg:w-8 md:w-5 w-3 bg-[rgba(0,215,255,0.05)] z-50" />
                    <div className="fixed right-0 top-0 lg:h-[80vh] md:h-[70vh] lg:w-8 md:w-5 w-3 bg-[rgba(0,215,255,0.05)] z-50" />

        {children}
              <Footer />

      </body>
    </html>
  );
}
