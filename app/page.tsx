"use client";

import { useState } from "react";
import AnalyzeForm, { AnalysisResult } from "./components/AnalyzeForm";
import VerdictCard from "./components/VerdictCard";
import EmailCapture from "./components/EmailCapture";
import Logo from "./components/Logo";

const BRAND = "#E62E04";
const ORANGE = "#FF6F00";
const GRAD = "linear-gradient(135deg, #FF6F00 0%, #E62E04 100%)";
const GREEN = "#00A862";

export default function Home() {
  const [stage, setStage] = useState<"landing" | "result">("landing");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(true);

  function handleResult(r: AnalysisResult) {
    setResult(r);
    setShowEmailCapture(true);
    setStage("result");
  }
  function handleReset() {
    setResult(null);
    setStage("landing");
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5", fontFamily: "'Inter', sans-serif" }}>

      {/* PROMO STRIP */}
      <div className="text-white text-center py-2 px-4 text-xs font-semibold tracking-wide" style={{ background: GRAD }}>
        🎯 БЕЗКОШТОВНО · перші 3 перевірки · без реєстрації
      </div>

      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center gap-3">
          <Logo size={26} />
          <span className="font-black text-[17px] tracking-tight" style={{ color: "#1A1A1A" }}>ALI SCOUT</span>
          <span className="ml-auto text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ color: BRAND, background: "#FFF1EC", border: "1px solid #FFCFC0" }}>BETA</span>
        </div>
      </nav>

      {/* ── RESULT STAGE ── */}
      {stage === "result" && result ? (
        <section className="w-full bg-white border-b border-gray-100" style={{ minHeight: "calc(100vh - 110px)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-20">
            {showEmailCapture && (
              <div className="max-w-xl mx-auto">
                <EmailCapture onSkip={() => setShowEmailCapture(false)} />
              </div>
            )}
            <VerdictCard result={result} onReset={handleReset} />
          </div>
        </section>
      ) : (

      /* ── LANDING ── */
      <>
        {/* HERO — 2-col grid */}
        <section className="w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT: Copy */}
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
                style={{ color: BRAND, background: "#FFF1EC", border: "1px solid #FFCFC0" }}>
                AI Product Scout
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black leading-[1.05] tracking-tight mb-5" style={{ color: "#1A1A1A" }}>
                Не вгадуй —<br />
                <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  перевіряй.
                </span>
              </h1>
              <p className="text-base sm:text-lg leading-relaxed mb-6" style={{ color: "#666" }}>
                Вставив посилання → AI прочитав відгуки → вердикт за{" "}
                <strong style={{ color: "#1A1A1A" }}>10 секунд.</strong>{" "}
                Перша перевірка{" "}
                <strong style={{ color: GREEN }}>безкоштовна.</strong>
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { icon: "🚩", text: "Червоні прапорці" },
                  { icon: "🎯", text: "Цільова аудиторія" },
                  { icon: "📣", text: "Рекламні кути" },
                  { icon: "💰", text: "Орієнтовна націнка" },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-1.5 text-sm" style={{ color: "#666" }}>
                    <span>{f.icon}</span>{f.text}
                  </div>
                ))}
              </div>

              <p className="text-xs mt-6" style={{ color: "#999" }}>
                Без реєстрації · Повна версія від <strong style={{ color: BRAND }}>$29/міс</strong>
              </p>
            </div>

            {/* RIGHT: Form card */}
            <div className="rounded-2xl border border-gray-200 p-6 sm:p-8" style={{ background: "#FAFAFA", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
              <h2 className="text-lg font-bold mb-1" style={{ color: "#1A1A1A" }}>Перевір товар прямо зараз</h2>
              <p className="text-sm mb-5" style={{ color: "#999" }}>Вставте посилання з AliExpress — решту зробимо ми.</p>
              <AnalyzeForm onResult={handleResult} onLoading={setLoading} loading={loading} />
            </div>
          </div>
        </section>

        {/* STATS ROW */}
        <section className="w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-7 grid grid-cols-3 gap-4">
            {[
              { value: "12 000+", label: "товарів перевірено" },
              { value: "94%", label: "точність вердиктів" },
              { value: "10 сек", label: "замість 2 годин" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl sm:text-3xl font-black" style={{ color: "#1A1A1A" }}>{s.value}</div>
                <div className="text-[11px] sm:text-sm mt-0.5" style={{ color: "#999" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="w-full py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-[11px] font-bold uppercase tracking-widest text-center mb-2" style={{ color: BRAND }}>
              Як це працює
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-10" style={{ color: "#1A1A1A" }}>
              3 кроки до вердикту
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { n: "1", title: "Вставляєш посилання", desc: "Просто скопіюй URL товару з AliExpress і встав у форму." },
                { n: "2", title: "AI аналізує відгуки", desc: "Читаємо сотні відгуків і витягуємо ключові сигнали якості." },
                { n: "3", title: "Отримуєш вердикт", desc: "БРАТИ або ПРОПУСТИТИ — з аудиторією, кутами реклами і націнкою." },
              ].map(s => (
                <div key={s.n} className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg mb-4 flex-shrink-0"
                    style={{ background: GRAD }}>
                    {s.n}
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: "#1A1A1A" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#666" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="w-full pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="px-6 py-4 border-b border-gray-100 text-[11px] font-bold uppercase tracking-widest" style={{ color: "#999" }}>
                Чим відрізняємось від Sell The Trend, Ali Insider, Spocket
              </div>
              <div className="grid grid-cols-2">
                <div className="px-5 sm:px-8 py-6 border-r border-gray-100">
                  <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: BRAND }}>❌ Конкуренти</div>
                  {["Рахують замовлення", "Показують тренди", "«1000+ замовлень = ок»", "Не читають відгуки"].map(item => (
                    <div key={item} className="text-sm mb-3 flex gap-2" style={{ color: "#999" }}>
                      <span className="flex-shrink-0">—</span>{item}
                    </div>
                  ))}
                </div>
                <div className="px-5 sm:px-8 py-6">
                  <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GREEN }}>✅ Ali Scout</div>
                  {["Читає відгуки покупців", "Дає вердикт: брати / злив", "Ловить скарги на якість", "10 секунд замість 2 годин"].map(item => (
                    <div key={item} className="text-sm mb-3 flex gap-2" style={{ color: "#444" }}>
                      <span className="flex-shrink-0" style={{ color: GREEN }}>✓</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PAIN TAGS */}
        <section className="w-full pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: "#999" }}>Знайомо?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["«злив бюджет»","«товар не зайшов»","«CAC більший за чек»","«повернення з'їли прибуток»","«довга доставка»","«погана якість»","«брейк-івен»"].map(p => (
                <span key={p} className="text-sm px-4 py-2 rounded-full"
                  style={{ color: "#FF8800", background: "rgba(255,136,0,0.07)", border: "1px solid rgba(255,136,0,0.2)" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="w-full py-16 md:py-24" style={{ background: GRAD }}>
          <div className="max-w-2xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-black mb-3">Перевір свій товар зараз.</h2>
            <p className="text-base sm:text-lg mb-8" style={{ opacity: 0.9 }}>
              Перша перевірка безкоштовно — результат за 10 секунд.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-black text-base px-8 py-4 rounded-full transition-all"
              style={{
                background: "#fff",
                color: BRAND,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              Перевірити мій товар →
            </button>
            <p className="text-xs mt-5" style={{ opacity: 0.7 }}>
              Без реєстрації · Повна версія від <strong>$29/міс</strong>
            </p>
          </div>
        </section>
      </>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-5 text-center text-sm" style={{ color: "#999" }}>
        Перемагає не той, хто більше тестує — а хто менше зливає на сміття.
      </footer>
    </div>
  );
}
