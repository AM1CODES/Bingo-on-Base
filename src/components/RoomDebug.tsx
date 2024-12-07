"use client";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { GameRoom } from "@/types/game";

export default function RoomDebug() {
  const [rooms, setRooms] = useState<Record<string, GameRoom>>({});

  useEffect(() => {
    const roomsRef = ref(database, "rooms");

    console.log("Setting up rooms listener..."); // Debug log

    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const roomsData = snapshot.val();
      console.log("Rooms update:", roomsData); // Debug log
      setRooms(roomsData || {});
    });

    return () => {
      console.log("Cleaning up rooms listener..."); // Debug log
      unsubscribe();
    };
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto">
      <h3 className="font-bold mb-2">Room Debug Panel</h3>
      <div className="space-y-2">
        {Object.entries(rooms).map(([roomId, room]) => (
          <div key={roomId} className="text-xs border-b pb-2">
            <p className="font-semibold">Room: {roomId}</p>
            <p>Status: {room.status}</p>
            <p>
              Players: {room.creator.name}{" "}
              {room.opponent?.name ? `vs ${room.opponent.name}` : "(waiting)"}
            </p>
          </div>
        ))}
        {Object.keys(rooms).length === 0 && (
          <p className="text-sm text-gray-500">No active rooms</p>
        )}
      </div>
    </div>
  );
}
