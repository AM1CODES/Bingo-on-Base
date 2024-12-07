"use client";
import { useEffect, useState } from "react";
import { ref, onValue, DataSnapshot } from "firebase/database";
import { database } from "@/lib/firebase";
import { GameRoom } from "@/types/game";

interface RoomsData {
  [key: string]: GameRoom;
}

export default function DatabaseDebug() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [rooms, setRooms] = useState<RoomsData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check database connection
      const connectedRef = ref(database, ".info/connected");
      const unsubConnected = onValue(connectedRef, (snap: DataSnapshot) => {
        setConnected(snap.val());
        setLastUpdate(new Date());
        console.log("Connection status:", snap.val());
      });

      // Monitor rooms
      const roomsRef = ref(database, "rooms");
      const unsubRooms = onValue(
        roomsRef,
        (snap: DataSnapshot) => {
          setRooms(snap.val() as RoomsData);
          setLastUpdate(new Date());
          console.log("Rooms updated:", snap.val());
        },
        (error) => {
          setError(error.message);
          console.error("Database error:", error);
        },
      );

      // Cleanup function
      return () => {
        unsubConnected();
        unsubRooms();
        console.log("Database listeners cleaned up");
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Setup error:", err);
    }
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md z-50 text-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg">Database Debug Panel</h3>
        <div className="text-xs text-gray-500">
          {lastUpdate && `Last update: ${lastUpdate.toLocaleTimeString()}`}
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Connection Status:</span>
          {connected === null ? (
            <span className="text-yellow-500">⚪ Checking...</span>
          ) : connected ? (
            <span className="text-green-500">🟢 Connected</span>
          ) : (
            <span className="text-red-500">🔴 Disconnected</span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
          <p className="font-semibold">Error:</p>
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Active Rooms */}
      <div className="mb-2">
        <h4 className="font-semibold mb-2">Active Rooms:</h4>
        <div className="bg-gray-50 p-2 rounded max-h-60 overflow-auto">
          {rooms && Object.entries(rooms).length > 0 ? (
            Object.entries(rooms).map(([roomId, room]) => (
              <div key={roomId} className="mb-2 p-2 bg-white rounded shadow-sm">
                <div className="flex justify-between">
                  <span className="font-mono text-xs">{roomId}</span>
                  <span
                    className={`text-xs ${
                      room.status === "waiting"
                        ? "text-yellow-600"
                        : room.status === "playing"
                          ? "text-green-600"
                          : "text-gray-600"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
                <div className="text-xs mt-1">
                  <p>Creator: {room.creator.name}</p>
                  {room.opponent && <p>Opponent: {room.opponent.name}</p>}
                  <p>Active: {room.isActive ? "Yes" : "No"}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No active rooms</p>
          )}
        </div>
      </div>

      {/* Debug Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              console.log("Local storage cleared");
            }}
            className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Clear Storage
          </button>
        </div>
      </div>
    </div>
  );
}
