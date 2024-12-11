import { Provider, Wallet, Contract, utils as zkUtils } from "zksync-ethers";
import { formatUnits, parseUnits } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const USER_PRIVATE_KEY =
  process.env.USER_PRIVATE_KEY || "0xYOUR_PRIVATE_KEY_HERE";
const TOKEN_ADDRESS = "0xD1B36d4935487adA8C7a0ee21d430ade9aB6Dcd0";
const RECIPIENT_ADDRESS = "0x000087F5841e85308F5159595bb1ABf60E150AdB";
const PAYMASTER_ADDRESS = "0x8cc17e063d6cdF04C78c3430ecb969F45d93c86f";
const AMOUNT = "0.1";

const erc20ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() view returns (uint8)",
];

async function main() {
  // wallet connect
  const provider = new Provider("https://sepolia.era.zksync.dev");
  const wallet = new Wallet(USER_PRIVATE_KEY, provider);
  console.log("Wallet:", wallet.address);
  // balance check
  const ethBalance = await provider.getBalance(await wallet.getAddress());
  console.log("ETH Balance:", formatUnits(ethBalance, 18));

  // token balance check
  const erc20 = new Contract(TOKEN_ADDRESS, erc20ABI, wallet);
  const decimals = await erc20.decimals();
  const tokenAmount = parseUnits(AMOUNT, decimals);
  const userBalance = await erc20.balanceOf(await wallet.getAddress());
  console.log("User token balance:", formatUnits(userBalance, decimals));

  if (userBalance < tokenAmount) {
    throw new Error(
      "User does not have enough tokens to perform this transfer."
    );
  }

  // paymaster address
  // const testnetPaymaster = await provider.getTestnetPaymasterAddress();
  // console.log("Testnet Paymaster Address:", testnetPaymaster);
  const testnetPaymaster = PAYMASTER_ADDRESS;

  // Get current gas price with a small buffer
  const gasPrice = await provider.getGasPrice();
  const bufferedGasPrice = (gasPrice * BigInt(12)) / BigInt(10);

  // First, approve a small amount for estimation
  const minimalAllowance = BigInt(1);
  const currentAllowance = await erc20.allowance(
    wallet.address,
    testnetPaymaster
  );

  if (currentAllowance < minimalAllowance) {
    console.log("Approving initial amount for estimation...");
    const approveTx = await erc20.approve(testnetPaymaster, minimalAllowance);
    await approveTx.wait();
  }

  // Estimate gas
  const paymasterParamsForEstimation = zkUtils.getPaymasterParams(
    testnetPaymaster as string,
    {
      type: "ApprovalBased",
      token: TOKEN_ADDRESS,
      minimalAllowance,
      innerInput: new Uint8Array(),
    }
  );

  const gasLimit = await erc20.transfer.estimateGas(
    RECIPIENT_ADDRESS,
    tokenAmount,
    {
      customData: {
        paymasterParams: paymasterParamsForEstimation,
        gasPerPubdata: zkUtils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      },
    }
  );

  // Calculate total fee
  const fee = bufferedGasPrice * gasLimit;

  // Ensure sufficient allowance for actual transaction
  if (currentAllowance < fee) {
    console.log(`Approving paymaster for full fee amount: ${fee.toString()}`);
    const approveTx = await erc20.approve(testnetPaymaster, fee);
    await approveTx.wait();
  }

  // Prepare final paymaster parameters
  const paymasterParams = zkUtils.getPaymasterParams(
    testnetPaymaster as string,
    {
      type: "ApprovalBased",
      token: TOKEN_ADDRESS,
      minimalAllowance: fee,
      innerInput: new Uint8Array(),
    }
  );

  console.log("Sending transaction...");
  const tx = await erc20.transfer(RECIPIENT_ADDRESS, tokenAmount, {
    maxFeePerGas: bufferedGasPrice,
    maxPriorityFeePerGas: bufferedGasPrice,
    gasLimit,
    customData: {
      paymasterParams,
      gasPerPubdata: zkUtils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
    },
  });

  console.log("Transaction hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
}

main().catch((error) => {
  console.error("Error executing script:", error);
  process.exit(1);
});
