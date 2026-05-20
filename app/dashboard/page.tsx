"use client";

// TODO: Add password protection before making this app production-ready

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Bracket from "@/components/Bracket";

interface Project {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  _count: { feedback: number };
}

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProjects(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const project = await res.json();
        setNewName("");
        setShowForm(false);
        router.push(`/dashboard/${project.id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  function copyLink(project: Project) {
    navigator.clipboard.writeText(`${window.location.origin}/f/${project.slug}`);
    setCopied(project.id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleDeleteProject(project: Project) {
    const confirmed = window.confirm(
      `Delete "${project.name}" and all its responses? This cannot be undone.`
    );
    if (!confirmed) return;
    setDeleting(project.id);
    try {
      await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[#e8392a] text-xs tracking-[0.3em] uppercase mb-2">{"// admin"}</p>
            <h1 className="text-4xl font-bold text-white uppercase tracking-tight">Dashboard</h1>
            <p className="text-[#999] text-xs mt-1 tracking-widest uppercase">
              {loading ? "Loading..." : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Bracket className="self-start">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 border border-[#333] text-white px-5 py-2.5 text-xs font-bold tracking-widest uppercase hover:border-[#e8392a] hover:text-[#e8392a] transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New project
            </button>
          </Bracket>
        </div>

        {showForm && (
          <div className="border border-[#1e1e1e] bg-[#0d0d0d] p-5">
            <p className="text-[#e8392a] text-xs tracking-widest uppercase mb-4">{"// create project"}</p>
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Project name..."
                className="flex-1 px-3 py-2 border border-[#2a2a2a] bg-[#0d0d0d] text-white text-sm focus:outline-none focus:border-[#e8392a] font-mono"
              />
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="px-5 py-2 bg-[#e8392a] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#ff4d3d] disabled:opacity-40 transition-colors"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setNewName(""); }}
                className="px-5 py-2 border border-[#333] text-[#888] text-xs font-bold tracking-widest uppercase hover:border-[#555] transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#777]">
            <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs tracking-widest uppercase">Loading...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 border border-[#1a1a1a]">
            <p className="text-[#777] text-xs tracking-widest uppercase">No projects yet</p>
            <p className="text-[#666] text-xs mt-2">Create your first project above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Bracket key={project.id} className="group">
                <div className="border border-[#1e1e1e] bg-[#0d0d0d] p-5 flex items-center justify-between gap-4 group-hover:border-[#2a2a2a] transition-colors">
                  <div className="min-w-0">
                    <h2 className="font-bold text-white uppercase tracking-wide truncate">{project.name}</h2>
                    <p className="text-xs text-[#999] mt-1 tracking-widest uppercase">
                      {project._count.feedback} response{project._count.feedback !== 1 ? "s" : ""} ·{" "}
                      {new Date(project.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyLink(project)}
                      className="px-3 py-1.5 border border-[#2a2a2a] text-[#888] text-xs font-bold tracking-widest uppercase hover:border-[#e8392a] hover:text-[#e8392a] transition-colors"
                    >
                      {copied === project.id ? "Copied!" : "Copy link"}
                    </button>
                    <Link
                      href={`/dashboard/${project.id}`}
                      className="px-3 py-1.5 bg-[#e8392a] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#ff4d3d] transition-colors"
                    >
                      Open →
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project)}
                      disabled={deleting === project.id}
                      className="px-3 py-1.5 border border-[#2a2a2a] text-[#666] text-xs font-bold tracking-widest uppercase hover:border-red-800 hover:text-red-600 disabled:opacity-30 transition-colors"
                      title="Delete project"
                    >
                      {deleting === project.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </Bracket>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
