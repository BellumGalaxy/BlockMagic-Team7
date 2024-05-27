"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (connectedAddress) {
      setUserAddress(connectedAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress]);

  useEffect(() => {
    if (tokenData) {
      const reservationsId: bigint[] = [];
      for (let i = 0; i < tokenData.length; i++) {
        reservationsId.push(tokenData[i].reservationId);
      }
      setTokensId(reservationsId);
    }
  }, [tokenData]);

  useEffect(() => {
    if (tokenURI) {
      fetchTokenURIData([...tokenURI]);
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
