"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All projects
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{project?.name ?? "Project"}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Loading…" : `${feedback.length} response${feedback.length !== 1 ? "s" : ""} total`}
            </p>
          </div>

          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Link copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Copy public link
              </>
            )}
          </button>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setTab("insights")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "insights"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            AI Insights
          </button>
          <button
            onClick={() => setTab("responses")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "responses"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Responses
            {!loading && feedback.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {feedback.length}
              </span>
            )}
          </button>
        </div>

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
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Loading feedback…
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
