import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Card = {
  id: number;
  card_name: string;
};

type Reward = {
  id: number;
  category: string;
  reward_rate: number;
  reward_type: string;
  credit_card_id: number;
};

export default function RewardsScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  const [creditCardId, setCreditCardId] = useState("");
  const [category, setCategory] = useState("");
  const [rewardRate, setRewardRate] = useState("");
  const [rewardType, setRewardType] = useState("points");

  async function loadCards() {
    const { data, error } = await supabase
      .from("credit_cards")
      .select("id, card_name")
      .order("card_name");

    if (error) {
      alert(error.message);
      return;
    }

    setCards(data || []);
  }

  async function loadRewards() {
    const { data, error } = await supabase
      .from("card_rewards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setRewards(data || []);
  }

  async function addReward() {
    if (!creditCardId || !category || !rewardRate) {
      alert("Please select card, category, and reward rate");
      return;
    }

    const { error } = await supabase.from("card_rewards").insert({
      credit_card_id: Number(creditCardId),
      category,
      reward_rate: Number(rewardRate),
      reward_type: rewardType,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setCreditCardId("");
    setCategory("");
    setRewardRate("");
    setRewardType("points");
    loadRewards();
  }

  useEffect(() => {
    loadCards();
    loadRewards();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>Card Rewards</h1>

      <select
        value={creditCardId}
        onChange={(e) => setCreditCardId(e.target.value)}
        style={inputStyle}
      >
        <option value="">Select Card</option>
        {cards.map((card) => (
          <option key={card.id} value={card.id}>
            {card.card_name}
          </option>
        ))}
      </select>

      <input
        placeholder="Category, example: Dining"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Reward Rate, example: 4"
        value={rewardRate}
        onChange={(e) => setRewardRate(e.target.value)}
        style={inputStyle}
      />

      <select
        value={rewardType}
        onChange={(e) => setRewardType(e.target.value)}
        style={inputStyle}
      >
        <option value="points">Points</option>
        <option value="cashback">Cashback %</option>
      </select>

      <button onClick={addReward} style={{ padding: 10, marginBottom: 30 }}>
        Add Reward Rule
      </button>

      <h2>Saved Reward Rules</h2>

      {rewards.map((reward) => {
        const card = cards.find((c) => c.id === reward.credit_card_id);

        return (
          <div key={reward.id} style={cardStyle}>
            <strong>{card?.card_name || "Unknown Card"}</strong>
            <br />
            Category: {reward.category}
            <br />
            Reward: {reward.reward_rate} {reward.reward_type}
          </div>
        );
      })}
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
  marginBottom: 10,
  borderRadius: 8,
};
