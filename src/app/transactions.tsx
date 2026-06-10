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

// Converts user-entered aliases into standard categories.
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

  const [editingTransactionId, setEditingTransactionId] = useState<
    number | null
  >(null);

  // Loads cards so the user can choose which card was used.
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

  // Loads saved transactions, newest first.
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

  function resetForm() {
    setMerchantName("");
    setAmount("");
    setCategory("");
    setTransactionDate("");
    setCreditCardId("");
    setEditingTransactionId(null);
  }

  // Calculates the recommended card and reward gap using reward rules.
  async function calculateRecommendation(
    inputCategory: string,
    inputAmount: number,
    usedCardId: number | null,
  ) {
    const normalizedCategory = normalizeCategory(inputCategory);

    const { data: rewardRules, error: rewardsError } = await supabase
      .from("card_rewards")
      .select("id, credit_card_id, category, reward_rate")
      .ilike("category", normalizedCategory);

    if (rewardsError) {
      throw new Error(rewardsError.message);
    }

    let recommendedCard: string | null = null;
    let rewardGap: number | null = null;

    if (rewardRules && rewardRules.length > 0) {
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

      rewardGap = Math.max(0, (bestRate - usedRate) * inputAmount);
    }

    return {
      normalizedCategory,
      recommendedCard,
      rewardGap,
    };
  }

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

    const usedCardId = creditCardId ? Number(creditCardId) : null;

    try {
      const { normalizedCategory, recommendedCard, rewardGap } =
        await calculateRecommendation(category, amountNumber, usedCardId);

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

      resetForm();
      await loadTransactions();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  function startEdit(transaction: Transaction) {
    setEditingTransactionId(transaction.id);
    setMerchantName(transaction.merchant_name || "");
    setAmount(String(transaction.amount || ""));
    setCategory(transaction.category || "");
    setTransactionDate(transaction.transaction_date || "");
    setCreditCardId(
      transaction.credit_card_id ? String(transaction.credit_card_id) : "",
    );
  }

  async function updateTransaction() {
    if (!editingTransactionId) return;

    if (!merchantName || !amount || !category || !transactionDate) {
      alert("Please fill merchant, amount, category, and date");
      return;
    }

    const amountNumber = Number(amount);

    if (Number.isNaN(amountNumber)) {
      alert("Amount must be a valid number");
      return;
    }

    const usedCardId = creditCardId ? Number(creditCardId) : null;

    try {
      const { normalizedCategory, recommendedCard, rewardGap } =
        await calculateRecommendation(category, amountNumber, usedCardId);

      const { error } = await supabase
        .from("transactions")
        .update({
          merchant_name: merchantName.trim(),
          amount: amountNumber,
          category: normalizedCategory,
          transaction_date: transactionDate,
          credit_card_id: usedCardId,
          recommended_card: recommendedCard,
          reward_gap: rewardGap,
        })
        .eq("id", editingTransactionId);

      if (error) {
        alert(error.message);
        return;
      }

      resetForm();
      await loadTransactions();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  async function deleteTransaction(id: number) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    if (editingTransactionId === id) {
      resetForm();
    }

    await loadTransactions();
  }

  useEffect(() => {
    loadCards();
    loadTransactions();
  }, []);

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>SmartPay Assistant</p>
        <h1 style={titleStyle}>Transactions</h1>
        <p style={subtitleStyle}>
          Track spending, identify the best card for each purchase, and measure
          missed reward opportunities.
        </p>
      </section>

      <section style={panelStyle}>
        <h2 style={sectionTitleStyle}>
          {editingTransactionId ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <div style={formGridStyle}>
          <input
            placeholder="Merchant Name, example: Chipotle"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
          />

          <input
            placeholder="Amount, example: 22.50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            placeholder="Category, example: Lunch"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
          />

          <select
            value={creditCardId}
            onChange={(e) => setCreditCardId(e.target.value)}
          >
            <option value="">Select Card Used</option>
            {cards.map((card) => (
              <option key={card.id} value={String(card.id)}>
                {card.card_name}
              </option>
            ))}
          </select>
        </div>

        <div style={buttonRowStyle}>
          {editingTransactionId ? (
            <>
              <button onClick={updateTransaction}>Update Transaction</button>
              <button className="secondary-button" onClick={resetForm}>
                Cancel Edit
              </button>
            </>
          ) : (
            <button onClick={addTransaction}>Add Transaction</button>
          )}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Transaction History</h2>

        {transactions.length === 0 && (
          <div style={emptyStateStyle}>No transactions added yet.</div>
        )}

        <div style={transactionsGridStyle}>
          {transactions.map((transaction) => {
            const card = cards.find(
              (c) => Number(c.id) === Number(transaction.credit_card_id),
            );

            const isMissedReward = Number(transaction.reward_gap || 0) > 0;

            return (
              <div key={transaction.id} style={transactionCardStyle}>
                <div style={transactionHeaderStyle}>
                  <div>
                    <p style={cardLabelStyle}>{transaction.category}</p>
                    <h3 style={merchantStyle}>{transaction.merchant_name}</h3>
                  </div>

                  <div style={amountBadgeStyle}>
                    ${Number(transaction.amount || 0).toFixed(2)}
                  </div>
                </div>

                <div style={detailsGridStyle}>
                  <div>
                    <p style={detailLabelStyle}>Date</p>
                    <p style={detailValueStyle}>
                      {transaction.transaction_date}
                    </p>
                  </div>

                  <div>
                    <p style={detailLabelStyle}>Card Used</p>
                    <p style={detailValueStyle}>{card?.card_name || "N/A"}</p>
                  </div>

                  <div>
                    <p style={detailLabelStyle}>Recommended</p>
                    <p style={detailValueStyle}>
                      {transaction.recommended_card || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p style={detailLabelStyle}>Reward Gap</p>
                    <p
                      style={{
                        ...detailValueStyle,
                        color: isMissedReward ? "#F95C4B" : "#000000",
                      }}
                    >
                      {Number(transaction.reward_gap || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {isMissedReward && (
                  <div style={warningBoxStyle}>
                    Better card available: {transaction.recommended_card}
                  </div>
                )}

                <div style={buttonRowStyle}>
                  <button
                    className="secondary-button"
                    onClick={() => startEdit(transaction)}
                  >
                    Edit Transaction
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteTransaction(transaction.id)}
                  >
                    Delete Transaction
                  </button>
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
  maxWidth: 680,
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

const transactionsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 20,
};

const transactionCardStyle = {
  background: "#E4DED2",
  border: "1px solid rgba(0,0,0,.05)",
  borderRadius: 32,
  padding: 26,
  boxShadow: "0 12px 30px rgba(0,0,0,.08)",
};

const transactionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 24,
};

const cardLabelStyle = {
  margin: 0,
  color: "#F95C4B",
  fontWeight: 700,
};

const merchantStyle = {
  margin: "6px 0 0",
  fontSize: 26,
};

const amountBadgeStyle = {
  background: "#000000",
  color: "#ffffff",
  borderRadius: 999,
  padding: "10px 16px",
  height: "fit-content",
  fontWeight: 800,
};

const detailsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 14,
  marginBottom: 20,
};

const detailLabelStyle = {
  margin: 0,
  fontSize: 13,
  color: "#4b453d",
  fontWeight: 700,
};

const detailValueStyle = {
  margin: "6px 0 0",
  fontSize: 16,
  fontWeight: 800,
};

const warningBoxStyle = {
  background: "#F95C4B",
  color: "#ffffff",
  borderRadius: 18,
  padding: 14,
  fontWeight: 800,
  marginBottom: 18,
};

const buttonRowStyle = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap" as const,
};

const emptyStateStyle = {
  background: "#E4DED2",
  borderRadius: 24,
  padding: 22,
  color: "#4b453d",
};
