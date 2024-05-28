"use client";

import { useState } from "react";

export default function CompanyResgistration() {
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    country: "",
    city: "",
    zip: "",
    district: "",
    complement: "",
    companyName: "",
    email: "",
    password: "",
    username: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    // Here you can add the logic to send the form data to the server
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
            name="companyName"
            value={formData.companyName}
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
