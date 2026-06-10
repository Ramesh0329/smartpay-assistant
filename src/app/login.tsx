import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created. Check your email if confirmation is enabled.");
  }

  async function login() {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  }

  return (
    <main style={pageStyle}>
      <section style={authCardStyle}>
        <p style={eyebrowStyle}>SmartPay Assistant</p>
        <h1 style={titleStyle}>Welcome Back</h1>
        <p style={subtitleStyle}>
          Sign in to manage your cards, bills, rewards, and transactions.
        </p>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginTop: 12 }}
        />

        <div style={buttonRowStyle}>
          <button onClick={login}>Login</button>
          <button className="secondary-button" onClick={signUp}>
            Sign Up
          </button>
        </div>
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#F6F4F1",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 24,
};

const authCardStyle = {
  background: "#E4DED2",
  borderRadius: 36,
  padding: 36,
  width: "100%",
  maxWidth: 480,
  boxShadow: "0 14px 34px rgba(0,0,0,.1)",
};

const eyebrowStyle = {
  color: "#F95C4B",
  fontWeight: 800,
  marginBottom: 8,
};

const titleStyle = {
  fontSize: 44,
  margin: 0,
  letterSpacing: "-1px",
};

const subtitleStyle = {
  fontSize: 17,
  color: "#4b453d",
  marginBottom: 24,
};

const buttonRowStyle = {
  display: "flex",
  gap: 12,
  marginTop: 20,
  flexWrap: "wrap" as const,
};
