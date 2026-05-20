import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const feedback = await prisma.feedback.findMany({
      where: projectId ? { projectId: parseInt(projectId) } : {},
      orderBy: { createdAt: "desc" },
    });

    const csv = Papa.unparse(
      feedback.map((f) => ({
        id: f.id,
        name: f.name ?? "",
        email: f.email ?? "",
        category: f.category,
        feedback: f.text,
        createdAt: f.createdAt.toISOString(),
      }))
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="feedback.csv"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to export feedback" },
      { status: 500 }
    );
  }
}
