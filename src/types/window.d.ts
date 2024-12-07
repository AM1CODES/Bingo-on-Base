export {};

type AddEthereumChainParameter = {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
};

type WalletRequestMethod =
  | "eth_requestAccounts"
  | "eth_accounts"
  | "wallet_addEthereumChain"
  | "wallet_switchEthereumChain";

type EthereumRequest = {
  method: WalletRequestMethod;
  params?: unknown[];
};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: EthereumRequest) => Promise<unknown>;
      on: (event: string, handler: (params?: unknown[]) => void) => void;
      removeListener: (
        event: string,
        handler: (params?: unknown[]) => void,
      ) => void;
      autoRefreshOnNetworkChange?: boolean;
      chainId?: string;
      selectedAddress?: string | null;
    };
  }
}
