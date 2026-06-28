"use client";
import { useState, useEffect } from "react";
import { FLAGS, GROUPS, GROUP_MATCHES, KNOCKOUT_MATCHES, getGroupMatches, GroupMatch, KnockoutMatch } from "@/lib/matches";
import type { ScoreMap } from "@/lib/kv";

type ResultsMap = Record<string, GroupMatch[]>;

function formatLocal(utcStr: string) {
  const d = new Date(utcStr);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateStr = d.toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short", timeZone: tz });
  const timeStr = d.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit", timeZone: tz });
  return { dateStr, timeStr };
}

function getTzAbbr() {
  try {
    return new Intl.DateTimeFormat("en", { timeZoneName:"short" })
      .formatToParts(new Date()).find(p => p.type === "timeZoneName")?.value || "Local";
  } catch { return "Local"; }
}

const HIGHLIGHT_TEAMS = new Set(["Qatar","Tunisia","Egypt","Saudi Arabia","Iraq","Jordan","Algeria"]);
const hl = (t: string) => HIGHLIGHT_TEAMS.has(t);

function calcStandings(teams: readonly string[], results: GroupMatch[]) {
  const s: Record<string, {p:number,w:number,d:number,l:number,gf:number,ga:number,pts:number}> =
    Object.fromEntries(teams.map(t => [t, {p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}]));
  results.forEach(r => {
    if (r.homeScore === null) return;
    const [h, a] = [r.home, r.away];
    s[h].p++; s[a].p++;
    s[h].gf += r.homeScore!; s[h].ga += r.awayScore!;
    s[a].gf += r.awayScore!; s[a].ga += r.homeScore!;
    if (r.homeScore! > r.awayScore!) { s[h].w++; s[h].pts+=3; s[a].l++; }
    else if (r.homeScore! < r.awayScore!) { s[a].w++; s[a].pts+=3; s[h].l++; }
    else { s[h].d++; s[a].d++; s[h].pts++; s[a].pts++; }
  });
  return teams.map(t => ({ team:t, ...s[t], gd: s[t].gf - s[t].ga }))
    .sort((a,b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--navy:#080E1A;--navy2:#0D1528;--navy3:#111B30;--panel:#FFFFFF;--panel2:#F4F7FC;--red:#C8102E;--redh:#A30E25;--txt:#0D1528;--txtb:#1E2D45;--txtm:#5A6E8A;--txtl:#E2EAF6;--txtd:#8299B8;--bdl:#DDE4F0;--bdd:rgba(255,255,255,.07);--grn:#16A34A}
.wc{min-height:100vh;background:var(--navy);color:var(--txtl);font-family:'DM Sans',sans-serif;font-size:14px}
.hdr{background:var(--navy2);padding:16px 24px 14px;border-bottom:3px solid var(--red)}
.hdr-top{display:flex;align-items:flex-start;gap:14px;margin-bottom:14px}
.htitle{font-family:'Barlow Condensed',sans-serif;font-size:clamp(26px,5vw,42px);font-weight:700;letter-spacing:2px;color:#fff;line-height:1;text-transform:uppercase}
.hsub{font-size:12px;color:var(--txtd);letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;font-weight:400}
.cdown{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.cdbox{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 14px;text-align:center;min-width:62px}
.cdnum{font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:700;color:#fff;line-height:1}
.cdlbl{font-size:10px;color:var(--txtd);text-transform:uppercase;letter-spacing:1.5px;margin-top:2px}
.cdsep{font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:600;color:rgba(255,255,255,.2);padding-bottom:12px}
.tz-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(200,16,46,.12);border:1px solid rgba(200,16,46,.3);border-radius:5px;padding:3px 9px;font-size:11px;color:var(--red);font-weight:600;margin-left:4px;align-self:center}
.tabs{display:flex;background:var(--navy3);border-bottom:1px solid var(--bdd);overflow-x:auto}
.tbtn{padding:12px 20px;font-size:12px;font-weight:500;letter-spacing:.8px;text-transform:uppercase;border:none;background:none;color:var(--txtd);cursor:pointer;border-bottom:3px solid transparent;transition:all .15s;font-family:'DM Sans',sans-serif;white-space:nowrap}
.tbtn:hover{color:var(--txtl);background:rgba(255,255,255,.03)}.tbtn.on{color:#fff;border-bottom-color:var(--red)}
.body{padding:20px 24px;max-width:1100px}
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:24px}
.scard{background:var(--panel);border-radius:10px;padding:16px 14px;text-align:center;border:1px solid var(--bdl)}
.snum{font-family:'Barlow Condensed',sans-serif;font-size:40px;font-weight:700;color:var(--txt);line-height:1}
.slbl{font-size:11px;color:var(--txtm);text-transform:uppercase;letter-spacing:1px;margin-top:4px;font-weight:500}
.sec{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--txtd);margin:0 0 10px}
.tl{display:flex;flex-direction:column;gap:4px}
.tlrow{display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--bdl);border-radius:8px;padding:11px 14px;border-left-width:4px}
.tlname{font-weight:600;font-size:13px;flex:1;color:var(--txtb)}
.tldet{flex:2;font-size:12px;color:var(--txtm)}
.tldt{font-size:12px;color:var(--txtm);white-space:nowrap;font-weight:500}
.gl{display:grid;grid-template-columns:200px 1fr;gap:16px}
.glist{display:flex;flex-direction:column;gap:4px}
.gbtn{display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,.03);border:1px solid var(--bdd);border-radius:8px;padding:9px 12px;cursor:pointer;text-align:left;transition:all .15s;width:100%}
.gbtn:hover{background:rgba(255,255,255,.06)}.gbtn.on{background:rgba(200,16,46,.1);border-color:rgba(200,16,46,.4)}
.gltr{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;color:var(--red);line-height:1;min-width:14px}
.gtmini{font-size:11px;color:var(--txtd);line-height:1.7}
.ghead{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;letter-spacing:2px;color:var(--txtl);margin-bottom:10px;text-transform:uppercase}
.stbl{width:100%;border-collapse:collapse;margin-bottom:16px;background:var(--panel);border-radius:10px;overflow:hidden;border:1px solid var(--bdl);font-size:13px}
.stbl thead tr{background:#F0F4FA;border-bottom:2px solid var(--bdl)}
.stbl th{font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:var(--txtm);padding:8px 10px;text-align:center;font-weight:600}
.stbl th:first-child{text-align:left}
.stbl td{padding:9px 10px;text-align:center;border-bottom:1px solid var(--bdl);color:var(--txtb)}
.stbl td:first-child{text-align:left;font-weight:600;color:var(--txt)}
.stbl tr:last-child td{border-bottom:none}
.stbl .q{background:rgba(22,163,74,.04)}.stbl .q td:not(:first-child){color:var(--grn)}
.rnk{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;font-size:10px;font-weight:700;margin-right:6px;background:#EEF1F7;color:var(--txtm)}
.rnk.top{background:rgba(22,163,74,.15);color:var(--grn)}
.mhd{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--txtd);margin-bottom:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-weight:600}
.mlist{display:flex;flex-direction:column;gap:4px}
.mrow{background:var(--panel);border:1px solid var(--bdl);border-radius:8px;overflow:hidden}
.mrow-main{display:flex;align-items:center;padding:10px 14px;gap:10px}
.mrow-meta{display:flex;align-items:center;gap:6px;padding:6px 14px 8px;font-size:11px;color:var(--txtm);flex-wrap:wrap;background:var(--panel2);border-top:1px solid var(--bdl)}
.mrow-meta span{background:rgba(0,0,0,.04);border-radius:4px;padding:2px 7px;font-weight:500}
.mrow-meta .mtime{color:var(--txtm)}
.mteam{display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600;flex:1;color:var(--txt)}
.mteam.away{justify-content:flex-end}
.msc{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;color:var(--red);min-width:52px;text-align:center;cursor:pointer;padding:3px 6px;border-radius:6px;transition:background .15s;background:rgba(200,16,46,.06)}
.msc:hover{background:rgba(200,16,46,.14)}.msc.pend{color:var(--txtm);font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;background:rgba(0,0,0,.04)}
.stg-filt{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
.sfbtn{padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:var(--txtd);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;transition:all .15s}
.sfbtn:hover{background:rgba(255,255,255,.08)}.sfbtn.on{background:rgba(200,16,46,.15);border-color:rgba(200,16,46,.5);color:#FF6B6B}
.sched-day{margin-bottom:20px}
.sday-hdr{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--txtd);padding:7px 12px;background:rgba(255,255,255,.035);border-radius:6px;margin-bottom:8px;border-left:3px solid var(--red)}
.srow{display:flex;align-items:stretch;background:var(--panel);border:1px solid var(--bdl);border-radius:8px;margin-bottom:5px;overflow:hidden}
.srow-grp{font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;color:var(--red);writing-mode:vertical-rl;padding:5px 7px;background:rgba(200,16,46,.06);border-right:1px solid rgba(200,16,46,.15);min-width:26px;display:flex;align-items:center;justify-content:center;letter-spacing:1px}
.srow-body{flex:1;padding:9px 14px}
.srow-teams{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--txt);margin-bottom:5px}
.srow-vs{color:var(--txtm);font-size:11px;font-weight:400}
.srow-meta{display:flex;flex-wrap:wrap;gap:5px;font-size:11px;color:var(--txtm)}
.srow-time{background:rgba(0,0,0,.05);border-radius:4px;padding:2px 7px;font-weight:500;color:var(--txtm)}
.ctry{margin-bottom:20px}
.ctitle{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:1.5px;margin-bottom:10px;display:flex;align-items:center;gap:8px;color:var(--txtl);text-transform:uppercase}
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:5px}
.ccard{background:var(--panel);border:1px solid var(--bdl);border-radius:8px;padding:9px 12px;font-size:12px;font-weight:500;color:var(--txtb)}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:98}
.modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border:1px solid var(--bdl);border-radius:14px;padding:24px;z-index:99;min-width:280px;box-shadow:0 24px 60px rgba(0,0,0,.5)}
.mtitle{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;letter-spacing:2px;color:var(--red);margin-bottom:4px;text-align:center;text-transform:uppercase}
.msub{text-align:center;font-size:13px;color:var(--txtm);margin-bottom:16px;font-weight:500}
.sinp-row{display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:18px}
.sinp{width:60px;height:60px;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:700;background:var(--panel2);border:2px solid var(--bdl);border-radius:8px;color:var(--txt);outline:none}
.sinp:focus{border-color:var(--red)}
.svs{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;color:var(--txtm)}
.mbtns{display:flex;gap:8px}
.btn{flex:1;padding:10px;border:none;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;font-size:12px;transition:all .15s}
.btn-p{background:var(--red);color:#fff}.btn-p:hover{background:var(--redh)}
.btn-s{background:var(--panel2);color:var(--txtm);border:1px solid var(--bdl)}.btn-s:hover{background:#EEF1F7}
.btn-d{background:rgba(239,68,68,.1);color:#DC2626;border:1px solid rgba(239,68,68,.2)}.btn-d:hover{background:rgba(239,68,68,.18)}
.note{margin-top:8px;font-size:11px;color:var(--txtd)}
.hl-team{color:#E8A020!important;font-weight:700!important}
@media(max-width:640px){.gl{grid-template-columns:1fr}.glist{display:grid;grid-template-columns:repeat(4,1fr)}.body{padding:14px}.hdr{padding:14px 16px}}
`;

interface Props { initialScores: ScoreMap }

// Build the full match grid and overlay any persisted scores from a ScoreMap.
function buildResults(scores: ScoreMap): ResultsMap {
  const r: ResultsMap = {};
  GROUPS.forEach(g => { r[g.id] = getGroupMatches(g.teams); });
  Object.entries(scores).forEach(([key, sc]) => {
    if (key.startsWith("KO|")) return;
    const [gid, home, away] = key.split("|");
    if (r[gid]) {
      r[gid] = r[gid].map(m =>
        m.home === home && m.away === away ? { ...m, homeScore: sc.homeScore, awayScore: sc.awayScore } : m
      );
    }
  });
  return r;
}

export type KoScores = Record<number, { homeScore: number | null; awayScore: number | null }>;

// Extract knockout scores (keyed "KO|<mn>|<home>|<away>") into a map keyed by match number.
function buildKoScores(scores: ScoreMap): KoScores {
  const k: KoScores = {};
  Object.entries(scores).forEach(([key, sc]) => {
    if (!key.startsWith("KO|")) return;
    const mn = parseInt(key.split("|")[1]);
    if (!isNaN(mn)) k[mn] = { homeScore: sc.homeScore, awayScore: sc.awayScore };
  });
  return k;
}

type EditTarget = { kind: "group"; g: string; i: number } | { kind: "ko"; mn: number };

export default function WorldCup2026({ initialScores }: Props) {
  const [tab, setTab] = useState("overview");
  const [sel, setSel] = useState("A");
  const [results, setResults] = useState<ResultsMap>(() => buildResults(initialScores));
  const [koScores, setKoScores] = useState<KoScores>(() => buildKoScores(initialScores));
  const [editM, setEditM] = useState<EditTarget|null>(null);
  const [sc, setSc] = useState({h:"",a:""});
  const [cd, setCd] = useState({d:0,h:0,m:0,s:0});
  const [schedStage, setSchedStage] = useState("Group Stage");
  const tzAbbr = getTzAbbr();

  useEffect(() => {
    const target = new Date("2026-06-11T19:00:00Z");
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setCd({d:0,h:0,m:0,s:0}); return; }
      setCd({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) });
    };
    tick(); const t = setInterval(tick,1000); return ()=>clearInterval(t);
  }, []);

  // The page HTML is served via ISR (cached up to 180s), so initialScores can be
  // stale on load. Pull the live scores from KV on mount so saved edits always show.
  useEffect(() => {
    fetch("/api/scores", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then((live: ScoreMap | null) => { if (live) { setResults(buildResults(live)); setKoScores(buildKoScores(live)); } })
      .catch(() => {});
  }, []);

  function persistScore(key: string, homeScore: number | null, awayScore: number | null) {
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: { homeScore, awayScore } }),
    }).catch(() => {});
  }

  function writeScore(t: EditTarget, homeScore: number | null, awayScore: number | null) {
    if (t.kind === "group") {
      const m = results[t.g][t.i];
      setResults(p => {
        const n = {...p};
        n[t.g] = n[t.g].map((mm,i) => i===t.i ? {...mm,homeScore,awayScore} : mm);
        return n;
      });
      persistScore(`${t.g}|${m.home}|${m.away}`, homeScore, awayScore);
    } else {
      const km = KNOCKOUT_MATCHES.find(m => m.mn === t.mn)!;
      setKoScores(p => ({ ...p, [t.mn]: { homeScore, awayScore } }));
      persistScore(`KO|${t.mn}|${km.home}|${km.away}`, homeScore, awayScore);
    }
    setEditM(null);
  }

  function saveScore() {
    const hv = parseInt(sc.h), av = parseInt(sc.a);
    if (!editM || isNaN(hv) || isNaN(av) || hv < 0 || av < 0) return;
    writeScore(editM, hv, av);
  }

  function clearScore() {
    if (!editM) return;
    writeScore(editM, null, null);
  }

  const curGroup = GROUPS.find(g => g.id === sel)!;
  const curMatches = results[sel];
  const standings = calcStandings(curGroup.teams, curMatches);
  let em: { home: string; away: string; homeScore: number | null; awayScore: number | null } | null = null;
  if (editM) {
    if (editM.kind === "group") {
      em = results[editM.g][editM.i];
    } else {
      const km = KNOCKOUT_MATCHES.find(m => m.mn === editM.mn)!;
      const ks = koScores[editM.mn];
      em = { home: km.home, away: km.away, homeScore: ks?.homeScore ?? null, awayScore: ks?.awayScore ?? null };
    }
  }
  const p2 = (v: number) => String(v).padStart(2,"0");

  const schedMatches = schedStage === "Group Stage"
    ? GROUP_MATCHES
    : KNOCKOUT_MATCHES.filter(m => m.stage === schedStage);

  const byDay = (schedMatches as (GroupMatch | KnockoutMatch)[]).reduce<Record<string, (GroupMatch | KnockoutMatch)[]>>((acc, m) => {
    const {dateStr} = formatLocal(m.utc);
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(m);
    return acc;
  }, {});

  return (
    <>
      <style>{CSS}</style>
      <div className="wc">
        <div style={{textAlign:"center",padding:"7px 16px",background:"rgba(200,16,46,.06)",borderBottom:"1px solid rgba(200,16,46,.15)",fontSize:11,color:"#8299B8",letterSpacing:.5}}>
          Concept by <span style={{color:"#E2EAF6",fontWeight:600}}>Radwan Khawlie</span>
        </div>

        <div className="hdr">
          <div className="hdr-top">
            <span style={{fontSize:26}}>🏆</span>
            <div style={{flex:1}}>
              <div className="htitle">WORLD CUP 2026</div>
              <div className="hsub">USA · Canada · Mexico &nbsp;|&nbsp; Jun 11 – Jul 19, 2026</div>
            </div>
          </div>
          <div className="cdown">
            <div className="cdbox"><div className="cdnum">{cd.d}</div><div className="cdlbl">Days</div></div>
            <span className="cdsep">:</span>
            <div className="cdbox"><div className="cdnum">{p2(cd.h)}</div><div className="cdlbl">Hrs</div></div>
            <span className="cdsep">:</span>
            <div className="cdbox"><div className="cdnum">{p2(cd.m)}</div><div className="cdlbl">Min</div></div>
            <span className="cdsep">:</span>
            <div className="cdbox"><div className="cdnum">{p2(cd.s)}</div><div className="cdlbl">Sec</div></div>
            <span className="tz-badge">📍 {tzAbbr}</span>
          </div>
        </div>

        <div className="tabs">
          {[["overview","Overview"],["groups","Groups & Scores"],["schedule","Full Schedule"],["cities","Host Cities"]].map(([v,l])=>(
            <button key={v} className={`tbtn ${tab===v?"on":""}`} onClick={()=>setTab(v)}>{l}</button>
          ))}
        </div>

        <div className="body">
          {tab==="overview" && <>
            <div className="sgrid">
              {[["48","Teams"],["104","Matches"],["16","Host Cities"],["3","Host Nations"],["12","Groups"],["39","Days"]].map(([n,l])=>(
                <div key={l} className="scard"><div className="snum">{n}</div><div className="slbl">{l}</div></div>
              ))}
            </div>
            <div className="sec">Tournament Stages</div>
            <div className="tl">
              {[
                {name:"Group Stage",dt:"Jun 11 – Jun 27",det:"72 matches · 12 groups",c:"#4ade80"},
                {name:"Round of 32",dt:"Jun 28 – Jul 3",det:"16 matches (new stage)",c:"#60a5fa"},
                {name:"Round of 16",dt:"Jul 4 – Jul 7",det:"8 matches",c:"#c084fc"},
                {name:"Quarterfinals",dt:"Jul 9 – Jul 11",det:"4 matches",c:"#fb923c"},
                {name:"Semifinals",dt:"Jul 14 – Jul 15",det:"2 matches",c:"#f472b6"},
                {name:"3rd Place Match",dt:"Jul 18",det:"Hard Rock Stadium, Miami",c:"#94a3b8"},
                {name:"THE FINAL",dt:"Jul 19",det:"MetLife Stadium, East Rutherford NJ",c:"#2563EB"},
              ].map(s=>(
                <div key={s.name} className="tlrow" style={{borderLeftColor:s.c}}>
                  <div className="tlname" style={{color:s.name==="THE FINAL"?"#C8102E":undefined}}>{s.name}</div>
                  <div className="tldet">{s.det}</div>
                  <div className="tldt">{s.dt}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20}}>
              <div className="sec">Key Kickoffs (your local time)</div>
              <div className="tl">
                <div className="tlrow" style={{borderLeftColor:"#C8102E"}}>
                  <div className="tlname">Opening Match</div>
                  <div className="tldet">🇲🇽 Mexico vs 🇿🇦 South Africa · Estadio Azteca, Mexico City</div>
                  <div className="tldt">Jun 11 · {formatLocal("2026-06-11T19:00:00Z").timeStr} {tzAbbr}</div>
                </div>
                <div className="tlrow" style={{borderLeftColor:"#C8102E"}}>
                  <div className="tlname">World Cup Final</div>
                  <div className="tldet">MetLife Stadium, East Rutherford, New Jersey</div>
                  <div className="tldt">Jul 19 · {formatLocal("2026-07-19T19:00:00Z").timeStr} {tzAbbr}</div>
                </div>
              </div>
            </div>
          </>}

          {tab==="groups" && (
            <div className="gl">
              <div className="glist">
                {GROUPS.map(g=>(
                  <button key={g.id} className={`gbtn ${sel===g.id?"on":""}`} onClick={()=>setSel(g.id)}>
                    <span className="gltr">{g.id}</span>
                    <span className="gtmini">{g.teams.map(t=><span key={t} style={{display:"block",color:hl(t)?"#E8A020":undefined,fontWeight:hl(t)?700:undefined}}>{FLAGS[t]||""} {t}</span>)}</span>
                  </button>
                ))}
              </div>
              <div>
                <div className="ghead">GROUP {sel}</div>
                <table className="stbl">
                  <thead>
                    <tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr>
                  </thead>
                  <tbody>
                    {standings.map((s,i)=>(
                      <tr key={s.team} className={i<2?"q":""}>
                        <td><span className={`rnk ${i<2?"top":""}`}>{i+1}</span><span className={hl(s.team)?"hl-team":""}>{FLAGS[s.team]} {s.team}</span></td>
                        <td>{s.p}</td><td>{s.w}</td><td>{s.d}</td><td>{s.l}</td>
                        <td>{s.gf}</td><td>{s.ga}</td>
                        <td>{s.gd>0?`+${s.gd}`:s.gd}</td>
                        <td><strong>{s.pts}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mhd">
                  Matches
                  <span className="tz-badge">📍 {tzAbbr}</span>
                  <span style={{fontWeight:400,color:"#8299B8",letterSpacing:0,textTransform:"none",fontSize:11}}>tap score to edit</span>
                </div>
                <div className="mlist">
                  {curMatches.map((m,i)=>{
                    const lc = m.utc ? formatLocal(m.utc) : null;
                    return (
                      <div key={i} className="mrow">
                        <div className="mrow-main">
                          <div className={`mteam${hl(m.home)?" hl-team":""}`}>{FLAGS[m.home]} {m.home}</div>
                          <div className={`msc ${m.homeScore===null?"pend":""}`}
                            onClick={()=>{ setEditM({kind:"group",g:sel,i}); setSc({h:m.homeScore?.toString()??"",a:m.awayScore?.toString()??""});}}>
                            {m.homeScore!==null?`${m.homeScore} – ${m.awayScore}`:"vs"}
                          </div>
                          <div className={`mteam away${hl(m.away)?" hl-team":""}`}>{m.away} {FLAGS[m.away]}</div>
                        </div>
                        {lc && <div className="mrow-meta">
                          <span className="mtime">{lc.dateStr} · {lc.timeStr} {tzAbbr}</span>
                          <span>{m.venue}</span>
                        </div>}
                      </div>
                    );
                  })}
                </div>
                <div className="note">Green rows = qualify for Round of 32</div>
              </div>
            </div>
          )}

          {tab==="schedule" && <>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"#475569"}}>All times shown in your local timezone</span>
              <span className="tz-badge">📍 {tzAbbr}</span>
              {schedStage!=="Group Stage" && <span style={{fontSize:11,color:"#8299B8"}}>· tap score to edit</span>}
            </div>
            <div className="stg-filt">
              {["Group Stage","Round of 32","Round of 16","Quarterfinals","Semifinals","3rd Place","Final"].map(s=>(
                <button key={s} className={`sfbtn ${schedStage===s?"on":""}`} onClick={()=>setSchedStage(s)}>{s}</button>
              ))}
            </div>
            {Object.entries(byDay).map(([day,matches])=>(
              <div key={day} className="sched-day">
                <div className="sday-hdr">{day}</div>
                {matches.map((m,i)=>{
                  const {timeStr} = formatLocal(m.utc);
                  const isKo = "mn" in m && !!m.mn;
                  const koMn = isKo ? (m as KnockoutMatch).mn : 0;
                  const ks = isKo ? koScores[koMn] : undefined;
                  const hasScore = !!ks && ks.homeScore!==null;
                  const label = isKo ? `M${koMn}` : "g" in m && m.g ? `Grp ${m.g}` : "";
                  return (
                    <div key={i} className="srow">
                      <div className="srow-grp">{label}</div>
                      <div className="srow-body">
                        <div className="srow-teams">
                          {m.away ? <>
                            <span className={hl(m.home)?"hl-team":""}>{FLAGS[m.home]||""} {m.home}</span>
                            {isKo
                              ? <span className={`msc${hasScore?"":" pend"}`}
                                  onClick={()=>{ setEditM({kind:"ko",mn:koMn}); setSc({h:ks?.homeScore?.toString()??"",a:ks?.awayScore?.toString()??""});}}>
                                  {hasScore?`${ks!.homeScore} – ${ks!.awayScore}`:"vs"}
                                </span>
                              : <span className="srow-vs">vs</span>}
                            <span className={hl(m.away as string)?"hl-team":""}>{m.away} {FLAGS[m.away as string]||""}</span>
                          </> : <span style={{color:"#5A6E8A"}}>{m.home}</span>}
                        </div>
                        <div className="srow-meta">
                          <span className="srow-time">{timeStr} {tzAbbr}</span>
                          <span>{m.venue}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </>}

          {tab==="cities" && <>
            {[
              {ctry:"🇺🇸 USA (11 cities)",cities:["New York/New Jersey — MetLife Stadium (Final)","Los Angeles — SoFi Stadium","Dallas — AT&T Stadium (Semifinal)","San Francisco Bay Area — Levi's Stadium","Miami — Hard Rock Stadium (3rd Place)","Atlanta — Mercedes-Benz Stadium (Semifinal)","Seattle — Lumen Field","Boston — Gillette Stadium","Houston — NRG Stadium","Kansas City — Arrowhead Stadium","Philadelphia — Lincoln Financial Field"]},
              {ctry:"🇲🇽 Mexico (3 cities)",cities:["Mexico City — Estadio Azteca (Opening Match)","Guadalajara — Estadio Akron","Monterrey — Estadio BBVA"]},
              {ctry:"🇨🇦 Canada (2 cities)",cities:["Toronto — BMO Field","Vancouver — BC Place"]},
            ].map(({ctry,cities})=>(
              <div key={ctry} className="ctry">
                <div className="ctitle">{ctry}<span style={{fontSize:11,fontFamily:"DM Sans",fontWeight:400,color:"#8299B8",letterSpacing:0}}>{cities.length} {cities.length===1?"city":"cities"}</span></div>
                <div className="cgrid">{cities.map(c=><div key={c} className="ccard">{c}</div>)}</div>
              </div>
            ))}
            <div style={{marginTop:12,padding:"12px 14px",background:"rgba(200,16,46,.05)",border:"1px solid rgba(200,16,46,.2)",borderRadius:8,fontSize:12,color:"#5A6E8A",lineHeight:1.8}}>
              <strong style={{color:"#C8102E"}}>Historic first:</strong> three nations jointly hosting a World Cup. USA hosts 78 of 104 matches · Mexico and Canada host 13 each.
            </div>
          </>}
        </div>

        {editM && em && (
          <>
            <div className="overlay" onClick={()=>setEditM(null)}/>
            <div className="modal">
              <div className="mtitle">UPDATE SCORE</div>
              <div className="msub">{FLAGS[em.home]} {em.home} &nbsp;vs&nbsp; {em.away} {FLAGS[em.away]}</div>
              <div className="sinp-row">
                <input className="sinp" type="number" min="0" max="20" value={sc.h} onChange={e=>setSc(p=>({...p,h:e.target.value}))} placeholder="0"/>
                <span className="svs">–</span>
                <input className="sinp" type="number" min="0" max="20" value={sc.a} onChange={e=>setSc(p=>({...p,a:e.target.value}))} placeholder="0"/>
              </div>
              <div className="mbtns">
                <button className="btn btn-s" onClick={()=>setEditM(null)}>Cancel</button>
                {em.homeScore!==null && <button className="btn btn-d" onClick={clearScore}>Clear</button>}
                <button className="btn btn-p" onClick={saveScore}>Save</button>
              </div>
            </div>
          </>
        )}

        <div style={{textAlign:"center",padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.05)",marginTop:8,fontSize:11,color:"#8299B8",letterSpacing:.5}}>
          Concept by <span style={{color:"#E2EAF6",fontWeight:600}}>Radwan Khawlie</span>
        </div>
      </div>
    </>
  );
}
