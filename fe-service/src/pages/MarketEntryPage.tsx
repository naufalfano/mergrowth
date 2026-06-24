import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Store,
} from "lucide-react";
import {
  CATEGORIES,
  analyzeMarketEntry,
  analyzeMultipleCategories,
  formatRupiah,
  formatPriceRange,
  type MarketEntryResult,
  type LowConfidenceResult,
  type Category,
} from "@/lib/marketEntry";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;
type InputMode = "chips" | "text";

const TIER_COLORS: Record<string, string> = {
  Budget: "bg-amber-400",
  "Mid-Low": "bg-blue-400",
  Mid: "bg-blue-500",
  "Mid-High": "bg-indigo-500",
  Premium: "bg-violet-500",
};

const TIER_LIGHT: Record<string, string> = {
  Budget: "bg-amber-50 border-amber-200 text-amber-700",
  "Mid-Low": "bg-blue-50 border-blue-200 text-blue-700",
  Mid: "bg-blue-50 border-blue-200 text-blue-700",
  "Mid-High": "bg-indigo-50 border-indigo-200 text-indigo-700",
  Premium: "bg-violet-50 border-violet-200 text-violet-700",
};

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: Step }) {
  const steps = ["Input", "Landscape", "Gap", "Strategy"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  done
                    ? "bg-[#2D4FE5] text-white"
                    : active
                    ? "bg-[#2D4FE5] text-white ring-4 ring-blue-100"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {done ? "✓" : idx}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  active ? "text-[#2D4FE5]" : done ? "text-slate-500" : "text-slate-300"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 mx-1 mb-5 transition-all ${
                  done ? "bg-[#2D4FE5]" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Tier bar (single-category landscape) ──────────────────────────────────────

function TierBar({
  tier,
  shopCount,
  gapShare,
  isGap,
  priceRange,
  animate,
}: {
  tier: string;
  shopCount: number;
  gapShare: number;
  isGap: boolean;
  priceRange: { p25: number; median: number; p75: number };
  animate: boolean;
}) {
  const barColor = isGap ? "bg-[#2D4FE5]" : (TIER_COLORS[tier] ?? "bg-slate-400");
  const pct = Math.round(gapShare * 100);

  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        isGap ? "bg-blue-50 border-blue-300 shadow-md" : "bg-white border-slate-100"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{tier}</span>
          {isGap && (
            <span className="bg-[#2D4FE5] text-white text-xs px-2 py-0.5 rounded-full font-medium">
              GAP
            </span>
          )}
        </div>
        <span className="text-sm text-slate-500">{formatPriceRange(priceRange)}</span>
      </div>

      <div className="h-7 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: animate ? `${pct}%` : "0%" }}
        />
      </div>

      <div className="flex justify-between mt-2 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <Store size={13} />
          {shopCount.toLocaleString()} shops ({pct}%)
        </span>
        {isGap && <span className="text-blue-600 font-medium">Lowest competition</span>}
      </div>
    </div>
  );
}

// ── Rank card (multi-category comparison) ─────────────────────────────────────

function RankCard({
  result,
  rank,
  selected,
  onSelect,
}: {
  result: MarketEntryResult;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const gap = result.all_tiers.find((t) => t.is_gap);
  const pct = gap ? Math.round(gap.gap_share * 100) : 0;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border p-5 transition-all ${
        selected
          ? "border-[#2D4FE5] bg-blue-50 shadow-md ring-2 ring-blue-200"
          : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Rank badge */}
        <div
          className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
            rank === 1
              ? "bg-[#2D4FE5] text-white"
              : rank === 2
              ? "bg-indigo-100 text-indigo-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {rank}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-900 text-base">{result.category}</span>
            {rank === 1 && (
              <span className="bg-[#2D4FE5] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                BEST
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
            <span>
              Gap tier:{" "}
              <span className="font-medium text-slate-700">{gap?.tier ?? "—"}</span>
            </span>
            <span className="flex items-center gap-1">
              <Store size={12} />
              {gap?.shop_count.toLocaleString() ?? "—"} shops ({pct}%)
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Entry price:</span>
            <span className="font-semibold text-slate-800">
              {formatPriceRange(result.entry_price_range)}
            </span>
          </div>
        </div>

        {/* Selection indicator */}
        <div
          className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            selected ? "bg-[#2D4FE5] border-[#2D4FE5]" : "border-slate-300"
          }`}
        >
          {selected && <Check size={11} className="text-white" />}
        </div>
      </div>

      {/* Seller share mini bar */}
      <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            rank === 1 ? "bg-[#2D4FE5]" : "bg-slate-300"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">{pct}% of shops compete here</p>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MarketEntryPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [inputMode, setInputMode] = useState<InputMode>("chips");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [productText, setProductText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MarketEntryResult[]>([]);
  const [focusedResult, setFocusedResult] = useState<MarketEntryResult | null>(null);
  const [lowConf, setLowConf] = useState<LowConfidenceResult | null>(null);
  const [barsAnimated, setBarsAnimated] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleAnalyze() {
    setLoading(true);
    setLowConf(null);
    try {
      if (inputMode === "chips") {
        const data = await analyzeMultipleCategories(selectedCategories);
        setResults(data);
        setFocusedResult(data[0]);
        goToStep(2);
      } else {
        const data = await analyzeMarketEntry(productText);
        if ("status" in data && data.status === "low_confidence") {
          setLowConf(data);
        } else {
          const r = data as MarketEntryResult;
          setResults([r]);
          setFocusedResult(r);
          goToStep(2);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function handlePickSuggestion(category: string) {
    setLowConf(null);
    setInputMode("chips");
    setSelectedCategories([category as Category]);
  }

  async function handleConfirmSuggestion() {
    setLoading(true);
    try {
      const data = await analyzeMultipleCategories(selectedCategories);
      setResults(data);
      setFocusedResult(data[0]);
      goToStep(2);
    } finally {
      setLoading(false);
    }
  }

  function goToStep(s: Step) {
    setStep(s);
    if (s === 2) setTimeout(() => setBarsAnimated(true), 100);
  }

  function reset() {
    setStep(1);
    setResults([]);
    setFocusedResult(null);
    setLowConf(null);
    setProductText("");
    setSelectedCategories([]);
    setBarsAnimated(false);
  }

  const isMulti = results.length > 1;
  const gapTier = focusedResult?.all_tiers.find((t) => t.is_gap);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">

        {/* Back nav */}
        <button
          onClick={() => navigate("/market-entry")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition"
        >
          <ArrowLeft size={16} />
          Market Entry
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-100 rounded-[32px] p-10 mb-10 flex items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
                Market Entry Analysis
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Find your market gap.</h1>
            <p className="text-slate-500 mt-3 text-lg">
              Segment competitor listings by price tier and discover where competition is lowest.
            </p>
          </div>
          <div className="shrink-0 w-56 h-36 hidden md:block opacity-90">
            <svg viewBox="0 0 220 140" fill="none" className="w-full h-full">
              <line x1="20" y1="20" x2="210" y2="20" stroke="#dbeafe" strokeWidth="1" />
              <line x1="20" y1="50" x2="210" y2="50" stroke="#dbeafe" strokeWidth="1" />
              <line x1="20" y1="80" x2="210" y2="80" stroke="#dbeafe" strokeWidth="1" />
              <line x1="20" y1="110" x2="210" y2="110" stroke="#dbeafe" strokeWidth="1" />
              <rect x="25" y="85" width="28" height="25" rx="4" fill="#bfdbfe" />
              <rect x="62" y="65" width="28" height="45" rx="4" fill="#93c5fd" />
              <rect x="99" y="22" width="28" height="88" rx="4" fill="#2563eb" />
              <rect x="136" y="70" width="28" height="40" rx="4" fill="#93c5fd" />
              <rect x="173" y="92" width="28" height="18" rx="4" fill="#bfdbfe" />
              <rect x="94" y="10" width="38" height="13" rx="3.5" fill="#1d4ed8" />
              <text x="113" y="20" fontSize="7" fill="white" textAnchor="middle" fontWeight="700">GAP</text>
              <text x="39" y="126" fontSize="6" fill="#93c5fd" textAnchor="middle">Budget</text>
              <text x="76" y="126" fontSize="6" fill="#93c5fd" textAnchor="middle">Low</text>
              <text x="113" y="126" fontSize="6" fill="#1d4ed8" textAnchor="middle" fontWeight="700">Mid</text>
              <text x="150" y="126" fontSize="6" fill="#93c5fd" textAnchor="middle">High</text>
              <text x="187" y="126" fontSize="6" fill="#93c5fd" textAnchor="middle">Premium</text>
            </svg>
          </div>
        </div>

        {/* Stepper */}
        <Stepper current={step} />

        {/* ── Step 1: Input ── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">What are you selling?</h2>
            <p className="text-slate-500 mb-6">
              Pick one or more categories, or describe your product and we'll detect it.
            </p>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
              <button
                onClick={() => setInputMode("chips")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  inputMode === "chips" ? "bg-white shadow text-slate-900" : "text-slate-500"
                }`}
              >
                Pick Category
              </button>
              <button
                onClick={() => setInputMode("text")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  inputMode === "text" ? "bg-white shadow text-slate-900" : "text-slate-500"
                }`}
              >
                Describe Product
              </button>
            </div>

            {/* Chip multi-select */}
            {inputMode === "chips" && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700">
                    Product Categories
                  </label>
                  {selectedCategories.length > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      {selectedCategories.length} selected
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          active
                            ? "bg-[#2D4FE5] border-[#2D4FE5] text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                        }`}
                      >
                        {active && <Check size={12} />}
                        {cat}
                      </button>
                    );
                  })}
                </div>
                {selectedCategories.length === 0 && (
                  <p className="text-xs text-slate-400 mt-3">Select at least one category.</p>
                )}
                {selectedCategories.length > 1 && (
                  <p className="text-xs text-slate-400 mt-3">
                    Results will be ranked by lowest competition — easiest opportunity first.
                  </p>
                )}
              </div>
            )}

            {/* Text mode */}
            {inputMode === "text" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Description
                </label>
                <textarea
                  value={productText}
                  onChange={(e) => setProductText(e.target.value)}
                  placeholder="e.g. sepatu lari pria nike, baju batik wanita premium..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Use Indonesian product keywords for best detection accuracy.
                </p>
              </div>
            )}

            {/* Low confidence fallback */}
            {lowConf && (
              <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-5">
                <p className="text-amber-800 font-medium mb-1">Category not detected</p>
                <p className="text-amber-700 text-sm mb-4">{lowConf.message}</p>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Top suggestions — pick one to continue:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {lowConf.top_categories.map((s) => (
                    <button
                      key={s.category}
                      onClick={() => handlePickSuggestion(s.category)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                        selectedCategories.includes(s.category as Category)
                          ? "bg-[#2D4FE5] text-white border-[#2D4FE5]"
                          : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                      }`}
                    >
                      {s.category}{" "}
                      <span className="opacity-60">{(s.score * 100).toFixed(0)}%</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleConfirmSuggestion}
                  disabled={loading}
                  className="bg-[#2D4FE5] hover:bg-[#2444d0] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  {loading ? "Analyzing..." : "Use Selected Category"}
                </button>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={
                loading ||
                (inputMode === "chips" && selectedCategories.length === 0) ||
                (inputMode === "text" && !productText.trim())
              }
              className="flex items-center gap-2 bg-[#2D4FE5] hover:bg-[#2444d0] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  {inputMode === "text" ? <Search size={16} /> : <ArrowRight size={16} />}
                  {inputMode === "text"
                    ? "Detect & Analyze"
                    : selectedCategories.length > 1
                    ? `Analyze ${selectedCategories.length} Categories`
                    : "Analyze Market"}
                </>
              )}
            </button>
          </div>
        )}

        {/* ── Step 2a: Single-category tier landscape ── */}
        {step === 2 && !isMulti && focusedResult && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {focusedResult.category} Market Landscape
                </h2>
                <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                  {focusedResult.n_competitors.toLocaleString()} listings
                </span>
              </div>
              <p className="text-slate-500 mb-8">
                Price tiers ranked by seller share. Smaller share means fewer sellers — lower competition.
              </p>
              <div className="space-y-3">
                {focusedResult.all_tiers.map((tier) => (
                  <TierBar
                    key={tier.tier}
                    tier={tier.tier}
                    shopCount={tier.shop_count}
                    gapShare={tier.gap_share}
                    isGap={tier.is_gap}
                    priceRange={tier.price_range}
                    animate={barsAnimated}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 border border-slate-200 hover:border-slate-400 px-5 py-3 rounded-xl text-slate-600 transition"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => goToStep(3)}
                className="flex items-center gap-2 bg-[#2D4FE5] hover:bg-[#2444d0] text-white px-6 py-3 rounded-xl font-medium transition"
              >
                See Gap Analysis <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2b: Multi-category ranked comparison ── */}
        {step === 2 && isMulti && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Category Comparison
              </h2>
              <p className="text-slate-500 mb-2">
                Ranked by lowest seller share in the gap tier — #1 is your best opportunity.
              </p>
              <p className="text-xs text-slate-400 mb-8">
                Select a category to explore its gap analysis.
              </p>

              <div className="space-y-3">
                {results.map((r, i) => (
                  <RankCard
                    key={r.category}
                    result={r}
                    rank={i + 1}
                    selected={focusedResult?.category === r.category}
                    onSelect={() => setFocusedResult(r)}
                  />
                ))}
              </div>

              {/* Ranking footnote */}
              <p className="text-xs text-slate-400 mt-6 flex items-center gap-1">
                <ChevronRight size={12} />
                Ranking signal: gap tier seller share (lower % = less competition)
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 border border-slate-200 hover:border-slate-400 px-5 py-3 rounded-xl text-slate-600 transition"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => goToStep(3)}
                disabled={!focusedResult}
                className="flex items-center gap-2 bg-[#2D4FE5] hover:bg-[#2444d0] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition"
              >
                Analyze{" "}
                {focusedResult
                  ? `${focusedResult.category} Gap`
                  : "Selected"}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Gap Highlight ── */}
        {step === 3 && focusedResult && gapTier && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <Target size={20} className="text-[#2D4FE5]" />
                <span className="text-[#2D4FE5] font-semibold text-sm uppercase tracking-wide">
                  Opportunity Found
                </span>
                {isMulti && (
                  <span className="ml-auto text-xs text-slate-400">
                    Showing: {focusedResult.category}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                The <span className="text-[#2D4FE5]">{gapTier.tier} tier</span> is underserved
              </h2>
              <p className="text-slate-500 mb-8">
                Only {(gapTier.gap_share * 100).toFixed(1)}% of sellers compete here — the lowest in{" "}
                {focusedResult.category}.
              </p>

              {/* Gap tier card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-300 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-slate-900">{gapTier.tier} Tier</span>
                  <span className="bg-[#2D4FE5] text-white text-xs font-bold px-3 py-1 rounded-full">
                    RECOMMENDED
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">Entry (P25)</p>
                    <p className="text-lg font-bold text-slate-800">
                      {formatRupiah(focusedResult.entry_price_range.p25)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center border-2 border-blue-200">
                    <p className="text-xs text-slate-400 mb-1">Median</p>
                    <p className="text-lg font-bold text-[#2D4FE5]">
                      {formatRupiah(focusedResult.entry_price_range.median)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">Upper (P75)</p>
                    <p className="text-lg font-bold text-slate-800">
                      {formatRupiah(focusedResult.entry_price_range.p75)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Context stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {focusedResult.n_competitors.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Total Listings</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {gapTier.shop_count.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Shops in Gap Tier</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {(focusedResult.confidence * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Detection Confidence</p>
                </div>
              </div>

              {/* Trend signal (if enriched) */}
              {focusedResult.trend_signal !== undefined && (
                <div
                  className={`mt-4 flex items-center gap-3 rounded-xl px-5 py-3 border ${
                    focusedResult.trend_direction === "rising"
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  {focusedResult.trend_direction === "rising" ? (
                    <TrendingUp size={18} className="text-emerald-600 shrink-0" />
                  ) : (
                    <TrendingDown size={18} className="text-slate-400 shrink-0" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        focusedResult.trend_direction === "rising"
                          ? "text-emerald-700"
                          : "text-slate-600"
                      }`}
                    >
                      Google Trends: {focusedResult.trend_signal}/100 —{" "}
                      {focusedResult.trend_direction === "rising"
                        ? "Rising demand"
                        : "Stable demand"}
                    </p>
                    <p className="text-xs text-slate-400">12-month average, Indonesia</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 border border-slate-200 hover:border-slate-400 px-5 py-3 rounded-xl text-slate-600 transition"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => goToStep(4)}
                className="flex items-center gap-2 bg-[#2D4FE5] hover:bg-[#2444d0] text-white px-6 py-3 rounded-xl font-medium transition"
              >
                Get Your Strategy <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Strategy CTA ── */}
        {step === 4 && focusedResult && gapTier && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <Zap size={20} className="text-[#2D4FE5]" />
                <span className="text-[#2D4FE5] font-semibold text-sm uppercase tracking-wide">
                  Your Strategy
                </span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {focusedResult.recommended_tier ? (
                  <>
                    Enter at the{" "}
                    <span
                      className={`${TIER_LIGHT[gapTier.tier] ?? ""} px-2 py-0.5 rounded-lg border`}
                    >
                      {gapTier.tier}
                    </span>{" "}
                    tier
                  </>
                ) : (
                  "No clear gap tier — all tiers are competitive"
                )}
              </h2>
              <p className="text-slate-500 mb-8">
                Compete in <strong>{focusedResult.category}</strong> with the lowest seller density.
              </p>

              {/* Main CTA card */}
              <div className="bg-gradient-to-br from-[#2D4FE5] to-indigo-600 rounded-2xl p-8 text-white mb-6">
                <p className="text-blue-200 text-sm mb-2">Recommended entry price range</p>
                <p className="text-4xl font-bold mb-1">
                  {formatRupiah(focusedResult.entry_price_range.p25)}{" "}
                  <span className="text-blue-300">–</span>{" "}
                  {formatRupiah(focusedResult.entry_price_range.p75)}
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  Median market price: {formatRupiah(focusedResult.entry_price_range.median)}
                </p>

                <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-200">Category</p>
                    <p className="font-semibold">{focusedResult.category}</p>
                  </div>
                  <div>
                    <p className="text-blue-200">Recommended Tier</p>
                    <p className="font-semibold">{focusedResult.recommended_tier ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-blue-200">Shops in Gap Tier</p>
                    <p className="font-semibold">{gapTier.shop_count.toLocaleString()} shops</p>
                  </div>
                  <div>
                    <p className="text-blue-200">Seller Share</p>
                    <p className="font-semibold">{focusedResult.seller_share}</p>
                  </div>
                  {focusedResult.trend_signal !== undefined && (
                    <div className="col-span-2">
                      <p className="text-blue-200">Google Trends (12-month, ID)</p>
                      <p className="font-semibold flex items-center gap-1.5">
                        {focusedResult.trend_signal}/100
                        {focusedResult.trend_direction === "rising" ? (
                          <TrendingUp size={14} className="text-emerald-300" />
                        ) : (
                          <TrendingDown size={14} className="text-blue-300" />
                        )}
                        <span className="font-normal text-blue-200 capitalize">
                          {focusedResult.trend_direction}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tier comparison chips */}
              <div className="mb-2">
                <p className="text-sm font-medium text-slate-600 mb-3">All price tiers:</p>
                <div className="flex flex-wrap gap-2">
                  {focusedResult.all_tiers.map((tier) => (
                    <div
                      key={tier.tier}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${
                        tier.is_gap
                          ? "bg-blue-50 border-blue-300 text-blue-700 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${TIER_COLORS[tier.tier] ?? "bg-slate-400"}`}
                      />
                      {tier.tier}: {formatPriceRange(tier.price_range)}
                      {tier.is_gap && (
                        <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full ml-1">
                          GAP
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Compare other categories link (multi mode) */}
              {isMulti && results.length > 1 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-3">Other categories you analyzed:</p>
                  <div className="flex flex-wrap gap-2">
                    {results
                      .filter((r) => r.category !== focusedResult.category)
                      .map((r) => {
                        const rGap = r.all_tiers.find((t) => t.is_gap);
                        return (
                          <button
                            key={r.category}
                            onClick={() => {
                              setFocusedResult(r);
                              setStep(3);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm hover:border-blue-300 transition"
                          >
                            {r.category}
                            <span className="text-xs text-slate-400">
                              {rGap ? `${(rGap.gap_share * 100).toFixed(0)}%` : ""}
                            </span>
                            <ChevronRight size={12} className="text-slate-400" />
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={reset}
                className="flex items-center gap-2 border border-slate-200 hover:border-slate-400 px-5 py-3 rounded-xl text-slate-600 transition"
              >
                <ArrowLeft size={16} /> Analyze Another
              </button>
              <button
                onClick={() => navigate("/market-entry")}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition"
              >
                Market Entry
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
