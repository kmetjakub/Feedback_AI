import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid feedback id" }, { status: 400 });
  }
  try {
    await prisma.feedback.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}
