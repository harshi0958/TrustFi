"use client";

import { create } from "zustand";

interface WalletStore {
  wallet: string;
  connected: boolean;

  connect: (address: string) => void;
  disconnect: () => void;
  loadWallet: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({

  wallet: "",
  connected: false,

  connect: (address) => {

    localStorage.setItem("wallet", address);

    set({
      wallet: address,
      connected: true,
    });

  },

  disconnect: () => {

    localStorage.removeItem("wallet");

    set({
      wallet: "",
      connected: false,
    });

  },

  loadWallet: () => {

    const address = localStorage.getItem("wallet");

    if (address) {

      set({
        wallet: address,
        connected: true,
      });

    }

  },

}));