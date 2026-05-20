import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

const VALID_CATEGORIES = ["Bug", "Feature request", "General", "Compliment"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectIdRaw = formData.get("projectId");
    const projectId = projectIdRaw ? parseInt(projectIdRaw as string) : null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      return NextResponse.json(
        { error: "CSV parsing failed: " + result.errors[0].message },
        { status: 400 }
      );
    }

    const rows = result.data;
    const valid = rows.filter(
      (row) =>
        row.feedback?.trim() &&
        row.category &&
        VALID_CATEGORIES.includes(row.category.trim())
    );

    if (valid.length === 0) {
      return NextResponse.json(
        {
          error:
            'No valid rows found. CSV must have "category" and "feedback" columns.',
        },
        { status: 400 }
      );
    }

    await prisma.feedback.createMany({
      data: valid.map((row) => ({
        category: row.category.trim(),
        text: row.feedback.trim(),
        name: row.name?.trim() || null,
        email: row.email?.trim() || null,
        ...(projectId ? { projectId } : {}),
      })),
    });

    return NextResponse.json({ imported: valid.length });
  } catch {
    return NextResponse.json(
      { error: "Failed to import CSV" },
      { status: 500 }
    );
  }
}
