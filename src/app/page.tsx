"use client";
import { useState } from "react";
import BingoGame from "@/components/BingoGame";
import TokenDisplay from "@/components/TokenDisplay";
import { useTokens } from "@/context/TokenContext";

export default function Home() {
  const [wantsToPlay, setWantsToPlay] = useState(false);
  const { tokens } = useTokens();

  // Landing page component
  const LandingUI = () => (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-6">Welcome to Bingo Game!</h1>
      <p className="text-xl mb-8">
        Play exciting games of Bingo against the computer
      </p>
      <button
        onClick={() => setWantsToPlay(true)}
        className="bg-blue-500 text-white px-8 py-3 rounded-lg text-xl hover:bg-blue-600 transition-colors"
      >
        Play Now!
      </button>
      <p className="mt-4 text-gray-600">Cost: 1 token per game</p>
    </div>
  );

  const BuyTokensUI = () => (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-4">Need More Tokens?</h2>
      <p className="mb-4">You don;t have enough tokens to play.</p>
      <button
        onClick={() => {
          /* Will implement Coinbase Checkout later */
        }}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
      >
        Buy Tokens
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bingo Game</h1>
          <TokenDisplay />
        </header>

        {/* Main Content */}
        {!wantsToPlay ? (
          <LandingUI />
        ) : tokens === 0 ? (
          <BuyTokensUI />
        ) : (
          <BingoGame />
        )}
      </div>
    </main>
  );
}
