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
    <main className="min-h-screen flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-500 mt-1 text-sm">Share your feedback — it helps us improve.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <FeedbackForm projectId={project.id} />
        </div>
      </div>
    </main>
  );
}
