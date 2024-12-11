import express from "express";
import * as dotenv from "dotenv";
import { request } from "graphql-request";
import {
  GET_VALIDATED_TRANSACTIONS,
  ValidatedTransactionsResponse,
} from "./graphql";

dotenv.config();

const SUBGRAPH_ENDPOINT = process.env.SUBGRAPH_ENDPOINT || "";
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// get recent validated transactions from The Graph
app.get("/transactions/validated", async (req, res) => {
  try {
    const { paymasterTransactionValidateds } =
      await request<ValidatedTransactionsResponse>(
        SUBGRAPH_ENDPOINT,
        GET_VALIDATED_TRANSACTIONS,
        { first: 10 }
      );
    return res.json(paymasterTransactionValidateds);
  } catch (error: any) {
    console.error("Error fetching validated transactions:", error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
});

// get transaction details by transaction hash
app.get("/transactions/:txHash", async (req, res) => {
  try {
    const { txHash } = req.params;
    const query = `
      query GetTransaction($txHash: String!) {
        paymasterTransactionValidateds(where: { transactionHash: $txHash }) {
          id
          user
          token
          amount
          requiredETH
          gasLimit
          maxFeePerGas
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;

    const response = await request(SUBGRAPH_ENDPOINT, query, { txHash });
    return res.json(response);
  } catch (error: any) {
    console.error("Error fetching transaction:", error);
    return res.status(404).json({ error: "Transaction not found" });
  }
});

// get all transactions for a specific user
app.get("/transactions/user/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const query = `
      query GetUserTransactions($address: String!) {
        paymasterTransactionValidateds(
          where: { user: $address }
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          id
          user
          token
          amount
          requiredETH
          gasLimit
          maxFeePerGas
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;

    const response = await request(SUBGRAPH_ENDPOINT, query, { address });
    return res.json(response);
  } catch (error: any) {
    console.error("Error fetching user transactions:", error);
    return res.status(500).json({ error: "Failed to fetch user transactions" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
