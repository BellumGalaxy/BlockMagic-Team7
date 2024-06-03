import { NextRequest, NextResponse } from "next/server";
import connect from "./../../../lib/db";
import Reservation from "~~/lib/modals/reservations";

export const GET = async (req: Request | NextRequest) => {
  const { searchParams } = new URL(req.url);
  const reservationId = searchParams.get("id");
  const reservationDate = searchParams.get("reservationDate");
  const reservationTimestamp = searchParams.get("reservationTimestamp");
  const tableNumber = searchParams.get("tableNumber");

  try {
    await connect();

    if (!reservationId && !reservationDate && !reservationTimestamp && !tableNumber) {
      // Fetch all reservations
      const reservations = await Reservation.find();
      return NextResponse.json(reservations, { status: 200 });
    }

    if (!reservationId || !reservationDate || !reservationTimestamp || !tableNumber) {
      return new NextResponse(
        "ID, reservationDate, reservationTimestamp, tableNumber, and persons parameters are required",
        { status: 400 },
      );
    }

    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 });
    }

    const dailyReservation = reservation.dailyReservations.find((d: any) => d.date === reservationDate);

    if (!dailyReservation) {
      return new NextResponse("Daily reservation not found", { status: 404 });
    }

    const specificReservation = dailyReservation.reservations.find(
      (r: any) => r.timestamp === reservationTimestamp && r.tableNumber === tableNumber,
    );

    if (!specificReservation) {
      return new NextResponse("Specific reservation not found", { status: 404 });
    }

    const responseData = {
      reservationDate: specificReservation.date,
      reservationPersonPerTable: specificReservation.persons,
      reservationTableNumber: specificReservation.tableNumber,
      reservationTimestamp: specificReservation.timestamp,
      reservationToleranceTime: reservation.toleranceTime,
      reservationValue: reservation.reservationValue,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Error fetching reservation:", error }), { status: 500 });
  }
};
