import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/gite/logo?slug=clos-du-marida
// Redirects to the Vercel Blob URL for the gite's logo.
// Kept for backwards-compatibility with email templates that embed this URL.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return new NextResponse("Missing slug", { status: 400 });

  const gite = await prisma.gite.findFirst({
    where: { slug },
    select: { logoUrl: true },
  });

  if (!gite?.logoUrl) return new NextResponse("Not found", { status: 404 });

  // Simple redirect — email clients will follow it
  return NextResponse.redirect(gite.logoUrl, { status: 302 });
}
