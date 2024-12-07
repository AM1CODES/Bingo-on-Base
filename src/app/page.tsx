"use client";
import { useState } from "react";
import { useTokens } from "@/context/TokenContext";
import { useGameRoom } from "@/context/GameRoomContext";
import BingoGame from "@/components/BingoGame";
import MultiplayerGame from "@/components/MultiplayerGame";
import WaitingRoom from "@/components/WaitingRoom";
import { GameMode } from "@/types/game";

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const { tokens } = useTokens();
  const {
    joinRoom,
    currentRoom,
    leaveRoom,
    error: gameError,
    playerId,
    createRoom,
  } = useGameRoom();

  const handleCreateRoom = async () => {
    try {
      const playerName = `Player${Math.floor(Math.random() * 1000)}`;
      await createRoom(playerName);
      setGameMode("multiplayer");
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const playerName = `Player${Math.floor(Math.random() * 1000)}`;
      await joinRoom(roomId, playerName);
      setGameMode("multiplayer");
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  const renderGameContent = () => {
    // If it's multiplayer and we have a room
    if (gameMode === "multiplayer" && currentRoom) {
      // Show waiting room if status is 'waiting'
      if (currentRoom.status === "waiting") {
        return (
          <WaitingRoom
            room={currentRoom}
            playerId={playerId}
            onLeave={() => {
              leaveRoom();
              setGameMode(null);
            }}
          />
        );
      }
      // Show multiplayer game if status is 'playing'
      return (
        <MultiplayerGame
          room={currentRoom}
          playerId={playerId}
          onLeave={() => {
            leaveRoom();
            setGameMode(null);
          }}
        />
      );
    }

    // Show single player game
    if (gameMode === "single") {
      return <BingoGame gameType="single" onEnd={() => setGameMode(null)} />;
    }

    // Show game mode selection
    return (
      <div className="text-center space-y-6 py-8">
        <h2 className="text-2xl font-bold mb-8">Select Game Mode</h2>

        <button
          onClick={() => setGameMode("single")}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 block w-64 mx-auto"
        >
          Play vs Computer
        </button>

        <button
          onClick={handleCreateRoom}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 block w-64 mx-auto"
        >
          Create 1v1 Room
        </button>

        <div className="mt-8">
          <p className="text-gray-600 mb-2">Or join an existing room:</p>
          <input
            type="text"
            placeholder="Enter Room Code"
            className="px-4 py-2 border rounded mr-2"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const input = e.target as HTMLInputElement;
                handleJoinRoom(input.value);
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = e.currentTarget
                .previousElementSibling as HTMLInputElement;
              handleJoinRoom(input.value);
            }}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Join Room
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bingo Game</h1>
          <div className="text-lg font-semibold">Tokens: {tokens}</div>
        </header>

        {/* Error Display */}
        {gameError && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
            {gameError}
          </div>
        )}

        {/* Main Game Content */}
        {renderGameContent()}
      </div>
    </main>
  );
}
