"use client";

import { useEffect } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  brandColor?: string;
  accentColor?: string;
}

// Aplica los colores personalizados de la clínica como CSS variables
export function ThemeProvider({ children, brandColor, accentColor }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement;
    if (brandColor) {
      root.style.setProperty("--primary", brandColor);
      root.style.setProperty("--sidebar", brandColor);
    }
    if (accentColor) {
      root.style.setProperty("--accent", accentColor);
      root.style.setProperty("--ring", accentColor);
    }
    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--sidebar");
    };
  }, [brandColor, accentColor]);

  return <>{children}</>;
}
