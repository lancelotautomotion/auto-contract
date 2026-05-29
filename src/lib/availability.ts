// Disponibilités par chambre pour une maison d'hôtes.
// Pur : prend des réservations (avec leurs chambres) et produit, par chambre,
// les plages occupées (hors réservations refusées/annulées).

export interface BookedRange {
  reservationId: string;
  clientName: string;
  checkIn: string; // ISO
  checkOut: string;
  status: string;
}

export interface RoomAvailability {
  roomId: string;
  roomName: string;
  booked: BookedRange[];
}

interface ReservationInput {
  id: string;
  clientFirstName: string;
  clientLastName: string;
  checkIn: Date | string;
  checkOut: Date | string;
  status: string;
  reservationRooms: { roomId: string | null }[];
}

interface RoomInput {
  id: string;
  name: string;
}

const EXCLUDED = new Set(["REFUSED", "CANCELLED"]);

export function buildRoomAvailability(rooms: RoomInput[], reservations: ReservationInput[]): RoomAvailability[] {
  const iso = (d: Date | string) => (d instanceof Date ? d.toISOString() : new Date(d).toISOString());

  return rooms.map((room) => ({
    roomId: room.id,
    roomName: room.name,
    booked: reservations
      .filter((r) => !EXCLUDED.has(r.status) && r.reservationRooms.some((rr) => rr.roomId === room.id))
      .map((r) => ({
        reservationId: r.id,
        clientName: `${r.clientFirstName} ${r.clientLastName}`.trim(),
        checkIn: iso(r.checkIn),
        checkOut: iso(r.checkOut),
        status: r.status,
      })),
  }));
}
