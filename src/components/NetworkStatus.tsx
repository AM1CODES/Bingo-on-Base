"use client";
import { useNetwork, useAccount } from "wagmi";
import { baseGoerli } from "wagmi/chains";

const NetworkStatus = () => {
  const { chain } = useNetwork();
  const { isConnected } = useAccount();

  if (!isConnected) return null;

  return (
    <div
      className={`rounded-lg p-4 mb-4 ${
        chain?.id === baseGoerli.id
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {chain?.id === baseGoerli.id ? (
        <p>Connected to Base Goerli network ✓</p>
      ) : (
        <p>Please switch to Base Goerli network</p>
      )}
    </div>
  );
};

export default NetworkStatus;
