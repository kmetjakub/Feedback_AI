import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import IntroScreen from "@/components/IntroScreen";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "FeedbackAI",
  description: "Collect user feedback and get instant AI-powered insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={spaceMono.className}>
        <IntroScreen />
        {children}
      </body>
    </html>
  );
}
