"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface Reservation {
  reservationId: bigint;
  reservationTimestamp: bigint;
  toleranceTime: bigint;
  reservationValue: bigint;
  reservationPayment: boolean;
  status: number;
}

interface UnifiedData {
  address: string;
  reservations: readonly Reservation[];
}

export default function ReservationTracking() {
  const [timestamp, setTimestamp] = useState(0);
  const [qrData, setQrData] = useState<string>("");
  const [reservationsAddress, setReservationsAddress] = useState<string[]>([]);
  const [unifiedReservations, setUnifiedReservations] = useState<UnifiedData[]>([]);

  const { data: dailyReservations } = useScaffoldReadContract({
    contractName: "Reservation",
    functionName: "getReservationsByDay",
    args: [BigInt(timestamp)],
  });

  const { data: reservationsDataStatus } = useScaffoldReadContract({
    contractName: "Reservation",
    functionName: "getReservationTokensByAddresses",
    args: [reservationsAddress],
  });

  useEffect(() => {
    const startOfDayUTC = getTheStartOfDayUTC();
    if (startOfDayUTC) {
      setTimestamp(startOfDayUTC);
    }
    addressReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyReservations]);

  useEffect(() => {
    if (dailyReservations && reservationsDataStatus) {
      const unifiedData: UnifiedData[] = reservationsAddress.map((address, index) => {
        return {
          address,
          reservations: reservationsDataStatus[index],
        };
      });

      setUnifiedReservations(unifiedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyReservations, reservationsDataStatus]);

  function addressReservations() {
    const addressSet = new Set<string>();
    if (dailyReservations?.length) {
      for (let i = 0; i < dailyReservations.length; i++) {
        const reservation = dailyReservations[i];
        const updatedAddress = reservation.userAddress.replace(/'/g, '"');
        addressSet.add(updatedAddress);
      }
      const uniqueAddresses = Array.from(addressSet);
      setReservationsAddress(uniqueAddresses);
    }
  }

  function getTheStartOfDayUTC() {
    const currentDate = new Date();
    return Math.floor(
      Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()) / 1000,
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center pt-6">
        <div>
          <h1 className="font-PlayfairDisplay font-bold text-4xl">Daily Reservation</h1>
        </div>
        {unifiedReservations?.map(reservationData =>
          reservationData.reservations.map((reservation: any) => (
            <table key={reservation.reservationId} className="table">
              <thead>
                <tr>
                  <th>ReservationId</th>
                  <th>User Address</th>
                  <th>TimeToCheckIn</th>
                  <th>ReservationStatus</th>
                  <th>CheckIn</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-base-200">
                  <th>{Number(reservation.reservationId)}</th>
                  <th>{reservationData.address}</th>
                  <td>{reservation.reservationTimestamp.toString()}</td>
                  <td>
                    <div
                      className={`badge ${
                        reservation.status === 0
                          ? "badge-primary"
                          : reservation.status === 1
                          ? "badge-success"
                          : reservation.status === 2
                          ? "badge-error"
                          : "badge-secondary"
                      }`}
                    >
                      {reservation.status === 0 && "Reserved"}
                      {reservation.status === 1 && "CheckedIn"}
                      {reservation.status === 2 && "Canceled"}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        setQrData(reservationData.address + reservation.reservationId);
                        const modal = document.getElementById("my_modal_1") as HTMLDialogElement;
                        if (modal) {
                          modal.showModal();
                        }
                      }}
                    >
                      CheckIn
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          )),
        )}
      </div>
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <div className="flex flex-col justify-center items-center">
            <h1>Read to CheckIn</h1>
            <QRCode value={qrData} />
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
