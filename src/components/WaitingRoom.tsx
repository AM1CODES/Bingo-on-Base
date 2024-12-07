"use client";
import React from "react";
import { GameRoom } from "@/types/game";

interface WaitingRoomProps {
  room: GameRoom;
  playerId: string;
  onLeave: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  room,
  playerId,
  onLeave,
}) => {
  const isCreator = playerId === room.creator.id;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Waiting for Opponent
      </h2>

      <div className="mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">Room Code:</p>
          <p className="text-3xl font-mono font-bold tracking-wide">
            {room.id}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(room.id)}
            className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
          >
            Copy Code
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <p className="text-sm text-gray-600">Creator:</p>
          <p className="font-bold">
            {room.creator.name} {isCreator && "(You)"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Opponent:</p>
          <p className="font-bold">
            {room.opponent
              ? `${room.opponent.name} ${!isCreator ? "(You)" : ""}`
              : "Waiting..."}
          </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Share the room code with your friend to start playing!
        </p>
        <button
          onClick={onLeave}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;
