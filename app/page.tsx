import Link from "next/link";
import Bracket from "@/components/Bracket";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <p className="text-[#e8392a] text-xs tracking-[0.3em] uppercase mb-6">
          // feedback collection
        </p>

        <h1 className="text-5xl sm:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
          FEEDBACK<br />
          <span className="text-[#e8392a]">AI</span>
        </h1>

        <p className="text-[#888] text-sm leading-relaxed mb-10 max-w-md">
          Collect feedback from anyone on the web.<br />
          Get instant AI-powered insights — no manual reading required.
        </p>

        <Bracket className="inline-block">
          <Link
            href="/feedback"
            className="inline-block bg-transparent border border-[#333] text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:border-[#e8392a] hover:text-[#e8392a] transition-colors"
          >
            Share your feedback
          </Link>
        </Bracket>

        <p className="mt-16 text-xs text-[#666] tracking-widest uppercase">
          Powered by Claude AI
        </p>
      </div>
    </main>
  );
}
