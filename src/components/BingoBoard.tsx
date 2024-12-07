"use client";
import { useState, useEffect } from "react";

interface BingoBoardProps {
  onGameComplete: (score: number) => void;
}

const BingoBoard = ({ onGameComplete }: BingoBoardProps) => {
  const [board, setBoard] = useState<number[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    new Set(),
  );
  const [computerNumbers, setComputerNumbers] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    setBoard(shuffled.slice(0, 25));
  };

  const handleNumberClick = (number: number) => {
    const newSelected = new Set(selectedNumbers);
    newSelected.add(number);
    setSelectedNumbers(newSelected);

    // Simulate computer turn
    const availableNumbers = board.filter(
      (n) => !selectedNumbers.has(n) && !computerNumbers.has(n),
    );
    if (availableNumbers.length > 0) {
      const computerChoice =
        availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      const newComputerNumbers = new Set(computerNumbers);
      newComputerNumbers.add(computerChoice);
      setComputerNumbers(newComputerNumbers);
    }

    checkWinCondition();
  };

  const checkWinCondition = () => {
    // Implement win checking logic here
    // For now, just checking if 5 numbers are selected
    if (selectedNumbers.size >= 5) {
      onGameComplete(selectedNumbers.size * 10);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="grid grid-cols-5 gap-2">
        {board.map((number, index) => (
          <button
            key={index}
            onClick={() => handleNumberClick(number)}
            disabled={
              selectedNumbers.has(number) || computerNumbers.has(number)
            }
            className={`aspect-square p-4 text-lg font-bold rounded
              ${
                selectedNumbers.has(number)
                  ? "bg-green-500 text-white"
                  : computerNumbers.has(number)
                    ? "bg-red-500 text-white"
                    : "bg-white hover:bg-gray-100"
              }`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BingoBoard;
