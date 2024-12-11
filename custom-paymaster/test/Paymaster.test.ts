import { Contract, Wallet } from "zksync-ethers";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "../deploy/utils";
import * as ethers from "ethers";
import { expect } from "chai";

describe("MyERC20Token", function () {
  let tokenContract: Contract;
  let ownerWallet: Wallet;
  let userWallet: Wallet;

  before(async function () {
    // These wallets should be funded with enough ETH to cover deployment and gas.
    ownerWallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    userWallet = getWallet(LOCAL_RICH_WALLETS[1].privateKey);

    // Deploy the ERC20 token contract from the owner wallet
    tokenContract = await deployContract(
      "MyERC20Token",
      [ownerWallet.address],
      {
        wallet: ownerWallet,
        silent: true,
      }
    );
  });
});
