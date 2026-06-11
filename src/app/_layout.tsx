import { supabase } from "@/lib/supabase";
import { Link, Slot, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserEmail(user?.email || null);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    router.push("/login");
  }

  useEffect(() => {
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <nav style={navStyle}>
        <div style={linksStyle}>
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
        </div>

        <div style={authStyle}>
          {userEmail ? (
            <>
              <span style={emailStyle}>👤 {userEmail}</span>
              <button className="secondary-button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="nav-link" href="/login">
              Login
            </Link>
          )}
        </div>
      </nav>

      <Slot />
    </>
  );
}

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 24,
  padding: "18px 32px",
  background: "#F6F4F1",
  borderBottom: "1px solid #E4DED2",
  fontWeight: 700,
  position: "sticky" as const,
  top: 0,
  zIndex: 10,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  flexWrap: "wrap" as const,
};

const linksStyle = {
  display: "flex",
  gap: 28,
  alignItems: "center",
  flexWrap: "wrap" as const,
};

const authStyle = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap" as const,
};

const emailStyle = {
  fontSize: 14,
  color: "#4b453d",
};
