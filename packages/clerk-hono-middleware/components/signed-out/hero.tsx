"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const Hero = () => {
  const [titleNumber, setTitleNumber] = useState(0);
  const adjectives = useMemo(
    () => ["funnest", "freshest", "coolest", "greatest", "newest"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === adjectives.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, adjectives]);

  return (
    <div className="space-y-4">
      <h1 className="text-balance pt-6 text-center text-3xl font-black sm:text-4xl md:text-5xl lg:text-6xl">
        GameX - Games for all
      </h1>
      <p className="text-center text-xl">
        Come play{" "}
        <span className="fixed relative inline-flex h-8 justify-center overflow-hidden font-semibold">
          {adjectives.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{
                y: titleNumber === index ? 0 : titleNumber > index ? -50 : 50,
                opacity: titleNumber === index ? 1 : 0,
              }}
              transition={{
                y: { type: "spring", stiffness: 100, damping: 15 },
                opacity: { duration: 0.2 },
              }}
            >
              {word}
            </motion.span>
          ))}
        </span>
        , and most popular games. Get your free account today.
      </p>
      <div className="space-x-4 text-center">
        <Button asChild>
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
