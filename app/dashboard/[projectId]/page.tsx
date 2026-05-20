"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FeedbackList from "@/components/FeedbackList";
import InsightsPanel from "@/components/InsightsPanel";
import CSVImport from "@/components/CSVImport";
import Bracket from "@/components/Bracket";

interface Feedback {
  id: number;
  name: string | null;
  email: string | null;
  category: string;
  text: string;
  createdAt: string;
}

interface Project {
  id: number;
  name: string;
  slug: string;
}

type Tab = "insights" | "responses";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<Tab>("insights");
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsRes, feedbackRes] = await Promise.all([
        fetch("/api/projects"),
        fetch(`/api/feedback?projectId=${projectId}`),
      ]);
      const projects = await projectsRes.json();
      const feedbackData = await feedbackRes.json();
      const found = Array.isArray(projects) ? projects.find((p: Project) => p.id === parseInt(projectId)) : null;
      setProject(found ?? null);
      setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
    } catch {
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/export?projectId=${projectId}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.slug ?? "feedback"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  function copyLink() {
    if (!project) return;
    navigator.clipboard.writeText(`${window.location.origin}/f/${project.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <Link href="/dashboard" className="text-xs text-[#555] hover:text-[#e8392a] flex items-center gap-2 mb-3 tracking-widest uppercase transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All projects
            </Link>
            <p className="text-[#e8392a] text-xs tracking-[0.3em] uppercase mb-2">// project</p>
            <h1 className="text-4xl font-bold text-white uppercase tracking-tight">{project?.name ?? "—"}</h1>
            <p className="text-[#555] text-xs mt-1 tracking-widest uppercase">
              {loading ? "Loading..." : `${feedback.length} response${feedback.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <Bracket className="self-start">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 border border-[#333] text-white px-5 py-2.5 text-xs font-bold tracking-widest uppercase hover:border-[#e8392a] hover:text-[#e8392a] transition-colors"
            >
              {copied ? "Link copied!" : "Copy public link"}
            </button>
          </Bracket>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e1e1e]">
          {(["insights", "responses"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-[#e8392a] text-white"
                  : "border-transparent text-[#444] hover:text-[#888]"
              }`}
            >
              {t === "insights" ? "AI Insights" : (
                <>
                  Responses
                  {!loading && feedback.length > 0 && (
                    <span className="ml-2 text-[#e8392a]">{feedback.length}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "insights" && (
          <InsightsPanel feedbackTexts={feedback.map((f) => f.text)} />
        )}

        {tab === "responses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-3 flex-wrap">
              <CSVImport onImported={fetchData} projectId={parseInt(projectId)} />
              <button
                onClick={handleExport}
                disabled={exporting || feedback.length === 0}
                className="flex items-center gap-2 border border-[#2a2a2a] text-[#888] px-4 py-2 text-xs font-bold tracking-widest uppercase hover:border-[#e8392a] hover:text-[#e8392a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {exporting ? (
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : null}
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
            <div className="border border-[#1e1e1e] bg-[#0d0d0d] p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-[#444]">
                  <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span className="text-xs tracking-widest uppercase">Loading...</span>
                </div>
              ) : (
                <FeedbackList feedback={feedback} onRefresh={fetchData} />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
