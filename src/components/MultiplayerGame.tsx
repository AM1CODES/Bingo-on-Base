"use client";
import React, { useState, useCallback, useEffect } from "react";
import { GameRoom, Player } from "@/types/game";
import { useGameRoom } from "@/context/GameRoomContext";

interface MultiplayerGameProps {
  room: GameRoom;
  playerId: string;
  onLeave: () => void;
}

const BINGO_LETTERS = ["B", "I", "N", "G", "O"] as const;
const AUTO_NUMBER_INTERVAL = 3000; // 3 seconds

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  room,
  playerId,
  onLeave,
}) => {
  const { markNumber, claimBingo } = useGameRoom();
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [hasWinningPattern, setHasWinningPattern] = useState(false);

  const isCreator = playerId === room.creator.id;
  const myPlayer: Player = isCreator ? room.creator : room.opponent!;
  const otherPlayer: Player = isCreator ? room.opponent! : room.creator;

  // Generate next number automatically
  useEffect(() => {
    if (!room.isActive || room.status !== "playing") return;

    const generateNextNumber = () => {
      const availableNumbers = Array.from(
        { length: 75 },
        (_, i) => i + 1,
      ).filter((num) => !room.calledNumbers.includes(num));

      if (availableNumbers.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      return availableNumbers[randomIndex];
    };

    const interval = setInterval(() => {
      const nextNumber = generateNextNumber();
      if (nextNumber) {
        setCurrentNumber(nextNumber);
        room.calledNumbers.push(nextNumber);
      }
    }, AUTO_NUMBER_INTERVAL);

    return () => clearInterval(interval);
  }, [room.isActive, room.status, room.calledNumbers]);

  // Check for winning patterns
  const checkWinningPattern = useCallback(() => {
    const markedNumbers = new Set(myPlayer.markedNumbers);

    // Check rows
    for (const letter of BINGO_LETTERS) {
      const row = myPlayer.card[letter];
      if (row.every((num) => markedNumbers.has(num))) {
        return true;
      }
    }

    // Check columns
    for (let i = 0; i < 5; i++) {
      const column = BINGO_LETTERS.map((letter) => myPlayer.card[letter][i]);
      if (column.every((num) => markedNumbers.has(num))) {
        return true;
      }
    }

    // Check diagonals
    const diagonal1 = BINGO_LETTERS.map(
      (letter, i) => myPlayer.card[letter][i],
    );
    const diagonal2 = BINGO_LETTERS.map(
      (letter, i) => myPlayer.card[letter][4 - i],
    );

    return (
      diagonal1.every((num) => markedNumbers.has(num)) ||
      diagonal2.every((num) => markedNumbers.has(num))
    );
  }, [myPlayer.card, myPlayer.markedNumbers]);

  // Update winning pattern status
  useEffect(() => {
    setHasWinningPattern(checkWinningPattern());
  }, [myPlayer.markedNumbers, checkWinningPattern]);

  // Handle number marking
  const handleNumberClick = async (number: number) => {
    if (!room.calledNumbers.includes(number)) return;
    try {
      await markNumber(number);
    } catch (error) {
      console.error("Failed to mark number:", error);
    }
  };

  // Render bingo card
  const renderBingoCard = (player: Player, isMyCard: boolean) => (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-center font-bold mb-4">
        {isMyCard ? "Your Card" : `${player.name}'s Card`}
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
          player.card[letter].map((number, index) => (
            <div
              key={`${letter}-${index}`}
              onClick={() => (isMyCard ? handleNumberClick(number) : undefined)}
              className={`
                p-2 text-center border transition-colors
                ${player.markedNumbers.includes(number) ? "bg-green-200" : "bg-white"}
                ${room.calledNumbers.includes(number) ? "bg-yellow-100" : ""}
                ${isMyCard ? "hover:bg-gray-100 cursor-pointer" : ""}
              `}
            >
              {number}
            </div>
          )),
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Game Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Playing as:</p>
            <p className="font-bold">{myPlayer.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Room Code:</p>
            <p className="font-mono font-bold">{room.id}</p>
          </div>

          {hasWinningPattern && (
            <button
              onClick={() => claimBingo()}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 animate-pulse"
            >
              BINGO!
            </button>
          )}
        </div>
      </div>

      {/* Current Number Display */}
      <div className="text-center mb-8">
        <div
          className={`text-4xl font-bold mb-4 ${
            currentNumber ? "animate-bounce" : ""
          }`}
        >
          Current Number: {currentNumber || "-"}
        </div>
      </div>

      {/* Game Boards */}
      <div className="grid md:grid-cols-2 gap-8 mb-6">
        {renderBingoCard(myPlayer, true)}
        {renderBingoCard(otherPlayer, false)}
      </div>

      {/* Called Numbers */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h4 className="font-bold mb-2">Called Numbers:</h4>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 75 }, (_, i) => i + 1).map((num) => (
            <div
              key={num}
              className={`
                p-2 text-center border rounded text-sm
                ${room.calledNumbers.includes(num) ? "bg-blue-100" : "bg-gray-50"}
                ${currentNumber === num ? "ring-2 ring-blue-500" : ""}
                ${myPlayer.markedNumbers.includes(num) ? "bg-green-200" : ""}
              `}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Game Controls */}
      <div className="text-center mt-4">
        <button
          onClick={onLeave}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Leave Game
        </button>
      </div>
    </div>
  );
};

export default MultiplayerGame;
