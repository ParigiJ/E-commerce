import { NextRequest, NextResponse } from "next/server";
import isValidPassword from "./lib/isValidPassword";

export default async function middlewear(req: NextRequest) {
  if ((await isAuthenticated(req)) === false) {
    return new NextResponse("Unathorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }
}

async function isAuthenticated(req: NextRequest) {
  const authheader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authheader) return false;
  const [username, password] = Buffer.from(authheader.split(" ")[1], "base64")
    .toString()
    .split(":");

  return (
    username === process.env.ADMIN_USERNAME &&
    (await isValidPassword(
      password,
      process.env.ADMIN_HASHED_PASSWORD as string
    ))
  );
}

export const config = {
  matcher: "/admin/:path*",
};
