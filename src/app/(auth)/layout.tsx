"use client";
import "../globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider"
import { Metadata } from "next";

const metadata: Metadata = {
  title: "AnonInbox",
  description: "Anonymous Feedback Platform",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            storageKey="auth-theme"
            disableTransitionOnChange
          >
            <Navbar />
            {children}
            <Toaster />
          </ThemeProvider>
      </AuthProvider>
  );
}
