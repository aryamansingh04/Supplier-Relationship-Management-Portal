import React from "react";
import { cn } from "./utils";

export const Meteors = ({ number = 20, className }) => {
  const meteors = new Array(number).fill(true);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor absolute h-0.5 w-0.5 rounded-[9999px] bg-slate-400 dark:bg-slate-300 shadow-[0_0_0_1px_ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-slate-400 dark:before:from-slate-300 before:to-transparent",
            className
          )}
          style={{
            top: Math.floor(Math.random() * 40) - 20 + "%",
            left: Math.floor(Math.random() * 120) - 10 + "%",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (6 - 2) + 2) + "s",
          }}
        />
      ))}
    </div>
  );
};
