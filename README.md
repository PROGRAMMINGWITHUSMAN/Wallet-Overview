# Wallet Overview

A small Next.js wallet explorer for Ethereum Sepolia. Paste a public wallet address to see its native ETH balance and up to 12 recent transactions.

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` if you want to configure a different Blockscout API URL. The default Sepolia endpoint works without an API key.
4. Start the app with `npm run dev` and open `http://localhost:3000`.

The lookup is handled by a Next.js route on the server, which requests indexed Sepolia data from Blockscout. The project only asks for public addresses. Never enter a private key or recovery phrase.

## Notes

- The app currently reads Ethereum Sepolia only. The displayed ETH is testnet ETH and has no real-world value.
- Transaction history comes from the explorer's indexed normal transactions; internal transactions and token transfers are not included in this first version.
- Set `BLOCKSCOUT_API_URL` in `.env.local` to the `/api/v2` base URL of a compatible Blockscout instance.
