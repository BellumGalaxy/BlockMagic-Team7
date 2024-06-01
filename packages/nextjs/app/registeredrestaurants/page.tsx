"use client";

import { useEffect, useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function ReservationTracking() {
  const [combinedData, setCombinedData] = useState<any>([]);

  const { data: restaurants } = useScaffoldReadContract({
    contractName: "ReservationFactory",
    functionName: "getAllDeployedContracts",
  });

  async function getRestaurantsData() {
    const response = await fetch("/api/users", {
      method: "GET",
    });
    const result = await response.json();
    return result;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const apiData = await getRestaurantsData();
        console.log(apiData, "API DATA");
        const apiDataFormated = JSON.parse(apiData);
        if (apiData && restaurants) {
          const combinedData:
            | ((prevState: never[]) => never[])
            | {
                restaurantName: string;
                restaurantAddress: string;
                restaurantContract: string;
                apiData: {
                  name: any;
                  description: any;
                  email: any;
                  address: any;
                  phone: any;
                  zip: any;
                  city: any;
                  country: any;
                  district: any;
                  complement: any;
                };
              }[] = [];
          restaurants.forEach(restaurant => {
            const matchingRestaurant = apiDataFormated.find(
              (data: { restaurantWallet: string }) => data.restaurantWallet === restaurant.companyAddress,
            );
            if (matchingRestaurant) {
              const combinedObject = {
                restaurantName: restaurant.companyName,
                restaurantAddress: restaurant.companyAddress,
                restaurantContract: restaurant.contractAddress,
                apiData: {
                  name: matchingRestaurant.name,
                  description: matchingRestaurant.description,
                  email: matchingRestaurant.email,
                  address: matchingRestaurant.address,
                  phone: matchingRestaurant.phone,
                  zip: matchingRestaurant.zip,
                  city: matchingRestaurant.city,
                  country: matchingRestaurant.country,
                  district: matchingRestaurant.district,
                  complement: matchingRestaurant.complement,
                },
              };
              combinedData.push(combinedObject);
            }
          });
          setCombinedData(combinedData);
          console.log(combinedData, "COMBINED DATA");
        } else {
          console.error("Expected arrays but got: ", { restaurants, apiData });
        }
      } catch (error) {
        console.error("Error fetching or combining data:", error);
      }
    }

    if (restaurants) {
      fetchData();
    }
  }, [restaurants]);

  return (
    <div className="flex flex-col items-center pt-6">
      <h1 className="font-PlayfairDisplay font-bold text-4xl">Restaurants:</h1>
      <div className="flex flex-wrap">
        {combinedData?.map((restaurant: any, index: number) => (
          <div key={index} className="p-4 m-2 rounded shadow">
            <div className="card w-96 bg-base-100 shadow-xl">
              <figure className="pt-4">
                <img src="/image1.png" alt="reservation" />
              </figure>
              <div className="card-body justify-center items-center">
                <h2 className="font-semibold text-xl">{restaurant.apiData.name}</h2>
                <p>{restaurant.apiData.description}</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">See Reservations</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
