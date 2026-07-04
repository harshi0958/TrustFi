export async function createBlockchainLoan(data: any) {

    console.log("========== BLOCKCHAIN ==========");

    console.log(data);

    console.log("Loan Created Successfully");

    return {
        txHash:
            "0x" +
            Math.random()
                .toString(16)
                .substring(2)
                .padEnd(64, "0"),

        contractAddress:
            "0x" +
            Math.random()
                .toString(16)
                .substring(2)
                .padEnd(40, "0")
    };
}