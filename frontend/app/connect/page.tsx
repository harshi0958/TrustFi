"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BrowserProvider } from "ethers";
import { useWalletStore } from "@/store/walletStore";

export default function ConnectPage() {
  const router = useRouter();

  const { connect } = useWalletStore();

  const connectWallet = async () => {
    try {
      if (!(window as any).ethereum) {
        alert("Please install MetaMask");
        return;
      }

      const provider = new BrowserProvider((window as any).ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const walletAddress = await signer.getAddress();

      // Zustand Store me save
      connect(walletAddress);

      alert("Wallet Connected Successfully ✅");

      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Wallet Connection Failed");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050816]">
      <div className="rounded-3xl bg-zinc-900 p-10 text-center border border-cyan-500/20">

        <h1 className="text-4xl font-bold text-white">
          Connect Wallet
        </h1>

        <p className="mt-3 text-zinc-400">
          Connect your MetaMask wallet to continue.
        </p>

        <Button
          onClick={connectWallet}
          className="mt-8 bg-cyan-500 text-black hover:bg-cyan-400"
        >
          Connect MetaMask
        </Button>

      </div>
    </main>
  );
}