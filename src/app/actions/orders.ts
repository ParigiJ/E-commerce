"use server";
import db from "@/db/db";

export default async function useOrderExists(email: string, serviceId: string) {
  return (
    (await db.order.findFirst({
      where: { user: { email }, serviceId },
      select: { id: true },
    })) != null
  );
}
