import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/authContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://baitai.com"),
  title: {
    default: "Bait AI | Redefining How Hiring Works",
    template: "%s | Bait AI",
  },
  description: "Bait AI is an AI-powered interviewing platform that gives candidates the practice they need and hiring teams the insights they deserve.",
  keywords: ["AI interviews", "hiring", "practice interviews", "recruiting platform", "mock interviews"],
  openGraph: {
    title: "Bait AI | Redefining How Hiring Works",
    description: "Bait AI is an AI-powered interviewing platform that gives candidates the practice they need and hiring teams the insights they deserve.",
    url: "https://baitai.com",
    siteName: "Bait AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Bait AI | Redefining How Hiring Works",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bait AI | Redefining How Hiring Works",
    description: "Bait AI is an AI-powered interviewing platform that gives candidates the practice they need and hiring teams the insights they deserve.",
    images: ["/og.png"],
  },
};

import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const country = headersList.get("cf-ipcountry") || "NAN";

  return (
    <html lang="en" suppressHydrationWarning >
      <head>
        <meta name="geo-country" content={country} />
      </head>
      <body
        className={` ${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
