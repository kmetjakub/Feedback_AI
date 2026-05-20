"use client";

// TODO: Add password protection before making this app production-ready
// (e.g. NextAuth.js, Clerk, or a simple middleware-based basic auth)

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import FeedbackList from "@/components/FeedbackList";
import InsightsPanel from "@/components/InsightsPanel";
import CSVImport from "@/components/CSVImport";

interface Feedback {
  id: number;
  name: string | null;
  email: string | null;
  category: string;
  text: string;
  createdAt: string;
}

export default function Dashboard() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setFeedback(Array.isArray(data) ? data : []);
    } catch {
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "feedback.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Loading…" : `${feedback.length} response${feedback.length !== 1 ? "s" : ""} total`}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <CSVImport onImported={fetchFeedback} />
            <button
              onClick={handleExport}
              disabled={exporting || feedback.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Export CSV
            </button>
          </div>
        </div>

        {/* AI Insights */}
        <InsightsPanel feedbackTexts={feedback.map((f) => f.text)} />

        {/* Feedback list */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All feedback</h2>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading feedback…
            </div>
          ) : (
            <FeedbackList feedback={feedback} onRefresh={fetchFeedback} />
          )}
        </div>
      </div>
    </main>
  );
}
