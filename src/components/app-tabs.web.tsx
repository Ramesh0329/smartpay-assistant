import { Link } from "expo-router";

export default function AppTabs() {
  return (
    <div style={{ display: "flex", gap: 20, padding: 16, fontWeight: "bold" }}>
      <Link href="/">Dashboard</Link>
      <Link href="/cards">Cards</Link>
      <Link href="/transactions">Transactions</Link>
      <Link href="/bills">Bills</Link>
      <Link href="/recommendations">Recommendations</Link>
    </div>
  );
}
