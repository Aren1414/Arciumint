import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const publicKey = url.searchParams.get("public_key");
  const session = url.searchParams.get("session");

  const redirectUrl = `/phantom-callback?public_key=${publicKey}&session=${session}`;

  return NextResponse.redirect(redirectUrl);
}
