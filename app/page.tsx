import { getScores } from "@/lib/kv";
import WorldCup2026 from "@/components/WorldCup2026";

export const revalidate = 180;

export default async function Page() {
  const initialScores = await getScores();
  return <WorldCup2026 initialScores={initialScores} />;
}
