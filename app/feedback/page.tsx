import Link from "next/link";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata = {
  title: "Share feedback · FeedbackAI",
};

export default function FeedbackPage() {
  return (
    <main className="min-h-screen flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Share your feedback</h1>
          <p className="text-gray-500 mt-1 text-sm">Your input helps us build a better product.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <FeedbackForm />
        </div>
      </div>
    </main>
  );
}
