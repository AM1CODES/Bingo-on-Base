"use client";
import { Suspense } from "react";
import "./globals.css";
import { TokenProvider } from "@/context/TokenContext";
import { GameRoomProvider } from "@/context/GameRoomContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <TokenProvider>
          <GameRoomProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </GameRoomProvider>
        </TokenProvider>
      </body>
    </html>
  );
}
