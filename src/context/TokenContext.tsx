"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface TokenContextType {
  tokens: number;
  spendToken: () => boolean;
  addTokens: (amount: number) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState(5); // Start with 5 tokens

  const spendToken = () => {
    if (tokens > 0) {
      setTokens((prev) => prev - 1);
      return true;
    }
    return false;
  };

  const addTokens = (amount: number) => {
    setTokens((prev) => prev + amount);
  };

  return (
    <TokenContext.Provider value={{ tokens, spendToken, addTokens }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useTokens must be used within a TokenProvider");
  }
  return context;
}
