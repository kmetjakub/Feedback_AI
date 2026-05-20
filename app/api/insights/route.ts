import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  try {
    const insight = await prisma.insight.findUnique({
      where: { projectId: parseInt(projectId) },
    });
    if (!insight) return NextResponse.json(null);
    return NextResponse.json({ ...insight.data as object, generatedAt: insight.generatedAt });
  } catch {
    return NextResponse.json({ error: "Failed to fetch insight" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "not_configured" }, { status: 200 });

  try {
    const { feedbackTexts, projectId } = await request.json();

    if (!Array.isArray(feedbackTexts) || feedbackTexts.length === 0) {
      return NextResponse.json({ error: "No feedback texts provided" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `You are a senior product analyst. Analyze the following ${feedbackTexts.length} user feedback entries about a product's new UI and return a detailed JSON report.

Return ONLY valid JSON with exactly these fields:

{
  "sentiment": "positive" | "mixed" | "negative",
  "sentimentScore": number between 0 and 100 (0 = extremely negative, 100 = extremely positive),
  "summary": "2-3 sentence executive summary of the overall feedback landscape",
  "themes": [
    { "title": "short theme title", "description": "2-3 sentence explanation of this theme with specific evidence from the feedback" }
  ],
  "urgentIssues": [
    { "title": "issue title", "detail": "concrete description of the problem and its user impact" }
  ],
  "positives": [
    { "title": "what's working", "detail": "what users specifically praised and why it matters" }
  ],
  "nextActions": ["specific actionable recommendation", "..."],
  "categoryInsight": "1-2 sentence observation about the distribution and nature of feedback categories",
  "riskLevel": "low" | "medium" | "high"
}

Rules:
- themes: exactly 4 items
- urgentIssues: 2-4 items (only real issues, do not fabricate)
- positives: 2-3 items
- nextActions: exactly 3 specific, concrete actions a product manager can act on immediately
- Be specific — reference actual patterns from the feedback, not generic observations
- riskLevel reflects how urgently the team should act based on severity of reported issues

Feedback entries:
${feedbackTexts.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type from Claude");

    const insights = JSON.parse(content.text);

    if (projectId) {
      await prisma.insight.upsert({
        where: { projectId: parseInt(projectId) },
        update: { data: insights, generatedAt: new Date() },
        create: { projectId: parseInt(projectId), data: insights },
      });
    }

    return NextResponse.json({ ...insights, generatedAt: new Date() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to generate insights: " + msg }, { status: 500 });
  }
}
