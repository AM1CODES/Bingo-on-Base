"use client";
import React, { useState } from "react";
import { useGameRoom } from "@/context/GameRoomContext";
import { GameMode } from "@/types/game";

interface Props {
  onSelectMode: (mode: GameMode) => void;
  onJoinRoom: (roomId: string) => void;
}

const GameModeSelector: React.FC<Props> = ({ onSelectMode, onJoinRoom }) => {
  // States for UI
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");

  // Get room functions from context
  const { createRoom, isLoading, error, currentRoom } = useGameRoom();

  // Handle player vs computer mode
  const handleSinglePlayerMode = () => {
    if (!playerName.trim()) {
      return; // Don't proceed if no name
    }
    onSelectMode("single");
  };

  // Handle room creation
  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      return;
    }

    try {
      await createRoom(playerName.trim()); // Removed the unused variable
      onSelectMode("multiplayer");
    } catch (err) {
      console.error("Failed to create room:", err);
    }
  };

  // Handle room joining
  const handleJoinRoom = () => {
    if (!roomId.trim() || !playerName.trim()) {
      return; // Don't proceed if no name or room ID
    }
    onJoinRoom(roomId.trim().toUpperCase());
  };

  // Render name input section
  const renderNameInput = () => (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Enter Your Name:
      </label>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Your name"
        className="shadow appearance-none border rounded w-64 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        maxLength={20}
      />
      {!playerName.trim() && (
        <p className="text-red-500 text-xs mt-1">
          Please enter your name to continue
        </p>
      )}
    </div>
  );

  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-6">Select Game Mode</h2>

      {/* Show errors if any */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Always show name input at the top */}
      {renderNameInput()}

      <div className="space-y-4">
        {/* Single player button */}
        <button
          onClick={handleSinglePlayerMode}
          disabled={isLoading || !playerName.trim()}
          className={`bg-blue-500 text-white px-6 py-3 rounded-lg w-64
            ${
              isLoading || !playerName.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
            }`}
        >
          Play vs Computer
        </button>

        {/* Create room button */}
        <button
          onClick={handleCreateRoom}
          disabled={isLoading || !playerName.trim()}
          className={`bg-green-500 text-white px-6 py-3 rounded-lg w-64
            ${
              isLoading || !playerName.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-600"
            }`}
        >
          {isLoading ? "Creating Room..." : "Create 1v1 Room"}
        </button>

        {/* Show room code if room was created */}
        {currentRoom && (
          <div className="mt-2 p-4 bg-green-100 rounded-lg">
            <p className="font-bold">Room Created!</p>
            <p className="text-lg">Share this code with your friend:</p>
            <p className="text-2xl font-mono mt-2">{currentRoom.id}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentRoom.id);
              }}
              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Copy Code
            </button>
          </div>
        )}

        {/* Join room button */}
        <button
          onClick={() => setShowJoinInput(true)}
          disabled={isLoading || !playerName.trim()}
          className={`bg-yellow-500 text-white px-6 py-3 rounded-lg w-64
            ${
              isLoading || !playerName.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-yellow-600"
            }`}
        >
          Join 1v1 Room
        </button>

        {/* Join room input section */}
        {showJoinInput && (
          <div className="mt-4 space-y-2">
            <div className="flex flex-col items-center gap-2">
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
                  disabled={isLoading || !roomId.trim() || !playerName.trim()}
                  className={`bg-blue-500 text-white px-4 py-2 rounded
                    ${
                      isLoading || !roomId.trim() || !playerName.trim()
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-600"
                    }`}
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
