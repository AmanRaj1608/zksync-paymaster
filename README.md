# ZKSync Paymaster Backend

Implemented a backend service for interacting with an ERC20 approval based paymaster on ZKSync ERA. The backend provides API endpoints to fetch and sync transaction data, along with scripts to send gasless transactions.

## Project Structure

```
├── backend/ ->           Express server and API endpoints
├── custom-paymaster/ ->  Paymaster contract implementation
└── subgraphs/ ->         TheGraph indexing for paymaster events
```

### High Overview:

- Paymaster Integration: ERC20 approval-based paymaster contract, added event logging for transaction tracking
- Subgraph Indexing: TheGraph subgraph studio for indexing paymaster events
- Backend Server: Express.js server with GraphQL integration for querying indexed events. Also using Supabase for persistent storage

### Key Challenges

- zksync AA flow: Understanding and implementing ZKSync's unique AA flow, quite different from standard EVM paymasters
- Paymaster Transaction Integration: Managing token approvals and gas calculations for paymaster transactions
- Contract Verification: Having error with hardhat verification for paymaster contract

### Quick Start

```bash
yarn
yarn run dev
# send some test transaction
yarn run sendTx
```

### API Endpoints

- Get Recent Validated Transactions: `curl http://localhost:3000/transactions/validated`
- Get transaction by hash `curl http://localhost:3000/transactions/tx_hash`
- Get user transactions `curl http://localhost:3000/transactions/user/0x000087F5841e85308F5159595bb1ABf60E150AdB`
- Testing Transaction Script: `yarn run sendTx`
  - checks user token balance
  - validates paymaster allowance
  - calculates required gas
  - sends the transaction

### Environment Setup

Required environment variables:

```env
SUBGRAPH_ENDPOINT=https://api.studio.thegraph.com/query/5840/paymaster/version/latest
USER_PRIVATE_KEY=
```

### Contract Details

- ERC20 Token: `0xD1B36d4935487adA8C7a0ee21d430ade9aB6Dcd0`
- Paymaster: `0x8cc17e063d6cdF04C78c3430ecb969F45d93c86f`

### Improvements can be added

1. Add support for multiple token types
2. Implement dynamic fee calculations based on token prices
3. Add transaction batching for improved efficiency
4. Enhance monitoring and analytics capabilities
