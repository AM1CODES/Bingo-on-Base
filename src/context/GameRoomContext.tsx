"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { GameRoom } from "@/types/game";
import { gameRoomService } from "@/services/gameRoomService";

interface GameRoomContextType {
  currentRoom: GameRoom | null;
  isLoading: boolean;
  error: string | null;
  createRoom: (playerName: string) => Promise<string>;
  joinRoom: (roomId: string, playerName: string) => Promise<boolean>;
  leaveRoom: () => void;
  markNumber: (number: number) => Promise<void>;
  claimBingo: () => Promise<void>;
}

const GameRoomContext = createContext<GameRoomContextType | undefined>(
  undefined,
);

export function GameRoomProvider({ children }: { children: ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerId] = useState(
    () => `player_${Math.random().toString(36).substr(2, 9)}`,
  );

  const createRoom = async (playerName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const roomId = await gameRoomService.createRoom(playerId, playerName);
      gameRoomService.subscribeToRoom(roomId, setCurrentRoom);
      return roomId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (roomId: string, playerName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await gameRoomService.joinRoom(
        roomId,
        playerId,
        playerName,
      );
      if (success) {
        gameRoomService.subscribeToRoom(roomId, setCurrentRoom);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
  };

  const markNumber = async (number: number) => {
    if (!currentRoom || !playerId) return;
    try {
      await gameRoomService.markNumber(currentRoom.id, playerId, number);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark number");
      throw err;
    }
  };

  const claimBingo = async () => {
    if (!currentRoom || !playerId) return;
    try {
      await gameRoomService.claimBingo(currentRoom.id, playerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim bingo");
      throw err;
    }
  };

  return (
    <GameRoomContext.Provider
      value={{
        currentRoom,
        isLoading,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        markNumber,
        claimBingo,
      }}
    >
      {children}
    </GameRoomContext.Provider>
  );
}

export function useGameRoom() {
  const context = useContext(GameRoomContext);
  if (context === undefined) {
    throw new Error("useGameRoom must be used within a GameRoomProvider");
  }
  return context;
}

export function useIsRoomCreator() {
  const { currentRoom } = useGameRoom();
  return (
    currentRoom?.creator.id ===
    useState(() => `player_${Math.random().toString(36).substr(2, 9)}`)[0]
  );
}

export function useIsPlayerTurn() {
  const { currentRoom } = useGameRoom();
  return (
    currentRoom?.currentTurn ===
    useState(() => `player_${Math.random().toString(36).substr(2, 9)}`)[0]
  );
}
