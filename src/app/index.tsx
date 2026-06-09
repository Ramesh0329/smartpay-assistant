import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

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

export default function DashboardScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);

  async function loadDashboardData() {
    const { data: cardsData } = await supabase
      .from("credit_cards")
      .select("id, card_name, credit_limit, annual_fee");

    const { data: billsData } = await supabase
      .from("bills")
      .select("id, bill_name, amount, due_date, is_paid")
      .order("due_date", { ascending: true })
      .limit(5);

    setCards(cardsData || []);
    setBills(billsData || []);
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

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>SmartPay Dashboard</h1>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h2>Total Cards</h2>
          <p style={bigNumberStyle}>{cards.length}</p>
        </div>

        <div style={cardStyle}>
          <h2>Total Credit Limit</h2>
          <p style={bigNumberStyle}>${totalCreditLimit}</p>
        </div>

        <div style={cardStyle}>
          <h2>Annual Fees</h2>
          <p style={bigNumberStyle}>${totalAnnualFees}</p>
        </div>

        <div style={cardStyle}>
          <h2>Unpaid Bills</h2>
          <p style={bigNumberStyle}>{unpaidBills.length}</p>
        </div>
      </div>

      <section style={{ marginTop: 30 }}>
        <h2>Upcoming Bills</h2>

        {bills.length === 0 && <p>No bills added yet.</p>}

        {bills.map((bill) => (
          <div key={bill.id} style={billStyle}>
            <strong>{bill.bill_name}</strong>
            <br />
            Amount: ${bill.amount || 0}
            <br />
            Due Date: {bill.due_date || "N/A"}
            <br />
            Status: {bill.is_paid ? "Paid" : "Unpaid"}
          </div>
        ))}
      </section>
    </main>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 16,
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
};

const bigNumberStyle = {
  fontSize: 28,
  fontWeight: "bold",
};

const billStyle = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginBottom: 10,
};
