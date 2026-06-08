import { supabase } from "@/lib/supabase";
import { useState } from "react";

type Card = {
  id: number;
  card_name: string;
  last_four: string;
  bank_name: string | null;
  due_day: number | null;
  credit_limit: number | null;
  annual_fee: number | null;
};

export default function CardsScreen() {
  const [cardName, setCardName] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [bankName, setBankName] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [annualFee, setAnnualFee] = useState("");
  const [cards, setCards] = useState<Card[]>([]);

  async function loadCards() {
    const { data, error } = await supabase
      .from("credit_cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setCards(data || []);
  }

  async function addCard() {
    if (!cardName || !lastFour) {
      alert("Please enter card name and last 4 digits");
      return;
    }

    const { error } = await supabase.from("credit_cards").insert({
      card_name: cardName,
      last_four: lastFour,
      bank_name: bankName,
      due_day: dueDay ? Number(dueDay) : null,
      credit_limit: creditLimit ? Number(creditLimit) : null,
      annual_fee: annualFee ? Number(annualFee) : 0,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setCardName("");
    setLastFour("");
    setBankName("");
    setDueDay("");
    setCreditLimit("");
    setAnnualFee("");
    loadCards();
  }

  async function deleteCard(id: number) {
    const { error } = await supabase.from("credit_cards").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadCards();
  }

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>Add Credit Card</h1>

      <input
        placeholder="Card Name"
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Last 4 Digits"
        value={lastFour}
        onChange={(e) => setLastFour(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Bank Name"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Due Day, example: 15"
        value={dueDay}
        onChange={(e) => setDueDay(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Credit Limit, example: 10000"
        value={creditLimit}
        onChange={(e) => setCreditLimit(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Annual Fee, example: 95"
        value={annualFee}
        onChange={(e) => setAnnualFee(e.target.value)}
        style={inputStyle}
      />

      <button onClick={addCard} style={{ padding: 10, marginBottom: 30 }}>
        Add Card
      </button>

      <h2>My Cards</h2>

      {cards.map((card) => (
        <div key={card.id} style={cardStyle}>
          <strong>{card.card_name}</strong>
          <br />
          Bank: {card.bank_name || "N/A"}
          <br />
          **** {card.last_four}
          <br />
          Due Day: {card.due_day || "N/A"}
          <br />
          Credit Limit: ${card.credit_limit || 0}
          <br />
          Annual Fee: ${card.annual_fee || 0}
          <br />
          <br />
          <button onClick={() => deleteCard(card.id)} style={deleteButtonStyle}>
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
