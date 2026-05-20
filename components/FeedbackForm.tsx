"use client";

import { useState } from "react";

const CATEGORIES = ["Bug", "Feature request", "General", "Compliment"];

interface Props {
  projectId?: number;
}

export default function FeedbackForm({ projectId }: Props) {
  const [form, setForm] = useState({ name: "", email: "", category: "General", text: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.text.trim()) { setError("Feedback text is required."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, projectId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-14 h-14 border border-[#e8392a] mb-5">
          <svg className="w-6 h-6 text-[#e8392a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-2">Thank you</h2>
        <p className="text-[#999] text-sm">Your feedback has been received.</p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", category: "General", text: "" }); }}
          className="mt-6 text-xs text-[#999] hover:text-[#e8392a] uppercase tracking-widest underline transition-colors"
        >
          Submit another
        </button>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2.5 border border-[#2a2a2a] bg-[#0d0d0d] text-white text-sm focus:outline-none focus:border-[#e8392a] transition-colors font-mono";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#888] mb-2 tracking-widest uppercase">
            Name <span className="text-[#777] normal-case">(optional)</span>
          </label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#888] mb-2 tracking-widest uppercase">
            Email <span className="text-[#777] normal-case">(optional)</span>
          </label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#888] mb-2 tracking-widest uppercase">Category</label>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#888] mb-2 tracking-widest uppercase">
          Feedback <span className="text-[#e8392a]">*</span>
        </label>
        <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Tell us what's on your mind..." rows={5} required className={`${inputCls} resize-none`} />
      </div>

      {error && (
        <p className="text-xs text-[#e8392a] border border-[#e8392a]/30 bg-[#e8392a]/5 px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#e8392a] text-white py-3 px-4 text-xs font-bold tracking-widest uppercase hover:bg-[#ff4d3d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading && (
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {loading ? "Submitting..." : "Submit feedback"}
      </button>
    </form>
  );
}
