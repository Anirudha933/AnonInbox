import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AnonInbox",
  description: "Anonymous Feedback Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
        >
            {children}
            <Toaster />
        </body>
    </html>
  );
}
