"use client";
import { useTokens } from "@/context/TokenContext";

export default function TokenDisplay() {
  const { tokens } = useTokens();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Your Tokens:</span>
        <span className="text-xl font-bold text-blue-600">{tokens}</span>
      </div>
    </div>
  );
}
