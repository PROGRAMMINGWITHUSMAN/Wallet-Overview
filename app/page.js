"use client";

import { useState } from "react";

const addressPattern = /^0x[a-fA-F0-9]{40}$/;

function shortAddress(value = "") {
  return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value || "—";
}

function formatAmount(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "0";
  return amount.toLocaleString(undefined, { maximumFractionDigits: 5 });
}

function formatDate(value) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown time"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchWallet(event) {
    event.preventDefault();
    const cleanAddress = address.trim();
    if (!addressPattern.test(cleanAddress)) {
      setError("Enter a valid Ethereum address (0x followed by 40 characters).");
      setWallet(null);
      return;
    }

    setLoading(true);
    setError("");
    setWallet(null);
    try {
      const response = await fetch(`/api/wallet/${cleanAddress}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load this wallet.");
      setWallet(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Wallet Overview home">
          <span className="brand-mark">W</span>
          <span>WALLET<span className="brand-light">OVERVIEW</span></span>
        </a>
        <div className="network-pill"><span className="status-dot" /> ETHEREUM <span className="network-divider">/</span> SEPOLIA</div>
      </header>

      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-line" /> ON-CHAIN ACCOUNT EXPLORER</div>
        <h1>Every wallet has<br /><span>a story.</span></h1>
        <p className="hero-copy">Look up an Ethereum address to explore its balance and recent activity on Sepolia.</p>

        <form className="search-form" onSubmit={searchWallet}>
          <div className="input-wrap">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              aria-label="Wallet address"
              autoComplete="off"
              spellCheck="false"
              placeholder="Paste a wallet address  0x…"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <button type="submit" disabled={loading}>{loading ? "Searching…" : "Explore wallet"}<span aria-hidden="true"> ↗</span></button>
        </form>
        <div className="hint"><span className="hint-icon">i</span> Public wallet address only. Never enter a private key or recovery phrase.</div>
        {error && <div className="message error-message" role="alert">{error}</div>}

        {!wallet && !loading && !error && (
          <div className="welcome-card">
            <div className="welcome-icon">◈</div>
            <div><strong>Your next search starts here</strong><p>Enter any Ethereum Sepolia address to see its on-chain footprint.</p></div>
            <span className="welcome-arrow">↗</span>
          </div>
        )}
        {loading && <div className="loading-card"><span className="spinner" /> Fetching wallet activity from Sepolia…</div>}

        {wallet && (
          <section className="results" aria-live="polite">
            <div className="results-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> WALLET SNAPSHOT</div><h2>Account overview</h2></div><a className="explorer-link" href={`https://eth-sepolia.blockscout.com/address/${wallet.address}`} target="_blank" rel="noreferrer">View on explorer ↗</a></div>
            <div className="summary-grid">
              <article className="summary-card balance-card"><div className="card-label">NATIVE BALANCE <span>◈</span></div><div className="balance-value">{formatAmount(wallet.balance)} <small>ETH</small></div><div className="card-foot">Sepolia testnet</div></article>
              <article className="summary-card address-card"><div className="card-label">WALLET ADDRESS <span>⌘</span></div><div className="address-value" title={wallet.address}>{shortAddress(wallet.address)}</div><button className="copy-button" onClick={() => navigator.clipboard?.writeText(wallet.address)}>Copy address</button></article>
            </div>
            <div className="activity-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> RECENT ACTIVITY</div><h2>Transactions <span className="count-badge">{wallet.transactions.length}</span></h2></div><span className="latest-label">LATEST FIRST</span></div>
            {wallet.transactions.length === 0 ? (
              <div className="empty-state"><span>◌</span><strong>No transactions found</strong><p>This address has no indexed Sepolia transactions yet.</p></div>
            ) : (
              <div className="table-wrap"><table><thead><tr><th>TRANSACTION</th><th>TYPE</th><th>FROM / TO</th><th>VALUE</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>
                {wallet.transactions.map((tx) => <tr key={tx.hash}>
                  <td><a className="tx-hash" href={`https://eth-sepolia.blockscout.com/tx/${tx.hash}`} target="_blank" rel="noreferrer">{shortAddress(tx.hash)}</a></td>
                  <td><span className="type-pill">{tx.direction}</span></td>
                  <td><span className="party-line">{shortAddress(tx.from)} <span>→</span> {shortAddress(tx.to)}</span></td>
                  <td className="tx-value">{formatAmount(tx.value)} ETH</td>
                  <td className="tx-date">{formatDate(tx.timestamp)}</td>
                  <td><span className={`status-pill ${tx.status === "success" ? "success" : tx.status === "pending" ? "pending" : "failed"}`}><i />{tx.status}</span></td>
                </tr>)}
              </tbody></table></div>
            )}
            <div className="data-note">Showing the latest indexed transactions. Data provided by Blockscout.</div>
          </section>
        )}
      </section>

      <footer><span>BUILT FOR THE OPEN WEB</span><span>ETHEREUM SEPOLIA TESTNET <b>·</b> PUBLIC DATA</span></footer>
    </main>
  );
}
