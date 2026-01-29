"use client";
import "../../globals.css";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { Metadata } from "next";


const metadata: Metadata = {
  title: "AnonInbox",
  description: "Anonymous Feedback Platform",
};

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
