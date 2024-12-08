import { database } from "@/lib/firebase";
import { ref, set, get, update, onValue, off, remove } from "firebase/database";
import { GameRoom, Player, BingoCard } from "@/types/game";
// Helper function to generate a bingo card
const generateBingoCard = (): BingoCard => {
  const usedNumbers = new Set<number>();

  const generateUniqueNumbers = (
    min: number,
    max: number,
    count: number,
  ): number[] => {
    const numbers: number[] = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!usedNumbers.has(num)) {
        numbers.push(num);
        usedNumbers.add(num);
      }
    }
    return numbers;
  };

  return {
    B: generateUniqueNumbers(1, 15, 5),
    I: generateUniqueNumbers(16, 30, 5),
    N: generateUniqueNumbers(31, 45, 5),
    G: generateUniqueNumbers(46, 60, 5),
    O: generateUniqueNumbers(61, 75, 5),
  };
};

export const gameRoomService = {
  createRoom: async (creatorId: string, creatorName: string) => {
    try {
      // Generate room ID
      const roomId = Math.random().toString(36).substr(2, 7).toUpperCase();
      console.log("Creating room:", roomId);

      // Create creator player object with defaults
      const creator: Player = {
        id: creatorId,
        name: creatorName,
        card: generateBingoCard(),
        markedNumbers: [], // Initialize empty array
        isReady: true,
      };

      // Create room data with all necessary defaults
      const roomData: GameRoom = {
        id: roomId,
        creator,
        opponent: null,
        isActive: true,
        currentTurn: creatorId,
        calledNumbers: [], // Initialize empty array
        currentNumber: null,
        winner: null,
        status: "waiting",
        lastUpdated: Date.now(),
        turnTimeLimit: 30000, // 30 seconds
        turnStartTime: Date.now(),
        nextNumberTime: Date.now() + 30000,
      };

      // Get reference to the room location in database
      const roomRef = ref(database, `rooms/${roomId}`);

      // Save room data
      await set(roomRef, roomData);

      // Verify room was created
      const verifySnapshot = await get(roomRef);
      if (!verifySnapshot.exists()) {
        throw new Error("Failed to create room - verification failed");
      }

      console.log("Room created successfully:", roomId);
      return roomId;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  },

  joinRoom: async (roomId: string, playerId: string, playerName: string) => {
    try {
      const cleanRoomId = roomId.trim().toUpperCase();
      console.log("Attempting to join room:", cleanRoomId);

      const roomRef = ref(database, `rooms/${cleanRoomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        throw new Error(
          "Room not found. Please check the room code and try again.",
        );
      }

      const roomData = snapshot.val() as GameRoom;

      if (!roomData.isActive) {
        throw new Error("This room is no longer active.");
      }

      if (roomData.opponent) {
        throw new Error("Room is already full.");
      }

      if (roomData.creator.id === playerId) {
        throw new Error("You cannot join your own room.");
      }

      // Create opponent player object with defaults
      const opponent: Player = {
        id: playerId,
        name: playerName,
        card: generateBingoCard(),
        markedNumbers: [], // Initialize empty array
        isReady: true,
      };

      // Update room with opponent and new status
      const updates = {
        opponent,
        status: "playing",
        lastUpdated: Date.now(),
        turnStartTime: Date.now(), // Reset turn timer
        nextNumberTime: Date.now() + 30000,
      };

      await update(roomRef, updates);
      return true;
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
  },

  markNumber: async (roomId: string, playerId: string, number: number) => {
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        throw new Error("Room not found");
      }

      const room = snapshot.val() as GameRoom;
      const isCreator = room.creator.id === playerId;

      // Get current room data
      const currentData = isCreator ? room.creator : room.opponent;
      if (!currentData) return;

      // Create the update object with proper typing
      const updates: Record<string, Player> = {};
      if (isCreator) {
        updates["creator"] = {
          ...room.creator,
          markedNumbers: [...(room.creator.markedNumbers || []), number],
        };
      } else if (room.opponent) {
        updates["opponent"] = {
          ...room.opponent,
          markedNumbers: [...(room.opponent.markedNumbers || []), number],
        };
      }

      await update(roomRef, updates);
    } catch (error) {
      console.error("Error marking number:", error);
      throw error;
    }
  },
  leaveRoom: async (roomId: string, playerId: string) => {
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) return;

      const room = snapshot.val() as GameRoom;

      if (room.creator.id === playerId) {
        // If creator leaves, delete the room
        await remove(roomRef);
      } else if (room.opponent?.id === playerId) {
        // If opponent leaves, remove them from the room
        await update(roomRef, {
          opponent: null,
          status: "waiting",
          lastUpdated: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error leaving room:", error);
      throw error;
    }
  },
  claimBingo: async (roomId: string, playerId: string) => {
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        throw new Error("Room not found");
      }

      const room = snapshot.val() as GameRoom;
      const player =
        room.creator.id === playerId ? room.creator : room.opponent;

      if (!player) {
        throw new Error("Player not found");
      }

      // Update room with winner
      await update(roomRef, {
        winner: playerId,
        status: "finished",
        lastUpdated: Date.now(),
      });

      return true;
    } catch (error) {
      console.error("Error claiming bingo:", error);
      throw error;
    }
  },
  callNumber: async (roomId: string, playerId: string, number: number) => {
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        throw new Error("Room not found");
      }

      const room = snapshot.val() as GameRoom;

      // Ensure calledNumbers exists
      if (!room.calledNumbers) {
        room.calledNumbers = [];
      }

      // Verify it's player's turn
      if (room.currentTurn !== playerId) {
        throw new Error("Not your turn");
      }

      // Verify number hasn't been called
      if (room.calledNumbers.includes(number)) {
        throw new Error("Number already called");
      }

      // Update room with new called number
      const updates = {
        currentNumber: number,
        calledNumbers: [...room.calledNumbers, number],
        currentTurn:
          room.creator.id === playerId ? room.opponent?.id : room.creator.id,
        turnStartTime: Date.now(),
        nextNumberTime: Date.now() + 30000,
        lastUpdated: Date.now(),
      };

      await update(roomRef, updates);
      return true;
    } catch (error) {
      console.error("Error calling number:", error);
      throw error;
    }
  },
  updateGameState: async (roomId: string, updates: Partial<GameRoom>) => {
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      await update(roomRef, {
        ...updates,
        lastUpdated: Date.now(),
      });
      return true;
    } catch (error) {
      console.error("Error updating game state:", error);
      throw error;
    }
  },
  subscribeToRoom: (roomId: string, callback: (room: GameRoom) => void) => {
    const roomRef = ref(database, `rooms/${roomId}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val() as GameRoom;
        // Ensure all arrays exist
        roomData.calledNumbers = roomData.calledNumbers || [];
        roomData.creator.markedNumbers = roomData.creator.markedNumbers || [];
        if (roomData.opponent) {
          roomData.opponent.markedNumbers =
            roomData.opponent.markedNumbers || [];
        }
        callback(roomData);
      }
    });

    return () => {
      off(roomRef);
      unsubscribe();
    };
  },
};
