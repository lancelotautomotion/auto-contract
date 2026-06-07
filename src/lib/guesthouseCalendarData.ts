import type { GiteCalendarData } from "@/app/dashboard/CalendarView";

// Palette pour colorer chaque chambre dans la vue planning empilée.
const ROOM_PALETTE = [
  "#7F77DD", // violet Kordia
  "#689D71", // vert
  "#D58A3E", // ambre
  "#C45D7A", // rose
  "#3F8FB0", // bleu
];

interface ReservationLike {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  checkIn: Date | string;
  checkOut: Date | string;
  status: string;
  rent: number | null;
  contract?: { status: string } | null;
  reservationRooms: { roomId: string | null; roomName: string }[];
}

interface RoomLike {
  id: string;
  name: string;
}

interface IcalBlockedDate { start: string; end: string }

interface IcalFeedLike {
  platform: string;
  label: string;
  blockedDates: unknown;
  roomId: string | null;
}

const toDateStr = (d: Date | string) => {
  const x = typeof d === "string" ? new Date(d) : d;
  return x.toISOString().slice(0, 10);
};

// Construit un GiteCalendarData par chambre : chaque réservation est dupliquée
// sur chaque chambre qu'elle occupe. Permet de réutiliser CalendarView en mode
// multi-établissements avec "Toute la maison" comme vue empilée.
export function buildGuesthouseCalendarData(
  rooms: RoomLike[],
  reservations: ReservationLike[],
  icalFeeds: IcalFeedLike[] = [],
): GiteCalendarData[] {
  return rooms.map((room, idx) => {
    const color = ROOM_PALETTE[idx % ROOM_PALETTE.length];
    const roomReservations = reservations
      .filter((r) => r.status !== "REFUSED" && r.status !== "CANCELLED")
      .filter((r) => r.reservationRooms.some((rr) => rr.roomId === room.id))
      .map((r) => ({
        id: r.id,
        clientFirstName: r.clientFirstName,
        clientLastName: r.clientLastName,
        checkIn: toDateStr(r.checkIn),
        checkOut: toDateStr(r.checkOut),
        status: r.status,
        contractStatus: r.contract?.status ?? null,
        depositReceived: r.contract?.depositReceived ?? false,
        rent: r.rent,
      }));

    const icalBlocked: { start: string; end: string; platform: string; label: string }[] = [];
    for (const feed of icalFeeds) {
      if (feed.roomId !== room.id) continue;
      const blocks = Array.isArray(feed.blockedDates) ? feed.blockedDates as IcalBlockedDate[] : [];
      for (const b of blocks) {
        if (typeof b?.start === "string" && typeof b?.end === "string") {
          icalBlocked.push({ start: b.start, end: b.end, platform: feed.platform, label: feed.label });
        }
      }
    }

    return {
      id: room.id,
      name: room.name,
      color,
      reservations: roomReservations,
      icalBlocked,
    };
  });
}
