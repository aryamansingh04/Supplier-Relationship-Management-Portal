import React from "react";

export function GridBackground({ children, className = "", type = "grid" }) {
  const gridSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M 32 0 L 0 0 0 32' fill='none' stroke='rgba(15, 23, 42, 0.05)' stroke-width='1'/%3E%3C/svg%3E`;
  const gridSvgDark = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M 32 0 L 0 0 0 32' fill='none' stroke='rgba(255, 255, 255, 0.05)' stroke-width='1'/%3E%3C/svg%3E`;

  const dotSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(15, 23, 42, 0.08)'/%3E%3C/svg%3E`;
  const dotSvgDark = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255, 255, 255, 0.08)'/%3E%3C/svg%3E`;

  const selectedSvg = type === "grid" ? gridSvg : dotSvg;
  const selectedSvgDark = type === "grid" ? gridSvgDark : dotSvgDark;

  return (
    <div className={`absolute inset-0 w-full h-full -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 ${className}`}>
      {/* Light Mode Pattern */}
      <div 
        className="absolute inset-0 block dark:hidden" 
        style={{ backgroundImage: `url("${selectedSvg}")` }}
      />
      {/* Dark Mode Pattern */}
      <div 
        className="absolute inset-0 hidden dark:block" 
        style={{ backgroundImage: `url("${selectedSvgDark}")` }}
      />
      {/* Radial Gradient Vignette for Depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, var(--bg-radial-fade) 85%)"
        }}
      />
      {children}
    </div>
  );
}
