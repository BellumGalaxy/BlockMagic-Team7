import { NextResponse } from "next/server";
import connect from "./../../../lib/db";
import Reservation from "~~/lib/modals/reservations";

export const GET = async (req: { url: string | URL }) => {
  const { searchParams } = new URL(req.url);
  const reservationId = searchParams.get("id");
  const reservationDate = searchParams.get("reservationDate");
  const reservationTimestamp = searchParams.get("reservationTimestamp");
  const tableNumber = searchParams.get("tableNumber");
  const persons = searchParams.get("persons");

  try {
    await connect();

    if (!reservationId && !reservationDate && !reservationTimestamp && !tableNumber && !persons) {
      // Fetch all reservations
      const reservations = await Reservation.find();
      return NextResponse.json(reservations, { status: 200 });
    }

    if (!reservationId || !reservationDate || !reservationTimestamp || !tableNumber || !persons) {
      return new NextResponse(
        "ID, reservationDate, reservationTimestamp, tableNumber, and persons parameters are required",
        { status: 400 },
      );
    }

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 });
    }

    const dailyReservation = reservation.dailyReservations.find((d: { date: string }) => d.date === reservationDate);

    if (!dailyReservation) {
      return new NextResponse("Daily reservation not found", { status: 404 });
    }

    const specificReservation = dailyReservation.reservations.find(
      (r: { timestamp: number; tableNumber: number; persons: number }) =>
        r.timestamp === parseInt(reservationTimestamp, 10) &&
        r.tableNumber === parseInt(tableNumber, 10) &&
        r.persons === parseInt(persons, 10),
    );

    if (!specificReservation) {
      return new NextResponse("Specific reservation not found", { status: 404 });
    }

    return NextResponse.json(specificReservation, { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Error fetching reservation:", erro: error }), { status: 500 });
  }
};
