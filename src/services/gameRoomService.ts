import { database } from "@/lib/firebase";
import { ref, set, get, update, onValue, off, remove } from "firebase/database"; // Add remove here
import { GameRoom, Player, BingoCard } from "@/types/game";

// Helper function to generate a bingo card
function generateBingoCard(): BingoCard {
  const generateColumnNumbers = (
    min: number,
    max: number,
    count: number,
  ): number[] => {
    const numbers: number[] = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers;
  };

  return {
    B: generateColumnNumbers(1, 15, 5),
    I: generateColumnNumbers(16, 30, 5),
    N: generateColumnNumbers(31, 45, 5),
    G: generateColumnNumbers(46, 60, 5),
    O: generateColumnNumbers(61, 75, 5),
  };
}

export const gameRoomService = {
  createRoom: async (creatorId: string, creatorName: string) => {
    try {
      const roomId = Math.random().toString(36).substr(2, 9).toUpperCase();
      const roomRef = ref(database, `rooms/${roomId}`);

      console.log("Creating room with ID:", roomId); // Debug log

      const creator: Player = {
        id: creatorId,
        name: creatorName,
        card: generateBingoCard(),
        markedNumbers: [],
        isReady: true,
      };

      const roomData: GameRoom = {
        id: roomId,
        creator,
        opponent: null,
        isActive: true,
        currentTurn: creatorId,
        calledNumbers: [],
        currentNumber: null,
        winner: null,
        status: "waiting",
        lastUpdated: Date.now(),
      };

      console.log("Room data:", roomData); // Debug log

      await set(roomRef, roomData);
      console.log("Room created successfully"); // Debug log
      return roomId;
    } catch (error) {
      console.error("Error creating room:", error); // Detailed error log
      throw error;
    }
  },

  joinRoom: async (roomId: string, playerId: string, playerName: string) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      throw new Error("Room not found");
    }

    const roomData = snapshot.val() as GameRoom;
    if (roomData.opponent || !roomData.isActive) {
      throw new Error("Room is full or inactive");
    }

    const opponent: Player = {
      id: playerId,
      name: playerName,
      card: generateBingoCard(),
      markedNumbers: [],
      isReady: true, // Add isReady property
    };

    await update(roomRef, {
      opponent,
      status: "playing",
      lastUpdated: Date.now(),
    });

    return true;
  },

  leaveRoom: async (roomId: string, playerId: string) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) return;

    const room = snapshot.val() as GameRoom;

    // If the leaving player is the creator, delete the room
    if (room.creator.id === playerId) {
      await remove(roomRef);
      return;
    }

    // If the leaving player is the opponent, remove them
    if (room.opponent?.id === playerId) {
      await update(roomRef, {
        opponent: null,
        status: "waiting",
        lastUpdated: Date.now(),
      });
    }
  },

  subscribeToRoom: (roomId: string, callback: (room: GameRoom) => void) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as GameRoom);
      }
    });

    return () => off(roomRef);
  },

  markNumber: async (roomId: string, playerId: string, number: number) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    const room = snapshot.val() as GameRoom;

    const isCreator = room.creator.id === playerId;
    const path = isCreator ? "creator.markedNumbers" : "opponent.markedNumbers";
    const currentMarkedNumbers = isCreator
      ? room.creator.markedNumbers
      : room.opponent?.markedNumbers || [];

    if (!currentMarkedNumbers.includes(number)) {
      await update(roomRef, {
        [path]: [...currentMarkedNumbers, number],
        lastUpdated: Date.now(),
      });
    }
  },

  claimBingo: async (roomId: string, playerId: string) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    await update(roomRef, {
      winner: playerId,
      status: "finished",
      lastUpdated: Date.now(),
    });
  },

  // Add method to update player ready status
  setPlayerReady: async (
    roomId: string,
    playerId: string,
    isReady: boolean,
  ) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);
    const room = snapshot.val() as GameRoom;

    const isCreator = room.creator.id === playerId;
    const path = isCreator ? "creator.isReady" : "opponent.isReady";

    await update(roomRef, {
      [path]: isReady,
      lastUpdated: Date.now(),
    });
  },
};
