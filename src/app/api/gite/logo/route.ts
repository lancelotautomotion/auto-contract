import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/gite/logo?slug=clos-du-marida
// Sert le logo du gîte comme image publique (pour les emails)
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return new NextResponse('Missing slug', { status: 400 });

  const gite = await prisma.gite.findFirst({
    where: { slug },
    select: { logoDataUrl: true },
  });

  if (!gite?.logoDataUrl) return new NextResponse('Not found', { status: 404 });

  // Parse data URL : data:<mime>;base64,<data>
  const match = gite.logoDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return new NextResponse('Invalid logo format', { status: 400 });

  const [, contentType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
