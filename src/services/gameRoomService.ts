import { database } from "@/lib/firebase";
import { ref, set, get, update, onValue, off } from "firebase/database";
import { GameRoom } from "@/types/game";

// Helper function to generate a bingo card
function generateBingoCard() {
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
    const roomId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const roomRef = ref(database, `rooms/${roomId}`);

    const roomData: GameRoom = {
      id: roomId,
      creator: {
        id: creatorId,
        name: creatorName,
        card: generateBingoCard(),
        markedNumbers: [],
      },
      opponent: null,
      isActive: true,
      currentTurn: creatorId,
      calledNumbers: [],
      currentNumber: null,
      winner: null,
      status: "waiting",
    };

    await set(roomRef, roomData);
    return roomId;
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

    await update(roomRef, {
      opponent: {
        id: playerId,
        name: playerName,
        card: generateBingoCard(),
        markedNumbers: [],
      },
      status: "playing",
    });

    return true;
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
      });
    }
  },

  claimBingo: async (roomId: string, playerId: string) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    await update(roomRef, {
      winner: playerId,
      status: "finished",
    });
  },
};
