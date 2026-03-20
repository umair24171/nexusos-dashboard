import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geist = Inter({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexusOS — Agent Control Tower",
  description: "Monitor, control, and govern your AI agents with confidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans bg-dark-bg text-dark-text antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
