import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, TrendingUp, MessageSquare, BarChart2 } from "lucide-react";

import {
  CORPUS_CATEGORIES,
  analyzeCorpus,
  type CorpusCategory,
  type CorpusResult,
  type Sentiment,
  type TermResult,
} from "@/lib/corpusAnalysis";

// ── Sentiment config ──────────────────────────────────────────────────────────

const SENTIMENT_CONFIG: Record<
  Sentiment,
  { label: string; bar: string; badge: string; dot: string }
> = {
  positive: {
    label: "Positive",
    bar:   "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot:   "bg-emerald-500",
  },
  neutral: {
    label: "Neutral",
    bar:   "bg-gray-300",
    badge: "bg-gray-50 text-gray-500 border border-gray-200",
    dot:   "bg-gray-400",
  },
  negative: {
    label: "Negative",
    bar:   "bg-red-400",
    badge: "bg-red-50 text-red-600 border border-red-200",
    dot:   "bg-red-500",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const cfg = SENTIMENT_CONFIG[sentiment];
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
}

function SentimentDot({ sentiment }: { sentiment: Sentiment }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${SENTIMENT_CONFIG[sentiment].dot}`} />;
}

function TermRow({ term, rank, maxScore }: { term: TermResult; rank: number; maxScore: number }) {
  const pct = maxScore > 0 ? (term.score / maxScore) * 100 : 0;
  const cfg = SENTIMENT_CONFIG[term.sentiment];
  const isBigram = term.term.includes(" ");

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
      {/* Rank */}
      <span className="text-xs text-gray-300 font-mono w-5 shrink-0 text-right">{rank}</span>

      {/* Term */}
      <div className="w-36 shrink-0">
        <span className={`text-sm font-semibold text-gray-900 ${isBigram ? "italic" : ""}`}>
          {term.term}
        </span>
        {isBigram && (
          <span className="ml-1.5 text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
            phrase
          </span>
        )}
      </div>

      {/* Score bar */}
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Score value */}
      <span className="text-xs text-gray-400 w-10 text-right shrink-0 font-mono">
        {term.score.toFixed(2)}
      </span>

      {/* Sentiment badge */}
      <div className="w-20 shrink-0 flex justify-end">
        <SentimentBadge sentiment={term.sentiment} />
      </div>

      {/* Frequency */}
      <span className="text-xs text-gray-500 w-16 text-right shrink-0">
        {term.freq.toLocaleString()}
        <span className="text-gray-300 ml-0.5">×</span>
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type SentimentFilter = "all" | Sentiment;

export default function CorpusAnalysisPage() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState<CorpusCategory | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<CorpusResult | null>(null);
  const [filter, setFilter]     = useState<SentimentFilter>("all");
  const [view, setView]         = useState<"list" | "cloud">("list");

  async function run() {
    if (!selected || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setFilter("all");
    try {
      const data = await analyzeCorpus(selected);
      setResult(data);
    } catch {
      setError("Failed to run analysis. Make sure the backend corpus endpoint is available.");
    } finally {
      setLoading(false);
    }
  }

  // ── Derived ──

  const sentimentCounts = result
    ? {
        positive: result.top_terms.filter((t) => t.sentiment === "positive").length,
        neutral:  result.top_terms.filter((t) => t.sentiment === "neutral").length,
        negative: result.top_terms.filter((t) => t.sentiment === "negative").length,
      }
    : null;

  const filteredTerms = result
    ? filter === "all"
      ? result.top_terms
      : result.top_terms.filter((t) => t.sentiment === filter)
    : [];

  const maxScore = filteredTerms.length ? Math.max(...filteredTerms.map((t) => t.score)) : 1;

  const topSentiment = sentimentCounts
    ? (["positive", "neutral", "negative"] as Sentiment[]).reduce((a, b) =>
        sentimentCounts[a] >= sentimentCounts[b] ? a : b
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate("/market-entry")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition"
          >
            <ArrowLeft size={15} /> Market Entry
          </button>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Competitor Review Intelligence</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Page intro */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">What do customers value?</h1>
          <p className="text-sm text-gray-400 mt-1">
            Extract top keywords and keyphrases from competitor reviews — ranked by relevance,
            with sentiment polarity per term.
          </p>
        </div>

        {/* Category selector card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Select category
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {CORPUS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelected(cat.id); setResult(null); }}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selected === cat.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            onClick={run}
            disabled={!selected || loading}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white text-sm font-semibold px-6 py-3 rounded-full transition"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analysing reviews...
              </>
            ) : (
              <>
                <BarChart2 size={15} />
                Analyse Reviews
              </>
            )}
          </button>

          {error && (
            <p className="text-sm text-red-500 mt-3">{error}</p>
          )}
        </div>

        {/* Loading hint */}
        {loading && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-700">
            <p className="font-semibold mb-1">Running corpus pipeline…</p>
            <p className="text-blue-500 text-xs">
              TF-IDF term ranking → KeyBERT keyphrase extraction → sentiment classification.
              This may take a minute.
            </p>
          </div>
        )}

        {/* Results */}
        {result && sentimentCounts && (
          <div className="flex flex-col gap-5">

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={14} className="text-blue-600" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reviews analysed</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {result.total_reviews_analyzed.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{result.category}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-blue-600" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top terms found</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{result.top_terms.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {result.top_terms.filter((t) => t.term.includes(" ")).length} keyphrases,{" "}
                  {result.top_terms.filter((t) => !t.term.includes(" ")).length} keywords
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <SentimentDot sentiment={topSentiment!} />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dominant sentiment</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 capitalize">{topSentiment}</p>
                <div className="flex items-center gap-2 mt-1">
                  {(["positive", "neutral", "negative"] as Sentiment[]).map((s) => (
                    <span key={s} className="text-[10px] text-gray-400 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${SENTIMENT_CONFIG[s].dot}`} />
                      {sentimentCounts[s]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Term analysis card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              {/* Card header */}
              <div className="px-6 pt-5 pb-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Top Terms by Relevance</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Combined score = 50% TF-IDF + 30% KeyBERT + 20% frequency
                  </p>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setView("list")}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${view === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setView("cloud")}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${view === "cloud" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                  >
                    Cloud
                  </button>
                </div>
              </div>

              {/* Sentiment filter tabs */}
              <div className="flex gap-0 border-b border-gray-50">
                {([
                  { key: "all",      label: "All",      count: result.top_terms.length },
                  { key: "positive", label: "Positive", count: sentimentCounts.positive },
                  { key: "neutral",  label: "Neutral",  count: sentimentCounts.neutral  },
                  { key: "negative", label: "Negative", count: sentimentCounts.negative },
                ] as { key: SentimentFilter; label: string; count: number }[]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                      filter === tab.key
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      filter === tab.key ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="px-6 py-2">
                {view === "list" && (
                  <>
                    {/* Column headers */}
                    <div className="flex items-center gap-4 py-2 mb-1">
                      <span className="w-5 shrink-0" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-36 shrink-0">Term</span>
                      <span className="flex-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Score</span>
                      <span className="w-10 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">Val</span>
                      <span className="w-20 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">Sentiment</span>
                      <span className="w-16 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">Freq</span>
                    </div>

                    {filteredTerms.length === 0 ? (
                      <p className="text-sm text-gray-400 py-6 text-center">No terms match this filter.</p>
                    ) : (
                      filteredTerms.map((term, i) => (
                        <TermRow key={term.term} term={term} rank={i + 1} maxScore={maxScore} />
                      ))
                    )}
                  </>
                )}

                {view === "cloud" && (
                  <div className="flex flex-wrap gap-2 py-6">
                    {filteredTerms.map((term) => {
                      const sizePct = maxScore > 0 ? term.score / maxScore : 0;
                      const fontSize = 11 + Math.round(sizePct * 14);
                      const cfg = SENTIMENT_CONFIG[term.sentiment];
                      return (
                        <span
                          key={term.term}
                          title={`Score: ${term.score.toFixed(3)} · Freq: ${term.freq} · ${term.sentiment}`}
                          className={`px-3 py-1.5 rounded-full border font-medium cursor-default transition-transform hover:scale-105 ${cfg.badge}`}
                          style={{ fontSize }}
                        >
                          {term.term}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 px-2">
              <p className="text-xs text-gray-400 font-medium">Sentiment:</p>
              {(["positive", "neutral", "negative"] as Sentiment[]).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${SENTIMENT_CONFIG[s].dot}`} />
                  <span className="text-xs text-gray-400 capitalize">{s}</span>
                </div>
              ))}
              <p className="text-xs text-gray-300 ml-4 italic">Italic = keyphrase (bigram)</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
