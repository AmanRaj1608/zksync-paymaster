import { gql } from "graphql-request";

const GET_VALIDATED_TRANSACTIONS = gql`
  query GetValidatedTransactions($first: Int = 5) {
    paymasterTransactionValidateds(
      first: $first
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

interface ValidatedTransactionsResponse {
  paymasterTransactionValidateds: {
    id: string;
    user: string;
    token: string;
    amount: string;
    requiredETH: string;
    gasLimit: string;
    maxFeePerGas: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }[];
}

export { GET_VALIDATED_TRANSACTIONS, ValidatedTransactionsResponse };
