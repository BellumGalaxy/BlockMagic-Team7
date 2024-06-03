"use client";

import { useState } from "react";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { DateRangePicker } from "@nextui-org/react";
import { useAccount } from "wagmi";
import { EtherInput } from "~~/components/scaffold-eth";

export default function ReservationManagement() {
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [toleranceTime, setToleranceTime] = useState("");
  const [numberOfTables, setNumberOfTables] = useState("");
  const [personsPerTable, setPersonsPerTable] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reservationValue, setReservationValue] = useState("");
  const [reservationRange, setReservationsRange] = useState({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()),
  });
  const { address: connectedAddress } = useAccount();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (!openTime || !closeTime || !reservationTime || !toleranceTime || !numberOfTables || !personsPerTable) {
      alert("Please fill all fields");
      return;
    } else {
      setShowConfirmation(true);
    }
  };

  const confirmSubmit = async () => {
    const parseTime = (timeString: string) => {
      const [time, period] = timeString.split(" ");
      // eslint-disable-next-line prefer-const
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return { hours, minutes };
    };

    const { hours: openHour, minutes: openMinutes } = parseTime(openTime);
    const { hours: closeHour, minutes: closeMinutes } = parseTime(closeTime);
    const reservationHours = parseInt(reservationTime, 10);
    const toleranceMinutes = parseInt(toleranceTime, 10);
    const totalTables = parseInt(numberOfTables, 10);
    const persons = parseInt(personsPerTable, 10);

    console.log("Open Hour:", openHour);
    console.log("Close Hour:", closeHour);
    console.log("Reservation Hours:", reservationHours);
    console.log("Tolerance Minutes:", toleranceMinutes);
    console.log("Total Tables:", totalTables);

    const totalAvailableMinutes = closeHour * 60 + closeMinutes - (openHour * 60 + openMinutes);
    const reservationDuration = reservationHours * 60 + toleranceMinutes;
    const totalReservationSlots = Math.floor(totalAvailableMinutes / reservationDuration);

    const reservations = [];

    const start = reservationRange.start;
    const end = reservationRange.end;

    const currentDate = new Date(start.year, start.month - 1, start.day);
    const endDate = new Date(end.year, end.month - 1, end.day);

    while (currentDate <= endDate) {
      const dayReservations = [];
      for (let table = 1; table <= totalTables; table++) {
        for (let slot = 0; slot < totalReservationSlots; slot++) {
          const slotMinutes = slot * reservationDuration;
          const slotHours = Math.floor(slotMinutes / 60);
          const slotRemainingMinutes = slotMinutes % 60;

          const reservationDateTime = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            openHour + slotHours,
            openMinutes + slotRemainingMinutes,
          );

          const reservationTimestamp = reservationDateTime.getTime(); // Get the timestamp in milliseconds
          dayReservations.push({
            date: currentDate.toDateString(),
            timestamp: reservationTimestamp,
            tableNumber: table,
            persons: persons,
          });
        }
      }
      reservations.push({
        date: currentDate.toDateString(),
        reservations: dayReservations,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const reservationData = {
      walletAddress: connectedAddress,
      opentime: openTime,
      closetime: closeTime,
      reservationtime: reservationTime,
      toleranceTime: toleranceTime,
      numberOfTables: totalTables,
      personPerTable: persons,
      reservationValue: reservationValue,
      dailyReservations: reservations,
    };

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });
      const data = await response.json();
      console.log("Reservation data:", data);
    } catch (error) {
      console.log("Error creating reservation:", error);
    }

    console.log("Reservations:", reservations);
    setShowConfirmation(false);
  };

  const cancelSubmit = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="flex justify-center h-screen">
      <form className="flex flex-col justify-around rounded-lg shadow-lg" onSubmit={handleSubmit}>
        <h1 className="font-PlayfairDisplay font-bold text-4xl">Reservation Management</h1>
        <div className="flex">
          <div className="flex flex-col">
            <div className="flex space-x-4">
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Open Time</span>
                </div>
                <select className="select w-full max-w-xs" value={openTime} onChange={e => setOpenTime(e.target.value)}>
                  <option disabled selected>
                    Select a time
                  </option>
                  {[...Array(24).keys()].map(hour => (
                    <option key={hour} value={hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}>
                      {hour < 10 ? `0${hour}` : hour}:{hour === 0 ? "00" : "00"} {hour < 12 ? "AM" : "PM"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Close Time</span>
                </div>
                <select
                  className="select w-full max-w-xs"
                  value={closeTime}
                  onChange={e => setCloseTime(e.target.value)}
                >
                  <option disabled selected>
                    Select a time
                  </option>
                  {[...Array(24).keys()].map(hour => (
                    <option key={hour} value={hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}>
                      {hour < 10 ? `0${hour}` : hour}:{hour === 0 ? "00" : "00"} {hour < 12 ? "AM" : "PM"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex space-x-4">
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Reservation Time</span>
                </div>
                <select
                  className="select w-full max-w-xs"
                  value={reservationTime}
                  onChange={e => setReservationTime(e.target.value)}
                >
                  {[1, 2, 3, 4].map(hours => (
                    <option key={hours} value={hours}>
                      {hours} hours
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Tolerance Time</span>
                </div>
                <select
                  className="select w-full max-w-xs"
                  value={toleranceTime}
                  onChange={e => setToleranceTime(e.target.value)}
                >
                  {[15, 20, 25, 30, 35, 40, 45].map(min => (
                    <option key={min} value={min}>
                      {min} min
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex space-x-4">
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Number of Tables</span>
                </div>
                <input
                  type="number"
                  value={numberOfTables}
                  onChange={e => setNumberOfTables(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
              </label>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Person per Table</span>
                </div>
                <input
                  type="number"
                  value={personsPerTable}
                  onChange={e => setPersonsPerTable(e.target.value)}
                  className="input input-bordered w-full max-w-xs"
                />
              </label>
            </div>
            <div className="flex justify-center items-center">
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Reservation Value</span>
                </div>
                <EtherInput value={reservationValue} onChange={amount => setReservationValue(amount)} />
              </label>
            </div>
            <div className="flex justify-center space-y-4">
              <DateRangePicker
                label="Reservations Range"
                labelPlacement="outside"
                isRequired
                defaultValue={{ start: today(getLocalTimeZone()), end: today(getLocalTimeZone()) }}
                className="max-w-xs"
                onChange={(value: { start: CalendarDate; end: CalendarDate }) => setReservationsRange(value)}
              />
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-4">
          Create Reservations
        </button>
      </form>

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-slate-700 p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Restaurant Reservations</h2>
            <p>Open Time: {openTime}</p>
            <p>Close Time: {closeTime}</p>
            <p>Reservation Time: {reservationTime} hours</p>
            <p>Tolerance Time: {toleranceTime} minutes</p>
            <p>Number of Tables: {numberOfTables}</p>
            <p>Persons per Table: {personsPerTable}</p>
            <div className="flex space-x-4 justify-between mt-4">
              <button onClick={confirmSubmit} className="btn btn-success">
                Confirm
              </button>
              <button onClick={cancelSubmit} className="btn btn-error">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
