import { useEffect, useState } from "react";
import { fetchAssociation, AssociationResponse } from "@/lib/dashboard";
import { ArrowRight } from "lucide-react";

export default function AssociationPage() {
  const [level, setLevel] = useState<1 | 2>(1);
  const [data, setData] = useState<AssociationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData(lvl: 1 | 2) {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAssociation(lvl);
      setData(result);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Failed to load association rules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(level);
  }, [level]);

  const badge = (text: string, color: string) => (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-medium ${color}`}
    >
      {text}
    </span>
  );

  const confidenceColor = (c: number) => {
    if (c >= 0.7) return "bg-green-100 text-green-700";
    if (c >= 0.4) return "bg-yellow-100 text-yellow-700";
    return "bg-slate-100 text-slate-600";
  };

  const liftColor = (l: number) => {
    if (l >= 2) return "text-green-700 font-semibold";
    if (l >= 1) return "text-slate-700";
    return "text-red-500";
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Association Rules</h1>
        <p className="text-slate-500 mt-1">
          Products frequently bought together, derived from the Apriori algorithm.
        </p>
      </div>

      {/* Level Toggle */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Rule type:</span>
          <button
            onClick={() => setLevel(1)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              level === 1
                ? "bg-[#2D4FE5] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Level 1 — Single trigger
          </button>
          <button
            onClick={() => setLevel(2)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              level === 2
                ? "bg-[#2D4FE5] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Level 2 — Pair trigger
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          {level === 1
            ? "If a customer buys Product A → they are likely to also buy Product B."
            : "If a customer buys Product A + Product B → they are likely to also buy Product C."}
        </p>
      </div>

      {/* Stats */}
      {!loading && !error && data && (
        <div className="mb-5 text-sm text-slate-500">
          {data.total_associations} rules found · sorted by confidence (high → low)
        </div>
      )}

      {loading && (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          Loading…
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (data?.data ?? []).length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400 text-sm shadow-sm">
          No association rules found for level {level}.
        </div>
      )}

      {!loading && !error && (data?.data ?? []).length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-slate-400 font-medium">
                  If bought
                </th>
                <th className="px-2 py-3" />
                <th className="text-left px-6 py-3 text-slate-400 font-medium">
                  Also buys
                </th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">
                  Support
                </th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">
                  Confidence
                </th>
                <th className="text-right px-6 py-3 text-slate-400 font-medium">
                  Lift
                </th>
              </tr>
            </thead>
            <tbody>
              {data!.data.map((rule, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-50 hover:bg-slate-50 transition"
                >
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
                    {badge(`${(rule.confidence * 100).toFixed(1)}%`, confidenceColor(rule.confidence))}
                  </td>
                  <td className={`px-6 py-3 text-right tabular-nums ${liftColor(rule.lift)}`}>
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
