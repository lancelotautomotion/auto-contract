import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/upload
 * Accepts a multipart/form-data with a single "file" field.
 * Uploads to Vercel Blob (public) and returns { url }.
 *
 * Requires BLOB_READ_WRITE_TOKEN in environment.
 */
export async function POST(req: NextRequest) {
  const [, err] = await requireAuth();
  if (err) return err;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });

  const maxMb = 10;
  if (file.size > maxMb * 1024 * 1024)
    return NextResponse.json({ error: `Fichier trop volumineux (max ${maxMb} Mo)` }, { status: 413 });

  const blob = await put(file.name, file, { access: "public" });
  return NextResponse.json({ url: blob.url });
}
