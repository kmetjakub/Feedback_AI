import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FeedbackForm from "@/components/FeedbackForm";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const project = await prisma.project.findUnique({ where: { slug: params.slug } });
  return { title: project ? `${project.name} · Feedback` : "Feedback" };
}

export default async function PublicFormPage({ params }: Props) {
  const project = await prisma.project.findUnique({ where: { slug: params.slug } });
  if (!project) notFound();

  return (
    <main className="min-h-screen flex items-start justify-center py-16 px-6">
      <div className="w-full max-w-lg">
        <p className="text-[#e8392a] text-xs tracking-[0.3em] uppercase mb-3">{"// feedback"}</p>
        <h1 className="text-3xl font-bold text-white mb-1 uppercase tracking-tight">{project.name}</h1>
        <p className="text-[#999] text-sm mb-8">Share your feedback — it helps us improve.</p>
        <div className="border border-[#1e1e1e] bg-[#0d0d0d] p-6">
          <FeedbackForm projectId={project.id} />
        </div>
      </div>
    </main>
  );
}
