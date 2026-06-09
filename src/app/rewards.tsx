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
      category: category.trim(),
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
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>SmartPay Assistant</p>
        <h1 style={titleStyle}>Rewards</h1>
        <p style={subtitleStyle}>
          Add reward rules so SmartPay can recommend the best card for each
          transaction category.
        </p>
      </section>

      <section style={panelStyle}>
        <h2 style={sectionTitleStyle}>Add Reward Rule</h2>

        <div style={formGridStyle}>
          <select
            value={creditCardId}
            onChange={(e) => setCreditCardId(e.target.value)}
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
          />

          <input
            placeholder="Reward Rate, example: 4"
            value={rewardRate}
            onChange={(e) => setRewardRate(e.target.value)}
          />

          <select
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value)}
          >
            <option value="points">Points</option>
            <option value="cashback">Cashback %</option>
          </select>
        </div>

        <button onClick={addReward}>Add Reward Rule</button>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Saved Reward Rules</h2>

        {rewards.length === 0 && (
          <div style={emptyStateStyle}>No reward rules added yet.</div>
        )}

        <div style={rewardsGridStyle}>
          {rewards.map((reward) => {
            const card = cards.find((c) => c.id === reward.credit_card_id);

            return (
              <div key={reward.id} style={rewardCardStyle}>
                <p style={cardLabelStyle}>
                  {card?.card_name || "Unknown Card"}
                </p>

                <h3 style={rewardCategoryStyle}>{reward.category}</h3>

                <div style={rewardBadgeStyle}>
                  {reward.reward_rate} {reward.reward_type}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const pageStyle = {
  padding: 40,
  maxWidth: 1200,
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

const sectionStyle = {
  marginTop: 34,
};

const sectionTitleStyle = {
  fontSize: 28,
  marginBottom: 18,
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  marginBottom: 20,
};

const rewardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
};

const rewardCardStyle = {
  background: "#E4DED2",
  border: "1px solid rgba(0,0,0,.05)",
  borderRadius: 32,
  padding: 26,
  boxShadow: "0 12px 30px rgba(0,0,0,.08)",
};

const cardLabelStyle = {
  margin: 0,
  color: "#F95C4B",
  fontWeight: 700,
};

const rewardCategoryStyle = {
  margin: "10px 0 22px",
  fontSize: 30,
};

const rewardBadgeStyle = {
  display: "inline-block",
  background: "#000000",
  color: "#ffffff",
  borderRadius: 999,
  padding: "10px 16px",
  fontWeight: 800,
};

const emptyStateStyle = {
  background: "#E4DED2",
  borderRadius: 24,
  padding: 22,
  color: "#4b453d",
};
