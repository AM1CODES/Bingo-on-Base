"use client";
import "./globals.css";
import { TokenProvider } from "@/context/TokenContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TokenProvider>{children}</TokenProvider>
      </body>
    </html>
  );
}
