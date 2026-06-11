export interface AliExpressProduct {
  productId: string;
  image?: string;
  title?: string;
  totalReviews?: number;
  fiveStarCount?: number;
  rating?: number;
}

export interface AliExpressFullData {
  product: AliExpressProduct;
  listing: string;   // title + description for Claude
  reviews: string;   // raw review text for Claude
}

export function extractProductId(url: string): string | null {
  const match = url.match(/\/(?:item|i)\/(\d{10,})/);
  return match?.[1] ?? null;
}

export function isAliExpressUrl(text: string): boolean {
  return /aliexpress\.com\/(item|i)\/\d{10,}/i.test(text);
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,uk;q=0.8,ru;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Ch-Ua": '"Google Chrome";v="126", "Chromium";v="126", "Not.A/Brand";v="24"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "Referer": "https://www.google.com/",
};

/* ── fetch helper: routes through ScraperAPI proxy when SCRAPER_API_KEY is set ── */

async function proxiedFetch(targetUrl: string, timeoutMs: number): Promise<Response> {
  const key = process.env.SCRAPER_API_KEY;
  if (key) {
    // ScraperAPI with JS rendering reliably bypasses AliExpress datacenter-IP blocking (~40s)
    const proxied = `https://api.scraperapi.com/?api_key=${key}&url=${encodeURIComponent(targetUrl)}&render=true`;
    return fetch(proxied, { signal: AbortSignal.timeout(timeoutMs) });
  }
  return fetch(targetUrl, { headers: HEADERS, signal: AbortSignal.timeout(timeoutMs) });
}

/* ── helpers ── */

function extractMeta(html: string, property: string): string | undefined {
  const m =
    html.match(new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]+)"`)) ||
    html.match(new RegExp(`<meta[^>]+content="([^"]+)"[^>]+property="${property}"`));
  return m?.[1];
}

function extractJson<T>(html: string, pattern: RegExp): T | null {
  const m = html.match(pattern);
  if (!m?.[1]) return null;
  try { return JSON.parse(m[1]) as T; } catch { return null; }
}

/* ── main export ── */

export async function fetchFullProductData(url: string): Promise<AliExpressFullData | null> {
  const productId = extractProductId(url);
  if (!productId) return null;

  let html = "";
  try {
    const res = await proxiedFetch(url, 90_000);
    if (res.ok) html = await res.text();
  } catch { /* network error – continue with empty html */ }

  /* ── product meta ── */
  const image = extractMeta(html, "og:image");
  const title = extractMeta(html, "og:title") ?? extractMeta(html, "title");

  /* ── review stats ── */
  type RunParams = { data?: { feedbackComponent?: { evarageStar?: string | number; totalValidNum?: number; fiveStarNum?: number } } };
  const rp = extractJson<RunParams>(html, /window\.runParams\s*=\s*(\{[\s\S]*?\});\s*(?:window|var|const|let|\n)/);
  const fb = rp?.data?.feedbackComponent;

  const totalReviewsRaw = html.match(new RegExp('"totalValidNum"\\s*:\\s*(\\d+)'));
  const fiveStarRaw = html.match(new RegExp('"fiveStarNum"\\s*:\\s*(\\d+)'));
  const ratingRaw = html.match(new RegExp('"averageStar"\\s*:\\s*"?([\\d.]+)"?'));

  const totalReviews: number | undefined = fb?.totalValidNum ?? (totalReviewsRaw ? parseInt(totalReviewsRaw[1]) : undefined);
  const fiveStarCount: number | undefined = fb?.fiveStarNum ?? (fiveStarRaw ? parseInt(fiveStarRaw[1]) : undefined);
  const rating: number | undefined = fb?.evarageStar
    ? parseFloat(String(fb.evarageStar))
    : (ratingRaw ? parseFloat(ratingRaw[1]) : undefined);

  /* ── product description ── */
  type ProductInfo = { subject?: string; description?: string; productImages?: string[] };
  const productInfo = extractJson<{ data?: { productInfoComponent?: ProductInfo } }>(
    html,
    /window\.runParams\s*=\s*(\{[\s\S]*?\});\s*(?:window|var|const|let|\n)/
  )?.data?.productInfoComponent;

  const descriptionText =
    productInfo?.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "";

  const listing = [
    title ? `Назва: ${title}` : "",
    descriptionText ? `Опис: ${descriptionText.slice(0, 1500)}` : "",
    totalReviews ? `Кількість відгуків на картці: ${totalReviews}` : "",
    fiveStarCount ? `Відгуків 5★: ${fiveStarCount}` : "",
    rating ? `Середній рейтинг: ${rating}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  /* ── fetch reviews via feedback API ── */
  let reviews = "";
  try {
    // Extract seller ID from page (needed for reviews API)
    const sellerIdMatch = html.match(/"ownerMemberId"\s*:\s*(\d+)/) ?? html.match(/ownerMemberId=(\d+)/);
    const sellerId = sellerIdMatch?.[1];

    if (sellerId) {
      const params = new URLSearchParams({
        productId,
        ownerMemberId: sellerId,
        memberType: "seller",
        withPictures: "false",
        withAdditionalFeedback: "false",
        onlyFromMyCountry: "false",
        version: "2",
        lang: "en_US",
        page: "1",
        pageSize: "30",
      });

      const reviewsRes = await proxiedFetch(
        `https://feedback.aliexpress.com/pc/evaluation/getEvaluationByPage.do?${params}`,
        25_000
      );

      if (reviewsRes.ok) {
        const json = await reviewsRes.json();
        type Review = { buyerEval?: string; buyerTranslationEval?: string };
        const items: Review[] = json?.data?.evaViewList ?? [];
        reviews = items
          .map((r, i) => `${i + 1}. ${r.buyerTranslationEval || r.buyerEval || ""}`)
          .filter((r) => r.length > 4)
          .join("\n");
      }
    }
  } catch { /* reviews fetch failed – Claude will work with listing only */ }

  return {
    product: { productId, image, title, totalReviews, fiveStarCount, rating },
    listing: listing || `Товар з AliExpress (ID: ${productId})`,
    reviews,
  };
}
