import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Bill = {
  id: number;
  bill_name: string;
  amount: number | null;
  due_date: string | null;
  frequency: string | null;
  is_paid: boolean;
};

export default function BillsScreen() {
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [bills, setBills] = useState<Bill[]>([]);

  async function loadBills() {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .order("due_date", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setBills(data || []);
  }

  async function addBill() {
    if (!billName || !dueDate) {
      alert("Please enter bill name and due date");
      return;
    }

    const { error } = await supabase.from("bills").insert({
      bill_name: billName.trim(),
      amount: amount ? Number(amount) : null,
      due_date: dueDate,
      frequency,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setBillName("");
    setAmount("");
    setDueDate("");
    setFrequency("monthly");

    loadBills();
  }

  async function deleteBill(id: number) {
    const { error } = await supabase.from("bills").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadBills();
  }

  async function togglePaid(bill: Bill) {
    const { error } = await supabase
      .from("bills")
      .update({ is_paid: !bill.is_paid })
      .eq("id", bill.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadBills();
  }

  useEffect(() => {
    loadBills();
  }, []);

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>SmartPay Assistant</p>
        <h1 style={titleStyle}>Bills</h1>
        <p style={subtitleStyle}>
          Track upcoming bills, due dates, payment status, and recurring
          expenses in one place.
        </p>
      </section>

      <section style={panelStyle}>
        <h2 style={sectionTitleStyle}>Add Bill</h2>

        <div style={formGridStyle}>
          <input
            placeholder="Bill Name, example: Internet"
            value={billName}
            onChange={(e) => setBillName(e.target.value)}
          />

          <input
            placeholder="Amount, example: 89.99"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
            <option value="one-time">One-time</option>
          </select>
        </div>

        <button onClick={addBill}>Add Bill</button>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Upcoming Bills</h2>

        {bills.length === 0 && (
          <div style={emptyStateStyle}>No bills added yet.</div>
        )}

        <div style={billsGridStyle}>
          {bills.map((bill) => (
            <div key={bill.id} style={billCardStyle}>
              <div style={billHeaderStyle}>
                <div>
                  <p style={billLabelStyle}>{bill.frequency || "N/A"}</p>
                  <h3 style={billNameStyle}>{bill.bill_name}</h3>
                </div>

                <div style={amountBadgeStyle}>
                  ${Number(bill.amount || 0).toFixed(2)}
                </div>
              </div>

              <div style={detailGridStyle}>
                <div>
                  <p style={detailLabelStyle}>Due Date</p>
                  <p style={detailValueStyle}>{bill.due_date || "N/A"}</p>
                </div>

                <div>
                  <p style={detailLabelStyle}>Status</p>
                  <p
                    style={{
                      ...detailValueStyle,
                      color: bill.is_paid ? "#000000" : "#F95C4B",
                    }}
                  >
                    {bill.is_paid ? "Paid" : "Unpaid"}
                  </p>
                </div>
              </div>

              <div style={buttonRowStyle}>
                <button onClick={() => togglePaid(bill)}>
                  Mark {bill.is_paid ? "Unpaid" : "Paid"}
                </button>

                <button
                  className="delete-button"
                  onClick={() => deleteBill(bill.id)}
                >
                  Delete Bill
                </button>
              </div>
            </div>
          ))}
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

const billsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 20,
};

const billCardStyle = {
  background: "#E4DED2",
  border: "1px solid rgba(0,0,0,.05)",
  borderRadius: 32,
  padding: 26,
  boxShadow: "0 12px 30px rgba(0,0,0,.08)",
};

const billHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 24,
};

const billLabelStyle = {
  margin: 0,
  color: "#F95C4B",
  fontWeight: 700,
  textTransform: "capitalize" as const,
};

const billNameStyle = {
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

const detailGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 14,
  marginBottom: 22,
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
