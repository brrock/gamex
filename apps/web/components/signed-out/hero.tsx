import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-balance text-center pt-6">
        GameX - Games for all
      </h1>
      <p className="text-center text-1xl">
        Come play funnest, freshest and most popular games. Get your free
        account today.
      </p>
      <div className="text-center space-x-4">
        <Button asChild className="">
          <Link href="/sign-in">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
      <div className=""></div>
    </div>
  );
};

export default Hero;
