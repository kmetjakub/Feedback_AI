import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_CATEGORIES = ["Bug", "Feature request", "General", "Compliment"];

// TODO: Add rate limiting before production (e.g. @upstash/ratelimit)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const projectId = searchParams.get("projectId");

    const feedback = await prisma.feedback.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(projectId ? { projectId: parseInt(projectId) } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, text, projectId } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Feedback text is required" },
        { status: 400 }
      );
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        name: name?.trim() || null,
        email: email?.trim() || null,
        category,
        text: text.trim(),
        ...(projectId ? { projectId: parseInt(projectId) } : {}),
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}
