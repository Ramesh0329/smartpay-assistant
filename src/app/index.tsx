import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Card = {
  id: number;
  card_name: string;
  credit_limit: number | null;
  annual_fee: number | null;
};

type Bill = {
  id: number;
  bill_name: string;
  amount: number | null;
  due_date: string | null;
  is_paid: boolean;
};

type Transaction = {
  id: number;
  merchant_name: string;
  amount: number;
  category: string;
  reward_gap: number | null;
  transaction_date: string;
  credit_card_id: number | null;
};

const CHART_COLORS = ["#F95C4B", "#000000", "#BFB8AA", "#D9D3C7", "#E4DED2"];

export default function DashboardScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  async function getCurrentUserId() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      alert(error.message);
      return null;
    }

    if (!user) {
      alert("Please login first");
      return null;
    }

    return user.id;
  }

  async function loadDashboardData() {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const { data: cardsData } = await supabase
      .from("credit_cards")
      .select("id, card_name, credit_limit, annual_fee")
      .eq("user_id", userId);

    const { data: billsData } = await supabase
      .from("bills")
      .select("id, bill_name, amount, due_date, is_paid")
      .eq("user_id", userId)
      .order("due_date", { ascending: true })
      .limit(5);

    const { data: transactionsData } = await supabase
      .from("transactions")
      .select(
        "id, merchant_name, amount, category, reward_gap, transaction_date, credit_card_id",
      )
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false });

    setCards(cardsData || []);
    setBills(billsData || []);
    setTransactions(transactionsData || []);
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalCreditLimit = cards.reduce(
    (sum, card) => sum + Number(card.credit_limit || 0),
    0,
  );

  const totalAnnualFees = cards.reduce(
    (sum, card) => sum + Number(card.annual_fee || 0),
    0,
  );

  const unpaidBills = bills.filter((bill) => !bill.is_paid);

  const totalSpend = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  );

  const totalMissedRewards = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.reward_gap || 0),
    0,
  );

  const spendByCategory = transactions.reduce<Record<string, number>>(
    (acc, transaction) => {
      const category = transaction.category || "Other";
      acc[category] = (acc[category] || 0) + Number(transaction.amount || 0);
      return acc;
    },
    {},
  );

  const chartData = Object.entries(spendByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const largestCategory =
    chartData.length > 0
      ? chartData.reduce((a, b) => (a.value > b.value ? a : b))
      : null;

  const merchantSpend = transactions.reduce<Record<string, number>>(
    (acc, transaction) => {
      const merchant = transaction.merchant_name || "Unknown";
      acc[merchant] = (acc[merchant] || 0) + Number(transaction.amount || 0);
      return acc;
    },
    {},
  );

  const topMerchant =
    Object.entries(merchantSpend).length > 0
      ? Object.entries(merchantSpend).reduce((a, b) => (a[1] > b[1] ? a : b))
      : null;

  const today = new Date();

  const billAlerts = bills.map((bill) => {
    const dueDate = bill.due_date ? new Date(bill.due_date) : null;

    if (bill.is_paid) {
      return {
        ...bill,
        message: "Paid",
        color: "#000000",
      };
    }

    if (!dueDate) {
      return {
        ...bill,
        message: "No due date",
        color: "#BFB8AA",
      };
    }

    const daysLeft = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysLeft < 0) {
      return {
        ...bill,
        message: "Overdue",
        color: "#F95C4B",
      };
    }

    if (daysLeft <= 3) {
      return {
        ...bill,
        message: `Due in ${daysLeft} days`,
        color: "#F95C4B",
      };
    }

    return {
      ...bill,
      message: `Due in ${daysLeft} days`,
      color: "#000000",
    };
  });

  const cardUsage = transactions.reduce<Record<number, number>>(
    (acc, transaction) => {
      const cardId = Number(transaction.credit_card_id);

      if (!cardId) return acc;

      acc[cardId] = (acc[cardId] || 0) + Number(transaction.amount || 0);

      return acc;
    },
    {},
  );

  const leaderboard = cards
    .map((card) => ({
      card_name: card.card_name,
      spend: cardUsage[card.id] || 0,
    }))
    .sort((a, b) => b.spend - a.spend);

  const monthlySpendMap = transactions.reduce<Record<string, number>>(
    (acc, transaction) => {
      if (!transaction.transaction_date) return acc;

      const date = new Date(transaction.transaction_date);
      const month = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      acc[month] = (acc[month] || 0) + Number(transaction.amount || 0);
      return acc;
    },
    {},
  );

  const monthlySpendData = Object.entries(monthlySpendMap)
    .map(([month, spend]) => ({
      month,
      spend,
      sortDate: new Date(month),
    }))
    .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
    .map(({ month, spend }) => ({
      month,
      spend,
    }));

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>SmartPay Assistant</p>
        <h1 style={titleStyle}>Analytics Dashboard</h1>
        <p style={subtitleStyle}>
          Track spending, bills, cards, and missed rewards in one elegant view.
        </p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <p style={labelStyle}>Total Cards</p>
          <p style={bigNumberStyle}>{cards.length}</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Total Credit Limit</p>
          <p style={bigNumberStyle}>${totalCreditLimit.toFixed(2)}</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Annual Fees</p>
          <p style={bigNumberStyle}>${totalAnnualFees.toFixed(2)}</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Unpaid Bills</p>
          <p style={bigNumberStyle}>{unpaidBills.length}</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Total Spend</p>
          <p style={bigNumberStyle}>${totalSpend.toFixed(2)}</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Transactions</p>
          <p style={bigNumberStyle}>{transactions.length}</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Missed Rewards</p>
          <p style={bigNumberStyle}>{totalMissedRewards.toFixed(2)}</p>
        </div>
      </div>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Smart Insights</h2>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <p style={labelStyle}>Missed Rewards</p>
            <p style={bigNumberStyle}>${totalMissedRewards.toFixed(2)}</p>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Largest Category</p>
            <p style={bigNumberStyle}>{largestCategory?.name || "N/A"}</p>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Top Merchant</p>
            <p style={bigNumberStyle}>{topMerchant?.[0] || "N/A"}</p>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Unpaid Bills</p>
            <p style={bigNumberStyle}>{unpaidBills.length}</p>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Monthly Spending Trend</h2>

        {monthlySpendData.length === 0 ? (
          <div style={emptyStateStyle}>No monthly spending data yet.</div>
        ) : (
          <div style={chartWrapperStyle}>
            <ResponsiveContainer>
              <LineChart data={monthlySpendData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    background: "#F6F4F1",
                    border: "1px solid #E4DED2",
                    borderRadius: 16,
                    color: "#000000",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="spend"
                  stroke="#F95C4B"
                  strokeWidth={4}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Spend by Category</h2>

        {chartData.length === 0 ? (
          <div style={emptyStateStyle}>No transactions added yet.</div>
        ) : (
          <div style={chartWrapperStyle}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={115}
                  label
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#F6F4F1",
                    border: "1px solid #E4DED2",
                    borderRadius: 16,
                    color: "#000000",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Category Breakdown</h2>

        {chartData.length === 0 && (
          <div style={emptyStateStyle}>No category data yet.</div>
        )}

        {chartData.map((item) => (
          <div key={item.name} style={listCardStyle}>
            <strong>{item.name}</strong>
            <br />
            Spend: ${item.value.toFixed(2)}
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Upcoming Bills</h2>

        {bills.length === 0 && (
          <div style={emptyStateStyle}>No bills added yet.</div>
        )}

        {bills.map((bill) => (
          <div key={bill.id} style={listCardStyle}>
            <strong>{bill.bill_name}</strong>
            <br />
            Amount: ${Number(bill.amount || 0).toFixed(2)}
            <br />
            Due Date: {bill.due_date || "N/A"}
            <br />
            Status: {bill.is_paid ? "Paid" : "Unpaid"}
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Recent Transactions</h2>

        {transactions.length === 0 && (
          <div style={emptyStateStyle}>No transactions added yet.</div>
        )}

        {transactions.slice(0, 5).map((transaction) => (
          <div key={transaction.id} style={listCardStyle}>
            <strong>{transaction.merchant_name}</strong>
            <br />
            Category: {transaction.category}
            <br />
            Amount: ${Number(transaction.amount || 0).toFixed(2)}
            <br />
            Date: {transaction.transaction_date}
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Bill Alerts</h2>

        {billAlerts.length === 0 && (
          <div style={emptyStateStyle}>No bill alerts yet.</div>
        )}

        {billAlerts.map((bill) => (
          <div key={bill.id} style={listCardStyle}>
            <strong>{bill.bill_name}</strong>
            <br />
            Amount: ${Number(bill.amount || 0).toFixed(2)}
            <br />
            <span
              style={{
                color: bill.color,
                fontWeight: 800,
              }}
            >
              {bill.message}
            </span>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Best Card Leaderboard</h2>

        {leaderboard.length === 0 && (
          <div style={emptyStateStyle}>No card activity yet.</div>
        )}

        {leaderboard.map((card, index) => (
          <div key={card.card_name} style={listCardStyle}>
            <strong>
              #{index + 1} {card.card_name}
            </strong>
            <br />
            Total Spend:
            <span
              style={{
                color: "#F95C4B",
                fontWeight: 800,
              }}
            >
              {" "}
              ${card.spend.toFixed(2)}
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}

const pageStyle = {
  padding: 40,
  maxWidth: 1400,
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
  maxWidth: 620,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 20,
};

const cardStyle = {
  background: "#E4DED2",
  borderRadius: 32,
  padding: 28,
  boxShadow: "0 12px 30px rgba(0,0,0,.08)",
  border: "1px solid rgba(0,0,0,.04)",
};

const labelStyle = {
  fontSize: 16,
  fontWeight: 700,
  margin: 0,
  marginBottom: 20,
};

const bigNumberStyle = {
  fontSize: 40,
  fontWeight: 800,
  color: "#F95C4B",
  margin: 0,
};

const sectionStyle = {
  marginTop: 34,
};

const sectionTitleStyle = {
  fontSize: 28,
  marginBottom: 16,
};

const chartWrapperStyle = {
  background: "#E4DED2",
  borderRadius: 32,
  padding: 24,
  width: "100%",
  height: 360,
  boxShadow: "0 12px 30px rgba(0,0,0,.08)",
};

const listCardStyle = {
  background: "#E4DED2",
  border: "1px solid rgba(0,0,0,.05)",
  borderRadius: 22,
  padding: 18,
  marginBottom: 12,
  boxShadow: "0 8px 20px rgba(0,0,0,.05)",
};

const emptyStateStyle = {
  background: "#E4DED2",
  borderRadius: 24,
  padding: 22,
  color: "#4b453d",
};
