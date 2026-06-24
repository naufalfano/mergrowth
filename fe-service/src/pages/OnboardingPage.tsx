import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

import {
  CATEGORIES,
  getMarketEntryByCategory,
  formatRupiah,
  type MarketEntryResult,
  type Category,
} from "@/lib/marketEntry";
import { completeOnboarding, getUser } from "@/lib/auth";
import { createShop } from "@/lib/shop";

// ── Provinces ─────────────────────────────────────────────────────────────────

const PROVINCES = [
  "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Banten",
  "Bali", "Yogyakarta", "Sumatera Utara", "Sumatera Selatan", "Sumatera Barat",
  "Riau", "Kepulauan Riau", "Lampung", "Aceh", "Jambi",
  "Kalimantan Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah",
  "Sulawesi Selatan", "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Tenggara",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat", "Maluku",
];

const STEPS = ["Shop Identity", "Shop Category", "Market Analysis", "First Product"];

// ── Province combobox ─────────────────────────────────────────────────────────

function ProvinceCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? PROVINCES.filter((p) => p.toLowerCase().includes(query.toLowerCase()))
    : PROVINCES;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        if (!value) setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [value]);

  function select(province: string) {
    onChange(province);
    setQuery(province);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={open ? query : (value || query)}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange("");
          }}
          placeholder="Search province..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
        />
        <ChevronDown
          size={15}
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto py-1">
          {filtered.map((p) => (
            <li
              key={p}
              onMouseDown={() => select(p)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                p === value
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
          <p className="text-sm text-gray-400">No province found.</p>
        </div>
      )}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex gap-2 mb-12">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className={`h-[3px] flex-1 rounded-full transition-all duration-500 ${
            i < current ? "bg-green-500" : i === current ? "bg-blue-600" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ── Nav row ───────────────────────────────────────────────────────────────────

function NavRow({
  onBack,
  onContinue,
  onSkip,
  continueLabel = "Continue",
  continueDisabled = false,
  loading = false,
  showBack = true,
}: {
  onBack?: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  loading?: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
      <div className="flex flex-col gap-1">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        {onSkip && (
          <button
            onClick={onSkip}
            className="text-sm text-gray-400 hover:text-gray-600 transition text-left"
          >
            Skip setup
          </button>
        )}
      </div>
      <button
        onClick={onContinue}
        disabled={continueDisabled || loading}
        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white text-sm font-semibold px-6 py-3 rounded-full transition"
      >
        {loading ? "Please wait..." : continueLabel}
        {!loading && <ArrowRight size={14} />}
      </button>
    </div>
  );
}

// ── Chip ─────────────────────────────────────────────────────────────────────

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
        active
          ? "border-blue-600 text-blue-600 bg-blue-50 font-medium"
          : "border-gray-200 text-gray-600 bg-white hover:border-gray-400 hover:text-gray-800"
      }`}
    >
      {label}
    </button>
  );
}

// ── Right-panel illustration ──────────────────────────────────────────────────

function MarketIllustration() {
  const tiers = [
    { label: "Budget", pct: 41, active: false },
    { label: "Mid",    pct: 9,  active: true  },
    { label: "Premium",pct: 60, active: false },
  ];

  return (
    <div className="w-full max-w-[272px]">

      {/* Single unified intelligence card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_40px_-8px_rgba(59,130,246,0.18)] border border-blue-50">

        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Market Intel
              </span>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">
              Fashion
            </span>
          </div>

          <p className="text-2xl font-bold text-gray-900 leading-none">Mid Tier</p>
          <p className="text-xs text-gray-400 mt-1.5">Best entry opportunity detected</p>
        </div>

        {/* Tier bars */}
        <div className="px-6 pb-5 flex flex-col gap-2.5">
          {tiers.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <span className={`text-[11px] w-14 shrink-0 ${t.active ? "font-bold text-gray-900" : "text-gray-400"}`}>
                {t.label}
              </span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${t.active ? "bg-blue-500" : "bg-gray-200"}`}
                  style={{ width: `${t.pct}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 w-5 text-right">{t.pct}%</span>
              {t.active && (
                <span className="text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  GAP
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Bottom stats row */}
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {[
            { value: "Rp 59K", sub: "Entry price" },
            { value: "9.2%",   sub: "Gap share",   accent: true },
            { value: "159",    sub: "Shops here" },
          ].map(({ value, sub, accent }) => (
            <div key={sub} className="py-4 text-center">
              <p className={`text-sm font-bold ${accent ? "text-blue-600" : "text-gray-900"}`}>{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating pill below card */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-1.5 bg-blue-500 text-white text-[11px] font-semibold px-4 py-2 rounded-full shadow-md shadow-blue-200">
          <span className="text-blue-200">↑</span> Low competition window
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = getUser();

  const [step, setStep] = useState(0);

  // Step 0
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");

  // Step 1
  const [category, setCategory] = useState<Category | null>(null);
  const [isOther, setIsOther] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const shopCategory = isOther ? customCategory.trim() : (category ?? "");

  // Step 2
  const [marketResult, setMarketResult] = useState<MarketEntryResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Finishing
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (step === 2 && category && !isOther && !marketResult) {
      setAnalysisLoading(true);
      getMarketEntryByCategory(category)
        .then(setMarketResult)
        .finally(() => setAnalysisLoading(false));
    }
  }, [step]);

  async function saveAndFinish(destination = "/dashboard") {
    setFinishing(true);
    try {
      await createShop(shopName.trim(), location, shopCategory);
      await completeOnboarding();
      navigate(destination);
    } catch {
      setFinishing(false);
    }
  }

  async function handleSkip() {
    setFinishing(true);
    try {
      if (shopName.trim() && location && shopCategory) {
        await createShop(shopName.trim(), location, shopCategory);
      }
      await completeOnboarding();
    } finally {
      navigate("/dashboard");
    }
  }

  const gapTier = marketResult?.all_tiers.find((t) => t.is_gap);

  return (
    <div className="min-h-screen flex">

      {/* ── Left: form panel ── */}
      <div className="w-full lg:w-[50%] bg-white flex flex-col px-10 lg:px-16 pt-10 pb-12 overflow-y-auto">

        {/* Logo */}
        <img
          src="/logo.png"
          alt="mergrowth"
          className="h-8 w-auto object-contain object-left mb-14"
        />

        {/* Progress */}
        <ProgressBar current={step} />

        {/* ── Step 0: Shop Identity ── */}
        {step === 0 && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tell us about your shop
            </h1>
            <p className="text-sm text-gray-400 mb-10">
              Hi{user?.full_name ? ` ${user.full_name.split(" ")[0]}` : ""}! Let's set up your shop
              profile so we can personalise your experience.
            </p>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop name
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Toko Maju Jaya"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <ProvinceCombobox value={location} onChange={setLocation} />
              </div>
            </div>

            <NavRow
              showBack={false}
              onContinue={() => setStep(1)}
              onSkip={handleSkip}
              continueDisabled={!shopName.trim() || !location}
            />
          </div>
        )}

        {/* ── Step 1: Category ── */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              What do you sell?
            </h1>
            <p className="text-sm text-gray-400 mb-8">
              Pick the category that best describes your shop.
            </p>

            <p className="text-sm font-medium text-gray-700 mb-3">
              Select your main category
            </p>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  active={!isOther && category === cat}
                  onClick={() => {
                    setCategory(cat);
                    setIsOther(false);
                    setMarketResult(null);
                  }}
                />
              ))}
              <Chip
                label="Other"
                active={isOther}
                onClick={() => {
                  setIsOther(true);
                  setCategory(null);
                  setMarketResult(null);
                }}
              />
            </div>

            {isOther && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Handmade Crafts, Wedding Supplies..."
                className="mt-4 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                autoFocus
              />
            )}

            {!category && !isOther && (
              <p className="text-xs text-gray-400 mt-4">
                Select one category to continue.
              </p>
            )}

            <NavRow
              onBack={() => setStep(0)}
              onContinue={() => setStep(2)}
              continueDisabled={isOther ? !customCategory.trim() : !category}
            />
          </div>
        )}

        {/* ── Step 2: Market Analysis ── */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Your market opportunity
            </h1>
            <p className="text-sm text-gray-400 mb-5">
              {isOther ? (
                <>Insights for <span className="font-medium text-gray-700">{customCategory}</span>.</>
              ) : (
                <>Where competition is lowest in <span className="font-medium text-gray-700">{category}</span>.</>
              )}
            </p>

            {isOther && (
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  No market data for custom categories
                </p>
                <p className="text-xs text-gray-400">
                  Market analysis is only available for standard categories. Explore the full tool from your dashboard.
                </p>
              </div>
            )}

            {!isOther && analysisLoading && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Analysing market data...</p>
              </div>
            )}

            {!isOther && !analysisLoading && marketResult && gapTier && (
              <div className="flex flex-col gap-3">

                {/* Insight card */}
                <div className="rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium">Best entry opportunity</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{gapTier.tier} Tier</p>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-sm font-bold text-gray-900">{formatRupiah(marketResult.entry_price_range.p25)}</span>
                          <span className="text-gray-300 text-xs">→</span>
                          <span className="text-sm font-bold text-blue-600">{formatRupiah(marketResult.entry_price_range.median)}</span>
                          <span className="text-gray-300 text-xs">→</span>
                          <span className="text-sm font-bold text-gray-900">{formatRupiah(marketResult.entry_price_range.p75)}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Entry · Median · Upper</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-[11px] text-blue-600 bg-blue-100 font-semibold px-2.5 py-1 rounded-full">
                          {(gapTier.gap_share * 100).toFixed(1)}% sellers here
                        </span>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-2">↓ Low competition</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 border-t border-gray-200 divide-x divide-gray-200 bg-white">
                    {[
                      { value: marketResult.n_competitors.toLocaleString(), label: "Total listings", accent: false },
                      { value: gapTier.shop_count.toLocaleString(),         label: "Shops in gap",   accent: false },
                      { value: marketResult.seller_share,                    label: "Seller share",   accent: true  },
                    ].map(({ value, label, accent }) => (
                      <div key={label} className="py-3 text-center">
                        <p className={`text-sm font-bold ${accent ? "text-blue-600" : "text-gray-900"}`}>{value}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All tiers */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Competition by tier</p>
                  <div className="flex flex-col gap-1.5">
                    {marketResult.all_tiers.map((tier) => (
                      <div key={tier.tier} className="flex items-center gap-3">
                        <span className={`text-xs w-16 shrink-0 ${tier.is_gap ? "font-bold text-gray-900" : "text-gray-400"}`}>
                          {tier.tier}
                        </span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${tier.is_gap ? "bg-blue-600" : "bg-gray-300"}`}
                            style={{ width: `${Math.round(tier.gap_share * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-gray-400 w-7 text-right">{Math.round(tier.gap_share * 100)}%</span>
                        {tier.is_gap && (
                          <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full">GAP</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isOther && !analysisLoading && !marketResult && (
              <p className="text-sm text-gray-400 py-6 text-center">
                Failed to load market data. You can continue anyway.
              </p>
            )}

            <NavRow
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
              continueDisabled={!isOther && analysisLoading}
            />
          </div>
        )}

        {/* ── Step 3: First Product ── */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Add your first product
            </h1>
            <p className="text-sm text-gray-400 mb-10">
              Start building your catalogue. You can always add more later.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => saveAndFinish("/products")}
                disabled={finishing}
                className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white rounded-2xl px-6 py-5 transition group"
              >
                <div className="text-left">
                  <p className="font-semibold">Add a product</p>
                  <p className="text-xs text-gray-400 mt-0.5">Fill in your product details now</p>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                onClick={() => saveAndFinish()}
                disabled={finishing}
                className="w-full flex items-center justify-between bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 rounded-2xl border border-gray-200 px-6 py-5 transition group"
              >
                <div className="text-left">
                  <p className="font-semibold">Skip for now</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Go to your dashboard and add products later
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-gray-400 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {finishing && (
              <p className="text-xs text-gray-400 text-center mt-6 animate-pulse">
                Setting up your account...
              </p>
            )}

            <div className="mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: illustration panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 items-center justify-center p-14 relative overflow-hidden">
        {/* Ambient glow shapes */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-100/50 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-blue-50/80 blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/60" />

        <div className="relative z-10">
          <MarketIllustration />
        </div>
      </div>
    </div>
  );
}
