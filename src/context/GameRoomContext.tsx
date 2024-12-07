"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { GameRoom } from "@/types/game";
import { gameRoomService } from "@/services/gameRoomService";

// Define the context type
interface GameRoomContextType {
  currentRoom: GameRoom | null;
  isLoading: boolean;
  error: string | null;
  playerId: string;
  createRoom: (playerName: string) => Promise<string>;
  joinRoom: (roomId: string, playerName: string) => Promise<boolean>;
  leaveRoom: () => void;
  markNumber: (number: number) => Promise<void>;
  callNumber: (number: number) => Promise<void>;
  claimBingo: () => Promise<void>;
}

// Create the context
const GameRoomContext = createContext<GameRoomContextType | undefined>(
  undefined,
);

// Create the provider component
export function GameRoomProvider({ children }: { children: ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerId] = useState(
    () => `player_${Math.random().toString(36).substr(2, 9)}`,
  );

  // Create room
  const createRoom = async (playerName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const roomId = await gameRoomService.createRoom(playerId, playerName);
      gameRoomService.subscribeToRoom(roomId, setCurrentRoom);
      return roomId;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create room";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Join room
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
      const errorMessage =
        err instanceof Error ? err.message : "Failed to join room";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Leave room
  const leaveRoom = async () => {
    if (!currentRoom) return;
    try {
      await gameRoomService.leaveRoom(currentRoom.id, playerId);
      setCurrentRoom(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to leave room";
      setError(errorMessage);
    }
  };

  // Mark number
  const markNumber = async (number: number) => {
    if (!currentRoom) return;
    setError(null);
    try {
      await gameRoomService.markNumber(currentRoom.id, playerId, number);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to mark number";
      setError(errorMessage);
      throw err;
    }
  };

  // Call number
  const callNumber = async (number: number) => {
    if (!currentRoom) return;
    setError(null);
    try {
      await gameRoomService.callNumber(currentRoom.id, playerId, number);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to call number";
      setError(errorMessage);
      throw err;
    }
  };

  // Claim bingo
  const claimBingo = async () => {
    if (!currentRoom) return;
    setIsLoading(true);
    setError(null);
    try {
      await gameRoomService.claimBingo(currentRoom.id, playerId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to claim bingo";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GameRoomContext.Provider
      value={{
        currentRoom,
        isLoading,
        error,
        playerId,
        createRoom,
        joinRoom,
        leaveRoom,
        markNumber,
        callNumber,
        claimBingo,
      }}
    >
      {children}
    </GameRoomContext.Provider>
  );
}

// Create the custom hook
export function useGameRoom() {
  const context = useContext(GameRoomContext);
  if (context === undefined) {
    throw new Error("useGameRoom must be used within a GameRoomProvider");
  }
  return context;
}
