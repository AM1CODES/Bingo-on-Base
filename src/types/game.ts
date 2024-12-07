export interface GameRoom {
  id: string;
  creator: {
    id: string;
    name: string;
    card: BingoCard | null;
    markedNumbers: number[];
  };
  opponent: {
    id: string;
    name: string;
    card: BingoCard | null;
    markedNumbers: number[];
  } | null;
  isActive: boolean;
  currentTurn: string;
  calledNumbers: number[];
  currentNumber: number | null;
  winner: string | null;
  status: "waiting" | "playing" | "finished";
}

export interface BingoCard {
  B: number[];
  I: number[];
  N: number[];
  G: number[];
  O: number[];
}

export type GameMode = "single" | "multiplayer";

// Add GameState interface
export interface GameState {
  playerCard: BingoCard | null;
  opponentCard: BingoCard | null;
  calledNumbers: number[];
  currentNumber: number | null;
  isGameActive: boolean;
  isPaused: boolean;
  winner: string | null;
  playerHasBingo: boolean;
  markedNumbers: {
    player: number[];
    opponent: number[];
  };
}
