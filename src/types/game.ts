export interface Player {
  id: string;
  name: string;
  card: BingoCard | null;
  markedNumbers: number[];
  isReady: boolean;
}

export interface GameRoom {
  id: string;
  creator: Player;
  opponent: Player | null;
  isActive: boolean;
  currentTurn: string; // player ID of whose turn it is
  calledNumbers: number[];
  currentNumber: number | null;
  winner: string | null; // player ID of winner
  status: "waiting" | "playing" | "finished";
  lastUpdated: number;
}

export interface BingoCard {
  B: number[];
  I: number[];
  N: number[];
  G: number[];
  O: number[];
}

export type GameMode = "single" | "multiplayer";

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
