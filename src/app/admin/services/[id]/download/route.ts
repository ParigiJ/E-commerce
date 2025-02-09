import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { notFound } from "next/navigation";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const service = await db.service.findUnique({
    where: { id },
    select: { filePath: true, name: true },
  });

  if (service === null) notFound();

  const { size } = await fs.stat(service.filePath);
  const file = await fs.readFile(service.filePath);
  const extension = service.filePath.split(".").pop();

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${service.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  });
}
