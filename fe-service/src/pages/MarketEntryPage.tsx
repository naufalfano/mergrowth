import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Search,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import {
  CATEGORIES,
  analyzeMarketEntry,
  getMarketEntryByCategory,
  formatRupiah,
  formatPriceRange,
  type MarketEntryResult,
  type LowConfidenceResult,
  type Category,
} from "@/lib/marketEntry";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;
type InputMode = "dropdown" | "text";

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

// ── Step indicator ─────────────────────────────────────────────────────────────

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

// ── Bar chart for tier landscape ───────────────────────────────────────────────

function TierBar({
  tier,
  gapShare,
  isGap,
  priceRange,
  animate,
}: {
  tier: string;
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
        isGap
          ? "bg-blue-50 border-blue-300 shadow-md"
          : "bg-white border-slate-100"
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
        <span>{pct}% seller share</span>
        {isGap && <span className="text-blue-600 font-medium">Lowest competition</span>}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MarketEntryPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [inputMode, setInputMode] = useState<InputMode>("dropdown");
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [productText, setProductText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketEntryResult | null>(null);
  const [lowConf, setLowConf] = useState<LowConfidenceResult | null>(null);
  const [barsAnimated, setBarsAnimated] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleAnalyze() {
    setLoading(true);
    setLowConf(null);
    try {
      if (inputMode === "dropdown") {
        const data = await getMarketEntryByCategory(selectedCategory);
        setResult(data);
        goToStep(2);
      } else {
        const data = await analyzeMarketEntry(productText);
        if ("status" in data && data.status === "low_confidence") {
          setLowConf(data);
        } else {
          setResult(data as MarketEntryResult);
          goToStep(2);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function handlePickSuggestion(category: string) {
    setLowConf(null);
    setInputMode("dropdown");
    setSelectedCategory(category as Category);
  }

  async function handleConfirmSuggestion() {
    setLoading(true);
    try {
      const data = await getMarketEntryByCategory(selectedCategory);
      setResult(data);
      goToStep(2);
    } finally {
      setLoading(false);
    }
  }

  function goToStep(s: Step) {
    setStep(s);
    if (s === 2) {
      setTimeout(() => setBarsAnimated(true), 100);
    }
  }

  function reset() {
    setStep(1);
    setResult(null);
    setLowConf(null);
    setProductText("");
    setSelectedCategory(CATEGORIES[0]);
    setBarsAnimated(false);
  }

  const gapTier = result?.all_tiers.find((t) => t.is_gap);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">

        {/* Back nav */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-100 rounded-[32px] p-10 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
              Market Entry Analysis
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            Find your market gap.
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            Segment competitor listings by price tier and discover where competition is lowest.
          </p>
        </div>

        {/* Stepper */}
        <Stepper current={step} />

        {/* ── Step 1: Input ── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              What are you selling?
            </h2>
            <p className="text-slate-500 mb-6">
              Pick a category directly or describe your product and we'll detect it.
            </p>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
              <button
                onClick={() => setInputMode("dropdown")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  inputMode === "dropdown"
                    ? "bg-white shadow text-slate-900"
                    : "text-slate-500"
                }`}
              >
                Pick Category
              </button>
              <button
                onClick={() => setInputMode("text")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  inputMode === "text"
                    ? "bg-white shadow text-slate-900"
                    : "text-slate-500"
                }`}
              >
                Describe Product
              </button>
            </div>

            {/* Dropdown mode */}
            {inputMode === "dropdown" && (
              <div className="relative mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 appearance-none bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
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
                        selectedCategory === s.category
                          ? "bg-[#2D4FE5] text-white border-[#2D4FE5]"
                          : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
                      }`}
                    >
                      {s.category}{" "}
                      <span className="opacity-60">
                        {(s.score * 100).toFixed(0)}%
                      </span>
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
              disabled={loading || (inputMode === "text" && !productText.trim())}
              className="flex items-center gap-2 bg-[#2D4FE5] hover:bg-[#2444d0] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  {inputMode === "text" ? <Search size={16} /> : <ArrowRight size={16} />}
                  {inputMode === "text" ? "Detect & Analyze" : "Analyze Market"}
                </>
              )}
            </button>

          </div>
        )}

        {/* ── Step 2: Tier Landscape ── */}
        {step === 2 && result && (
          <div className="space-y-6">

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {result.category} Market Landscape
                </h2>
                <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                  {result.n_competitors.toLocaleString()} competitors
                </span>
              </div>
              <p className="text-slate-500 mb-8">
                Price tiers ranked by seller share. A smaller share means fewer sellers — lower competition.
              </p>

              <div className="space-y-3">
                {result.all_tiers.map((tier) => (
                  <TierBar
                    key={tier.tier}
                    tier={tier.tier}
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

        {/* ── Step 3: Gap Highlight ── */}
        {step === 3 && result && gapTier && (
          <div className="space-y-6">

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <Target size={20} className="text-[#2D4FE5]" />
                <span className="text-[#2D4FE5] font-semibold text-sm uppercase tracking-wide">
                  Opportunity Found
                </span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                The <span className="text-[#2D4FE5]">{gapTier.tier} tier</span> is underserved
              </h2>
              <p className="text-slate-500 mb-8">
                Only {(gapTier.gap_share * 100).toFixed(1)}% of sellers compete here — the lowest in {result.category}.
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
                      {formatRupiah(result.entry_price_range.p25)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center border-2 border-blue-200">
                    <p className="text-xs text-slate-400 mb-1">Median</p>
                    <p className="text-lg font-bold text-[#2D4FE5]">
                      {formatRupiah(result.entry_price_range.median)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">Upper (P75)</p>
                    <p className="text-lg font-bold text-slate-800">
                      {formatRupiah(result.entry_price_range.p75)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Context stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {result.n_competitors.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Total Competitors</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {(gapTier.gap_share * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Sellers in Gap Tier</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {(result.confidence * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Detection Confidence</p>
                </div>
              </div>

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

        {/* ── Step 4: CTA ── */}
        {step === 4 && result && gapTier && (
          <div className="space-y-6">

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <Zap size={20} className="text-[#2D4FE5]" />
                <span className="text-[#2D4FE5] font-semibold text-sm uppercase tracking-wide">
                  Your Strategy
                </span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Enter at the{" "}
                <span className={`${TIER_LIGHT[gapTier.tier] ?? ""} px-2 py-0.5 rounded-lg border`}>
                  {gapTier.tier}
                </span>{" "}
                tier
              </h2>
              <p className="text-slate-500 mb-8">
                Compete in <strong>{result.category}</strong> with the lowest seller density.
              </p>

              {/* Main CTA card */}
              <div className="bg-gradient-to-br from-[#2D4FE5] to-indigo-600 rounded-2xl p-8 text-white mb-6">
                <p className="text-blue-200 text-sm mb-2">Recommended entry price range</p>
                <p className="text-4xl font-bold mb-1">
                  {formatRupiah(result.entry_price_range.p25)}{" "}
                  <span className="text-blue-300">–</span>{" "}
                  {formatRupiah(result.entry_price_range.p75)}
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  Median market price: {formatRupiah(result.entry_price_range.median)}
                </p>

                <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-200">Category</p>
                    <p className="font-semibold">{result.category}</p>
                  </div>
                  <div>
                    <p className="text-blue-200">Recommended Tier</p>
                    <p className="font-semibold">{result.recommended_tier}</p>
                  </div>
                  <div>
                    <p className="text-blue-200">Competitors in Tier</p>
                    <p className="font-semibold">
                      ~{Math.round(result.n_competitors * gapTier.gap_share).toLocaleString()} sellers
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-200">Seller Share</p>
                    <p className="font-semibold">{result.seller_share}</p>
                  </div>
                </div>
              </div>

              {/* Tier comparison chips */}
              <div className="mb-2">
                <p className="text-sm font-medium text-slate-600 mb-3">All price tiers:</p>
                <div className="flex flex-wrap gap-2">
                  {result.all_tiers.map((tier) => (
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

            </div>

            <div className="flex justify-between">
              <button
                onClick={reset}
                className="flex items-center gap-2 border border-slate-200 hover:border-slate-400 px-5 py-3 rounded-xl text-slate-600 transition"
              >
                <ArrowLeft size={16} /> Analyze Another
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition"
              >
                Back to Dashboard
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
