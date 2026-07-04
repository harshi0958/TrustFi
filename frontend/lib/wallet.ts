import { BrowserProvider } from "ethers";

export async function connectWallet() {
  if (!(window as any).ethereum) {
    alert("Install MetaMask");
    return null;
  }

  const provider = new BrowserProvider((window as any).ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();

  return await signer.getAddress();
}