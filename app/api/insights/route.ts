import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 200 });
  }

  try {
    const { feedbackTexts } = await request.json();

    if (!Array.isArray(feedbackTexts) || feedbackTexts.length === 0) {
      return NextResponse.json(
        { error: "No feedback texts provided" },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    const prompt = `You are a product analyst. Analyze the following ${feedbackTexts.length} user feedback entries and return a JSON object with exactly these fields:

- "sentiment": one of "positive", "mixed", or "negative" — the overall tone
- "themes": an array of exactly 3 strings, each describing a recurring theme
- "urgentIssue": a single string describing the most urgent problem to fix
- "nextAction": a single string with one concrete recommended next action for the product manager

Return ONLY valid JSON, no markdown, no explanation.

Feedback entries:
${feedbackTexts.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const insights = JSON.parse(content.text);
    return NextResponse.json(insights);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate insights: " + message },
      { status: 500 }
    );
  }
}
