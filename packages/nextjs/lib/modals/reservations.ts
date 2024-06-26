import { Schema, model, models } from "mongoose";

const reservationSlotSchema = new Schema(
  {
    date: { type: String, required: true },
    timestamp: { type: Number, required: true },
    tableNumber: { type: Number, required: true },
    persons: { type: String, required: true },
  },
  { _id: false },
);

const dailyReservationsSchema = new Schema(
  {
    date: { type: String, required: true },
    reservations: [reservationSlotSchema],
  },
  { _id: false },
);

const reservationSchema = new Schema(
  {
    walletAddress: { type: String, required: true },
    opentime: { type: String, required: true },
    closetime: { type: String, required: true },
    reservationtime: { type: Number, required: true },
    toleranceTime: { type: Number, required: true },
    numberOfTables: { type: Number, required: true },
    personPerTable: { type: String, required: true },
    reservationValue: { type: Number, required: true },
    restaurantIdentifier: { type: Schema.Types.ObjectId, ref: "Restaurant" },
    dailyReservations: [dailyReservationsSchema],
  },
  { timestamps: true },
);

const Reservation = models.Reservation || model("Reservation", reservationSchema);

export default Reservation;
