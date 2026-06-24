import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Tag,
  MessageSquare,
  TrendingUp,
  Swords,
  PenLine,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

import {
  ADVISOR_CATEGORIES,
  generateBrandStrategy,
  type AdvisorCategory,
  type BrandAdvisorResult,
} from "@/lib/brandAdvisor";

// ── Loading steps ─────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Fetching market gap data…",
  "Loading competitor review insights…",
  "Composing strategy prompt…",
  "Generating brand recommendations…",
];

function LoadingCard({ step }: { step: number }) {
  return (
    <div className="bg-white rounded-2xl border border-amber-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <Sparkles size={16} className="text-amber-500 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-gray-900">AI is working…</p>
      </div>

      <div className="flex flex-col gap-3">
        {LOADING_STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${
                i < step
                  ? "border-amber-400 bg-amber-400"
                  : i === step
                  ? "border-amber-400 border-t-transparent animate-spin"
                  : "border-gray-200"
              }`}
            >
              {i < step && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span
              className={`text-sm transition-colors ${
                i < step
                  ? "text-gray-400 line-through"
                  : i === step
                  ? "text-gray-900 font-medium"
                  : "text-gray-300"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Result sub-cards ──────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  iconColor = "text-amber-500",
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={15} className={iconColor} />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  );
}

function BrandToneCard({ tone }: { tone: BrandAdvisorResult["brand_tone"] }) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-7">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={15} className="text-amber-500" />
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Brand Tone</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">{tone.archetype}</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-5">{tone.description}</p>

      <div className="flex flex-wrap gap-2">
        {tone.traits.map((trait) => (
          <span
            key={trait}
            className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-semibold rounded-full"
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
}

function PricePositioningCard({ pp }: { pp: BrandAdvisorResult["price_positioning"] }) {
  return (
    <SectionCard icon={TrendingUp} title="Price Positioning" iconColor="text-blue-500">
      <div className="flex items-baseline gap-2 mb-2">
        <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          {pp.recommended_tier}
        </span>
      </div>
      <p className="text-lg font-bold text-gray-900 mb-3">{pp.price_range}</p>
      <p className="text-sm text-gray-500 leading-relaxed">{pp.reasoning}</p>
    </SectionCard>
  );
}

function KeyMessagesCard({ messages }: { messages: string[] }) {
  return (
    <SectionCard icon={MessageSquare} title="Key Messages" iconColor="text-violet-500">
      <div className="flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <ChevronRight size={14} className="text-violet-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">{msg}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function KeywordsCard({ keywords }: { keywords: string[] }) {
  return (
    <SectionCard icon={Tag} title="Keywords to Emphasise" iconColor="text-emerald-500">
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full"
          >
            {kw}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

function CompetitiveStrategyCard({ strategy }: { strategy: string }) {
  return (
    <SectionCard icon={Swords} title="Competitive Strategy" iconColor="text-rose-500">
      <p className="text-sm text-gray-600 leading-relaxed">{strategy}</p>
    </SectionCard>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BrandAdvisorPage() {
  const navigate = useNavigate();

  const [selected, setSelected]   = useState<AdvisorCategory | null>(null);
  const [loading, setLoading]     = useState(false);
  const [loadStep, setLoadStep]   = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const [result, setResult]       = useState<BrandAdvisorResult | null>(null);

  async function generate() {
    if (!selected || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setLoadStep(0);

    // Animate steps during the real async call
    const stepTimer = setInterval(() => {
      setLoadStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 3000);

    try {
      const data = await generateBrandStrategy(selected);
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to generate. Make sure both analysis pipelines have run for this category.";
      setError(msg);
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setLoadStep(0);
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate("/market-entry")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition"
          >
            <ArrowLeft size={15} /> Market Entry
          </button>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-amber-500" />
            <span className="text-sm font-semibold text-gray-900">AI Brand Advisor</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full">
              AI-Powered
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Brand Advisor</h1>
          <p className="text-sm text-gray-400 mt-1.5">
            Combines market gap data and competitor review intelligence to generate
            brand positioning, messaging strategy, and tone recommendations.
          </p>
        </div>

        {/* Category selector */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Select category
              </p>
              <p className="text-xs text-gray-400">
                Both market gap and competitor review data are used as context.
              </p>
            </div>
            {result && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition"
              >
                <RotateCcw size={12} /> New category
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {ADVISOR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                disabled={loading}
                onClick={() => { setSelected(cat.id); setResult(null); setError(null); }}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selected === cat.id
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 disabled:opacity-40"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={!selected || loading}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white text-sm font-semibold px-6 py-3 rounded-full transition"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate Brand Strategy
              </>
            )}
          </button>

          {error && (
            <p className="text-sm text-red-500 mt-3">{error}</p>
          )}
        </div>

        {/* Loading */}
        {loading && <LoadingCard step={loadStep} />}

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-5">

            {/* Brand tone — full width, prominent */}
            <BrandToneCard tone={result.brand_tone} />

            {/* Price + Messages — 2 col */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PricePositioningCard pp={result.price_positioning} />
              <KeyMessagesCard messages={result.key_messages} />
            </div>

            {/* Keywords + Competitive — 2 col */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <KeywordsCard keywords={result.keywords_to_emphasize} />
              <CompetitiveStrategyCard strategy={result.competitive_strategy} />
            </div>

            {/* Content guidelines — full width */}
            <SectionCard icon={PenLine} title="Content & Tone Guidelines" iconColor="text-indigo-500">
              <p className="text-sm text-gray-600 leading-relaxed">{result.content_tone_guidelines}</p>
            </SectionCard>

            {/* Footer note */}
            <p className="text-xs text-gray-300 text-center pb-4">
              Generated from market gap analysis + {result.category} competitor reviews · AI output — verify before use
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
