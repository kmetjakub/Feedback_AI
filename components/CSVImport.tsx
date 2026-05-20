"use client";

import { useRef, useState } from "react";

interface CSVImportProps {
  onImported: () => void;
}

export default function CSVImport({ onImported }: CSVImportProps) {
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

      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMessage({ type: "error", text: data.error ?? "Import failed." });
      } else {
        setMessage({ type: "success", text: `Successfully imported ${data.imported} entries.` });
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="hidden"
        id="csv-upload"
      />
      <label
        htmlFor="csv-upload"
        className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${loading ? "opacity-50 pointer-events-none" : ""}`}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )}
        {loading ? "Importing..." : "Import CSV"}
      </label>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <p className="text-xs text-gray-400">CSV must have <code className="bg-gray-100 px-1 rounded">category</code> and <code className="bg-gray-100 px-1 rounded">feedback</code> columns</p>
    </div>
  );
}
