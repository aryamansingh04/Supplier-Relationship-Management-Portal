import React from "react";
import { cn } from "./utils";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  ...props
}) {
  return (
    <Tag
      className={cn(
        "group relative p-[1px] rounded-xl overflow-hidden bg-slate-200/80 dark:bg-slate-800/80 hover:bg-transparent transition-all duration-300 active:scale-[0.99]",
        containerClassName
      )}
      {...props}
    >
      {/* Animated gradient background layer */}
      <div className="absolute inset-[-20%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-md -z-10 animate-spin-slow" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 -z-10" />
      
      {/* Content wrapper */}
      <div className={cn("relative z-10 w-full h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-[11px] transition-colors duration-300", className)}>
        {children}
      </div>
    </Tag>
  );
}
