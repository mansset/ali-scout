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
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
};

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
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10_000),
    });
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

      const reviewsRes = await fetch(
        `https://feedback.aliexpress.com/pc/evaluation/getEvaluationByPage.do?${params}`,
        { headers: HEADERS, signal: AbortSignal.timeout(8_000) }
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
