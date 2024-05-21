"use client";

import type { NextPage } from "next";
import { FrontLogo } from "~~/components/assets/FrontLogo";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex justify-center gap-x-12 items-center pt-10">
        <div className="flex flex-col h-2/3 w-2/5">
          <h1 className="font-PlayfairDisplay font-extrabold text-7xl">Link a Table Effortlessly with Our Dapp</h1>
          <p>Experience seamless restaurant reservations with our decentralized app, designed for food enthusiasts.</p>
          <div className="flex gap-x-4 gap-y-4">
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-active">Learn More</button>
          </div>
        </div>
        <FrontLogo className="h-2/6 w-2/6" />
      </div>
    </>
  );
};

export default Home;
