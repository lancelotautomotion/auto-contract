import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkId: userId, email: body.email, name: body.giteName },
    });
  }

  const existing = await prisma.gite.findFirst({ where: { userId: user.id } });
  if (existing) {
    const updated = await prisma.gite.update({
      where: { id: existing.id },
      data: {
        name: body.giteName,
        email: body.email,
        phone: body.phone ?? "",
        address: body.address ?? "",
        city: body.city ?? "",
        zipCode: body.zipCode ?? "",
        capacity: parseInt(body.capacity ?? "12"),
        cleaningFee: parseFloat(body.cleaningFee ?? "90"),
        touristTax: parseFloat(body.touristTax ?? "1.32"),
        n8nWebhookUrl: body.n8nWebhookUrl ?? "",
        driveTemplateFolderId: body.driveTemplateFolderId ?? "",
        driveOutputFolderId: body.driveOutputFolderId ?? "",
      },
    });
    return NextResponse.json(updated);
  }

  const gite = await prisma.gite.create({
    data: {
      userId: user.id,
      name: body.giteName,
      email: body.email,
      phone: body.phone ?? "",
      address: body.address ?? "",
      city: body.city ?? "",
      zipCode: body.zipCode ?? "",
      capacity: parseInt(body.capacity ?? "12"),
      cleaningFee: parseFloat(body.cleaningFee ?? "90"),
      touristTax: parseFloat(body.touristTax ?? "1.32"),
      n8nWebhookUrl: body.n8nWebhookUrl ?? "",
      driveTemplateFolderId: body.driveTemplateFolderId ?? "",
      driveOutputFolderId: body.driveOutputFolderId ?? "",
    },
  });

  return NextResponse.json(gite, { status: 201 });
}
