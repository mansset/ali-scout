import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import { fetchFullProductData, extractProductId } from "@/lib/aliexpress";

// Scraping proxy + Claude can take a while — allow up to 60s
export const maxDuration = 60;

const MOCK_RESPONSE = {
  verdict: "БРАТИ",
  score: 74,
  summary: "Товар з хорошим попитом і зрозумілою аудиторією, але є скарги на терміни доставки.",
  red_flags: [
    "Частина покупців скаржиться на доставку 30+ днів",
    "Кілька відгуків про відмінність кольору від фото",
    "Якість шнура сумнівна за ціну",
  ],
  audience:
    "Жінки 25–40, які стежать за порядком вдома. Болі: хаос на кухні, мало місця. Шукати в Facebook/Instagram по інтересах «домашній декор», «організація простору».",
  ad_angles: [
    "«Нарешті порядок на кухні за 2 хвилини» — до/після розкладання речей",
    "«Подарунок мамі, який вона реально використає» — ситуативна реклама під свята",
  ],
  markup_range: "2.5x–4x (450–700 грн при закупці 180 грн)",
  product: {
    productId: "demo",
    image: "https://ae01.alicdn.com/kf/S8c618bde2a564e6091df62b69ec69f09c.jpg",
    title: "Bamboo Kitchen Organizer 3-Section",
    totalReviews: 2847,
    fiveStarCount: 1923,
    rating: 4.7,
  },
};

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url?.trim()) {
    return NextResponse.json({ error: "Вставте посилання на товар AliExpress" }, { status: 400 });
  }

  if (!extractProductId(url)) {
    return NextResponse.json({ error: "Не вдалось розпізнати товар. Перевірте посилання AliExpress." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Always fetch real product data from AliExpress
  const data = await fetchFullProductData(url);

  if (!data) {
    return NextResponse.json({ error: "Не вдалось отримати дані товару. Перевірте посилання." }, { status: 422 });
  }

  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 1200));
    return NextResponse.json({ ...MOCK_RESPONSE, product: data.product });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(data.listing, data.reviews) }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    // strip markdown code fences if Claude wrapped the JSON
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const result = JSON.parse(cleaned);
    return NextResponse.json({ ...result, product: data.product });
  } catch (err) {
    console.error("analyze error:", err);
    return NextResponse.json({ error: "Помилка аналізу. Спробуй ще раз." }, { status: 500 });
  }
}
