"use client";

import { useState, useEffect } from "react";

export interface ProductMeta {
  productId: string;
  image?: string;
  title?: string;
  totalReviews?: number;
  fiveStarCount?: number;
  rating?: number;
}

export interface AnalysisResult {
  verdict: "БРАТИ" | "ПРОПУСТИТИ";
  score: number;
  summary: string;
  red_flags: string[];
  audience: string;
  ad_angles: string[];
  markup_range: string;
  product?: ProductMeta | null;
}

interface Props {
  onResult: (result: AnalysisResult) => void;
  onLoading: (loading: boolean) => void;
  loading: boolean;
}

const C = {
  surface: "#FFFFFF",
  border: "#E5E5E5",
  brand: "#E62E04",
  orange: "#FF6F00",
  grad: "linear-gradient(135deg, #FF6F00 0%, #E62E04 100%)",
  green: "#00A862",
  red: "#E62E04",
  text: "#1A1A1A",
  muted: "#666666",
  disabled: "#999999",
};

export default function AnalyzeForm({ onResult, onLoading, loading }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const isValid = url.includes("aliexpress.com") && url.includes("/item/");

  // progress ticker while analyzing
  useEffect(() => {
    if (!loading) { setElapsed(0); return; }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 250);
    return () => clearInterval(id);
  }, [loading]);

  // ~45s flow — rotate status by elapsed time
  const STEPS = [
    { at: 0, text: "Відкриваємо сторінку товару…" },
    { at: 8, text: "Обходимо захист AliExpress…" },
    { at: 20, text: "Витягуємо фото, назву та категорію…" },
    { at: 32, text: "AI аналізує товар і ринок…" },
    { at: 44, text: "Формуємо вердикт…" },
  ];
  const currentStep = [...STEPS].reverse().find(s => elapsed >= s.at) ?? STEPS[0];
  const progressPct = Math.min(95, Math.round((elapsed / 48) * 100));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) { setError("Вставте посилання на товар"); return; }
    if (!isValid) { setError("Не схоже на посилання AliExpress. Приклад: aliexpress.com/item/..."); return; }
    setError("");
    onLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else onResult(data);
    } catch {
      setError("Щось пішло не так. Спробуй ще раз.");
    } finally {
      onLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* URL input */}
      <div style={{ position: "relative" }}>
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(""); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="https://www.aliexpress.com/item/..."
          autoFocus
          style={{
            width: "100%",
            background: C.surface,
            border: `2px solid ${focused ? C.brand : error ? C.red : C.border}`,
            borderRadius: 12,
            padding: "14px 48px 14px 16px",
            fontSize: 15,
            color: C.text,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            transition: "border-color 0.15s",
          }}
        />
        {url.length > 10 && (
          <span style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 16,
          }}>
            {isValid ? "✅" : "❌"}
          </span>
        )}
      </div>

      {!error && !loading && (
        <p style={{ fontSize: 13, color: C.disabled, margin: 0 }}>
          Вставте посилання — ми самі підтягнемо фото, опис і відгуки.
        </p>
      )}

      {error && (
        <p style={{
          fontSize: 13,
          color: C.red,
          background: "#FFF1EC",
          border: "1px solid #FFCFC0",
          borderRadius: 8,
          padding: "10px 14px",
          margin: 0,
        }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: loading ? C.border : C.grad,
          color: loading ? C.disabled : "#FFFFFF",
          fontWeight: 700,
          fontSize: 16,
          padding: "15px 28px",
          borderRadius: 999,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
          fontFamily: "'Inter', sans-serif",
          boxShadow: loading ? "none" : "0 4px 14px rgba(230,46,4,0.35)",
          transition: "transform 0.15s, box-shadow 0.15s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: 4,
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(230,46,4,0.5)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? "none" : "0 4px 14px rgba(230,46,4,0.35)";
        }}
      >
        {loading ? (
          <>
            <svg style={{ animation: "spin 1s linear infinite", width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Аналізуємо… {elapsed}с
          </>
        ) : (
          "Перевірити товар →"
        )}
      </button>

      {/* PROGRESS PANEL */}
      {loading && (
        <div style={{
          background: "#FFF8F5",
          border: "1px solid #FFCFC0",
          borderRadius: 14,
          padding: "16px 16px 18px",
          marginTop: 4,
        }}>
          {/* progress bar */}
          <div style={{ height: 6, width: "100%", background: "#FFE3D6", borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
            <div style={{
              height: "100%",
              width: `${progressPct}%`,
              background: C.grad,
              borderRadius: 999,
              transition: "width 0.3s ease",
            }} />
          </div>

          {/* current step */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: C.brand,
              animation: "pulse 1s ease-in-out infinite", flexShrink: 0,
            }} />
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>{currentStep.text}</span>
          </div>

          {/* checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {STEPS.map((s) => {
              const done = elapsed > (STEPS[STEPS.indexOf(s) + 1]?.at ?? 999);
              const active = currentStep === s;
              return (
                <div key={s.at} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  fontSize: 12,
                  color: done ? C.green : active ? "#1A1A1A" : "#BBB",
                  fontWeight: active ? 600 : 400,
                }}>
                  <span style={{ width: 13, flexShrink: 0 }}>{done ? "✓" : active ? "▸" : "·"}</span>
                  {s.text}
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 11, color: C.disabled, margin: "12px 0 0", textAlign: "center" }}>
            AliExpress жорстко захищений — обхід займає ~40–50 секунд. Це нормально 👌
          </p>
        </div>
      )}
    </form>
  );
}
