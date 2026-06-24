import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, TrendingUp, BookOpen, Sparkles } from "lucide-react";

const FEATURES = [
  {
    id: "gap",
    path: "/market-entry/gap",
    icon: TrendingUp,
    iconBg: "bg-blue-600",
    hoverTitle: "group-hover:text-blue-600",
    title: "Market Gap Analysis",
    description:
      "Discover under-served price tiers in your product category. Find where competition is lowest and identify your ideal entry price range.",
    highlights: ["Price tier clustering", "Gap share scoring", "Category comparison"],
    badge: "ML Clustering",
    badgeColor: "bg-blue-50 text-blue-600",
  },
  {
    id: "corpus",
    path: "/market-entry/competitor-review",
    icon: BookOpen,
    iconBg: "bg-violet-600",
    hoverTitle: "group-hover:text-violet-600",
    title: "Competitor Review Intelligence",
    description:
      "Extract top keywords and keyphrases from thousands of competitor reviews. Understand what customers value most — with sentiment analysis per term.",
    highlights: ["TF-IDF + KeyBERT ranking", "Sentiment polarity", "Phrase detection"],
    badge: "NLP",
    badgeColor: "bg-violet-50 text-violet-600",
  },
  {
    id: "ai-advisor",
    path: "/market-entry/ai-advisor",
    icon: Sparkles,
    iconBg: "bg-amber-500",
    hoverTitle: "group-hover:text-amber-600",
    title: "AI Brand Advisor",
    description:
      "Combines market gap data and competitor review insights to generate brand positioning, tone, key messages, and content strategy — powered by AI.",
    highlights: ["Brand tone archetype", "Price positioning advice", "Content strategy"],
    badge: "AI",
    badgeColor: "bg-amber-50 text-amber-600",
  },
];

export default function MarketEntryHubPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition"
          >
            <ArrowLeft size={15} /> Dashboard
          </button>
          <span className="text-gray-200">|</span>
          <span className="text-sm font-semibold text-gray-900">Market Entry Analysis</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Market Entry Analysis</h1>
          <p className="text-sm text-gray-400 mt-2">
            Three tools to help you enter the right market, at the right price, with the right message.
          </p>
        </div>

        {/* Top row: two analytic tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {FEATURES.slice(0, 2).map((feat) => {
            const Icon = feat.icon;
            return (
              <button
                key={feat.id}
                onClick={() => navigate(feat.path)}
                className="group text-left bg-white rounded-3xl border border-gray-100 p-7 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 ${feat.iconBg} rounded-2xl flex items-center justify-center`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${feat.badgeColor}`}>
                    {feat.badge}
                  </span>
                </div>

                <h2 className={`text-lg font-bold text-gray-900 mb-2 ${feat.hoverTitle} transition-colors`}>
                  {feat.title}
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">{feat.description}</p>

                <div className="flex flex-col gap-1.5 mb-7">
                  {feat.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                      <span className="text-xs text-gray-500">{h}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 group-hover:gap-2.5 transition-all">
                  Open tool
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom row: AI advisor — full width, visually distinct */}
        {(() => {
          const feat = FEATURES[2];
          const Icon = feat.icon;
          return (
            <button
              onClick={() => navigate(feat.path)}
              className="group w-full text-left bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-100 p-7 hover:border-amber-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                {/* Left: icon + content */}
                <div className="flex items-start gap-5 flex-1">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                        {feat.title}
                      </h2>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-600">
                        {feat.badge}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-xl">
                      {feat.description}
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                      {feat.highlights.map((h) => (
                        <div key={h} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-300 shrink-0" />
                          <span className="text-xs text-gray-500">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: CTA */}
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 group-hover:gap-2.5 transition-all shrink-0 ml-6 mt-1">
                  Open tool
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          );
        })()}
      </div>
    </div>
  );
}
