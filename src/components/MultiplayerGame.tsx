"use client";
import React from "react";
import { GameRoom, Player, BingoCard } from "@/types/game";
import { useGameRoom } from "@/context/GameRoomContext";
//import TurnTimer from "./TurnTimer";

// Note: Removed CallNumber import since we're using inline number calling UI

interface MultiplayerGameProps {
  room: GameRoom;
  playerId: string;
  onLeave: () => void;
}

const BINGO_LETTERS = ["B", "I", "N", "G", "O"] as const;

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  room,
  playerId,
  onLeave,
}) => {
  const { markNumber, callNumber } = useGameRoom();

  const isCreator = playerId === room.creator.id;
  const myPlayer: Player = isCreator ? room.creator : room.opponent!;
  const otherPlayer: Player = isCreator ? room.opponent! : room.creator;
  const isMyTurn = room.currentTurn === playerId;

  const handleNumberClick = async (number: number) => {
    // Add null check for calledNumbers
    if (!room.calledNumbers?.includes(number)) return;
    try {
      await markNumber(number);
    } catch (error) {
      console.error("Failed to mark number:", error);
    }
  };

  const handleCallNumber = async (number: number) => {
    if (!isMyTurn) return;
    try {
      await callNumber(number);
    } catch (error) {
      console.error("Failed to call number:", error);
    }
  };

  const renderBingoCard = (
    card: BingoCard | null,
    isMyCard: boolean,
    markedNumbers: number[],
  ) => {
    if (!card) return null;

    return (
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
              onClick={() => (isMyCard ? handleNumberClick(number) : null)}
              className={`p-2 text-center border ${
                (markedNumbers || []).includes(number)
                  ? "bg-green-200"
                  : "bg-white"
              } ${isMyCard && room.calledNumbers?.includes(number) ? "hover:bg-gray-100 cursor-pointer" : ""}`}
            >
              {number}
            </div>
          )),
        )}
      </div>
    );
  };

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

          <div>
            <p className="text-sm text-gray-600">Current Turn:</p>
            <p
              className={`font-bold ${isMyTurn ? "text-green-600" : "text-gray-600"}`}
            >
              {isMyTurn ? "Your Turn" : `${otherPlayer.name}'s Turn`}
            </p>
          </div>
        </div>
      </div>

      {/* Number Selection (Only shown when it's player's turn) */}
      {isMyTurn && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <h3 className="text-lg font-bold mb-4">Select a Number to Call</h3>
          <div className="grid grid-cols-10 gap-2">
            {Array.from({ length: 75 }, (_, i) => i + 1)
              .filter((num) => !room.calledNumbers?.includes(num)) // Add optional chaining
              .map((number) => (
                <button
                  key={number}
                  onClick={() => handleCallNumber(number)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                >
                  {number}
                </button>
              ))}
          </div>
        </div>
      )}
      {/* Game Boards */}
      <div className="grid md:grid-cols-2 gap-8 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-center font-bold mb-4">Your Card</h3>
          {renderBingoCard(myPlayer.card, true, myPlayer.markedNumbers)}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-center font-bold mb-4">
            {otherPlayer.name};s Card
          </h3>
          {renderBingoCard(otherPlayer.card, false, otherPlayer.markedNumbers)}
        </div>
      </div>

      {/* Game Controls */}
      <div className="text-center space-y-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <p className="text-xl font-bold mb-4">
            Current Number:{" "}
            <span className="text-blue-600">{room.currentNumber || "-"}</span>
          </p>
          <button
            onClick={onLeave}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Leave Game
          </button>
        </div>

        {/* Called Numbers */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h4 className="font-bold mb-2">Called Numbers:</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {(room.calledNumbers || []).map(
              (
                num, // Add fallback empty array
              ) => (
                <span
                  key={num}
                  className={`px-2 py-1 rounded ${
                    myPlayer.markedNumbers?.includes(num)
                      ? "bg-green-200"
                      : "bg-gray-200"
                  }`}
                >
                  {num}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGame;
