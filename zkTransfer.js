import * as zksync from "zksync";
import * as ethers from "ethers";
import "dotenv/config";

// initialize the zksync provider
const initializeProvider = async () => {
  const syncProvider = await zksync.Provider.newHttpProvider(
    "https://api.zksync.io/jsrpc"
  );

  const ethProvider = new ethers.providers.InfuraProvider(
    "mainnet",
    process.env.PROJECT_ID
  );

  // get access to ethereum Wallet
  const ethWallet = new ethers.Wallet(process.env.PRIVATE_KEY, ethProvider);

  // get access to zkSync.signer from ethereum wallet
  const zkWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  return { zkWallet };
};

// fees to pay: 0.00002 eth
// total eth: 0.00991162248 eth
// to transfer:  0.00889 eth
// addr_to: 0xbb256f544b8087596e8e6cdd7fe9726cc98cb400

const runZKTransfer = async () => {
  const { zkWallet } = await initializeProvider();

  // set the amount to transfer
  const amount = zksync.utils.closestPackableTransactionAmount(
    ethers.utils.parseEther("0.0088")
  );

  // set the fees to be included in the transfer success
  const fees = zksync.utils.closestPackableTransactionFee(
    ethers.utils.parseEther("0.00002")
  );

  const transfer = await zkWallet.syncTransfer({
    to: "0xbb256f544b8087596e8e6cdd7fe9726cc98cb400",
    token: "ETH",
    amount,
    fees,
  });

  const txnReceipt = await transfer.awaitReceipt();
  console.log("Is txn success: ", txnReceipt.success);

  // Retreiving the current (committed) balance of an account
  const committedEthBalance = await zkWallet.getBalance("ETH");
  console.log("before", committedEthBalance.toNumber());

  // Retreiving the finalized balance of an account
  const finalizedEthBalance = await zkWallet.getBalance("ETH", "verified");
  console.log("after", finalizedEthBalance.toNumber());
};

const run = async () => {
  try {
    await runZKTransfer();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

run();
