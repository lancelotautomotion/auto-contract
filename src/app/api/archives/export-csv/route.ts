import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const [ctx, err] = await requireAuth();
  if (err) return err;

  const { searchParams } = req.nextUrl;
  const year = searchParams.get("year") ?? "";
  const search = searchParams.get("search") ?? "";

  const searchFilter = search
    ? {
        OR: [
          { clientFirstName: { contains: search, mode: "insensitive" as const } },
          { clientLastName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const archives = await prisma.reservation.findMany({
    where: { gite: { userId: ctx.userId }, contract: { status: "SIGNED", depositReceived: true }, ...searchFilter },
    include: { contract: true, gite: { select: { name: true } } },
    orderBy: { checkIn: "desc" },
  });

  const filtered = year
    ? archives.filter((r) => new Date(r.checkIn).getFullYear().toString() === year)
    : archives;

  const fmt = (d: Date) => new Date(d).toLocaleDateString("fr-FR");
  const fmtPrice = (n: number | null) => (n != null ? n.toFixed(2).replace(".", ",") : "");

  const header = ["Nom", "Prénom", "Email", "Téléphone", "Arrivée", "Départ", "Loyer (€)", "Acompte (€)", "Ménage (€)", "Taxe séjour (€)", "Date signature", "Signé par"];
  const rows = filtered.map((r) => [
    r.clientLastName,
    r.clientFirstName,
    r.clientEmail,
    r.clientPhone,
    fmt(r.checkIn),
    fmt(r.checkOut),
    fmtPrice(r.rent),
    fmtPrice(r.deposit),
    fmtPrice(r.cleaningFee),
    fmtPrice(r.touristTax),
    r.contract?.signedAt ? fmt(r.contract.signedAt) : "",
    r.contract?.signedByName ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const filename = `archives-contrats${year ? `-${year}` : ""}.csv`;

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
