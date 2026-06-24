import { useEffect, useState } from "react";
import { fetchRecommendation, RecommendationResponse } from "@/lib/marketing";
import { fetchAssociation, AssociationResponse } from "@/lib/dashboard";
import { getProducts } from "@/lib/product";
import { Lightbulb, ChevronRight, ArrowRight } from "lucide-react";

// ─── Recommendations ───────────────────────────────────────────────────────

function confidenceBadge(c: number) {
  const pct = `${(c * 100).toFixed(1)}%`;
  if (c >= 0.7)
    return (
      <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-lg">
        {pct} confidence
      </span>
    );
  if (c >= 0.4)
    return (
      <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-lg">
        {pct} confidence
      </span>
    );
  return (
    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
      {pct} confidence
    </span>
  );
}

function assocConfidenceClass(c: number) {
  if (c >= 0.7) return "bg-green-100 text-green-700";
  if (c >= 0.4) return "bg-yellow-100 text-yellow-700";
  return "bg-slate-100 text-slate-600";
}

function liftClass(l: number) {
  if (l >= 2) return "text-green-700 font-semibold";
  if (l >= 1) return "text-slate-700";
  return "text-red-500";
}

// ─── Combined page ─────────────────────────────────────────────────────────

export default function RecommendationPage() {
  // — Products (shared) —
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // — Recommendation state —
  const [recLevel, setRecLevel] = useState<1 | 2>(1);
  const [product1, setProduct1] = useState<string>("");
  const [product2, setProduct2] = useState<string>("");
  const [recResult, setRecResult] = useState<RecommendationResponse | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  // — Association rules state —
  const [assocLevel, setAssocLevel] = useState<1 | 2>(1);
  const [assocData, setAssocData] = useState<AssociationResponse | null>(null);
  const [assocLoading, setAssocLoading] = useState(true);
  const [assocError, setAssocError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        const items = data.items ?? [];
        setProducts(items);
        if (items.length > 0) setProduct1(String(items[0].product_id));
        if (items.length > 1) setProduct2(String(items[1].product_id));
      } catch {
        // products failed; recommendation section will stay empty
      } finally {
        setProductsLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function loadAssoc() {
      setAssocLoading(true);
      setAssocError(null);
      try {
        setAssocData(await fetchAssociation(assocLevel));
      } catch (e: any) {
        setAssocError(e?.response?.data?.detail ?? "Failed to load rules.");
      } finally {
        setAssocLoading(false);
      }
    }
    loadAssoc();
  }, [assocLevel]);

  async function handleGetRecommendations() {
    if (!product1) return;
    setRecLoading(true);
    setRecError(null);
    setRecResult(null);
    try {
      const pid1 = parseInt(product1);
      const pid2 = recLevel === 2 && product2 ? parseInt(product2) : undefined;
      setRecResult(await fetchRecommendation(pid1, pid2));
    } catch (e: any) {
      setRecError(e?.response?.data?.detail ?? "No recommendations found.");
    } finally {
      setRecLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Product Intelligence</h1>
        <p className="text-slate-500 mt-1">
          Get product recommendations and explore market basket association rules.
        </p>
      </div>

      {/* ── Recommendations ── */}
      <div className="mb-2">
        <h2 className="text-base font-semibold text-slate-900">Recommendations</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Discover which products are frequently bought alongside a selection.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-sm font-medium text-slate-500">Mode:</span>
          {([1, 2] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => { setRecLevel(lvl); setRecResult(null); setRecError(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                recLevel === lvl
                  ? "bg-[#2D4FE5] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {lvl === 1 ? "1 Product" : "2 Products"}
            </button>
          ))}
        </div>

        {productsLoading ? (
          <p className="text-sm text-slate-400">Loading products…</p>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Product {recLevel === 2 ? "A" : ""}
              </label>
              <select
                value={product1}
                onChange={(e) => setProduct1(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.product_name}
                  </option>
                ))}
              </select>
            </div>

            {recLevel === 2 && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Product B
                </label>
                <select
                  value={product2}
                  onChange={(e) => setProduct2(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {products
                    .filter((p) => String(p.product_id) !== product1)
                    .map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <button
              onClick={handleGetRecommendations}
              disabled={recLoading}
              className="w-full bg-[#2D4FE5] hover:bg-[#2444d0] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <Lightbulb size={15} />
              {recLoading ? "Searching…" : "Get Recommendations"}
            </button>
          </div>
        )}
      </div>

      {recError && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 text-amber-700 text-sm mb-4">
          {recError}
        </div>
      )}

      {recResult && recResult.recommendations.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400 text-sm shadow-sm mb-4">
          No rules found for the selected product(s). Try a different combination.
        </div>
      )}

      {recResult && recResult.recommendations.length > 0 && (
        <div className="space-y-2.5 mb-4">
          {recResult.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between hover:border-blue-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{rec.product_name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {confidenceBadge(rec.confidence)}
                    <span className="text-xs text-slate-400">
                      lift {rec.lift.toFixed(2)}×
                    </span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">
                      support {(rec.support * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* ── Divider ── */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Association Rules
        </span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* ── Association Rules ── */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Market Basket Analysis</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Products frequently bought together, derived from the Apriori algorithm.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mb-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Rule type:</span>
          <button
            onClick={() => setAssocLevel(1)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              assocLevel === 1
                ? "bg-[#2D4FE5] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Level 1 — Single trigger
          </button>
          <button
            onClick={() => setAssocLevel(2)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              assocLevel === 2
                ? "bg-[#2D4FE5] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Level 2 — Pair trigger
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          {assocLevel === 1
            ? "If a customer buys Product A → they are likely to also buy Product B."
            : "If a customer buys Product A + Product B → they are likely to also buy Product C."}
        </p>
      </div>

      {!assocLoading && !assocError && assocData && (
        <p className="text-sm text-slate-400 mb-4">
          {assocData.total_associations} rules · sorted by confidence (high → low)
        </p>
      )}

      {assocLoading && (
        <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
          Loading…
        </div>
      )}

      {!assocLoading && assocError && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-red-500 text-sm">
          {assocError}
        </div>
      )}

      {!assocLoading && !assocError && (assocData?.data ?? []).length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400 text-sm shadow-sm">
          No association rules found for level {assocLevel}.
        </div>
      )}

      {!assocLoading && !assocError && (assocData?.data ?? []).length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-slate-400 font-medium">If bought</th>
                <th className="px-2 py-3" />
                <th className="text-left px-6 py-3 text-slate-400 font-medium">Also buys</th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">Support</th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">Confidence</th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">Lift</th>
              </tr>
            </thead>
            <tbody>
              {assocData!.data.map((rule, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-1">
                      {rule.from.map((p) => (
                        <span
                          key={p}
                          className="inline-block bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg text-xs font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-slate-300">
                    <ArrowRight size={14} />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-1">
                      {rule.to.map((p) => (
                        <span
                          key={p}
                          className="inline-block bg-green-50 text-green-700 px-2.5 py-0.5 rounded-lg text-xs font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums text-slate-500">
                    {(rule.support * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-medium ${assocConfidenceClass(rule.confidence)}`}
                    >
                      {(rule.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className={`px-6 py-3 text-right tabular-nums ${liftClass(rule.lift)}`}>
                    {rule.lift.toFixed(2)}×
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
