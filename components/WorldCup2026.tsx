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
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.wc{min-height:100vh;background:#060D1A;color:#e2e8f0;font-family:'Outfit',sans-serif;background-image:radial-gradient(ellipse 70% 40% at 50% 0%,rgba(37,99,235,.08) 0%,transparent 70%)}
.hdr{padding:18px 22px 14px;border-bottom:1px solid rgba(255,255,255,.06)}
.hdr-top{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}
.htitle{font-family:'Bebas Neue',sans-serif;font-size:clamp(24px,5vw,40px);letter-spacing:3px;color:#2563EB;line-height:1}
.hsub{font-size:11px;color:#475569;letter-spacing:2px;text-transform:uppercase;margin-top:3px}
.cdown{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.cdbox{background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.25);border-radius:8px;padding:8px 13px;text-align:center;min-width:58px}
.cdnum{font-family:'Bebas Neue',sans-serif;font-size:26px;color:#2563EB;line-height:1}
.cdlbl{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:1px}
.cdsep{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#0D1E3A;padding-bottom:10px}
.tz-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(37,99,235,.08);border:1px solid rgba(37,99,235,.25);border-radius:5px;padding:2px 8px;font-size:10px;color:#2563EB;font-weight:600;margin-left:6px;align-self:center}
.tabs{display:flex;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.06);overflow-x:auto}
.tbtn{padding:11px 17px;font-size:10.5px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;border:none;background:none;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;font-family:'Outfit',sans-serif;white-space:nowrap}
.tbtn:hover{color:#94a3b8}.tbtn.on{color:#2563EB;border-bottom-color:#2563EB}
.body{padding:18px 22px;max-width:1100px}
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:22px}
.scard{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:13px;text-align:center}
.snum{font-family:'Bebas Neue',sans-serif;font-size:38px;color:#2563EB;line-height:1}
.slbl{font-size:9.5px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
.sec{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:#64748b;margin:0 0 9px}
.tl{display:flex;flex-direction:column;gap:5px}
.tlrow{display:flex;align-items:center;gap:11px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:7px;padding:9px 12px;border-left-width:3px}
.tlname{font-weight:600;font-size:12.5px;flex:1}.tldet{flex:2;font-size:10.5px;color:#64748b}.tldt{font-size:10.5px;color:#94a3b8;white-space:nowrap}
.gl{display:grid;grid-template-columns:195px 1fr;gap:16px}
.glist{display:flex;flex-direction:column;gap:4px}
.gbtn{display:flex;align-items:flex-start;gap:8px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:7px;padding:8px 10px;cursor:pointer;text-align:left;transition:all .15s;width:100%}
.gbtn:hover{background:rgba(255,255,255,.045)}.gbtn.on{background:rgba(37,99,235,.08);border-color:rgba(37,99,235,.35)}
.gltr{font-family:'Bebas Neue',sans-serif;font-size:19px;color:#2563EB;line-height:1;min-width:13px}
.gtmini{font-size:9.5px;color:#64748b;line-height:1.65}
.ghead{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:#2563EB;margin-bottom:11px}
.stbl{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px}
.stbl th{font-size:9.5px;text-transform:uppercase;letter-spacing:1px;color:#475569;padding:5px 7px;text-align:center;border-bottom:1px solid rgba(255,255,255,.06)}
.stbl th:first-child{text-align:left}
.stbl td{padding:7px 7px;text-align:center;border-bottom:1px solid rgba(255,255,255,.04)}
.stbl td:first-child{text-align:left;font-weight:500}
.stbl .q td{background:rgba(74,222,128,.04)}.stbl .q td:not(:first-child){color:#4ade80}
.rnk{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;font-size:9px;font-weight:600;margin-right:5px;background:rgba(255,255,255,.05)}
.rnk.top{background:rgba(74,222,128,.15);color:#4ade80}
.mhd{font-size:9.5px;text-transform:uppercase;letter-spacing:1px;color:#475569;margin-bottom:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.mlist{display:flex;flex-direction:column;gap:4px}
.mrow{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:7px}
.mrow-main{display:flex;align-items:center;padding:8px 10px;gap:7px}
.mrow-meta{display:flex;align-items:center;gap:6px;padding:0 10px 7px;font-size:9.5px;color:#475569;flex-wrap:wrap}
.mrow-meta span{background:rgba(255,255,255,.04);border-radius:4px;padding:2px 6px}
.mrow-meta .mtime{color:#94a3b8}
.mteam{display:flex;align-items:center;gap:4px;font-size:12px;flex:1}
.mteam.away{justify-content:flex-end}
.msc{font-family:'Bebas Neue',sans-serif;font-size:17px;color:#2563EB;min-width:46px;text-align:center;cursor:pointer;padding:2px 4px;border-radius:4px;transition:background .15s}
.msc:hover{background:rgba(37,99,235,.12)}.msc.pend{color:#334155;font-size:10.5px;font-family:'Outfit',sans-serif;font-weight:500}
.stg-filt{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px}
.sfbtn{padding:5px 10px;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#64748b;cursor:pointer;font-family:'Outfit',sans-serif;font-size:10.5px;font-weight:500;transition:all .15s}
.sfbtn:hover{background:rgba(255,255,255,.06)}.sfbtn.on{background:rgba(37,99,235,.1);border-color:rgba(37,99,235,.4);color:#2563EB}
.sched-day{margin-bottom:18px}
.sday-hdr{font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:2px;color:#64748b;padding:6px 11px;background:rgba(255,255,255,.025);border-radius:6px;margin-bottom:7px;border-left:3px solid rgba(37,99,235,.5)}
.srow{display:flex;align-items:stretch;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:7px;margin-bottom:4px;overflow:hidden}
.srow-grp{font-family:'Bebas Neue',sans-serif;font-size:11px;color:#2563EB;writing-mode:vertical-rl;padding:5px 6px;background:rgba(37,99,235,.06);border-right:1px solid rgba(255,255,255,.05);min-width:24px;display:flex;align-items:center;justify-content:center}
.srow-body{flex:1;padding:7px 11px}
.srow-teams{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:500;margin-bottom:4px}
.srow-vs{color:#334155;font-size:10px;font-family:'Bebas Neue',sans-serif}
.srow-meta{display:flex;flex-wrap:wrap;gap:5px;font-size:9.5px;color:#64748b}
.srow-time{background:rgba(255,255,255,.04);border-radius:4px;padding:2px 6px;color:#94a3b8}
.ctry{margin-bottom:18px}
.ctitle{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:2px;margin-bottom:8px;display:flex;align-items:center;gap:8px}
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:5px}
.ccard{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:6px;padding:7px 11px;font-size:11.5px;font-weight:500}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:98}
.modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#0A1628;border:1px solid rgba(37,99,235,.4);border-radius:13px;padding:22px;z-index:99;min-width:270px;box-shadow:0 30px 60px rgba(0,0,0,.9)}
.mtitle{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;color:#2563EB;margin-bottom:3px;text-align:center}
.msub{text-align:center;font-size:10.5px;color:#475569;margin-bottom:14px}
.sinp-row{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:16px}
.sinp{width:56px;height:56px;text-align:center;font-family:'Bebas Neue',sans-serif;font-size:26px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:7px;color:#2563EB;outline:none}
.sinp:focus{border-color:rgba(37,99,235,.7)}
.svs{font-family:'Bebas Neue',sans-serif;font-size:17px;color:#0D1E3A}
.mbtns{display:flex;gap:6px}
.btn{flex:1;padding:9px;border:none;border-radius:7px;cursor:pointer;font-family:'Outfit',sans-serif;font-weight:600;font-size:11px;transition:all .15s}
.btn-p{background:#2563EB;color:#fff}.btn-p:hover{background:#3B82F6}
.btn-s{background:rgba(255,255,255,.05);color:#94a3b8}.btn-s:hover{background:rgba(255,255,255,.08)}
.btn-d{background:rgba(239,68,68,.12);color:#f87171}.btn-d:hover{background:rgba(239,68,68,.22)}
.note{margin-top:7px;font-size:10px;color:#334155}
@media(max-width:640px){.gl{grid-template-columns:1fr}.glist{display:grid;grid-template-columns:repeat(4,1fr)}.body{padding:13px}}
`;

interface Props { initialScores: ScoreMap }

export default function WorldCup2026({ initialScores }: Props) {
  const [tab, setTab] = useState("overview");
  const [sel, setSel] = useState("A");
  const [results, setResults] = useState<ResultsMap>(() => {
    const r: ResultsMap = {};
    GROUPS.forEach(g => { r[g.id] = getGroupMatches(g.teams); });
    Object.entries(initialScores).forEach(([key, sc]) => {
      const [gid, home, away] = key.split("|");
      if (r[gid]) {
        r[gid] = r[gid].map(m =>
          m.home === home && m.away === away ? { ...m, homeScore: sc.homeScore, awayScore: sc.awayScore } : m
        );
      }
    });
    return r;
  });
  const [editM, setEditM] = useState<{g:string,i:number}|null>(null);
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

  async function saveScore() {
    const hv = parseInt(sc.h), av = parseInt(sc.a);
    if (!editM || isNaN(hv) || isNaN(av) || hv < 0 || av < 0) return;
    const em = results[editM.g][editM.i];
    const key = `${editM.g}|${em.home}|${em.away}`;
    setResults(p => {
      const n = {...p};
      n[editM.g] = n[editM.g].map((m,i) => i===editM.i ? {...m,homeScore:hv,awayScore:av} : m);
      return n;
    });
    setEditM(null);
    await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: { homeScore: hv, awayScore: av } }),
    }).catch(() => {});
  }

  function clearScore() {
    if (!editM) return;
    const em = results[editM.g][editM.i];
    const key = `${editM.g}|${em.home}|${em.away}`;
    setResults(p => {
      const n = {...p};
      n[editM.g] = n[editM.g].map((m,i) => i===editM.i ? {...m,homeScore:null,awayScore:null} : m);
      return n;
    });
    setEditM(null);
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: { homeScore: null, awayScore: null } }),
    }).catch(() => {});
  }

  const curGroup = GROUPS.find(g => g.id === sel)!;
  const curMatches = results[sel];
  const standings = calcStandings(curGroup.teams, curMatches);
  const em = editM ? results[editM.g][editM.i] : null;
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
        <div style={{textAlign:"center",padding:"7px 16px",background:"rgba(37,99,235,.04)",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:11,color:"#475569",letterSpacing:.5}}>
          Generated with <span style={{color:"#2563EB",fontWeight:600}}>Claude</span> &nbsp;|&nbsp; Concept by <span style={{color:"#e2e8f0",fontWeight:500}}>Radwan Khawlie</span>
        </div>

        <div className="hdr">
          <div className="hdr-top">
            <span style={{fontSize:26}}>🏆</span>
            <div style={{flex:1}}>
              <div className="htitle">FIFA WORLD CUP 2026</div>
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
                  <div className="tlname" style={{color:s.name==="THE FINAL"?"#2563EB":undefined}}>{s.name}</div>
                  <div className="tldet">{s.det}</div>
                  <div className="tldt">{s.dt}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20}}>
              <div className="sec">Key Kickoffs (your local time)</div>
              <div className="tl">
                <div className="tlrow" style={{borderLeftColor:"#2563EB"}}>
                  <div className="tlname">Opening Match</div>
                  <div className="tldet">🇲🇽 Mexico vs 🇿🇦 South Africa · Estadio Azteca, Mexico City</div>
                  <div className="tldt">Jun 11 · {formatLocal("2026-06-11T19:00:00Z").timeStr} {tzAbbr}</div>
                </div>
                <div className="tlrow" style={{borderLeftColor:"#2563EB"}}>
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
                    <span className="gtmini">{g.teams.map(t=>`${FLAGS[t]||""} ${t}`).join("\n")}</span>
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
                        <td><span className={`rnk ${i<2?"top":""}`}>{i+1}</span>{FLAGS[s.team]} {s.team}</td>
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
                  <span style={{fontWeight:400,color:"#475569",letterSpacing:0,textTransform:"none",fontSize:9.5}}>tap score to edit</span>
                </div>
                <div className="mlist">
                  {curMatches.map((m,i)=>{
                    const lc = m.utc ? formatLocal(m.utc) : null;
                    return (
                      <div key={i} className="mrow">
                        <div className="mrow-main">
                          <div className="mteam">{FLAGS[m.home]} {m.home}</div>
                          <div className={`msc ${m.homeScore===null?"pend":""}`}
                            onClick={()=>{ setEditM({g:sel,i}); setSc({h:m.homeScore?.toString()??"",a:m.awayScore?.toString()??""});}}>
                            {m.homeScore!==null?`${m.homeScore} – ${m.awayScore}`:"vs"}
                          </div>
                          <div className="mteam away">{m.away} {FLAGS[m.away]}</div>
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
                  const label = "mn" in m && m.mn ? `M${m.mn}` : "g" in m && m.g ? `Grp ${m.g}` : "";
                  return (
                    <div key={i} className="srow">
                      <div className="srow-grp">{label}</div>
                      <div className="srow-body">
                        <div className="srow-teams">
                          {m.away ? <>
                            <span>{FLAGS[m.home]||""} {m.home}</span>
                            <span className="srow-vs">vs</span>
                            <span>{m.away} {FLAGS[m.away]||""}</span>
                          </> : <span style={{color:"#94a3b8"}}>{m.home}</span>}
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
                <div className="ctitle">{ctry}<span style={{fontSize:10.5,fontFamily:"Outfit",fontWeight:400,color:"#64748b",letterSpacing:0}}>{cities.length} {cities.length===1?"city":"cities"}</span></div>
                <div className="cgrid">{cities.map(c=><div key={c} className="ccard">{c}</div>)}</div>
              </div>
            ))}
            <div style={{marginTop:12,padding:"12px 14px",background:"rgba(37,99,235,.04)",border:"1px solid rgba(37,99,235,.15)",borderRadius:8,fontSize:11,color:"#64748b",lineHeight:1.8}}>
              <strong style={{color:"#2563EB"}}>Historic first:</strong> three nations jointly hosting a FIFA World Cup. USA hosts 78 of 104 matches · Mexico and Canada host 13 each.
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

        <div style={{textAlign:"center",padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.05)",marginTop:8,fontSize:11,color:"#475569",letterSpacing:.5}}>
          Generated with <span style={{color:"#2563EB",fontWeight:600}}>Claude</span> &nbsp;|&nbsp; Concept by <span style={{color:"#e2e8f0",fontWeight:500}}>Radwan Khawlie</span>
        </div>
      </div>
    </>
  );
}
