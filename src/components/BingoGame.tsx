"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useTokens } from "@/context/TokenContext";
import { GameMode, BingoCard, GameState } from "@/types/game"; // Removed unused GameRoom import
interface Props {
  gameType: GameMode;
  onEnd: () => void;
}

const BINGO_LETTERS = ["B", "I", "N", "G", "O"] as const;
const NUMBER_CALL_INTERVAL = 2500;

const BingoGame: React.FC<Props> = ({ gameType, onEnd }) => {
  const { spendToken } = useTokens();

  const [gameState, setGameState] = useState<GameState>({
    playerCard: null,
    opponentCard: null,
    calledNumbers: [],
    currentNumber: null,
    isGameActive: false,
    isPaused: false,
    winner: null,
    playerHasBingo: false,
    markedNumbers: {
      player: [],
      opponent: [],
    },
  });

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

  const generateBingoCard = useCallback(
    (): BingoCard => ({
      B: generateColumnNumbers(1, 15, 5),
      I: generateColumnNumbers(16, 30, 5),
      N: generateColumnNumbers(31, 45, 5),
      G: generateColumnNumbers(46, 60, 5),
      O: generateColumnNumbers(61, 75, 5),
    }),
    [],
  );

  const checkWin = useCallback(
    (numbers: number[], card: BingoCard): boolean => {
      const areAllMarked = (nums: number[]): boolean =>
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
    },
    [],
  );

  const handleGameStart = useCallback(() => {
    if (!spendToken()) {
      onEnd();
      return;
    }

    setGameState((prevState: GameState) => ({
      ...prevState,
      playerCard: generateBingoCard(),
      opponentCard: gameType === "single" ? generateBingoCard() : null,
      calledNumbers: [],
      currentNumber: null,
      isGameActive: true,
      isPaused: false,
      winner: null,
      playerHasBingo: false,
      markedNumbers: {
        player: [],
        opponent: [],
      },
    }));
  }, [spendToken, generateBingoCard, gameType]);

  const handleBingoClaim = () => {
    if (!gameState.playerCard) return;

    if (checkWin(gameState.markedNumbers.player, gameState.playerCard)) {
      setGameState((prevState: GameState) => ({
        ...prevState,
        winner: "player",
        isGameActive: false,
      }));
    } else {
      setGameState((prevState: GameState) => ({
        ...prevState,
        playerHasBingo: false,
      }));
    }
  };

  const handlePlayerNumberClick = (number: number) => {
    if (!gameState.isGameActive || !gameState.calledNumbers.includes(number))
      return;

    if (!gameState.markedNumbers.player.includes(number)) {
      setGameState((prevState: GameState) => ({
        ...prevState,
        markedNumbers: {
          ...prevState.markedNumbers,
          player: [...prevState.markedNumbers.player, number],
        },
      }));
    }
  };

  const togglePause = () => {
    setGameState((prevState: GameState) => ({
      ...prevState,
      isPaused: !prevState.isPaused,
    }));
  };

  // Effect for number calling
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (gameState.isGameActive && !gameState.winner && !gameState.isPaused) {
      intervalId = setInterval(() => {
        setGameState((prevState: GameState) => {
          const availableNumbers = Array.from(
            { length: 75 },
            (_, i) => i + 1,
          ).filter((num) => !prevState.calledNumbers.includes(num));

          if (availableNumbers.length === 0) {
            return { ...prevState, isGameActive: false };
          }

          const newNumber =
            availableNumbers[
              Math.floor(Math.random() * availableNumbers.length)
            ];

          // Auto-mark computer's numbers in single player mode
          let newOpponentMarkedNumbers = prevState.markedNumbers.opponent;
          if (gameType === "single" && prevState.opponentCard) {
            for (const letter of BINGO_LETTERS) {
              if (
                prevState.opponentCard[letter as keyof BingoCard].includes(
                  newNumber,
                )
              ) {
                newOpponentMarkedNumbers = [
                  ...newOpponentMarkedNumbers,
                  newNumber,
                ];
                break;
              }
            }
          }

          return {
            ...prevState,
            currentNumber: newNumber,
            calledNumbers: [...prevState.calledNumbers, newNumber],
            markedNumbers: {
              ...prevState.markedNumbers,
              opponent: newOpponentMarkedNumbers,
            },
          };
        });
      }, NUMBER_CALL_INTERVAL);
    }

    return () => clearInterval(intervalId);
  }, [gameState.isGameActive, gameState.winner, gameState.isPaused, gameType]);

  // Effect for checking wins
  useEffect(() => {
    if (!gameState.isGameActive || !gameState.playerCard) return;

    if (checkWin(gameState.markedNumbers.player, gameState.playerCard)) {
      setGameState((prevState: GameState) => ({
        ...prevState,
        playerHasBingo: true,
      }));
    }

    if (
      gameType === "single" &&
      gameState.opponentCard &&
      checkWin(gameState.markedNumbers.opponent, gameState.opponentCard)
    ) {
      setGameState((prevState: GameState) => ({
        ...prevState,
        winner: "opponent",
        isGameActive: false,
      }));
    }
  }, [
    gameState.markedNumbers,
    gameState.playerCard,
    gameState.opponentCard,
    gameState.isGameActive,
    checkWin,
    gameType,
  ]);

  // Render functions
  const renderBingoCard = (card: BingoCard | null, isPlayer: boolean) => {
    if (!card) return null;

    const markedNumbersArray = isPlayer
      ? gameState.markedNumbers.player
      : gameState.markedNumbers.opponent;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-center font-bold mb-2">
          {isPlayer
            ? "Your Card"
            : gameType === "single"
              ? "Computer's Card"
              : "Opponent's Card"}
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      {!gameState.isGameActive && !gameState.winner ? (
        <div className="text-center">
          <button
            onClick={handleGameStart}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mx-auto block"
          >
            Start New Game (1 Token)
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {renderBingoCard(gameState.playerCard, true)}
            {gameType === "single" &&
              renderBingoCard(gameState.opponentCard, false)}
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
                  onClick={handleGameStart}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
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
