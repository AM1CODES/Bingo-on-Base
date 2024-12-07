import { erc20ABI } from "wagmi";

export const USDC_ADDRESS = "0x YOUR_USDC_CONTRACT_ADDRESS"; // Replace with actual USDC address on Base
export const GAME_CONTRACT_ADDRESS = "0x YOUR_GAME_CONTRACT_ADDRESS"; // Replace with your game contract

export const USDC_ABI = erc20ABI; // Using standard ERC20 ABI for USDC

export const formatUSDC = (amount: string) => {
  // USDC has 6 decimals
  return (Number(amount) * 1000000).toString();
};
