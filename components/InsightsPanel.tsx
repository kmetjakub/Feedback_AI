"use client";

import { useState } from "react";

interface Insights {
  sentiment: "positive" | "mixed" | "negative";
  themes: string[];
  urgentIssue: string;
  nextAction: string;
}

interface InsightsPanelProps {
  feedbackTexts: string[];
}

const sentimentConfig = {
  positive: { label: "Positive", className: "text-green-700 bg-green-50 border-green-200" },
  mixed: { label: "Mixed", className: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  negative: { label: "Negative", className: "text-red-700 bg-red-50 border-red-200" },
};

export default function InsightsPanel({ feedbackTexts }: InsightsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setInsights(null);
    setNotConfigured(false);

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackTexts }),
      });

      const data = await res.json();

      if (data.error === "not_configured") {
        setNotConfigured(true);
        return;
      }

      if (!res.ok || data.error) {
        setError(data.error ?? "Failed to generate insights. Please try again.");
        return;
      }

      setInsights(data);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
          <p className="text-sm text-gray-500 mt-0.5">Powered by Claude · analyzes all {feedbackTexts.length} responses</p>
        </div>
        <button
          onClick={generate}
          disabled={loading || feedbackTexts.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {loading ? "Analyzing..." : "Generate insights"}
        </button>
      </div>

      {notConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <strong>API key not configured.</strong> Add your{" "}
          <code className="font-mono bg-amber-100 px-1 rounded">ANTHROPIC_API_KEY</code> in Vercel environment
          variables to enable AI insights.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
      )}

      {insights && (
        <div className="space-y-4 mt-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${sentimentConfig[insights.sentiment]?.className}`}>
            Overall sentiment: {sentimentConfig[insights.sentiment]?.label}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Top themes</h3>
            <ul className="space-y-1.5">
              {insights.themes.map((theme, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">{i + 1}</span>
                  {theme}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
              <p className="text-xs font-medium text-red-600 mb-1">Most urgent issue</p>
              <p className="text-sm text-gray-800">{insights.urgentIssue}</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
              <p className="text-xs font-medium text-green-600 mb-1">Recommended next action</p>
              <p className="text-sm text-gray-800">{insights.nextAction}</p>
            </div>
          </div>
        </div>
      )}

      {!insights && !notConfigured && !error && !loading && feedbackTexts.length === 0 && (
        <p className="text-sm text-gray-400">No feedback to analyze yet.</p>
      )}
    </div>
  );
}
