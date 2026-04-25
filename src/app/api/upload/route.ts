import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const [, err] = await requireAuth();
  if (err) return err;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Stockage non configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants)" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });

  const maxMb = 10;
  if (file.size > maxMb * 1024 * 1024)
    return NextResponse.json({ error: `Fichier trop volumineux (max ${maxMb} Mo)` }, { status: 413 });

  const ext = file.name.split('.').pop() ?? 'bin';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bucket = "uploads";

  const arrayBuffer = await file.arrayBuffer();
  const uploadResp = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${safeName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: arrayBuffer,
  });

  if (!uploadResp.ok) {
    const detail = await uploadResp.text().catch(() => "");
    console.error("[upload] Supabase Storage error:", uploadResp.status, detail);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }

  const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${safeName}`;
  return NextResponse.json({ url });
}
