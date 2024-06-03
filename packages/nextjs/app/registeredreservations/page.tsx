"use client";

import React, { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function RegisteredReservations() {
  const [registeredReservations, setRegisteredReservations] = useState<any>([]);
  const [uniqueDates, setUniqueDates] = useState<any>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("Reservation");
  const { address: connectedAddress } = useAccount();

  const [dataToMint, setDataToMint] = useState<any>([]);

  async function getReservationsData() {
    const response = await fetch("/api/reservations", {
      method: "GET",
    });
    const result = await response.json();
    return result;
  }

  useEffect(() => {
    const dataArray = [dataToMint.id, dataToMint.timestamp, dataToMint.tableNumber, dataToMint.date];
    const stringDataArray = dataArray.map(String);
    if (stringDataArray.length === 0) return;
    async function fetchData() {
      try {
        await writeYourContractAsync({
          functionName: "sendRequest",
          args: [stringDataArray],
        });
        const weiAmount = parseEther(dataToMint.reservationValue.toString());
        const bigIntWeiAmount = BigInt(weiAmount.toString());
        console.log(bigIntWeiAmount, "BIG INT WEI AMOUNT");
        await writeYourContractAsync({
          functionName: "safeMint",
          args: [
            connectedAddress,
            dataToMint.timestamp,
            BigInt(dataToMint.toleranceTime * 1e18),
            BigInt(dataToMint.reservationValue * 1e18),
          ],
          value: bigIntWeiAmount,
        });
      } catch (e) {
        console.error("Error setting greeting:", e);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataToMint]);

  useEffect(() => {
    async function fetchData() {
      try {
        const apiData = await getReservationsData();
        const apiDataFormated = JSON.parse(apiData);
        console.log(apiDataFormated, "API DATA");
        setRegisteredReservations(apiDataFormated);

        const dates: string[] = apiDataFormated.flatMap((reservation: { dailyReservations: any[] }) =>
          reservation.dailyReservations.map(dailyRes => dailyRes.date),
        );
        const uniqueDatesArr: string[] = [...new Set(dates)];
        console.log(uniqueDatesArr, "UNIQUE DATES");
        setUniqueDates(uniqueDatesArr);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  // const deleteSpecificReservation = async (
  //   reservationId: string,
  //   reservationDate: string,
  //   reservationTimestamp: string,
  //   tableNumber: string,
  // ) => {
  //   try {
  //     const response = await fetch(
  //       `/api/reservationsById?id=${reservationId}&reservationTimestamp=${reservationTimestamp}&tableNumber=${tableNumber}&reservationDate=${reservationDate}`,
  //     );
  //     console.log(response, "RESPONSE");
  //     console.log(reservationId, reservationDate, reservationTimestamp, tableNumber);
  //     if (!response.ok) {
  //       if (response.status === 404) {
  //         console.log("Specific reservation not found");
  //       } else {
  //         throw new Error("Network response was not ok");
  //       }
  //     }
  //     const specificReservation = await response.json();
  //     console.log("Specific reservation found:", specificReservation);
  //   } catch (error) {
  //     console.error("Error fetching specific reservation:", error);
  //   }
  // };

  const handleDateChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setSelectedDate(e.target.value);
  };

  // Filter reservations based on selected date
  const filteredReservations = registeredReservations.filter((reservation: { dailyReservations: any[] }) =>
    reservation.dailyReservations.some(dailyRes => dailyRes.date === selectedDate),
  );

  return (
    <div className="flex flex-col items-center pt-6">
      {/* Date Selection */}
      <label htmlFor="date-select" className="block mb-2">
        Select Date:
      </label>
      <select id="date-select" value={selectedDate} onChange={handleDateChange} className="border p-2 rounded">
        <option value="">Select Date</option>
        {uniqueDates.map((date: any) => (
          <option key={date} value={date}>
            {date}
          </option>
        ))}
      </select>

      {/* Display Reservations */}
      <div className="flex justify-center reservation-list mt-4">
        {selectedDate && filteredReservations.length > 0 ? (
          filteredReservations.map((reservations: any, index: number) => (
            <div key={index} className="flex flex-col justify-center items-center reservation-item">
              {/* <p>Wallet Address: {reservations.walletAddress}</p> */}
              <div className="flex gap-4">
                <p>Open Time: {reservations.opentime}</p>
                <p>Close Time: {reservations.closetime} ETH</p>
              </div>

              <p>Reservation Value: {reservations.reservationValue}</p>
              {/* Wrap the following content in a div */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {registeredReservations.map((reservation: { dailyReservations: any[] }) => {
                  if (reservation.dailyReservations) {
                    return reservation.dailyReservations.map((day: { date: string; reservations: any[] }) => {
                      if (day.date === selectedDate) {
                        return day.reservations.map((res: any, resIndex: any) => (
                          <div key={resIndex} className="card w-96 bg-base-100 shadow-xl px-4 py-4">
                            <div className="">
                              <h2 className="card-title justify-center">Reservation Details:</h2>
                              <div className="">
                                <p>Time: {new Date(parseInt(res.timestamp, 10)).toString()}</p>
                                <p>Table Number: {res.tableNumber}</p>
                                <p>Persons: {res.persons}</p>
                              </div>

                              {/* Add more reservation details */}
                              <button
                                className="btn btn-primary"
                                onClick={() =>
                                  setDataToMint({
                                    id: reservations._id,
                                    date: res.date,
                                    tableNumber: res.tableNumber,
                                    timestamp: res.timestamp,
                                    toleranceTime: reservations.toleranceTime,
                                    reservationValue: reservations.reservationValue,
                                  })
                                }
                              >
                                Link a table
                              </button>
                            </div>
                          </div>
                        ));
                      }
                      return null;
                    });
                  }
                  return null;
                })}
              </div>
            </div>
          ))
        ) : (
          <p>No reservations found for the selected date.</p>
        )}
      </div>
    </div>
  );
}
