import { kv } from "@vercel/kv";

export type ScoreMap = Record<string, { homeScore: number | null; awayScore: number | null }>;

const KEY = "wc2026:scores";

export async function getScores(): Promise<ScoreMap> {
  try {
    const data = await kv.get<ScoreMap>(KEY);
    return data ?? {};
  } catch {
    return {};
  }
}

export async function setScores(scores: ScoreMap): Promise<void> {
  await kv.set(KEY, scores);
}

export async function mergeScores(partial: ScoreMap): Promise<ScoreMap> {
  const existing = await getScores();
  const merged = { ...existing, ...partial };
  await setScores(merged);
  return merged;
}
