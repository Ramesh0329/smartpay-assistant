import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Card = {
  id: number;
  card_name: string;
};

type Transaction = {
  id: number;
  merchant_name: string;
  amount: number;
  category: string;
  transaction_date: string;
  credit_card_id: number | null;
  recommended_card: string | null;
  reward_gap: number | null;
};

type RewardRule = {
  id: number;
  credit_card_id: number;
  category: string;
  reward_rate: number;
};

// Converts user-entered category aliases into standard reward categories.
// Example: "Lunch" or "McDonald" becomes "Dining".
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

export default function TransactionsScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [creditCardId, setCreditCardId] = useState("");

  // Loads all saved cards so the user can select which card was used.
  async function loadCards() {
    const { data, error } = await supabase
      .from("credit_cards")
      .select("id, card_name")
      .order("card_name", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setCards(data || []);
  }

  // Loads transaction history from Supabase, newest transactions first.
  async function loadTransactions() {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setTransactions(data || []);
  }

  // Adds a transaction and calculates the best card recommendation.
  async function addTransaction() {
    if (!merchantName || !amount || !category || !transactionDate) {
      alert("Please fill merchant, amount, category, and date");
      return;
    }

    const amountNumber = Number(amount);

    if (Number.isNaN(amountNumber)) {
      alert("Amount must be a valid number");
      return;
    }

    const normalizedCategory = normalizeCategory(category);
    const usedCardId = creditCardId ? Number(creditCardId) : null;

    // Find reward rules for the normalized category.
    // Example: "Lunch" becomes "Dining", then we search Dining rewards.
    const { data: rewardRules, error: rewardsError } = await supabase
      .from("card_rewards")
      .select("id, credit_card_id, category, reward_rate")
      .ilike("category", normalizedCategory);

    if (rewardsError) {
      alert(rewardsError.message);
      return;
    }

    let recommendedCard: string | null = null;
    let rewardGap: number | null = null;

    if (rewardRules && rewardRules.length > 0) {
      // Sort reward rules from highest reward rate to lowest.
      const sortedRewards = [...(rewardRules as RewardRule[])].sort(
        (a, b) => Number(b.reward_rate) - Number(a.reward_rate),
      );

      const bestReward = sortedRewards[0];

      const bestCard = cards.find(
        (card) => Number(card.id) === Number(bestReward.credit_card_id),
      );

      recommendedCard = bestCard?.card_name || "Unknown Card";

      const usedReward = sortedRewards.find(
        (reward) => Number(reward.credit_card_id) === Number(usedCardId),
      );

      const usedRate = usedReward ? Number(usedReward.reward_rate) : 0;
      const bestRate = Number(bestReward.reward_rate);

      // Reward gap means how many rewards the user missed by not using the best card.
      rewardGap = Math.max(0, (bestRate - usedRate) * amountNumber);
    }

    const { error } = await supabase.from("transactions").insert({
      merchant_name: merchantName.trim(),
      amount: amountNumber,
      category: normalizedCategory,
      transaction_date: transactionDate,
      credit_card_id: usedCardId,
      recommended_card: recommendedCard,
      reward_gap: rewardGap,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setMerchantName("");
    setAmount("");
    setCategory("");
    setTransactionDate("");
    setCreditCardId("");

    await loadTransactions();
  }

  // Deletes a transaction and reloads the list.
  async function deleteTransaction(id: number) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadTransactions();
  }

  // Runs once when the page opens.
  useEffect(() => {
    loadCards();
    loadTransactions();
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>Transactions</h1>

      <input
        placeholder="Merchant Name, example: Chipotle"
        value={merchantName}
        onChange={(e) => setMerchantName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Amount, example: 22.50"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Category, example: Lunch"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={inputStyle}
      />

      <input
        type="date"
        value={transactionDate}
        onChange={(e) => setTransactionDate(e.target.value)}
        style={inputStyle}
      />

      <select
        value={creditCardId}
        onChange={(e) => setCreditCardId(e.target.value)}
        style={inputStyle}
      >
        <option value="">Select Card Used</option>
        {cards.map((card) => (
          <option key={card.id} value={String(card.id)}>
            {card.card_name}
          </option>
        ))}
      </select>

      <button
        onClick={addTransaction}
        style={{ padding: 10, marginBottom: 30 }}
      >
        Add Transaction
      </button>

      <h2>Transaction History</h2>

      {transactions.map((transaction) => {
        const card = cards.find(
          (c) => Number(c.id) === Number(transaction.credit_card_id),
        );

        return (
          <div key={transaction.id} style={cardStyle}>
            <strong>{transaction.merchant_name}</strong>
            <br />
            Amount: ${transaction.amount}
            <br />
            Category: {transaction.category}
            <br />
            Date: {transaction.transaction_date}
            <br />
            Card Used: {card?.card_name || "N/A"}
            <br />
            Recommended Card: {transaction.recommended_card || "N/A"}
            <br />
            Reward Gap: {transaction.reward_gap || 0}
            <br />
            <br />
            <button
              onClick={() => deleteTransaction(transaction.id)}
              style={deleteButtonStyle}
            >
              Delete
            </button>
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

const deleteButtonStyle = {
  backgroundColor: "#ff4d4f",
  color: "white",
  border: "none",
  padding: "8px 12px",
  cursor: "pointer",
};
