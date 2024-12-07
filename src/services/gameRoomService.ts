import { database } from "@/lib/firebase";
import { ref, set, get, update, onValue, off, remove } from "firebase/database";
import { GameRoom, Player, BingoCard } from "@/types/game";
// Helper function to generate a bingo card
const generateBingoCard = (): BingoCard => ({
  B: Array.from({ length: 5 }, () => Math.floor(Math.random() * 15) + 1),
  I: Array.from({ length: 5 }, () => Math.floor(Math.random() * 15) + 16),
  N: Array.from({ length: 5 }, () => Math.floor(Math.random() * 15) + 31),
  G: Array.from({ length: 5 }, () => Math.floor(Math.random() * 15) + 46),
  O: Array.from({ length: 5 }, () => Math.floor(Math.random() * 15) + 61),
});

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

      // Ensure calledNumbers exists
      if (!room.calledNumbers) {
        room.calledNumbers = [];
      }

      if (!room.calledNumbers.includes(number)) {
        throw new Error("This number has not been called yet.");
      }

      const isCreator = room.creator.id === playerId;
      const player = isCreator ? room.creator : room.opponent;

      if (!player) {
        throw new Error("Player not found");
      }

      // Ensure markedNumbers exists
      if (!player.markedNumbers) {
        player.markedNumbers = [];
      }

      // Update the marked numbers
      const path = isCreator
        ? "creator.markedNumbers"
        : "opponent.markedNumbers";
      await update(roomRef, {
        [path]: [...player.markedNumbers, number],
        lastUpdated: Date.now(),
      });
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
