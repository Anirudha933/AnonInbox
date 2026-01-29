"use client";
import "../../globals.css";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
export default function PublicUserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      // enableSystem={false}
      disableTransitionOnChange
      storageKey="public-theme"
    >
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
