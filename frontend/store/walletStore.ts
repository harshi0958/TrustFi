import { create } from "zustand";

interface WalletState {
  address: string;
  connected: boolean;

  setWallet: (address: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: "",
  connected: false,

  setWallet: (address) =>
    set({
      address,
      connected: true,
    }),

  disconnect: () =>
    set({
      address: "",
      connected: false,
    }),
}));