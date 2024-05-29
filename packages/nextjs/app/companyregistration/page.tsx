"use client";

import { useState } from "react";
import { useFirebaseAuth } from "~~/hooks/firebase/useAuth";

export default function CompanyRegistration() {
  const { createUser } = useFirebaseAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    birthday_date: "",
    phone: "",
    document_type: "",
    document_number: "",
    country: "",
    city: "",
    zip_code: "",
    street: "",
    district: "",
    complement: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createUser(formData);
  };

  return (
    <form className="flex flex-col justify-center items-center pt-6" onSubmit={handleSubmit}>
      <h2 className="font-PlayfairDisplay font-bold text-4xl">Company Registration</h2>
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
      <div className="flex gap-2 py-2">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="password"
            className="grow"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
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
            placeholder="Document Type"
            name="document_type"
            value={formData.document_type}
            onChange={handleChange}
            required
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Document Number"
            name="document_number"
            value={formData.document_number}
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
            placeholder="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </label>
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
      </div>
      <div className="flex gap-2 py-2">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Zip Code"
            name="zip_code"
            value={formData.zip_code}
            onChange={handleChange}
            required
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Street"
            name="street"
            value={formData.street}
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
