"use client";
import React, { useState } from "react";
import { useGameRoom } from "@/context/GameRoomContext";
import { GameMode } from "@/types/game";

interface Props {
  onSelectMode: (mode: GameMode) => void;
  onJoinRoom: (roomId: string) => void;
}

const GameModeSelector: React.FC<Props> = ({ onSelectMode, onJoinRoom }) => {
  const { createRoom, isLoading, error } = useGameRoom();
  const [roomId, setRoomId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setShowNameInput(true);
      return;
    }

    try {
      const newRoomId = await createRoom(playerName);
      setCreatedRoomId(newRoomId);
      onSelectMode("multiplayer");
    } catch (err) {
      console.error("Failed to create room:", err);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim() || !playerName.trim()) {
      setShowNameInput(true);
      return;
    }

    onJoinRoom(roomId.trim().toUpperCase());
  };

  const renderNameInput = () => (
    <div className="mb-4">
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
        className="px-4 py-2 border rounded w-64 mb-2"
        maxLength={20}
      />
    </div>
  );

  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-6">Select Game Mode</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {showNameInput && renderNameInput()}

      <div className="space-y-4">
        <button
          onClick={() => onSelectMode("single")}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 w-64"
          disabled={isLoading}
        >
          Play vs Computer
        </button>

        <button
          onClick={handleCreateRoom}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 w-64"
          disabled={isLoading}
        >
          {isLoading ? "Creating Room..." : "Create 1v1 Room"}
        </button>

        {createdRoomId && (
          <div className="mt-2 p-4 bg-green-100 rounded-lg">
            <p className="font-bold">Room Created!</p>
            <p className="text-lg">Share this code with your friend:</p>
            <p className="text-2xl font-mono mt-2">{createdRoomId}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdRoomId);
              }}
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Copy Code
            </button>
          </div>
        )}

        <button
          onClick={() => setShowJoinInput(true)}
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 w-64"
          disabled={isLoading}
        >
          Join 1v1 Room
        </button>

        {showJoinInput && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-col items-center gap-2">
              {!playerName && renderNameInput()}
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter Room Code"
                className="px-4 py-2 border rounded w-48"
                maxLength={6}
              />
              <div className="space-x-2">
                <button
                  onClick={handleJoinRoom}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Joining..." : "Join"}
                </button>
                <button
                  onClick={() => {
                    setShowJoinInput(false);
                    setRoomId("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameModeSelector;
