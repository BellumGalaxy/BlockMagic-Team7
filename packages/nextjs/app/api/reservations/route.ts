import { NextResponse } from "next/server";
import connect from "./../../../lib/db";
import Reservation from "~~/lib/modals/reservations";

export const GET = async () => {
  try {
    await connect();
    const reservations = await Reservation.find();
    return NextResponse.json(JSON.stringify(reservations), { status: 200 });
  } catch (error) {
    return new NextResponse("Error fetching reservations" + error, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    console.log(body);
    await connect();
    const newRestaurantReservation = new Reservation(body);
    await newRestaurantReservation.save();
    return new NextResponse(JSON.stringify({ message: "User is created", user: newRestaurantReservation }), {
      status: 201,
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Error creating reservation", erro: error }), { status: 500 });
  }
};
