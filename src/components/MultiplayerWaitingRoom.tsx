"use client";
import React from "react";
import { GameRoom } from "@/types/game";

interface Props {
  room: GameRoom;
  playerId: string;
  onLeaveRoom: () => void;
}

const MultiplayerWaitingRoom: React.FC<Props> = ({
  room,
  playerId,
  onLeaveRoom,
}) => {
  const isCreator = playerId === room.creator.id;
  const playerName = isCreator ? room.creator.name : room.opponent?.name;
  const opponentName = isCreator ? room.opponent?.name : room.creator.name;

  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-6">Game Room</h2>

      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="mb-4">
          <p className="text-gray-600">Room Code:</p>
          <p className="text-2xl font-mono font-bold">{room.id}</p>
          <button
            onClick={() => navigator.clipboard.writeText(room.id)}
            className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
          >
            Copy Code
          </button>
        </div>

        <div className="border-t border-b py-4 my-4">
          <div className="mb-4">
            <p className="text-gray-600">You:</p>
            <p className="font-bold">{playerName}</p>
          </div>

          <div>
            <p className="text-gray-600">Opponent:</p>
            <p className="font-bold">
              {opponentName || "Waiting for opponent..."}
            </p>
          </div>
        </div>

        {!room.opponent && (
          <div className="mb-4">
            <div className="animate-pulse flex justify-center">
              <div className="h-2 w-2 bg-blue-500 rounded-full mx-1"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full mx-1 animate-delay-100"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full mx-1 animate-delay-200"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share the room code with your friend to play together
            </p>
          </div>
        )}

        <div className="space-x-4">
          <button
            onClick={onLeaveRoom}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerWaitingRoom;
