import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-6">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-3">FeedbackAI</h1>
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          Collect feedback from anyone on the web and get instant AI-powered insights — without reading hundreds of responses manually.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/feedback"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
          >
            Send feedback
          </Link>
          <Link
            href="/dashboard"
            className="bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-center"
          >
            Open dashboard
          </Link>
        </div>

        <p className="mt-10 text-xs text-gray-400">
          Built for product managers · Powered by Claude AI
        </p>
      </div>
    </main>
  );
}
