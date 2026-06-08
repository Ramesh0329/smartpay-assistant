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
      bill_name: billName,
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
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>Bills</h1>

      <input
        placeholder="Bill Name, example: Internet"
        value={billName}
        onChange={(e) => setBillName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Amount, example: 89.99"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={inputStyle}
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={inputStyle}
      />

      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        style={inputStyle}
      >
        <option value="monthly">Monthly</option>
        <option value="weekly">Weekly</option>
        <option value="yearly">Yearly</option>
        <option value="one-time">One-time</option>
      </select>

      <button onClick={addBill} style={{ padding: 10, marginBottom: 30 }}>
        Add Bill
      </button>

      <h2>Upcoming Bills</h2>

      {bills.map((bill) => (
        <div key={bill.id} style={cardStyle}>
          <strong>{bill.bill_name}</strong>
          <br />
          Amount: ${bill.amount || 0}
          <br />
          Due Date: {bill.due_date}
          <br />
          Frequency: {bill.frequency}
          <br />
          Status: {bill.is_paid ? "Paid" : "Unpaid"}
          <br />
          <br />
          <button onClick={() => togglePaid(bill)} style={{ marginRight: 10 }}>
            Mark {bill.is_paid ? "Unpaid" : "Paid"}
          </button>
          <button onClick={() => deleteBill(bill.id)} style={deleteButtonStyle}>
            Delete
          </button>
        </div>
      ))}
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
