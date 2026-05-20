"use client";

import { useState } from "react";
import Bracket from "@/components/Bracket";

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
  positive: { label: "Positive", cls: "border-green-500 text-green-400" },
  mixed: { label: "Mixed", cls: "border-yellow-500 text-yellow-400" },
  negative: { label: "Negative", cls: "border-[#e8392a] text-[#e8392a]" },
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
      if (data.error === "not_configured") { setNotConfigured(true); return; }
      if (!res.ok || data.error) { setError(data.error ?? "Failed to generate insights."); return; }
      setInsights(data);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-[#1e1e1e] bg-[#0d0d0d] p-6">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <p className="text-[#e8392a] text-xs tracking-[0.3em] uppercase mb-1">// claude ai</p>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">AI Insights</h2>
          <p className="text-xs text-[#555] mt-1 tracking-wide">
            Analyzes all {feedbackTexts.length} response{feedbackTexts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Bracket className="shrink-0">
          <button
            onClick={generate}
            disabled={loading || feedbackTexts.length === 0}
            className="flex items-center gap-2 border border-[#333] text-white px-5 py-2.5 text-xs font-bold tracking-widest uppercase hover:border-[#e8392a] hover:text-[#e8392a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {loading && (
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? "Analyzing..." : "Generate insights"}
          </button>
        </Bracket>
      </div>

      {notConfigured && (
        <div className="border border-yellow-500/30 bg-yellow-500/5 p-4 text-xs text-yellow-400">
          <span className="font-bold uppercase tracking-widest">API key not configured.</span>{" "}
          Add your <code className="font-mono bg-[#1a1a1a] px-1">ANTHROPIC_API_KEY</code> in Vercel environment variables.
        </div>
      )}

      {error && (
        <div className="border border-[#e8392a]/30 bg-[#e8392a]/5 p-4 text-xs text-[#e8392a]">{error}</div>
      )}

      {insights && (
        <div className="space-y-5 mt-2">
          <div className={`inline-flex items-center gap-2 border px-3 py-1.5 text-xs font-bold tracking-widest uppercase ${sentimentConfig[insights.sentiment]?.cls}`}>
            Sentiment: {sentimentConfig[insights.sentiment]?.label}
          </div>

          <div>
            <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-3">Top themes</p>
            <div className="space-y-2">
              {insights.themes.map((theme, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-[#ccc]">
                  <span className="text-[#e8392a] font-bold text-xs mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  {theme}
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-[#e8392a]/30 bg-[#e8392a]/5 p-4">
              <p className="text-xs font-bold text-[#e8392a] uppercase tracking-widest mb-2">Most urgent issue</p>
              <p className="text-sm text-[#ccc]">{insights.urgentIssue}</p>
            </div>
            <div className="border border-green-500/30 bg-green-500/5 p-4">
              <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Recommended next action</p>
              <p className="text-sm text-[#ccc]">{insights.nextAction}</p>
            </div>
          </div>
        </div>
      )}

      {!insights && !notConfigured && !error && !loading && feedbackTexts.length === 0 && (
        <p className="text-xs text-[#444] tracking-widest uppercase">No feedback to analyze yet.</p>
      )}
    </div>
  );
}
