import React from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

export const BackgroundBeams = React.memo(({ className }) => {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      <svg
        className="absolute left-1/2 top-0 h-[80rem] w-[80rem] -translate-x-1/2 stroke-slate-200/20 dark:stroke-slate-800/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"
        aria-hidden="true"
        viewBox="0 0 1200 1200"
      >
        <defs>
          <linearGradient id="beam-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
            <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Animated paths */}
        <motion.path
          d="M 100 0 L 900 1000"
          stroke="url(#beam-grad-1)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{
            pathLength: [0.1, 0.4, 0.1],
            pathOffset: [0, 0.8, 1.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.path
          d="M 500 0 L 1200 900"
          stroke="url(#beam-grad-2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{
            pathLength: [0.15, 0.35, 0.15],
            pathOffset: [0, 0.7, 1.1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
        />
        <motion.path
          d="M 900 0 L 200 1100"
          stroke="url(#beam-grad-3)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{
            pathLength: [0.1, 0.3, 0.1],
            pathOffset: [0, 0.9, 1.3],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "linear",
            delay: 4,
          }}
        />
        <motion.path
          d="M 0 400 L 1100 1100"
          stroke="url(#beam-grad-1)"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{
            pathLength: [0.08, 0.4, 0.08],
            pathOffset: [0, 0.85, 1.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 1,
          }}
        />
      </svg>
    </div>
  );
});

BackgroundBeams.displayName = "BackgroundBeams";
