import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";


export async function GET(
  req: NextRequest,
  options: { params: { downloadVerificationId: string } }
) {
  const { downloadVerificationId } = await options.params;
  const serviceData = await db.downloadVerification.findUnique({
    where: {
      id: downloadVerificationId,
      expiresAt: { gt: new Date() },
    },
    select: {
      service: {
        select: {
          name: true,
          filePath: true,
        },
      },
    },
  });

  if (serviceData == null) {
    return NextResponse.redirect(
      new URL("/services/download/expired", req.url)
    );
  }

  const { size } = await fs.stat(serviceData.service.filePath);
  const file = await fs.readFile(serviceData.service.filePath);
  const extension = serviceData.service.filePath.split(".").pop();

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${serviceData.service.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  });
}
