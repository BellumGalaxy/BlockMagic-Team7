"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function CompanyResgistration() {
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("ReservationFactory");
  const [formData, setFormData] = useState({
    restaurantWallet: "",
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    zip: "",
    city: "",
    country: "",
    district: "",
    complement: "",
  });

  const { address: connectedAddress } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (connectedAddress) {
      setFormData({
        ...formData,
        restaurantWallet: connectedAddress,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("formData", formData);
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log(result);

      if (formData.name !== "") {
        await writeYourContractAsync({
          functionName: "createReservationContract",
          args: [formData.name],
        });
        router.push("/reservationmanagement");
      }
    } catch (error) {
      console.error("Error registering company:", error);
    }
  };

  return (
    <form className="flex flex-col justify-center items-center pt-6" onSubmit={handleSubmit}>
      <h2 className="font-PlayfairDisplay font-bold text-4xl">Restaurant Registration</h2>
      <div className="flex gap-2 py-2">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Company Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="email"
            className="grow"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <textarea
        placeholder="Description"
        className="textarea textarea-bordered textarea-sm w-full max-w-xs"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
      ></textarea>
      <div className="flex gap-2 py-2">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="tel"
            className="grow"
            placeholder="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div className="flex gap-2 py-2">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div className="flex gap-2 py-2">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Zip Code"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div className="flex gap-2 py-2">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="District"
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Complement"
            name="complement"
            value={formData.complement}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <button className="btn btn-primary" type="submit">
        Register Company
      </button>
    </form>
  );
}
