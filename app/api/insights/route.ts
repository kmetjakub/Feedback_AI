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

    const n = feedbackTexts.length;
    const scale = n === 1 ? "single" : n <= 3 ? "small" : n <= 10 ? "moderate" : "large";

    const rules =
      scale === "single"
        ? `- summary: 1 concise sentence — describe only what is actually reported, no speculation
- themes: 1 item maximum — only if a clear theme exists; if the feedback is a single point, return 1 theme directly about it
- urgentIssues: 0-1 items — only if the feedback explicitly describes a broken or failing feature; do not fabricate issues
- positives: 0-1 items — only if something positive is genuinely mentioned
- nextActions: 1-2 specific actions directly tied to the reported feedback
- categoryInsight: 1 short sentence, acknowledge the very limited sample size`
        : scale === "small"
        ? `- summary: 1-2 sentences covering the main points
- themes: 1-2 items — only real recurring patterns across the entries
- urgentIssues: 0-2 items — only genuine problems mentioned in the feedback
- positives: 0-2 items — only genuine praise
- nextActions: 2 specific actions
- categoryInsight: 1 sentence, note the small sample size`
        : scale === "moderate"
        ? `- summary: 2 sentences
- themes: 2-3 items
- urgentIssues: 1-3 items (only real issues, do not fabricate)
- positives: 1-2 items
- nextActions: 3 specific, concrete actions a product manager can act on immediately
- categoryInsight: 1-2 sentences`
        : `- summary: 2-3 sentence executive summary of the overall feedback landscape
- themes: 4 items
- urgentIssues: 2-4 items (only real issues, do not fabricate)
- positives: 2-3 items
- nextActions: 3 specific, concrete actions a product manager can act on immediately
- categoryInsight: 1-2 sentences`;

    const prompt = `You are a senior product analyst. Analyze the following ${n} user feedback ${n === 1 ? "entry" : "entries"} and return a JSON report scaled appropriately to the volume of data.

CRITICAL: Do NOT pad the analysis to seem more thorough. If there is only 1 response, produce a minimal but accurate report. More data = more analysis. Less data = less analysis.

Return ONLY valid JSON with exactly these fields:

{
  "sentiment": "positive" | "mixed" | "negative",
  "sentimentScore": number between 0 and 100 (0 = extremely negative, 100 = extremely positive),
  "summary": string,
  "themes": [
    { "title": "short theme title", "description": "explanation with evidence from the feedback" }
  ],
  "urgentIssues": [
    { "title": "issue title", "detail": "concrete description of the problem and its user impact" }
  ],
  "positives": [
    { "title": "what's working", "detail": "what users specifically praised and why it matters" }
  ],
  "nextActions": ["specific actionable recommendation", "..."],
  "categoryInsight": string,
  "riskLevel": "low" | "medium" | "high"
}

Rules for this report (${n} ${n === 1 ? "response" : "responses"}):
${rules}
- Be specific — reference actual content from the feedback, never generic observations
- riskLevel reflects how urgently the team should act based on severity of reported issues
- If urgentIssues or positives have 0 items, return an empty array []

Feedback ${n === 1 ? "entry" : "entries"}:
${feedbackTexts.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type from Claude");

    const raw = content.text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const insights = JSON.parse(raw);

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
