"use client";

import { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/* eslint-disable @next/next/no-img-element */
export default function UserReservation() {
  const { address: connectedAddress } = useAccount();
  const [userAddress, setUserAddress] = useState<string>("");
  const [tokensId, setTokensId] = useState<bigint[]>([]);
  const [tokenURIData, setTokenURIData] = useState<any>();

  const { data: tokenURI } = useScaffoldReadContract({
    contractName: "Reservation",
    functionName: "tokenURIs",
    args: [tokensId],
  });

  const { data: tokenData } = useScaffoldReadContract({
    contractName: "Reservation",
    functionName: "getTokenData",
    args: [userAddress],
  });

  const [data, setData] = useState("");
  const [showCameraModal, setshowCameraModal] = useState(false);

  const handleQrResult = (result: any, error: any) => {
    if (result) {
      const text = result.text;
      console.log(text);
      setData(text);
    }

    if (error) {
      console.info(error);
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  const toggleCameraModal = () => {
    setshowCameraModal(prevState => !prevState);
  };

  const qrReaderProps: any = {
    onResult: handleQrResult,
    constraints: {
      facingMode: "environment",
    },
    style: {
      width: "100%",
      height: "100%",
    },
  };

  useEffect(() => {
    if (connectedAddress) {
      setUserAddress(connectedAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress]);

  useEffect(() => {
    if (tokenData && Array.isArray(tokenData)) {
      const reservationsId: bigint[] = [];
      for (let i = 0; i < tokenData.length; i++) {
        if (typeof tokenData[i] === "object" && "reservationId" in tokenData[i]) {
          reservationsId.push(tokenData[i].reservationId);
        }
      }
      setTokensId(reservationsId);
    }
  }, [tokenData]);

  useEffect(() => {
    if (tokenURI) {
      fetchTokenURIData(Array.isArray(tokenURI) ? tokenURI : [tokenURI].map(uri => uri.toString()));
    }
  }, [tokenURI]);

  const fetchTokenURIData = async (uris: string[]) => {
    try {
      const fetchedData = await Promise.all(uris.map(uri => fetch(uri).then(res => res.json())));
      setTokenURIData(fetchedData);
    } catch (error) {
      console.error("Error fetching token URI data:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-x-2 pt-6">
      <h1 className="font-PlayfairDisplay font-bold text-4xl">My Reservations</h1>
      <div className="flex justify-center items-center gap-x-2">
        {tokenURIData && tokenURIData.length > 0 ? (
          tokenURIData.map((data: any, index: number) => (
            <div key={index} className="card w-48 bg-base-100 shadow-xl pt-2">
              <figure>
                <img className="w-40" src={data.image} alt={data.name} />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{data.name}</h2>
                <p>{data.description}</p>
                <div className="card-actions justify-end">
                  <div
                    className={`badge ${
                      data.status === "Reserved"
                        ? "badge-primary"
                        : data.status === "CheckedIn"
                        ? "badge-success"
                        : data.status === "Canceled"
                        ? "badge-error"
                        : "badge-secondary"
                    }`}
                  >
                    {data.status}
                  </div>
                </div>
              </div>
              <button className="btn" onClick={toggleCameraModal}>
                Check In
              </button>
              {showCameraModal && (
                <dialog id="camera_modal" className="modal" open>
                  <div className="modal-box">
                    <h3 className="font-bold text-lg">Make the Check In</h3>
                    <QrReader {...qrReaderProps} style={{ width: "100%", height: "100%" }} />
                    <div className="modal-action">
                      <form method="dialog">
                        <button className="btn" onClick={toggleCameraModal}>
                          Close
                        </button>
                      </form>
                    </div>
                  </div>
                </dialog>
              )}
            </div>
          ))
        ) : (
          // eslint-disable-next-line react/no-unescaped-entities
          <p className="font-PlayfairDisplay font-bold text-4xl">You don't have reservations yet </p>
        )}
      </div>
    </div>
  );
}
