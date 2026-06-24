import api from "./api";

export type Sentiment = "positive" | "neutral" | "negative";

export interface TermResult {
  term: string;
  score: number;
  sentiment: Sentiment;
  freq: number;
}

export interface CorpusResult {
  category: string;
  top_terms: TermResult[];
  total_reviews_analyzed: number;
}

export const CORPUS_CATEGORIES = [
  { id: "elektronik",   label: "Elektronik" },
  { id: "fashion",      label: "Fashion" },
  { id: "olahraga",     label: "Olahraga" },
  { id: "handphone",    label: "Handphone" },
  { id: "pertukangan",  label: "Pertukangan" },
] as const;

export type CorpusCategory = (typeof CORPUS_CATEGORIES)[number]["id"];

export async function analyzeCorpus(category: CorpusCategory): Promise<CorpusResult> {
  const res = await api.post("/api/v1/corpus/analyze", { category });
  return res.data.data;
}
