export interface BingoCard {
  B: number[];
  I: number[];
  N: number[];
  G: number[];
  O: number[];
}

export interface Player {
  id: string;
  name: string;
  card: BingoCard;
  markedNumbers: number[];
  isReady: boolean;
}

export interface GameRoom {
  id: string;
  creator: Player;
  opponent: Player | null;
  isActive: boolean;
  currentTurn: string;
  calledNumbers: number[];
  currentNumber: number | null;
  winner: string | null;
  status: "waiting" | "playing" | "finished";
  lastUpdated: number;
  turnTimeLimit: number;
  turnStartTime: number;
  nextNumberTime: number;
}

export type GameMode = "single" | "multiplayer";

// Game state interface
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

// Multiplayer specific game state
export interface MultiplayerGameState {
  isMyTurn: boolean;
  timeUntilNextNumber: number;
  canCallNumber: boolean;
  myRole: "creator" | "opponent";
}
