import { gameRoomService } from "./gameRoomService";
import { GameRoom } from "@/types/game";

export const numberCallerService = {
  generateNextNumber: (calledNumbers: number[]): number => {
    const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1).filter(
      (num) => !calledNumbers.includes(num),
    );

    if (availableNumbers.length === 0) return -1; // Game is complete

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    return availableNumbers[randomIndex];
  },

  startAutoNumberCalling: async (roomId: string) => {
    const CALL_INTERVAL = 3000; // 3 seconds between numbers

    const callNextNumber = async (roomData: GameRoom) => {
      const newNumber = numberCallerService.generateNextNumber(
        roomData.calledNumbers || [],
      );
      if (newNumber !== -1) {
        await gameRoomService.updateGameState(roomId, {
          currentNumber: newNumber,
          calledNumbers: [...(roomData.calledNumbers || []), newNumber],
          lastUpdated: Date.now(),
          nextNumberTime: Date.now() + CALL_INTERVAL,
        });
      }
    };

    return callNextNumber;
  },
};
