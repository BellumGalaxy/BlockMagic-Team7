import { NextResponse } from "next/server";
import connect from "./../../../lib/db";
import Restaurant from "~~/lib/modals/company";

// import Reservation from "~~/lib/modals/reservations";

export const GET = async () => {
  try {
    await connect();
    const reservations = await Restaurant.find();
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
    const newRestaurant = new Restaurant(body);
    await newRestaurant.save();
    return new NextResponse(JSON.stringify({ message: "Restaurant is created", user: newRestaurant }), { status: 201 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ message: "Error creating restaurant", erro: error }), { status: 500 });
  }
};
