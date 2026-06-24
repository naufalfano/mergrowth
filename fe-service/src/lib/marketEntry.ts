import api from "./api";

export interface PriceRange {
  p25: number;
  median: number;
  p75: number;
}

export interface TierInfo {
  tier: string;
  gap_share: number;
  is_gap: boolean;
  price_range: PriceRange;
}

export interface MarketEntryResult {
  category: string;
  confidence: number;
  n_competitors: number;
  recommended_tier: string;
  seller_share: string;
  entry_price_range: PriceRange;
  all_tiers: TierInfo[];
}

export interface CategorySuggestion {
  category: string;
  score: number;
}

export interface LowConfidenceResult {
  status: "low_confidence";
  message: string;
  top_categories: CategorySuggestion[];
}

export type MarketEntryResponse = MarketEntryResult | LowConfidenceResult;

export const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Sports",
  "Automotive",
  "Beauty",
  "Home & Living",
  "Books",
  "Food & Beverage",
  "Toys",
  "Health",
  "Office & Stationery",
] as const;

export type Category = (typeof CATEGORIES)[number];

// ── Dummy data ────────────────────────────────────────────────────────────────

const DUMMY_RESULTS: Record<string, MarketEntryResult> = {
  Fashion: {
    category: "Fashion",
    confidence: 0.91,
    n_competitors: 5842,
    recommended_tier: "Mid",
    seller_share: "18.4%",
    entry_price_range: { p25: 85000, median: 145000, p75: 280000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.51,
        is_gap: false,
        price_range: { p25: 12000, median: 28000, p75: 65000 },
      },
      {
        tier: "Mid",
        gap_share: 0.18,
        is_gap: true,
        price_range: { p25: 85000, median: 145000, p75: 280000 },
      },
      {
        tier: "Premium",
        gap_share: 0.31,
        is_gap: false,
        price_range: { p25: 350000, median: 680000, p75: 1500000 },
      },
    ],
  },
  Electronics: {
    category: "Electronics",
    confidence: 0.88,
    n_competitors: 3201,
    recommended_tier: "Mid-Low",
    seller_share: "14.2%",
    entry_price_range: { p25: 120000, median: 280000, p75: 520000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.38,
        is_gap: false,
        price_range: { p25: 25000, median: 65000, p75: 110000 },
      },
      {
        tier: "Mid-Low",
        gap_share: 0.14,
        is_gap: true,
        price_range: { p25: 120000, median: 280000, p75: 520000 },
      },
      {
        tier: "Mid-High",
        gap_share: 0.27,
        is_gap: false,
        price_range: { p25: 600000, median: 1200000, p75: 2500000 },
      },
      {
        tier: "Premium",
        gap_share: 0.21,
        is_gap: false,
        price_range: { p25: 3000000, median: 5500000, p75: 12000000 },
      },
    ],
  },
  Sports: {
    category: "Sports",
    confidence: 0.87,
    n_competitors: 1990,
    recommended_tier: "Mid",
    seller_share: "12.3%",
    entry_price_range: { p25: 150000, median: 250000, p75: 450000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.45,
        is_gap: false,
        price_range: { p25: 15000, median: 35000, p75: 89000 },
      },
      {
        tier: "Mid",
        gap_share: 0.12,
        is_gap: true,
        price_range: { p25: 150000, median: 250000, p75: 450000 },
      },
      {
        tier: "Premium",
        gap_share: 0.38,
        is_gap: false,
        price_range: { p25: 500000, median: 850000, p75: 2000000 },
      },
    ],
  },
  Automotive: {
    category: "Automotive",
    confidence: 0.83,
    n_competitors: 2740,
    recommended_tier: "Premium",
    seller_share: "19.8%",
    entry_price_range: { p25: 450000, median: 780000, p75: 1800000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.42,
        is_gap: false,
        price_range: { p25: 20000, median: 58000, p75: 120000 },
      },
      {
        tier: "Mid",
        gap_share: 0.36,
        is_gap: false,
        price_range: { p25: 150000, median: 320000, p75: 420000 },
      },
      {
        tier: "Premium",
        gap_share: 0.2,
        is_gap: true,
        price_range: { p25: 450000, median: 780000, p75: 1800000 },
      },
    ],
  },
  Beauty: {
    category: "Beauty",
    confidence: 0.92,
    n_competitors: 4315,
    recommended_tier: "Mid",
    seller_share: "16.7%",
    entry_price_range: { p25: 55000, median: 110000, p75: 220000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.48,
        is_gap: false,
        price_range: { p25: 8000, median: 22000, p75: 48000 },
      },
      {
        tier: "Mid",
        gap_share: 0.17,
        is_gap: true,
        price_range: { p25: 55000, median: 110000, p75: 220000 },
      },
      {
        tier: "Premium",
        gap_share: 0.35,
        is_gap: false,
        price_range: { p25: 280000, median: 520000, p75: 1200000 },
      },
    ],
  },
  "Home & Living": {
    category: "Home & Living",
    confidence: 0.79,
    n_competitors: 3876,
    recommended_tier: "Budget",
    seller_share: "21.3%",
    entry_price_range: { p25: 18000, median: 45000, p75: 95000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.21,
        is_gap: true,
        price_range: { p25: 18000, median: 45000, p75: 95000 },
      },
      {
        tier: "Mid",
        gap_share: 0.39,
        is_gap: false,
        price_range: { p25: 110000, median: 220000, p75: 480000 },
      },
      {
        tier: "Premium",
        gap_share: 0.4,
        is_gap: false,
        price_range: { p25: 550000, median: 950000, p75: 3000000 },
      },
    ],
  },
  Books: {
    category: "Books",
    confidence: 0.94,
    n_competitors: 1124,
    recommended_tier: "Mid",
    seller_share: "22.1%",
    entry_price_range: { p25: 45000, median: 85000, p75: 150000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.55,
        is_gap: false,
        price_range: { p25: 10000, median: 28000, p75: 42000 },
      },
      {
        tier: "Mid",
        gap_share: 0.22,
        is_gap: true,
        price_range: { p25: 45000, median: 85000, p75: 150000 },
      },
      {
        tier: "Premium",
        gap_share: 0.23,
        is_gap: false,
        price_range: { p25: 180000, median: 350000, p75: 800000 },
      },
    ],
  },
  "Food & Beverage": {
    category: "Food & Beverage",
    confidence: 0.86,
    n_competitors: 6503,
    recommended_tier: "Mid",
    seller_share: "13.8%",
    entry_price_range: { p25: 35000, median: 68000, p75: 130000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.49,
        is_gap: false,
        price_range: { p25: 5000, median: 18000, p75: 32000 },
      },
      {
        tier: "Mid",
        gap_share: 0.14,
        is_gap: true,
        price_range: { p25: 35000, median: 68000, p75: 130000 },
      },
      {
        tier: "Premium",
        gap_share: 0.37,
        is_gap: false,
        price_range: { p25: 160000, median: 280000, p75: 650000 },
      },
    ],
  },
  Toys: {
    category: "Toys",
    confidence: 0.81,
    n_competitors: 2189,
    recommended_tier: "Mid",
    seller_share: "20.4%",
    entry_price_range: { p25: 75000, median: 145000, p75: 320000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.44,
        is_gap: false,
        price_range: { p25: 12000, median: 32000, p75: 68000 },
      },
      {
        tier: "Mid",
        gap_share: 0.2,
        is_gap: true,
        price_range: { p25: 75000, median: 145000, p75: 320000 },
      },
      {
        tier: "Premium",
        gap_share: 0.36,
        is_gap: false,
        price_range: { p25: 380000, median: 720000, p75: 2000000 },
      },
    ],
  },
  Health: {
    category: "Health",
    confidence: 0.89,
    n_competitors: 2947,
    recommended_tier: "Budget",
    seller_share: "23.5%",
    entry_price_range: { p25: 25000, median: 55000, p75: 110000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.24,
        is_gap: true,
        price_range: { p25: 25000, median: 55000, p75: 110000 },
      },
      {
        tier: "Mid",
        gap_share: 0.38,
        is_gap: false,
        price_range: { p25: 130000, median: 280000, p75: 520000 },
      },
      {
        tier: "Premium",
        gap_share: 0.38,
        is_gap: false,
        price_range: { p25: 600000, median: 1100000, p75: 3500000 },
      },
    ],
  },
  "Office & Stationery": {
    category: "Office & Stationery",
    confidence: 0.77,
    n_competitors: 1567,
    recommended_tier: "Mid",
    seller_share: "17.9%",
    entry_price_range: { p25: 45000, median: 95000, p75: 210000 },
    all_tiers: [
      {
        tier: "Budget",
        gap_share: 0.46,
        is_gap: false,
        price_range: { p25: 8000, median: 22000, p75: 42000 },
      },
      {
        tier: "Mid",
        gap_share: 0.18,
        is_gap: true,
        price_range: { p25: 45000, median: 95000, p75: 210000 },
      },
      {
        tier: "Premium",
        gap_share: 0.36,
        is_gap: false,
        price_range: { p25: 250000, median: 480000, p75: 1200000 },
      },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectCategoryFromText(text: string): Category | null {
  const lower = text.toLowerCase();
  const keywords: [Category, string[]][] = [
    ["Fashion", ["baju", "celana", "sepatu", "fashion", "kaos", "kemeja", "dress", "rok"]],
    ["Electronics", ["hp", "laptop", "elektronik", "charger", "kabel", "baterai", "headset"]],
    ["Sports", ["lari", "gym", "olahraga", "sport", "sepatu lari", "jersey", "raket", "dumbbell"]],
    ["Automotive", ["motor", "mobil", "ban", "oli", "helm", "sparepart", "otomotif"]],
    ["Beauty", ["skincare", "makeup", "serum", "lipstik", "cream", "kecantikan", "parfum"]],
    ["Home & Living", ["kursi", "meja", "lampu", "dekorasi", "kasur", "furniture", "karpet"]],
    ["Books", ["buku", "novel", "majalah", "komik", "textbook"]],
    ["Food & Beverage", ["makanan", "minuman", "snack", "kopi", "teh", "cemilan", "food"]],
    ["Toys", ["mainan", "toy", "boneka", "lego", "action figure"]],
    ["Health", ["vitamin", "suplemen", "obat", "masker", "kesehatan", "herbal"]],
    ["Office & Stationery", ["alat tulis", "pulpen", "buku tulis", "stationery", "kertas"]],
  ];
  for (const [cat, words] of keywords) {
    if (words.some((w) => lower.includes(w))) return cat;
  }
  return null;
}

// ── API functions (dummy-first, swap to real when BE is ready) ────────────────

const USE_DUMMY = true;

export async function analyzeMarketEntry(
  productText: string
): Promise<MarketEntryResponse> {
  if (USE_DUMMY) {
    await new Promise((r) => setTimeout(r, 1200));
    const detected = detectCategoryFromText(productText);
    if (!detected) {
      return {
        status: "low_confidence",
        message: "Deskripsi terlalu umum — pilih kategori secara manual",
        top_categories: [
          { category: "Fashion", score: 0.31 },
          { category: "Sports", score: 0.28 },
          { category: "Beauty", score: 0.18 },
        ],
      };
    }
    return DUMMY_RESULTS[detected];
  }

  const res = await api.post("/api/v1/market-entry/analyze", {
    product_text: productText,
  });
  return res.data.data;
}

export async function getMarketEntryByCategory(
  category: string
): Promise<MarketEntryResult> {
  if (USE_DUMMY) {
    await new Promise((r) => setTimeout(r, 900));
    return DUMMY_RESULTS[category] ?? DUMMY_RESULTS["Sports"];
  }

  const res = await api.post("/api/v1/market-entry/analyze", {
    product_text: category,
  });
  return res.data.data;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}k`;
  return `Rp ${amount}`;
}

export function formatPriceRange(range: PriceRange): string {
  return `${formatRupiah(range.p25)} – ${formatRupiah(range.p75)}`;
}
