import { ethers } from "hardhat";

declare const process: { exitCode: number };

async function main() {

    const LoanFactory = await ethers.getContractFactory("LoanFactory");

    const loanFactory = await LoanFactory.deploy();

    await loanFactory.waitForDeployment();

    console.log(
        "LoanFactory deployed to:",
        await loanFactory.getAddress()
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});