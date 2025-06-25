// src/components/theme-toggle.tsx
"use client";

import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const toggleTheme = () => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark");
    }
  };

  return (
    <Button
      variant="outline"
      className="text-base px-5 py-2 font-semibold shadow hover:scale-105 transition-transform"
      onClick={toggleTheme}
    >
      🌙 الوضع الداكن
    </Button>
  );
}
