// src/components/GradientBackground.tsx
import React from "react";

export const GradientBackgroundForward: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0B0F1A] overflow-hidden">
      {/* Radial Gradient 1 (Top Left) */}
      <div className="absolute bottom-[-20%] right-[-20%] w-[50rem] h-[50rem] rounded-full bg-[#0c0946ae] opacity-40 blur-[160px]" />

      {/* Radial Gradient 2 (Bottom Right) */}
      <div className="absolute top-[-20%] left-[-20%] w-[40rem] h-[40rem] rounded-full bg-[#20043a] opacity-40 blur-[200px]" />

      {/* Radial Gradient 3 (Center Glow) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[35rem] h-[35rem] rounded-full bg-[#2c2d7497] opacity-30 blur-[180px]" />
    </div>
  );
};

export const GradientBackgroundBackward: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0B0F1A] overflow-hidden">
      {/* Radial Gradient 1 (Top Left) */}
      <div className="absolute top-[-20%] left-[-20%] w-[40rem] h-[40rem] rounded-full bg-[#0c0946ae] opacity-40 blur-[160px]" />

      {/* Radial Gradient 2 (Bottom Right) */}
      <div className="absolute bottom-[-20%] right-[-20%] w-[50rem] h-[50rem] rounded-full bg-[#20043a] opacity-40 blur-[200px]" />

      {/* Radial Gradient 3 (Center Glow) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[35rem] h-[35rem] rounded-full bg-[#2c2d7497] opacity-30 blur-[180px]" />
    </div>
  );
};

