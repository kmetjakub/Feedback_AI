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
  Bug: "bg-red-100 text-red-700",
  "Feature request": "bg-blue-100 text-blue-700",
  General: "bg-gray-100 text-gray-700",
  Compliment: "bg-green-100 text-green-700",
};

export default function FeedbackList({ feedback, onRefresh }: FeedbackListProps) {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? feedback : feedback.filter((f) => f.category === filter);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === c
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={onRefresh}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="font-medium">No feedback yet</p>
          <p className="text-sm mt-1">Share the feedback form link to start collecting responses.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryBadge[f.category] ?? "bg-gray-100 text-gray-700"}`}>
                  {f.category}
                </span>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(f.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">{f.text}</p>
              {(f.name || f.email) && (
                <p className="text-xs text-gray-400 mt-2">
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
