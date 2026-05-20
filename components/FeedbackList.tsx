"use client";

import { useState } from "react";

interface Feedback {
  id: number;
  name: string | null;
  email: string | null;
  category: string;
  text: string;
  createdAt: string;
}

interface FeedbackListProps {
  feedback: Feedback[];
  onRefresh: () => void;
}

const CATEGORIES = ["All", "Bug", "Feature request", "General", "Compliment"];

const categoryBadge: Record<string, string> = {
  Bug: "border-[#e8392a] text-[#e8392a]",
  "Feature request": "border-blue-500 text-blue-400",
  General: "border-[#444] text-[#888]",
  Compliment: "border-green-500 text-green-400",
};

export default function FeedbackList({ feedback, onRefresh }: FeedbackListProps) {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? feedback : feedback.filter((f) => f.category === filter);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 text-xs font-bold tracking-widest uppercase transition-colors border ${
                filter === c
                  ? "border-[#e8392a] text-[#e8392a]"
                  : "border-[#2a2a2a] text-[#999] hover:border-[#444] hover:text-[#888]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={onRefresh}
          className="text-xs text-[#999] hover:text-[#e8392a] flex items-center gap-1.5 tracking-widest uppercase transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#777] text-xs tracking-widest uppercase">No feedback yet</p>
          <p className="text-[#666] text-xs mt-2">Share the feedback form link to start collecting responses.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="border border-[#1e1e1e] bg-[#080808] p-4 hover:border-[#2a2a2a] transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`inline-block border px-2 py-0.5 text-xs font-bold tracking-widest uppercase ${categoryBadge[f.category] ?? "border-[#444] text-[#888]"}`}>
                  {f.category}
                </span>
                <span className="text-xs text-[#777] shrink-0 tracking-wide">{formatDate(f.createdAt)}</span>
              </div>
              <p className="text-sm text-[#ccc] leading-relaxed">{f.text}</p>
              {(f.name || f.email) && (
                <p className="text-xs text-[#777] mt-3 tracking-wide">
                  {[f.name, f.email].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
