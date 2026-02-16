"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import * as React from "react";

const THEMES = [
  "light",
  "dark",
  "tokyo-night",
  "monokai",
  "abyss",
  "dracula",
  "one-dark-pro",
  "nord",
];

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      themes={THEMES}
      disableTransitionOnChange
    >
      {children}
      <Toaster richColors position="bottom-right" />
    </NextThemesProvider>
  );
}
