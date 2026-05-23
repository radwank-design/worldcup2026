import { NextRequest, NextResponse } from "next/server";
import { getScores, setScores, ScoreMap } from "@/lib/kv";
import { GM_RAW } from "@/lib/matches";

// API-Football team name → our canonical name
const TEAM_MAP: Record<string, string> = {
  "Mexico": "Mexico",
  "South Africa": "South Africa",
  "South Korea": "South Korea",
  "Czech Republic": "Czechia",
  "Czechia": "Czechia",
  "Canada": "Canada",
  "Bosnia": "Bosnia & Herz.",
  "Bosnia And Herzegovina": "Bosnia & Herz.",
  "Qatar": "Qatar",
  "Switzerland": "Switzerland",
  "Brazil": "Brazil",
  "Morocco": "Morocco",
  "Haiti": "Haiti",
  "Scotland": "Scotland",
  "USA": "USA",
  "United States": "USA",
  "Paraguay": "Paraguay",
  "Australia": "Australia",
  "Turkey": "Türkiye",
  "Turkiye": "Türkiye",
  "Germany": "Germany",
  "Curacao": "Curaçao",
  "Ivory Coast": "Ivory Coast",
  "Côte D'Ivoire": "Ivory Coast",
  "Ecuador": "Ecuador",
  "Netherlands": "Netherlands",
  "Japan": "Japan",
  "Sweden": "Sweden",
  "Tunisia": "Tunisia",
  "Belgium": "Belgium",
  "Egypt": "Egypt",
  "Iran": "Iran",
  "New Zealand": "New Zealand",
  "Spain": "Spain",
  "Cape Verde": "Cape Verde",
  "Saudi Arabia": "Saudi Arabia",
  "Uruguay": "Uruguay",
  "France": "France",
  "Senegal": "Senegal",
  "Iraq": "Iraq",
  "Norway": "Norway",
  "Argentina": "Argentina",
  "Algeria": "Algeria",
  "Austria": "Austria",
  "Jordan": "Jordan",
  "Portugal": "Portugal",
  "DR Congo": "DR Congo",
  "Congo DR": "DR Congo",
  "Democratic Republic Of Congo": "DR Congo",
  "Uzbekistan": "Uzbekistan",
  "Colombia": "Colombia",
  "England": "England",
  "Croatia": "Croatia",
  "Ghana": "Ghana",
  "Panama": "Panama",
};

interface ApiFixture {
  fixture: { status: { short: string } };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  goals: { home: number | null; away: number | null };
}

export async function GET(req: NextRequest) {
  // Vercel automatically adds CRON_SECRET to cron requests
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API_FOOTBALL_KEY not set" }, { status: 500 });
  }

  // Fetch finished fixtures for WC 2026 (league ID 1 = FIFA World Cup)
  const res = await fetch(
    "https://v3.football.api-sports.io/fixtures?league=1&season=2026&status=FT",
    { headers: { "x-apisports-key": apiKey }, next: { revalidate: 0 } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "API-Football error", status: res.status }, { status: 502 });
  }

  const json = await res.json();
  const fixtures: ApiFixture[] = json.response ?? [];

  const existing = await getScores();
  const updates: ScoreMap = {};
  let updatedCount = 0;

  for (const fix of fixtures) {
    if (fix.fixture.status.short !== "FT") continue;
    const homeRaw = fix.teams.home.name;
    const awayRaw = fix.teams.away.name;
    const home = TEAM_MAP[homeRaw] ?? homeRaw;
    const away = TEAM_MAP[awayRaw] ?? awayRaw;
    const homeScore = fix.goals.home;
    const awayScore = fix.goals.away;
    if (homeScore === null || awayScore === null) continue;

    // Find the group for this match
    const gm = GM_RAW.find(m => m.home === home && m.away === away);
    if (!gm) continue;

    const key = `${gm.g}|${home}|${away}`;
    updates[key] = { homeScore, awayScore };
    updatedCount++;
  }

  const merged = { ...existing, ...updates };
  await setScores(merged);

  return NextResponse.json({ updated: updatedCount, total: Object.keys(merged).length });
}
