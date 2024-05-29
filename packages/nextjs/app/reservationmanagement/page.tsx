"use client";

import { useState } from "react";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { DateRangePicker } from "@nextui-org/react";

export default function ReservationManagement() {
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [toleranceTime, setToleranceTime] = useState("");
  const [numberOfTables, setNumberOfTables] = useState("");
  const [personsPerTable, setPersonsPerTable] = useState("");
  const [, setReservationsRange] = useState({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()),
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    const data = {
      openTime,
      closeTime,
      reservationTime,
      toleranceTime,
      numberOfTables,
      personsPerTable,
    };
    console.log(data);
  };

  const cancelSubmit = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form className="flex flex-col justify-around rounded-lg shadow-lg" onSubmit={handleSubmit}>
        <h1 className="text-center text-xl font-bold">Reservation Management</h1>
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
            <div className="flex justify-center space-y-4">
              <DateRangePicker
                label="Reservations Range"
                labelPlacement="outside"
                onChange={(value: { start: CalendarDate; end: CalendarDate }) => setReservationsRange(value)}
                isRequired
                defaultValue={{ start: today(getLocalTimeZone()), end: today(getLocalTimeZone()) }}
                className="max-w-xs"
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
