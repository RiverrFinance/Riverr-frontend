"use client";
import React, { useEffect, useRef } from "react";

interface GlowingEffectProps {
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
  proximity?: number;
  inactiveZone?: number;
}

export const GlowingEffect = ({
  spread = 40,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled || !glow) return;

    const container = containerRef.current;
    const glowElement = glowRef.current;

    if (!container || !glowElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      glowElement.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(120, 119, 198, 0.2), transparent ${spread}%)`;
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [spread, glow, disabled]);

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0 rounded-3xl transition duration-300"
      >
        <div
          ref={glowRef}
          className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </div>
    </>
  );
};
