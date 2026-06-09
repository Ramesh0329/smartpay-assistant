import { supabase } from "@/lib/supabase";
import { useState } from "react";

type RewardResult = {
  id: number;
  category: string;
  reward_rate: number;
  reward_type: string;
  credit_card_id: number;
  credit_cards: {
    card_name: string;
    bank_name: string | null;
  };
};

// Converts common user inputs into standard categories used in reward rules.
function normalizeCategory(input: string) {
  const value = input.toLowerCase().trim();

  const categoryMap: Record<string, string> = {
    lunch: "Dining",
    dinner: "Dining",
    restaurant: "Dining",
    restaurants: "Dining",
    food: "Dining",
    coffee: "Dining",
    mcdonald: "Dining",
    chipotle: "Dining",
    starbucks: "Dining",

    uber: "Travel",
    lyft: "Travel",
    hotel: "Travel",
    flight: "Travel",
    airfare: "Travel",

    grocery: "Groceries",
    groceries: "Groceries",
    costco: "Groceries",
    walmart: "Groceries",
    target: "Groceries",

    gas: "Gas",
    fuel: "Gas",
    shell: "Gas",
    chevron: "Gas",

    shopping: "Shopping",
    amazon: "Shopping",

    internet: "Bills",
    electricity: "Bills",
    phone: "Bills",
    bill: "Bills",
  };

  return categoryMap[value] || input.trim();
}

export default function RecommendationsScreen() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [bestReward, setBestReward] = useState<RewardResult | null>(null);

  async function findBestCard() {
    if (!category || !amount) {
      alert("Please enter category and amount");
      return;
    }

    const amountNumber = Number(amount);

    if (Number.isNaN(amountNumber)) {
      alert("Amount must be a valid number");
      return;
    }

    const normalizedCategory = normalizeCategory(category);

    const { data, error } = await supabase
      .from("card_rewards")
      .select(
        `
        id,
        category,
        reward_rate,
        reward_type,
        credit_card_id,
        credit_cards (
          card_name,
          bank_name
        )
      `,
      )
      .ilike("category", normalizedCategory)
      .order("reward_rate", { ascending: false })
      .limit(1);

    if (error) {
      alert(error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No matching reward rule found for this category");
      setBestReward(null);
      return;
    }

    setBestReward(data[0] as RewardResult);
  }

  const estimatedReward =
    bestReward && amount ? Number(amount) * Number(bestReward.reward_rate) : 0;

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>SmartPay Assistant</p>
        <h1 style={titleStyle}>Recommendations</h1>
        <p style={subtitleStyle}>
          Enter a purchase category and amount to find the best credit card for
          maximum rewards.
        </p>
      </section>

      <section style={panelStyle}>
        <h2 style={sectionTitleStyle}>Find Best Card</h2>

        <div style={formGridStyle}>
          <input
            placeholder="Category, example: Dining or Lunch"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            placeholder="Amount, example: 100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button onClick={findBestCard}>Find Best Card</button>
      </section>

      {bestReward && (
        <section style={resultCardStyle}>
          <p style={resultLabelStyle}>Recommended Card</p>

          <h2 style={cardNameStyle}>{bestReward.credit_cards.card_name}</h2>

          <div style={detailsGridStyle}>
            <div>
              <p style={detailLabelStyle}>Bank</p>
              <p style={detailValueStyle}>
                {bestReward.credit_cards.bank_name || "N/A"}
              </p>
            </div>

            <div>
              <p style={detailLabelStyle}>Category</p>
              <p style={detailValueStyle}>{bestReward.category}</p>
            </div>

            <div>
              <p style={detailLabelStyle}>Reward Rate</p>
              <p style={detailValueStyle}>
                {bestReward.reward_rate} {bestReward.reward_type}
              </p>
            </div>

            <div>
              <p style={detailLabelStyle}>Estimated Reward</p>
              <p style={accentValueStyle}>
                {estimatedReward.toFixed(2)} {bestReward.reward_type}
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

const pageStyle = {
  padding: 40,
  maxWidth: 1100,
  minHeight: "100vh",
  background: "#F6F4F1",
  color: "#000000",
};

const heroStyle = {
  marginBottom: 28,
};

const eyebrowStyle = {
  color: "#F95C4B",
  fontWeight: 700,
  marginBottom: 8,
};

const titleStyle = {
  fontSize: 48,
  lineHeight: 1,
  margin: 0,
  letterSpacing: "-1.5px",
};

const subtitleStyle = {
  fontSize: 18,
  color: "#4b453d",
  maxWidth: 650,
};

const panelStyle = {
  background: "#E4DED2",
  borderRadius: 32,
  padding: 28,
  boxShadow: "0 12px 30px rgba(0,0,0,.08)",
  marginBottom: 34,
};

const sectionTitleStyle = {
  fontSize: 28,
  marginBottom: 18,
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
  marginBottom: 20,
};

const resultCardStyle = {
  background: "#E4DED2",
  border: "1px solid rgba(0,0,0,.05)",
  borderRadius: 36,
  padding: 32,
  boxShadow: "0 14px 34px rgba(0,0,0,.1)",
};

const resultLabelStyle = {
  margin: 0,
  color: "#F95C4B",
  fontWeight: 800,
};

const cardNameStyle = {
  margin: "8px 0 26px",
  fontSize: 40,
  letterSpacing: "-1px",
};

const detailsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

const detailLabelStyle = {
  margin: 0,
  fontSize: 13,
  color: "#4b453d",
  fontWeight: 700,
};

const detailValueStyle = {
  margin: "6px 0 0",
  fontSize: 18,
  fontWeight: 800,
};

const accentValueStyle = {
  margin: "6px 0 0",
  fontSize: 24,
  fontWeight: 900,
  color: "#F95C4B",
};
