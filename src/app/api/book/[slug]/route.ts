import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const gite = await prisma.gite.findUnique({
    where: { slug },
    include: { options: true },
  });

  if (!gite) return NextResponse.json({ error: "Gîte introuvable" }, { status: 404 });

  const body = await req.json();

  if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.checkIn || !body.checkOut) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const selectedIds: string[] = Array.isArray(body.selectedOptionIds) ? body.selectedOptionIds : [];
  const selectedOptions = gite.options.filter(o => selectedIds.includes(o.id));

  const reservation = await prisma.reservation.create({
    data: {
      giteId: gite.id,
      status: 'PENDING_REVIEW',
      clientFirstName: body.firstName,
      clientLastName: body.lastName,
      clientEmail: body.email,
      clientPhone: body.phone,
      clientAddress: body.address ?? "",
      clientCity: body.city ?? "",
      clientZipCode: body.zipCode ?? "",
      checkIn: new Date(body.checkIn),
      checkOut: new Date(body.checkOut),
      notes: body.notes ?? "",
      // Tarifs non renseignés — le gérant les ajoutera
      rent: null,
      deposit: null,
      cleaningFee: null,
      touristTax: null,
      reservationOptions: {
        create: selectedOptions.map(o => ({
          label: o.label,
          price: o.price,
          giteOptionId: o.id,
        })),
      },
    },
  });

  return NextResponse.json(reservation, { status: 201 });
}
