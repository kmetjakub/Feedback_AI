"use client";

import { useRef, useState } from "react";

interface CSVImportProps {
  onImported: () => void;
  projectId?: number;
}

export default function CSVImport({ onImported, projectId }: CSVImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (projectId) formData.append("projectId", String(projectId));
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) {
        setMessage({ type: "error", text: data.error ?? "Import failed." });
      } else {
        setMessage({ type: "success", text: `Imported ${data.imported} entries.` });
        onImported();
      }
    } catch {
      setMessage({ type: "error", text: "Network error during import." });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input ref={inputRef} type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-upload" />
      <label
        htmlFor="csv-upload"
        className={`cursor-pointer flex items-center gap-2 border border-[#2a2a2a] text-[#888] px-4 py-2 text-xs font-bold tracking-widest uppercase hover:border-[#e8392a] hover:text-[#e8392a] transition-colors ${loading ? "opacity-40 pointer-events-none" : ""}`}
      >
        {loading ? (
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : null}
        {loading ? "Importing..." : "Import CSV"}
      </label>
      {message && (
        <p className={`text-xs tracking-wide ${message.type === "success" ? "text-green-400" : "text-[#e8392a]"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
