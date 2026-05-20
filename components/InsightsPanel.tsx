"use client";

import { useEffect, useState } from "react";
import Bracket from "@/components/Bracket";

interface Theme {
  title: string;
  description: string;
}

interface Issue {
  title: string;
  detail: string;
}

interface Insights {
  sentiment: "positive" | "mixed" | "negative";
  sentimentScore: number;
  summary: string;
  themes: Theme[];
  urgentIssues: Issue[];
  positives: Issue[];
  nextActions: string[];
  categoryInsight: string;
  riskLevel: "low" | "medium" | "high";
  generatedAt?: string;
}

interface InsightsPanelProps {
  feedbackTexts: string[];
  projectId: number;
}

const sentimentConfig = {
  positive: { label: "Positive", cls: "border-green-500 text-green-400" },
  mixed: { label: "Mixed", cls: "border-yellow-500 text-yellow-400" },
  negative: { label: "Negative", cls: "border-[#e8392a] text-[#e8392a]" },
};

const riskConfig = {
  low: { label: "Low risk", cls: "text-green-400" },
  medium: { label: "Medium risk", cls: "text-yellow-400" },
  high: { label: "High risk", cls: "text-[#e8392a]" },
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function InsightsPanel({ feedbackTexts, projectId }: InsightsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await fetch(`/api/insights?projectId=${projectId}`);
        const data = await res.json();
        if (data && !data.error) setInsights(data);
      } catch {
        // no saved insight
      } finally {
        setFetching(false);
      }
    }
    loadSaved();
  }, [projectId]);

  async function generate() {
    setLoading(true);
    setError("");
    setNotConfigured(false);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackTexts, projectId }),
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
    <div className="border border-[#1e1e1e] bg-[#0d0d0d] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[#e8392a] text-xs tracking-[0.3em] uppercase mb-1">{"// claude ai"}</p>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">AI Insights</h2>
          <p className="text-xs text-[#999] mt-1 tracking-wide">
            {feedbackTexts.length} response{feedbackTexts.length !== 1 ? "s" : ""}
            {insights?.generatedAt && (
              <span className="ml-2 text-[#666]">· last generated {timeAgo(insights.generatedAt)}</span>
            )}
          </p>
        </div>
        <Bracket className="shrink-0">
          <button
            onClick={generate}
            disabled={loading || fetching || feedbackTexts.length === 0}
            className="flex items-center gap-2 border border-[#333] text-white px-5 py-2.5 text-xs font-bold tracking-widest uppercase hover:border-[#e8392a] hover:text-[#e8392a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {loading && (
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? "Analyzing..." : insights ? "Regenerate" : "Generate insights"}
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

      {fetching && !insights && (
        <div className="flex items-center gap-2 text-xs text-[#666] tracking-widest uppercase">
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading saved insights...
        </div>
      )}

      {insights && (
        <div className="space-y-6">

          {/* Sentiment + Risk row */}
          <div className="flex flex-wrap gap-3">
            <div className={`inline-flex items-center gap-2 border px-3 py-1.5 text-xs font-bold tracking-widest uppercase ${sentimentConfig[insights.sentiment]?.cls}`}>
              Sentiment: {sentimentConfig[insights.sentiment]?.label}
              <span className="opacity-60">({insights.sentimentScore}/100)</span>
            </div>
            <div className={`inline-flex items-center gap-2 border border-current px-3 py-1.5 text-xs font-bold tracking-widest uppercase ${riskConfig[insights.riskLevel]?.cls}`}>
              {riskConfig[insights.riskLevel]?.label}
            </div>
          </div>

          {/* Summary */}
          <div className="border-l-2 border-[#e8392a] pl-4">
            <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-2">Executive summary</p>
            <p className="text-sm text-[#ccc] leading-relaxed">{insights.summary}</p>
          </div>

          {/* Themes */}
          <div>
            <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-3">Key themes</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {insights.themes?.map((theme, i) => (
                <div key={i} className="border border-[#1e1e1e] p-4 bg-[#080808]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#e8392a] font-bold text-xs shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">{theme.title}</p>
                  </div>
                  <p className="text-xs text-[#999] leading-relaxed">{theme.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent issues + Positives */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#e8392a] uppercase tracking-widest mb-3">Urgent issues</p>
              {insights.urgentIssues?.map((issue, i) => (
                <div key={i} className="border border-[#e8392a]/20 bg-[#e8392a]/5 p-3">
                  <p className="text-xs font-bold text-[#e8392a] mb-1">{issue.title}</p>
                  <p className="text-xs text-[#bbb] leading-relaxed">{issue.detail}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">{"What's working"}</p>
              {insights.positives?.map((pos, i) => (
                <div key={i} className="border border-green-500/20 bg-green-500/5 p-3">
                  <p className="text-xs font-bold text-green-400 mb-1">{pos.title}</p>
                  <p className="text-xs text-[#bbb] leading-relaxed">{pos.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Next actions */}
          <div>
            <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-3">Recommended next actions</p>
            <div className="space-y-2">
              {insights.nextActions?.map((action, i) => (
                <div key={i} className="flex items-start gap-3 border border-[#1e1e1e] p-3 bg-[#080808]">
                  <span className="text-[#e8392a] font-bold text-xs mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm text-[#ccc]">{action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category insight */}
          {insights.categoryInsight && (
            <div className="border border-[#1e1e1e] p-4 bg-[#080808]">
              <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-2">Category analysis</p>
              <p className="text-sm text-[#999] leading-relaxed">{insights.categoryInsight}</p>
            </div>
          )}
        </div>
      )}

      {!fetching && !insights && !notConfigured && !error && feedbackTexts.length === 0 && (
        <p className="text-xs text-[#777] tracking-widest uppercase">No feedback to analyze yet.</p>
      )}

      {!fetching && !insights && !notConfigured && !error && feedbackTexts.length > 0 && (
        <p className="text-xs text-[#777] tracking-widest uppercase">Click generate to analyze {feedbackTexts.length} responses.</p>
      )}
    </div>
  );
}
