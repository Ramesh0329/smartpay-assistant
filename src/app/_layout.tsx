import { Link, Slot } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <nav
        style={{ display: "flex", gap: 20, padding: 16, fontWeight: "bold" }}
      >
        <Link href="/">Dashboard</Link>
        <Link href="/cards">Cards</Link>
        <Link href="/rewards">Rewards</Link>
        <Link href="/transactions">Transactions</Link>
        <Link href="/bills">Bills</Link>
        <Link href="/recommendations">Recommendations</Link>
      </nav>

      <Slot />
    </>
  );
}
