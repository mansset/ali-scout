"use client";

import { useState } from "react";

interface Props {
  onSkip: () => void;
}

const C = {
  surface: "#FFFFFF",
  border: "#E5E5E5",
  brand: "#E62E04",
  grad: "linear-gradient(135deg, #FF6F00 0%, #E62E04 100%)",
  green: "#00A862",
  text: "#1A1A1A",
  muted: "#666666",
  disabled: "#999999",
};

export default function EmailCapture({ onSkip }: Props) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [focus, setFocus] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setDone(true);
  }

  if (done) {
    return (
      <div style={{
        background: C.surface,
        border: "2px solid #86EFAC",
        borderRadius: 16,
        padding: "28px 24px",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,168,98,0.12)",
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          Готово! 3 перевірки розблоковано.
        </p>
        <p style={{ fontSize: 14, color: C.muted }}>
          Перевіряй наступний товар — ліміт збільшено.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: C.surface,
      border: `1px solid #FFCFC0`,
      borderRadius: 16,
      padding: "28px 24px",
      marginBottom: 12,
      boxShadow: "0 4px 24px rgba(230,46,4,0.08)",
    }}>
      {/* Counter dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
        <CheckDot used />
        <CheckDot />
        <CheckDot />
        <CheckDot />
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8, textAlign: "center" }}>
        Ще 3 перевірки — безкоштовно
      </h3>
      <p style={{ fontSize: 14, color: C.muted, textAlign: "center", marginBottom: 20, lineHeight: 1.5 }}>
        Лишиш email — розблокуємо 3 додаткові перевірки.<br />
        Без спаму. Тільки корисні матеріали для дропшиперів.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder="твій@email.com"
          required
          style={{
            background: C.surface,
            border: `2px solid ${focus ? C.brand : C.border}`,
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 15,
            color: C.text,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            width: "100%",
            transition: "border-color 0.15s",
          }}
        />
        <button
          type="submit"
          style={{
            background: C.grad,
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: "13px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 4px 14px rgba(230,46,4,0.35)",
          }}
        >
          Розблокувати 3 перевірки →
        </button>
      </form>

      <button
        onClick={onSkip}
        style={{
          background: "none",
          border: "none",
          color: C.disabled,
          fontSize: 13,
          cursor: "pointer",
          display: "block",
          margin: "12px auto 0",
          fontFamily: "'Inter', sans-serif",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        Пропустити
      </button>
    </div>
  );
}

function CheckDot({ used }: { used?: boolean }) {
  return (
    <div style={{
      width: 28,
      height: 28,
      borderRadius: "50%",
      border: `2px solid ${used ? "#00A862" : "#E5E5E5"}`,
      background: used ? "rgba(0,168,98,0.12)" : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      color: used ? "#00A862" : "#999999",
    }}>
      {used ? "✓" : "·"}
    </div>
  );
}
