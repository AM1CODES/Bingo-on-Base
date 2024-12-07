"use client";
import React, { useState } from "react";

interface CallNumberProps {
  isMyTurn: boolean;
  calledNumbers: number[];
  onNumberCalled: (number: number) => void;
  disabled?: boolean;
  timeLeft?: number;
}

const CallNumber: React.FC<CallNumberProps> = ({
  isMyTurn,
  calledNumbers,
  onNumberCalled,
  disabled = false,
  timeLeft = 30000,
}) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showAllNumbers, setShowAllNumbers] = useState(false);

  const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1).filter(
    (num) => !calledNumbers.includes(num),
  );

  const timeLeftSeconds = Math.ceil(timeLeft / 1000);
  const isUrgent = timeLeftSeconds <= 5;

  if (!isMyTurn) return null;

  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-4 mb-6 ${
        isUrgent ? "animate-pulse" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Call a Number</h3>
        <span
          className={`${isUrgent ? "text-red-500 font-bold" : "text-gray-600"}`}
        >
          {timeLeftSeconds}s
        </span>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {availableNumbers
            .slice(0, showAllNumbers ? undefined : 10)
            .map((num) => (
              <button
                key={num}
                onClick={() => setSelectedNumber(num)}
                disabled={disabled}
                className={`
                px-3 py-1 rounded transition-colors
                ${
                  selectedNumber === num
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              >
                {num}
              </button>
            ))}
        </div>

        {availableNumbers.length > 10 && (
          <button
            onClick={() => setShowAllNumbers(!showAllNumbers)}
            className="mt-2 text-blue-500 text-sm hover:text-blue-600"
          >
            {showAllNumbers ? "Show Less" : "Show All Numbers"}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            if (selectedNumber) {
              onNumberCalled(selectedNumber);
              setSelectedNumber(null);
              setShowAllNumbers(false);
            }
          }}
          disabled={!selectedNumber || disabled}
          className={`
            flex-1 py-2 rounded font-semibold transition-colors
            ${
              selectedNumber && !disabled
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
        >
          Call Number
        </button>

        {selectedNumber && (
          <button
            onClick={() => setSelectedNumber(null)}
            disabled={disabled}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default CallNumber;
