import Link from "next/link";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata = {
  title: "Share feedback · FeedbackAI",
};

export default function FeedbackPage() {
  return (
    <main className="min-h-screen flex items-start justify-center py-16 px-6">
      <div className="w-full max-w-lg">
        <Link href="/" className="text-xs text-[#999] hover:text-[#e8392a] flex items-center gap-2 mb-10 tracking-widest uppercase transition-colors">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <p className="text-[#e8392a] text-xs tracking-[0.3em] uppercase mb-3">{"// input"}</p>
        <h1 className="text-3xl font-bold text-white mb-1 uppercase tracking-tight">Share your feedback</h1>
        <p className="text-[#999] text-sm mb-8">Your input helps us build a better product.</p>

        <div className="border border-[#1e1e1e] p-6 bg-[#0d0d0d]">
          <FeedbackForm />
        </div>
      </div>
    </main>
  );
}
