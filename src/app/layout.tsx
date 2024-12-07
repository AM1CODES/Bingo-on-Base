"use client";
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
      <body>
        <TokenProvider>
          <GameRoomProvider>{children}</GameRoomProvider>
        </TokenProvider>
      </body>
    </html>
  );
}
