import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

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

  const [editingCardId, setEditingCardId] = useState<number | null>(null);

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

  function resetForm() {
    setCardName("");
    setLastFour("");
    setBankName("");
    setDueDay("");
    setCreditLimit("");
    setAnnualFee("");
    setEditingCardId(null);
  }

  async function addCard() {
    if (!cardName || !lastFour) {
      alert("Please enter card name and last 4 digits");
      return;
    }

    const { error } = await supabase.from("credit_cards").insert({
      card_name: cardName.trim(),
      last_four: lastFour.trim(),
      bank_name: bankName.trim(),
      due_day: dueDay ? Number(dueDay) : null,
      credit_limit: creditLimit ? Number(creditLimit) : null,
      annual_fee: annualFee ? Number(annualFee) : 0,
    });

    if (error) {
      alert(error.message);
      return;
    }

    resetForm();
    loadCards();
  }

  function startEdit(card: Card) {
    setEditingCardId(card.id);
    setCardName(card.card_name || "");
    setLastFour(card.last_four || "");
    setBankName(card.bank_name || "");
    setDueDay(card.due_day ? String(card.due_day) : "");
    setCreditLimit(card.credit_limit ? String(card.credit_limit) : "");
    setAnnualFee(card.annual_fee ? String(card.annual_fee) : "");
  }

  async function updateCard() {
    if (!editingCardId) return;

    if (!cardName || !lastFour) {
      alert("Please enter card name and last 4 digits");
      return;
    }

    const { error } = await supabase
      .from("credit_cards")
      .update({
        card_name: cardName.trim(),
        last_four: lastFour.trim(),
        bank_name: bankName.trim(),
        due_day: dueDay ? Number(dueDay) : null,
        credit_limit: creditLimit ? Number(creditLimit) : null,
        annual_fee: annualFee ? Number(annualFee) : 0,
      })
      .eq("id", editingCardId);

    if (error) {
      alert(error.message);
      return;
    }

    resetForm();
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

  useEffect(() => {
    loadCards();
  }, []);

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>SmartPay Assistant</p>
        <h1 style={titleStyle}>Cards</h1>
        <p style={subtitleStyle}>
          Add your credit cards, track limits, annual fees, and payment due
          days.
        </p>
      </section>

      <section style={panelStyle}>
        <h2 style={sectionTitleStyle}>
          {editingCardId ? "Edit Credit Card" : "Add Credit Card"}
        </h2>

        <div style={formGridStyle}>
          <input
            placeholder="Card Name"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />

          <input
            placeholder="Last 4 Digits"
            value={lastFour}
            onChange={(e) => setLastFour(e.target.value)}
          />

          <input
            placeholder="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />

          <input
            placeholder="Due Day, example: 15"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
          />

          <input
            placeholder="Credit Limit, example: 10000"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
          />

          <input
            placeholder="Annual Fee, example: 95"
            value={annualFee}
            onChange={(e) => setAnnualFee(e.target.value)}
          />
        </div>

        <div style={buttonRowStyle}>
          {editingCardId ? (
            <>
              <button onClick={updateCard}>Update Card</button>
              <button className="secondary-button" onClick={resetForm}>
                Cancel Edit
              </button>
            </>
          ) : (
            <button onClick={addCard}>Add Card</button>
          )}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>My Cards</h2>

        {cards.length === 0 && (
          <div style={emptyStateStyle}>No cards added yet.</div>
        )}

        <div style={cardsGridStyle}>
          {cards.map((card) => (
            <div key={card.id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <p style={cardLabelStyle}>{card.bank_name || "Bank N/A"}</p>
                  <h3 style={cardNameStyle}>{card.card_name}</h3>
                </div>

                <div style={lastFourStyle}>•••• {card.last_four}</div>
              </div>

              <div style={detailGridStyle}>
                <div>
                  <p style={detailLabelStyle}>Due Day</p>
                  <p style={detailValueStyle}>{card.due_day || "N/A"}</p>
                </div>

                <div>
                  <p style={detailLabelStyle}>Credit Limit</p>
                  <p style={detailValueStyle}>
                    ${Number(card.credit_limit || 0).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p style={detailLabelStyle}>Annual Fee</p>
                  <p style={detailValueStyle}>
                    ${Number(card.annual_fee || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div style={buttonRowStyle}>
                <button
                  className="secondary-button"
                  onClick={() => startEdit(card)}
                >
                  Edit Card
                </button>

                <button
                  className="delete-button"
                  onClick={() => deleteCard(card.id)}
                >
                  Delete Card
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
  maxWidth: 640,
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

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};

const cardStyle = {
  background: "#E4DED2",
  border: "1px solid rgba(0,0,0,.05)",
  borderRadius: 32,
  padding: 26,
  boxShadow: "0 12px 30px rgba(0,0,0,.08)",
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 26,
};

const cardLabelStyle = {
  margin: 0,
  color: "#F95C4B",
  fontWeight: 700,
};

const cardNameStyle = {
  margin: "6px 0 0",
  fontSize: 26,
};

const lastFourStyle = {
  background: "#000000",
  color: "#ffffff",
  borderRadius: 999,
  padding: "8px 14px",
  height: "fit-content",
  fontWeight: 700,
};

const detailGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
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
  fontSize: 17,
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
