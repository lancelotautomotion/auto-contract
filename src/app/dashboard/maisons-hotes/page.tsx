import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopbarSignOut from "@/app/dashboard/TopbarSignOut";
import GuesthouseList from "./GuesthouseList";

export const dynamic = "force-dynamic";

export default async function MaisonsHotesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/onboarding");

  const guesthouses = await prisma.guesthouse.findMany({
    where: { userId: dbUser.id, deletedAt: null },
    select: { id: true, name: true, _count: { select: { rooms: true } } },
    orderBy: { createdAt: "asc" },
  });

  const items = guesthouses.map((g) => ({ id: g.id, name: g.name, roomCount: g._count.rooms }));

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="topbar-breadcrumb">Kordia / <span>Maisons d&apos;hôtes</span></div>
        </div>
        <div className="topbar-right"><TopbarSignOut /></div>
      </div>

      <div className="content" style={{ maxWidth: "1100px", width: "100%" }}>
        <div className="page-title">
          <h1>Maisons d&apos;<span className="v">hôtes</span></h1>
          <div className="sub">Gérez vos chambres, vos réservations et la restauration</div>
        </div>
        <GuesthouseList initial={items} />
      </div>
    </>
  );
}
