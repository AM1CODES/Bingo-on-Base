"use client";
import { useState } from "react"; // Remove useEffect since it's not being used
import { useTokens } from "@/context/TokenContext";
import { useGameRoom } from "@/context/GameRoomContext";
import BingoGame from "@/components/BingoGame";
import GameModeSelector from "@/components/GameModeSelector";
import MultiplayerWaitingRoom from "@/components/MultiplayerWaitingRoom";
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
  } = useGameRoom();

  const handleModeSelect = (mode: GameMode) => {
    if (tokens > 0) {
      setGameMode(mode);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (tokens > 0) {
      try {
        await joinRoom(roomId, `Player${Math.floor(Math.random() * 1000)}`);
        setGameMode("multiplayer");
      } catch (err) {
        console.error("Failed to join room:", err);
      }
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setGameMode(null);
  };

  // Render game content based on state
  const renderGameContent = () => {
    if (tokens === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-xl text-red-600 mb-4">
            You need tokens to play. Please purchase more tokens.
          </p>
          <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
            Buy Tokens
          </button>
        </div>
      );
    }

    if (!gameMode) {
      return (
        <GameModeSelector
          onSelectMode={handleModeSelect}
          onJoinRoom={handleJoinRoom}
        />
      );
    }

    if (gameMode === "multiplayer" && currentRoom) {
      // Show waiting room if opponent hasn't joined yet
      if (currentRoom.status === "waiting") {
        return (
          <MultiplayerWaitingRoom
            room={currentRoom}
            playerId={playerId}
            onLeaveRoom={handleLeaveRoom}
          />
        );
      }
    }

    return (
      <BingoGame
        gameType={gameMode}
        onEnd={() => {
          setGameMode(null);
          if (currentRoom) {
            leaveRoom();
          }
        }}
      />
    );
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bingo Game</h1>
          <div className="text-lg font-semibold">Tokens: {tokens}</div>
        </header>

        {gameError && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
            {gameError}
          </div>
        )}

        {renderGameContent()}
      </div>
    </main>
  );
}
