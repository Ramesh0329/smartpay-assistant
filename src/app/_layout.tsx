import { Link, Slot } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <nav style={navStyle}>
        <Link className="nav-link" href="/">
          Dashboard
        </Link>

        <Link className="nav-link" href="/cards">
          Cards
        </Link>

        <Link className="nav-link" href="/rewards">
          Rewards
        </Link>

        <Link className="nav-link" href="/transactions">
          Transactions
        </Link>

        <Link className="nav-link" href="/bills">
          Bills
        </Link>

        <Link className="nav-link" href="/recommendations">
          Recommendations
        </Link>
        <Link className="nav-link" href="/login">
          Login
        </Link>
      </nav>

      <Slot />
    </>
  );
}

const navStyle = {
  display: "flex",
  gap: 36,
  padding: "18px 32px",
  background: "#F6F4F1",
  borderBottom: "1px solid #E4DED2",
  fontWeight: 700,
  position: "sticky" as const,
  top: 0,
  zIndex: 10,
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  flexWrap: "wrap" as const,
};
