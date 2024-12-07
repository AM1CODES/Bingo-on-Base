"use client";
import { useState, useEffect } from "react";
import { useTokens } from "@/context/TokenContext";
import { useGameRoom } from "@/context/GameRoomContext";
import BingoGame from "@/components/BingoGame";
import GameModeSelector from "@/components/GameModeSelector";
import { GameMode } from "@/types/game";
import { database } from "@/lib/firebase";
import { ref, set } from "firebase/database";

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const { tokens } = useTokens();
  const { joinRoom, error: gameError } = useGameRoom();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(true);

  // Firebase connection test
  useEffect(() => {
    const testConnection = async () => {
      const testRef = ref(database, "test");
      setIsTestingConnection(true);

      try {
        await set(testRef, {
          testData: "Hello Firebase!",
          timestamp: Date.now(),
        });
        console.log("Firebase connection successful!");
        setConnectionError(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown Firebase connection error";
        console.error("Firebase connection failed:", errorMessage);
        setConnectionError(errorMessage);
      } finally {
        setIsTestingConnection(false);
      }
    };

    testConnection();
  }, []);

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

  // Loading state
  if (isTestingConnection) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to game server...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 text-red-600 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Connection Error</h2>
            <p className="mb-4">{connectionError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bingo Game</h1>
          <div className="text-lg font-semibold">Tokens: {tokens}</div>
        </header>

        {/* Game error display */}
        {gameError && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
            <p className="font-semibold">Game Error:</p>
            <p>{gameError}</p>
          </div>
        )}

        {/* Main game content */}
        {tokens === 0 ? (
          // No tokens state
          <div className="text-center py-8">
            <p className="text-xl text-red-600 mb-4">
              You need tokens to play. Please purchase more tokens.
            </p>
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Buy Tokens
            </button>
          </div>
        ) : !gameMode ? (
          // Game mode selection
          <GameModeSelector
            onSelectMode={handleModeSelect}
            onJoinRoom={handleJoinRoom}
          />
        ) : (
          // Active game
          <BingoGame gameType={gameMode} onEnd={() => setGameMode(null)} />
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Connected to game server ✓</p>
        </footer>
      </div>
    </main>
  );
}
