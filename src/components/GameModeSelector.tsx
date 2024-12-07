"use client";
import React, { useState } from "react";

interface Props {
  onStartSinglePlayer: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

const GameModeSelector: React.FC<Props> = ({
  onStartSinglePlayer,
  onCreateRoom,
  onJoinRoom,
}) => {
  const [roomId, setRoomId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim().toUpperCase());
      setRoomId("");
      setShowJoinInput(false);
    }
  };

  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-6">Select Game Mode</h2>

      <div className="space-y-4">
        <button
          onClick={onStartSinglePlayer}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg w-64 hover:bg-blue-600"
        >
          Play vs Computer
        </button>

        <button
          onClick={onCreateRoom}
          className="bg-green-500 text-white px-6 py-3 rounded-lg w-64 hover:bg-green-600"
        >
          Create 1v1 Room
        </button>

        <button
          onClick={() => setShowJoinInput(true)}
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg w-64 hover:bg-yellow-600"
        >
          Join 1v1 Room
        </button>

        {showJoinInput && (
          <div className="mt-4">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="Enter Room Code"
              className="px-4 py-2 border rounded mr-2"
              maxLength={6}
            />
            <button
              onClick={handleJoinRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Join
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameModeSelector;
