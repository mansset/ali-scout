"use client";

import Image from "next/image";
import { AnalysisResult } from "./AnalyzeForm";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const BRAND = "#E62E04";
const GRAD = "linear-gradient(135deg, #FF6F00 0%, #E62E04 100%)";
const GREEN = "#00A862";
const AMBER = "#FFB800";

export default function VerdictCard({ result, onReset }: Props) {
  const isBuy = result.verdict === "БРАТИ";
  const p = result.product;
  const fiveStarPct = p?.totalReviews && p?.fiveStarCount
    ? Math.round((p.fiveStarCount / p.totalReviews) * 100)
    : null;

  return (
    <div className="animate-fade-in flex flex-col gap-3">

      {/* PRODUCT HEADER */}
      {p && (p.image || p.totalReviews) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          {p.image && (
            <div className="rounded-xl overflow-hidden flex-shrink-0 border border-gray-100" style={{ width: 72, height: 72 }}>
              <Image src={p.image} alt={p.title ?? "Товар"} width={72} height={72}
                style={{ objectFit: "cover", width: "100%", height: "100%" }} unoptimized />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {p.title && (
              <p className="text-sm font-semibold mb-2 truncate" style={{ color: "#1A1A1A" }}>{p.title}</p>
            )}
            <div className="flex flex-wrap gap-4">
              {p.rating && (
                <Stat label="Рейтинг" value={
                  <span className="flex items-center gap-1">
                    <StarIcon />
                    <span className="font-bold" style={{ color: AMBER }}>{p.rating}</span>
                    <span style={{ color: "#999" }}>/5</span>
                  </span>
                } />
              )}
              {p.totalReviews && (
                <Stat label="Відгуків" value={
                  <span className="font-bold" style={{ color: "#1A1A1A" }}>{p.totalReviews.toLocaleString("uk-UA")}</span>
                } />
              )}
              {p.fiveStarCount && (
                <Stat label="Відгуків 5★" value={
                  <span className="flex items-center gap-1">
                    <span className="font-bold" style={{ color: GREEN }}>{p.fiveStarCount.toLocaleString("uk-UA")}</span>
                    {fiveStarPct !== null && <span className="text-xs" style={{ color: "#999" }}>({fiveStarPct}%)</span>}
                  </span>
                } />
              )}
            </div>
          </div>
        </div>
      )}

      {/* VERDICT */}
      <div className="bg-white rounded-2xl border-2 overflow-hidden relative text-center"
        style={{
          borderColor: isBuy ? "#86EFAC" : "#FCA5A5",
          boxShadow: isBuy ? "0 4px 32px rgba(0,168,98,0.1)" : "0 4px 32px rgba(230,46,4,0.08)",
        }}>
        {/* corner badge */}
        <div className="absolute top-0 right-0 text-white text-[11px] font-black px-4 py-1.5"
          style={{ background: isBuy ? GREEN : BRAND, borderBottomLeftRadius: 12 }}>
          {isBuy ? "✓ WINNING" : "✗ SKIP"}
        </div>

        {/* gradient accent bar */}
        <div className="h-1 w-full" style={{ background: isBuy ? GREEN : GRAD }} />

        <div className="px-6 py-7">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#999" }}>Вердикт</div>
          <div className="text-5xl sm:text-6xl font-black leading-none mb-3"
            style={{ color: isBuy ? GREEN : BRAND }}>
            {isBuy ? "БРАТИ" : "ПРОПУСТИТИ"}
          </div>

          {/* score bar */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-2 w-40 sm:w-52 rounded-full overflow-hidden" style={{ background: "#F0F0F0" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${result.score}%`, background: isBuy ? GREEN : GRAD }} />
            </div>
            <span className="text-sm font-bold" style={{ color: isBuy ? GREEN : BRAND }}>
              {result.score}/100
            </span>
          </div>

          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#666" }}>{result.summary}</p>
        </div>
      </div>

      {/* DETAILS GRID — 2-col on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* RED FLAGS */}
        {result.red_flags.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Label>🚩 Червоні прапорці</Label>
            <ul className="flex flex-col gap-2">
              {result.red_flags.map((flag, i) => (
                <li key={i} className="flex gap-2 text-sm leading-snug" style={{ color: "#555" }}>
                  <span className="flex-shrink-0 font-bold" style={{ color: BRAND }}>•</span>{flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AUDIENCE */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Label>🎯 Цільова аудиторія</Label>
          <p className="text-sm leading-relaxed" style={{ color: "#555" }}>{result.audience}</p>
        </div>

        {/* AD ANGLES — full width */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:col-span-2" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Label>📣 Рекламні кути</Label>
          <div className="flex flex-col gap-2">
            {result.ad_angles.map((angle, i) => (
              <div key={i} className="rounded-xl px-4 py-3 text-sm leading-snug" style={{ background: "#FFF1EC", border: "1px solid #FFCFC0", color: "#1A1A1A" }}>
                <span className="font-bold mr-1.5" style={{ color: BRAND }}>{i + 1}.</span>{angle}
              </div>
            ))}
          </div>
        </div>

        {/* MARKUP — full width */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:col-span-2" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <Label>💰 Орієнтовна націнка</Label>
          <p className="text-base font-bold" style={{ color: "#1A1A1A" }}>{result.markup_range}</p>
        </div>
      </div>

      {/* RESET */}
      <button
        onClick={onReset}
        className="w-full py-3.5 rounded-full font-semibold text-sm border-2 transition-all mt-1"
        style={{ background: "transparent", borderColor: "#E5E5E5", color: "#999" }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = BRAND;
          (e.currentTarget as HTMLButtonElement).style.color = BRAND;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5";
          (e.currentTarget as HTMLButtonElement).style.color = "#999";
        }}
      >
        ← Перевірити інший товар
      </button>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "#1A1A1A" }}>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide" style={{ color: "#999" }}>{label}</span>
      <span className="text-sm flex items-center gap-1">{value}</span>
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={AMBER} style={{ flexShrink: 0 }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
