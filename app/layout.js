import "./globals.css";

export const metadata = {
  title: "Wallet Overview | Sepolia Explorer",
  description: "Explore an Ethereum Sepolia wallet balance and recent transactions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
