import { network } from "hardhat";

async function main() {

  const { viem } = await network.connect();

  await viem.getWalletClients();

  const loanFactory = await viem.deployContract("LoanFactory");

  console.log("==================================");
  console.log("LoanFactory deployed at:");
  console.log(loanFactory.address);
  console.log("==================================");

}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});