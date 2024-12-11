import { getWallet, deployContract } from "./utils";
import { ethers } from "ethers";

export default async function main() {
  try {
    const wallet = getWallet();
    const deployerAddress = await wallet.getAddress();
    console.log(`Deployer EOA: ${deployerAddress}`);

    // deploy test erc20
    const erc20 = await deployContract("MyERC20Token", [deployerAddress], {
      wallet,
      noVerify: true,
    });
    const erc20Address = await erc20.getAddress();
    console.log(`ERC20 Token deployed at: ${erc20Address}`);

    // Mint tokens
    const mintAmount = ethers.parseEther("1000000");
    const mintTx = await erc20.mint(deployerAddress, mintAmount);
    await mintTx.wait();
    console.log(
      `Minted ${ethers.formatEther(mintAmount)} tokens to ${deployerAddress}`
    );

    const balance = await erc20.balanceOf(deployerAddress);
    console.log(`Deployer token balance: ${ethers.formatEther(balance)}`);

    // deploy ApprovalPaymaster with the ERC20 token as the allowedToken
    const approvalPaymaster = await deployContract(
      "ApprovalPaymaster",
      [erc20Address],
      {
        wallet,
        noVerify: true,
      }
    );
    const paymasterAddress = await approvalPaymaster.getAddress();
    console.log(`ApprovalPaymaster deployed at: ${paymasterAddress}`);

    // Log final deployment summary
    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log(`ERC20 Token: ${erc20Address}`);
    console.log(`ApprovalPaymaster: ${paymasterAddress}`);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}
