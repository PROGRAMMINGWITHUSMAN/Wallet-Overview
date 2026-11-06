import { NextResponse } from "next/server";

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const API_BASE = process.env.BLOCKSCOUT_API_URL || "https://eth-sepolia.blockscout.com/api/v2";

async function getJson(url) {
  const response = await fetch(url, { next: { revalidate: 20 } });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Blockchain data provider returned ${response.status}.`);
  }
  return response.json();
}

export async function GET(_request, { params }) {
  const { address } = await params;
  if (!ADDRESS_PATTERN.test(address || "")) {
    return NextResponse.json({ error: "Invalid Ethereum address." }, { status: 400 });
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const [account, activity] = await Promise.all([
      getJson(`${API_BASE}/addresses/${encodedAddress}`),
      getJson(`${API_BASE}/addresses/${encodedAddress}/transactions`),
    ]);

    if (!account) return NextResponse.json({ error: "This address could not be found on Sepolia." }, { status: 404 });
    const transactions = (activity?.items || []).slice(0, 12).map((tx) => {
      const from = tx.from?.hash || "";
      const to = tx.to?.hash || "";
      const status = tx.status === "ok" ? "success" : tx.status === "pending" ? "pending" : "failed";
      return {
        hash: tx.hash,
        from,
        to: to || "Contract creation",
        timestamp: tx.timestamp,
        value: Number(tx.value || 0) / 1e18,
        direction: from.toLowerCase() === address.toLowerCase() ? "Sent" : "Received",
        status,
      };
    });

    return NextResponse.json({
      address,
      balance: Number(account.coin_balance || 0) / 1e18,
      transactions,
    });
  } catch (error) {
    console.error("Wallet lookup failed:", error);
    return NextResponse.json({ error: "Wallet data is temporarily unavailable. Please try again shortly." }, { status: 502 });
  }
}
