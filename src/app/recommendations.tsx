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

export default function RecommendationsScreen() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [bestReward, setBestReward] = useState<RewardResult | null>(null);

  async function findBestCard() {
    if (!category || !amount) {
      alert("Please enter category and amount");
      return;
    }

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
      .ilike("category", category)
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
    <main style={{ padding: 24, maxWidth: 700 }}>
      <h1>Best Card Recommendation</h1>

      <input
        placeholder="Category, example: Dining"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Amount, example: 100"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={inputStyle}
      />

      <button onClick={findBestCard} style={{ padding: 10, marginBottom: 30 }}>
        Find Best Card
      </button>

      {bestReward && (
        <div style={cardStyle}>
          <h2>Recommended Card</h2>
          <strong>{bestReward.credit_cards.card_name}</strong>
          <p>Bank: {bestReward.credit_cards.bank_name || "N/A"}</p>
          <p>Category: {bestReward.category}</p>
          <p>
            Reward: {bestReward.reward_rate} {bestReward.reward_type}
          </p>
          <p>
            Estimated Reward: {estimatedReward} {bestReward.reward_type}
          </p>
        </div>
      )}
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: 15,
  borderRadius: 8,
};
