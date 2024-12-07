"use client";
import { useState, useEffect, useCallback } from "react";
import { useTokens } from "@/context/TokenContext";

// Type definitions
type BingoColumn = number[];
interface BingoCard {
  B: BingoColumn;
  I: BingoColumn;
  N: BingoColumn;
  G: BingoColumn;
  O: BingoColumn;
}

interface MarkedNumbers {
  player: number[];
  computer: number[];
}

interface GameState {
  playerCard: BingoCard | null;
  computerCard: BingoCard | null;
  calledNumbers: number[];
  currentNumber: number | null;
  isGameActive: boolean;
  isPaused: boolean;
  winner: "player" | "computer" | null;
  playerHasBingo: boolean;
  markedNumbers: MarkedNumbers;
}

// Constants
const BINGO_LETTERS = ["B", "I", "N", "G", "O"] as const;
const NUMBER_CALL_INTERVAL = 2500; // 2.5 seconds between number calls

const BingoGame = () => {
  // Get token functions from context
  const { tokens, spendToken } = useTokens();

  // Initialize game state
  const [gameState, setGameState] = useState<GameState>({
    playerCard: null,
    computerCard: null,
    calledNumbers: [],
    currentNumber: null,
    isGameActive: false,
    isPaused: false,
    winner: null,
    playerHasBingo: false,
    markedNumbers: {
      player: [],
      computer: [],
    },
  });

  // Error state for token-related issues
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Helper functions
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

  const generateBingoCard = (): BingoCard => ({
    B: generateColumnNumbers(1, 15, 5),
    I: generateColumnNumbers(16, 30, 5),
    N: generateColumnNumbers(31, 45, 5),
    G: generateColumnNumbers(46, 60, 5),
    O: generateColumnNumbers(61, 75, 5),
  });

  // Game logic functions
  const checkWin = useCallback((numbers: number[], card: BingoCard) => {
    const areAllMarked = (nums: number[]) =>
      nums.every((num) => numbers.includes(num));

    // Check rows
    for (const letter of BINGO_LETTERS) {
      if (areAllMarked(card[letter as keyof BingoCard])) {
        return true;
      }
    }

    // Check columns
    for (let i = 0; i < 5; i++) {
      const column = BINGO_LETTERS.map(
        (letter) => card[letter as keyof BingoCard][i],
      );
      if (areAllMarked(column)) {
        return true;
      }
    }

    // Check diagonals
    const diagonal1 = BINGO_LETTERS.map(
      (letter, i) => card[letter as keyof BingoCard][i],
    );
    const diagonal2 = BINGO_LETTERS.map(
      (letter, i) => card[letter as keyof BingoCard][4 - i],
    );

    return areAllMarked(diagonal1) || areAllMarked(diagonal2);
  }, []);

  // Handle game start with token check
  const startGame = useCallback(() => {
    setTokenError(null);

    // Try to spend a token
    if (!spendToken()) {
      setTokenError("Not enough tokens to play. Please purchase more tokens.");
      return;
    }

    setGameState({
      playerCard: generateBingoCard(),
      computerCard: generateBingoCard(),
      calledNumbers: [],
      currentNumber: null,
      isGameActive: true,
      isPaused: false,
      winner: null,
      playerHasBingo: false,
      markedNumbers: {
        player: [],
        computer: [],
      },
    });
  }, [spendToken]);

  const handleBingoClaim = () => {
    if (!gameState.playerCard) return;

    if (checkWin(gameState.markedNumbers.player, gameState.playerCard)) {
      setGameState((prev) => ({
        ...prev,
        winner: "player",
        isGameActive: false,
      }));
    } else {
      setGameState((prev) => ({ ...prev, playerHasBingo: false }));
    }
  };

  const handlePlayerNumberClick = (number: number) => {
    if (!gameState.isGameActive || !gameState.calledNumbers.includes(number))
      return;

    if (!gameState.markedNumbers.player.includes(number)) {
      setGameState((prev) => ({
        ...prev,
        markedNumbers: {
          ...prev.markedNumbers,
          player: [...prev.markedNumbers.player, number],
        },
      }));
    }
  };

  const togglePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  // Auto mark computer numbers
  const autoMarkComputerNumber = useCallback(
    (number: number) => {
      if (!gameState.computerCard) return;

      setGameState((prev) => {
        if (!prev.computerCard) return prev;

        for (const letter of BINGO_LETTERS) {
          const column = prev.computerCard[letter as keyof BingoCard];
          if (column.includes(number)) {
            return {
              ...prev,
              markedNumbers: {
                ...prev.markedNumbers,
                computer: [...prev.markedNumbers.computer, number],
              },
            };
          }
        }
        return prev;
      });
    },
    [gameState.computerCard],
  );

  // Effect for number calling
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (gameState.isGameActive && !gameState.winner && !gameState.isPaused) {
      intervalId = setInterval(() => {
        const availableNumbers = Array.from(
          { length: 75 },
          (_, i) => i + 1,
        ).filter((num) => !gameState.calledNumbers.includes(num));

        if (availableNumbers.length === 0) {
          setGameState((prev) => ({ ...prev, isGameActive: false }));
          return;
        }

        const newNumber =
          availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        setGameState((prev) => ({
          ...prev,
          currentNumber: newNumber,
          calledNumbers: [...prev.calledNumbers, newNumber],
        }));
        autoMarkComputerNumber(newNumber);
      }, NUMBER_CALL_INTERVAL);
    }

    return () => clearInterval(intervalId);
  }, [
    gameState.isGameActive,
    gameState.winner,
    gameState.isPaused,
    gameState.calledNumbers,
    autoMarkComputerNumber,
  ]);

  // Effect for checking wins
  useEffect(() => {
    if (
      !gameState.isGameActive ||
      !gameState.playerCard ||
      !gameState.computerCard
    )
      return;

    if (checkWin(gameState.markedNumbers.player, gameState.playerCard)) {
      setGameState((prev) => ({ ...prev, playerHasBingo: true }));
    }

    if (checkWin(gameState.markedNumbers.computer, gameState.computerCard)) {
      setGameState((prev) => ({
        ...prev,
        winner: "computer",
        isGameActive: false,
      }));
    }
  }, [
    gameState.markedNumbers,
    gameState.playerCard,
    gameState.computerCard,
    gameState.isGameActive,
    checkWin,
  ]);

  // Render functions
  const renderBingoCard = (card: BingoCard | null, isPlayer: boolean) => {
    if (!card) return null;

    const markedNumbersArray = isPlayer
      ? gameState.markedNumbers.player
      : gameState.markedNumbers.computer;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-center font-bold mb-2">
          {isPlayer ? "Your Card" : "Computer's Card"}
        </h3>
        <div className="grid grid-cols-5 gap-1">
          {BINGO_LETTERS.map((letter) => (
            <div
              key={letter}
              className="bg-blue-500 text-white font-bold p-2 text-center"
            >
              {letter}
            </div>
          ))}

          {BINGO_LETTERS.map((letter) =>
            card[letter as keyof BingoCard].map((number, index) => (
              <div
                key={`${letter}-${index}`}
                onClick={() =>
                  isPlayer ? handlePlayerNumberClick(number) : null
                }
                className={`p-2 text-center border ${
                  markedNumbersArray.includes(number)
                    ? "bg-green-200"
                    : "bg-white"
                } ${isPlayer ? "hover:bg-gray-100 cursor-pointer" : ""}`}
              >
                {number}
              </div>
            )),
          )}
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="max-w-6xl mx-auto p-4">
      {!gameState.isGameActive && !gameState.winner ? (
        <div className="text-center">
          <div className="mb-4">
            <p className="text-lg">Available Tokens: {tokens}</p>
            {tokenError && <p className="text-red-500 mt-2">{tokenError}</p>}
          </div>
          <button
            onClick={startGame}
            className={`px-6 py-2 rounded ${
              tokens > 0
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            } text-white`}
            disabled={tokens === 0}
          >
            Start New Game (1 Token)
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {renderBingoCard(gameState.playerCard, true)}
            {renderBingoCard(gameState.computerCard, false)}
          </div>

          <div className="text-center mb-8">
            <div className="text-2xl font-bold mb-4">
              Current Number: {gameState.currentNumber || "-"}
            </div>

            <div className="space-x-4 mb-4">
              {!gameState.winner && (
                <>
                  <button
                    onClick={togglePause}
                    className={`px-6 py-2 rounded ${
                      gameState.isPaused
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    } text-white`}
                  >
                    {gameState.isPaused ? "Resume Game" : "Pause Game"}
                  </button>

                  <button
                    onClick={handleBingoClaim}
                    className={`px-6 py-2 rounded ${
                      gameState.playerHasBingo
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : "bg-gray-400 cursor-not-allowed"
                    } text-white font-bold`}
                    disabled={!gameState.playerHasBingo}
                  >
                    BINGO!
                  </button>
                </>
              )}

              {gameState.winner && (
                <button
                  onClick={startGame}
                  className={`px-6 py-2 rounded ${
                    tokens > 0
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-400 cursor-not-allowed"
                  } text-white`}
                  disabled={tokens === 0}
                >
                  Play Again (1 Token)
                </button>
              )}
            </div>

            {gameState.winner && (
              <div className="text-xl font-bold text-green-600 mb-4">
                {gameState.winner === "player" ? "You won!" : "Computer won!"}
              </div>
            )}

            {gameState.isPaused && !gameState.winner && (
              <div className="text-xl font-bold text-yellow-600 mb-4">
                Game Paused
              </div>
            )}
          </div>

          <div className="text-center">
            <h4 className="font-bold mb-2">Called Numbers:</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {gameState.calledNumbers.map((num) => (
                <span key={num} className="bg-gray-200 px-2 py-1 rounded">
                  {num}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BingoGame;
