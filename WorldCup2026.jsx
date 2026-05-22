import { useState, useEffect } from "react";

const FLAGS = {
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿",
  "Canada":"🇨🇦","Bosnia & Herz.":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭",
  "Brazil":"🇧🇷","Morocco":"🇲🇦","Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "USA":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺","Türkiye":"🇹🇷",
  "Germany":"🇩🇪","Curaçao":"🇨🇼","Ivory Coast":"🇨🇮","Ecuador":"🇪🇨",
  "Netherlands":"🇳🇱","Japan":"🇯🇵","Sweden":"🇸🇪","Tunisia":"🇹🇳",
  "Belgium":"🇧🇪","Egypt":"🇪🇬","Iran":"🇮🇷","New Zealand":"🇳🇿",
  "Spain":"🇪🇸","Cape Verde":"🇨🇻","Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾",
  "France":"🇫🇷","Senegal":"🇸🇳","Iraq":"🇮🇶","Norway":"🇳🇴",
  "Argentina":"🇦🇷","Algeria":"🇩🇿","Austria":"🇦🇹","Jordan":"🇯🇴",
  "Portugal":"🇵🇹","DR Congo":"🇨🇩","Uzbekistan":"🇺🇿","Colombia":"🇨🇴",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦",
};

const GROUPS = [
  {id:"A",teams:["Mexico","South Africa","South Korea","Czechia"]},
  {id:"B",teams:["Canada","Bosnia & Herz.","Qatar","Switzerland"]},
  {id:"C",teams:["Brazil","Morocco","Haiti","Scotland"]},
  {id:"D",teams:["USA","Paraguay","Australia","Türkiye"]},
  {id:"E",teams:["Germany","Curaçao","Ivory Coast","Ecuador"]},
  {id:"F",teams:["Netherlands","Japan","Sweden","Tunisia"]},
  {id:"G",teams:["Belgium","Egypt","Iran","New Zealand"]},
  {id:"H",teams:["Spain","Cape Verde","Saudi Arabia","Uruguay"]},
  {id:"I",teams:["France","Senegal","Iraq","Norway"]},
  {id:"J",teams:["Argentina","Algeria","Austria","Jordan"]},
  {id:"K",teams:["Portugal","DR Congo","Uzbekistan","Colombia"]},
  {id:"L",teams:["England","Croatia","Ghana","Panama"]},
];

// ET = UTC-4 in summer. Convert ET time + date to UTC ISO
function etToUtc(dateStr, timeET) {
  const [h, m] = timeET.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCHours(h + 4, m);
  return d.toISOString();
}

const GM_RAW = [
  {g:"A",home:"Mexico",away:"South Africa",date:"2026-06-11",et:"15:00",venue:"Estadio Azteca, Mexico City"},
  {g:"A",home:"South Korea",away:"Czechia",date:"2026-06-11",et:"22:00",venue:"Estadio Akron, Guadalajara"},
  {g:"B",home:"Canada",away:"Bosnia & Herz.",date:"2026-06-12",et:"15:00",venue:"BMO Field, Toronto"},
  {g:"D",home:"USA",away:"Paraguay",date:"2026-06-12",et:"21:00",venue:"SoFi Stadium, Los Angeles"},
  {g:"B",home:"Qatar",away:"Switzerland",date:"2026-06-13",et:"15:00",venue:"Levi's Stadium, San Francisco"},
  {g:"C",home:"Brazil",away:"Morocco",date:"2026-06-13",et:"18:00",venue:"MetLife Stadium, New York/NJ"},
  {g:"C",home:"Haiti",away:"Scotland",date:"2026-06-13",et:"21:00",venue:"Gillette Stadium, Boston"},
  {g:"D",home:"Australia",away:"Türkiye",date:"2026-06-14",et:"00:00",venue:"BC Place, Vancouver"},
  {g:"E",home:"Germany",away:"Curaçao",date:"2026-06-14",et:"13:00",venue:"NRG Stadium, Houston"},
  {g:"F",home:"Netherlands",away:"Japan",date:"2026-06-14",et:"16:00",venue:"AT&T Stadium, Dallas"},
  {g:"E",home:"Ivory Coast",away:"Ecuador",date:"2026-06-14",et:"19:00",venue:"Lincoln Financial Field, Philadelphia"},
  {g:"F",home:"Sweden",away:"Tunisia",date:"2026-06-14",et:"22:00",venue:"Estadio BBVA, Monterrey"},
  {g:"H",home:"Spain",away:"Cape Verde",date:"2026-06-15",et:"12:00",venue:"Mercedes-Benz Stadium, Atlanta"},
  {g:"G",home:"Belgium",away:"Egypt",date:"2026-06-15",et:"15:00",venue:"Lumen Field, Seattle"},
  {g:"H",home:"Saudi Arabia",away:"Uruguay",date:"2026-06-15",et:"18:00",venue:"Hard Rock Stadium, Miami"},
  {g:"G",home:"Iran",away:"New Zealand",date:"2026-06-15",et:"21:00",venue:"SoFi Stadium, Los Angeles"},
  {g:"I",home:"France",away:"Senegal",date:"2026-06-16",et:"15:00",venue:"MetLife Stadium, New York/NJ"},
  {g:"I",home:"Iraq",away:"Norway",date:"2026-06-16",et:"18:00",venue:"Gillette Stadium, Boston"},
  {g:"J",home:"Argentina",away:"Algeria",date:"2026-06-16",et:"21:00",venue:"Arrowhead Stadium, Kansas City"},
  {g:"J",home:"Austria",away:"Jordan",date:"2026-06-17",et:"00:00",venue:"Levi's Stadium, San Francisco"},
  {g:"K",home:"Portugal",away:"DR Congo",date:"2026-06-17",et:"13:00",venue:"NRG Stadium, Houston"},
  {g:"L",home:"England",away:"Croatia",date:"2026-06-17",et:"16:00",venue:"AT&T Stadium, Dallas"},
  {g:"L",home:"Ghana",away:"Panama",date:"2026-06-17",et:"19:00",venue:"BMO Field, Toronto"},
  {g:"K",home:"Uzbekistan",away:"Colombia",date:"2026-06-17",et:"22:00",venue:"Estadio Azteca, Mexico City"},
  {g:"A",home:"Czechia",away:"South Africa",date:"2026-06-18",et:"12:00",venue:"Mercedes-Benz Stadium, Atlanta"},
  {g:"B",home:"Switzerland",away:"Bosnia & Herz.",date:"2026-06-18",et:"15:00",venue:"SoFi Stadium, Los Angeles"},
  {g:"B",home:"Canada",away:"Qatar",date:"2026-06-18",et:"18:00",venue:"BC Place, Vancouver"},
  {g:"A",home:"Mexico",away:"South Korea",date:"2026-06-18",et:"21:00",venue:"Estadio Akron, Guadalajara"},
  {g:"D",home:"USA",away:"Australia",date:"2026-06-19",et:"15:00",venue:"Lumen Field, Seattle"},
  {g:"C",home:"Scotland",away:"Morocco",date:"2026-06-19",et:"18:00",venue:"Gillette Stadium, Boston"},
  {g:"C",home:"Brazil",away:"Haiti",date:"2026-06-19",et:"20:30",venue:"Lincoln Financial Field, Philadelphia"},
  {g:"D",home:"Türkiye",away:"Paraguay",date:"2026-06-19",et:"23:00",venue:"Levi's Stadium, San Francisco"},
  {g:"F",home:"Netherlands",away:"Sweden",date:"2026-06-20",et:"13:00",venue:"NRG Stadium, Houston"},
  {g:"E",home:"Germany",away:"Ivory Coast",date:"2026-06-20",et:"16:00",venue:"BMO Field, Toronto"},
  {g:"E",home:"Ecuador",away:"Curaçao",date:"2026-06-20",et:"20:00",venue:"Arrowhead Stadium, Kansas City"},
  {g:"F",home:"Tunisia",away:"Japan",date:"2026-06-21",et:"00:00",venue:"Estadio BBVA, Monterrey"},
  {g:"H",home:"Spain",away:"Saudi Arabia",date:"2026-06-21",et:"12:00",venue:"Mercedes-Benz Stadium, Atlanta"},
  {g:"G",home:"Belgium",away:"Iran",date:"2026-06-21",et:"15:00",venue:"SoFi Stadium, Los Angeles"},
  {g:"H",home:"Uruguay",away:"Cape Verde",date:"2026-06-21",et:"18:00",venue:"Hard Rock Stadium, Miami"},
  {g:"G",home:"New Zealand",away:"Egypt",date:"2026-06-21",et:"21:00",venue:"BC Place, Vancouver"},
  {g:"J",home:"Argentina",away:"Austria",date:"2026-06-22",et:"13:00",venue:"AT&T Stadium, Dallas"},
  {g:"I",home:"France",away:"Iraq",date:"2026-06-22",et:"17:00",venue:"Lincoln Financial Field, Philadelphia"},
  {g:"I",home:"Norway",away:"Senegal",date:"2026-06-22",et:"20:00",venue:"MetLife Stadium, New York/NJ"},
  {g:"J",home:"Jordan",away:"Algeria",date:"2026-06-22",et:"23:00",venue:"Levi's Stadium, San Francisco"},
  {g:"K",home:"Portugal",away:"Uzbekistan",date:"2026-06-23",et:"13:00",venue:"NRG Stadium, Houston"},
  {g:"L",home:"England",away:"Ghana",date:"2026-06-23",et:"16:00",venue:"Gillette Stadium, Boston"},
  {g:"L",home:"Panama",away:"Croatia",date:"2026-06-23",et:"19:00",venue:"BMO Field, Toronto"},
  {g:"K",home:"Colombia",away:"DR Congo",date:"2026-06-23",et:"22:00",venue:"Estadio Akron, Guadalajara"},
  {g:"B",home:"Switzerland",away:"Canada",date:"2026-06-24",et:"15:00",venue:"BC Place, Vancouver"},
  {g:"B",home:"Bosnia & Herz.",away:"Qatar",date:"2026-06-24",et:"15:00",venue:"Lumen Field, Seattle"},
  {g:"C",home:"Scotland",away:"Brazil",date:"2026-06-24",et:"18:00",venue:"Hard Rock Stadium, Miami"},
  {g:"C",home:"Morocco",away:"Haiti",date:"2026-06-24",et:"18:00",venue:"Mercedes-Benz Stadium, Atlanta"},
  {g:"A",home:"Czechia",away:"Mexico",date:"2026-06-24",et:"21:00",venue:"Estadio Azteca, Mexico City"},
  {g:"A",home:"South Africa",away:"South Korea",date:"2026-06-24",et:"21:00",venue:"Estadio BBVA, Monterrey"},
  {g:"E",home:"Curaçao",away:"Ivory Coast",date:"2026-06-25",et:"16:00",venue:"Lincoln Financial Field, Philadelphia"},
  {g:"E",home:"Ecuador",away:"Germany",date:"2026-06-25",et:"16:00",venue:"MetLife Stadium, New York/NJ"},
  {g:"F",home:"Japan",away:"Sweden",date:"2026-06-25",et:"19:00",venue:"AT&T Stadium, Dallas"},
  {g:"F",home:"Tunisia",away:"Netherlands",date:"2026-06-25",et:"19:00",venue:"Arrowhead Stadium, Kansas City"},
  {g:"D",home:"Türkiye",away:"USA",date:"2026-06-25",et:"22:00",venue:"SoFi Stadium, Los Angeles"},
  {g:"D",home:"Paraguay",away:"Australia",date:"2026-06-25",et:"22:00",venue:"Levi's Stadium, San Francisco"},
  {g:"I",home:"Norway",away:"France",date:"2026-06-26",et:"15:00",venue:"Gillette Stadium, Boston"},
  {g:"I",home:"Senegal",away:"Iraq",date:"2026-06-26",et:"15:00",venue:"BMO Field, Toronto"},
  {g:"H",home:"Cape Verde",away:"Saudi Arabia",date:"2026-06-26",et:"20:00",venue:"NRG Stadium, Houston"},
  {g:"H",home:"Uruguay",away:"Spain",date:"2026-06-26",et:"20:00",venue:"Estadio Akron, Guadalajara"},
  {g:"G",home:"Egypt",away:"Iran",date:"2026-06-26",et:"23:00",venue:"Lumen Field, Seattle"},
  {g:"G",home:"New Zealand",away:"Belgium",date:"2026-06-26",et:"23:00",venue:"BC Place, Vancouver"},
  {g:"L",home:"Panama",away:"England",date:"2026-06-27",et:"17:00",venue:"MetLife Stadium, New York/NJ"},
  {g:"L",home:"Croatia",away:"Ghana",date:"2026-06-27",et:"17:00",venue:"Lincoln Financial Field, Philadelphia"},
  {g:"K",home:"Colombia",away:"Portugal",date:"2026-06-27",et:"19:30",venue:"Hard Rock Stadium, Miami"},
  {g:"K",home:"DR Congo",away:"Uzbekistan",date:"2026-06-27",et:"19:30",venue:"Mercedes-Benz Stadium, Atlanta"},
  {g:"J",home:"Algeria",away:"Austria",date:"2026-06-27",et:"22:00",venue:"Arrowhead Stadium, Kansas City"},
  {g:"J",home:"Jordan",away:"Argentina",date:"2026-06-27",et:"22:00",venue:"AT&T Stadium, Dallas"},
];

const KO_RAW = [
  {stage:"Round of 32",mn:73,home:"Runner-up A",away:"Runner-up B",date:"2026-06-28",et:"15:00",venue:"SoFi Stadium, Los Angeles"},
  {stage:"Round of 32",mn:76,home:"Winner C",away:"Runner-up F",date:"2026-06-29",et:"13:00",venue:"NRG Stadium, Houston"},
  {stage:"Round of 32",mn:74,home:"Winner E",away:"Best 3rd A/B/C/D/F",date:"2026-06-29",et:"16:30",venue:"Gillette Stadium, Boston"},
  {stage:"Round of 32",mn:75,home:"Winner F",away:"Runner-up C",date:"2026-06-29",et:"21:00",venue:"Estadio BBVA, Monterrey"},
  {stage:"Round of 32",mn:78,home:"Runner-up E",away:"Runner-up I",date:"2026-06-30",et:"13:00",venue:"AT&T Stadium, Dallas"},
  {stage:"Round of 32",mn:77,home:"Winner I",away:"Best 3rd C/D/F/G/H",date:"2026-06-30",et:"17:00",venue:"MetLife Stadium, New York/NJ"},
  {stage:"Round of 32",mn:79,home:"Winner A",away:"Best 3rd C/E/F/H/I",date:"2026-06-30",et:"21:00",venue:"Estadio Azteca, Mexico City"},
  {stage:"Round of 32",mn:80,home:"Winner L",away:"Best 3rd E/H/I/J/K",date:"2026-07-01",et:"12:00",venue:"Mercedes-Benz Stadium, Atlanta"},
  {stage:"Round of 32",mn:82,home:"Winner G",away:"Best 3rd A/E/H/I/J",date:"2026-07-01",et:"16:00",venue:"Lumen Field, Seattle"},
  {stage:"Round of 32",mn:81,home:"Winner D",away:"Best 3rd B/E/F/I/J",date:"2026-07-01",et:"20:00",venue:"Levi's Stadium, San Francisco"},
  {stage:"Round of 32",mn:84,home:"Winner H",away:"Runner-up J",date:"2026-07-02",et:"15:00",venue:"SoFi Stadium, Los Angeles"},
  {stage:"Round of 32",mn:83,home:"Runner-up K",away:"Runner-up L",date:"2026-07-02",et:"19:00",venue:"BMO Field, Toronto"},
  {stage:"Round of 32",mn:85,home:"Winner B",away:"Best 3rd E/F/G/I/J",date:"2026-07-02",et:"23:00",venue:"BC Place, Vancouver"},
  {stage:"Round of 32",mn:88,home:"Runner-up D",away:"Runner-up G",date:"2026-07-03",et:"14:00",venue:"AT&T Stadium, Dallas"},
  {stage:"Round of 32",mn:86,home:"Winner J",away:"Runner-up H",date:"2026-07-03",et:"18:00",venue:"Hard Rock Stadium, Miami"},
  {stage:"Round of 32",mn:87,home:"Winner K",away:"Best 3rd D/E/I/J/L",date:"2026-07-03",et:"21:30",venue:"Arrowhead Stadium, Kansas City"},
  {stage:"Round of 16",mn:90,home:"W73 vs W75",away:"",date:"2026-07-04",et:"13:00",venue:"NRG Stadium, Houston"},
  {stage:"Round of 16",mn:89,home:"W74 vs W77",away:"",date:"2026-07-04",et:"17:00",venue:"Lincoln Financial Field, Philadelphia"},
  {stage:"Round of 16",mn:91,home:"W76 vs W78",away:"",date:"2026-07-05",et:"16:00",venue:"MetLife Stadium, New York/NJ"},
  {stage:"Round of 16",mn:92,home:"W79 vs W80",away:"",date:"2026-07-05",et:"20:00",venue:"Estadio Azteca, Mexico City"},
  {stage:"Round of 16",mn:93,home:"W83 vs W84",away:"",date:"2026-07-06",et:"15:00",venue:"AT&T Stadium, Dallas"},
  {stage:"Round of 16",mn:94,home:"W81 vs W82",away:"",date:"2026-07-06",et:"20:00",venue:"Lumen Field, Seattle"},
  {stage:"Round of 16",mn:95,home:"W86 vs W88",away:"",date:"2026-07-07",et:"12:00",venue:"Mercedes-Benz Stadium, Atlanta"},
  {stage:"Round of 16",mn:96,home:"W85 vs W87",away:"",date:"2026-07-07",et:"16:00",venue:"BC Place, Vancouver"},
  {stage:"Quarterfinals",mn:97,home:"W89 vs W90",away:"",date:"2026-07-09",et:"16:00",venue:"Gillette Stadium, Boston"},
  {stage:"Quarterfinals",mn:98,home:"W93 vs W94",away:"",date:"2026-07-10",et:"15:00",venue:"SoFi Stadium, Los Angeles"},
  {stage:"Quarterfinals",mn:99,home:"W91 vs W92",away:"",date:"2026-07-11",et:"17:00",venue:"Hard Rock Stadium, Miami"},
  {stage:"Quarterfinals",mn:100,home:"W95 vs W96",away:"",date:"2026-07-11",et:"21:00",venue:"Arrowhead Stadium, Kansas City"},
  {stage:"Semifinals",mn:101,home:"W97 vs W98",away:"",date:"2026-07-14",et:"15:00",venue:"AT&T Stadium, Dallas"},
  {stage:"Semifinals",mn:102,home:"W99 vs W100",away:"",date:"2026-07-15",et:"15:00",venue:"Mercedes-Benz Stadium, Atlanta"},
  {stage:"3rd Place",mn:103,home:"Loser M101",away:"Loser M102",date:"2026-07-18",et:"17:00",venue:"Hard Rock Stadium, Miami"},
  {stage:"Final",mn:104,home:"Winner M101",away:"Winner M102",date:"2026-07-19",et:"15:00",venue:"MetLife Stadium, New York/NJ"},
];

const GROUP_MATCHES = GM_RAW.map(m => ({ ...m, utc: etToUtc(m.date, m.et), homeScore: null, awayScore: null }));
const KNOCKOUT_MATCHES = KO_RAW.map(m => ({ ...m, utc: etToUtc(m.date, m.et) }));

function formatLocal(utcStr) {
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

function getGroupMatches(teams) {
  return teams.flatMap((t, i) => teams.slice(i+1).map(t2 => {
    const gm = GROUP_MATCHES.find(m => m.home === t && m.away === t2);
    return gm ? { ...gm } : { home:t, away:t2, utc:null, venue:"", homeScore:null, awayScore:null };
  }));
}

function calcStandings(teams, results) {
  const s = Object.fromEntries(teams.map(t => [t, {p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}]));
  results.forEach(r => {
    if (r.homeScore === null) return;
    const [h, a] = [r.home, r.away];
    s[h].p++; s[a].p++;
    s[h].gf += r.homeScore; s[h].ga += r.awayScore;
    s[a].gf += r.awayScore; s[a].ga += r.homeScore;
    if (r.homeScore > r.awayScore) { s[h].w++; s[h].pts+=3; s[a].l++; }
    else if (r.homeScore < r.awayScore) { s[a].w++; s[a].pts+=3; s[h].l++; }
    else { s[h].d++; s[a].d++; s[h].pts++; s[a].pts++; }
  });
  return teams.map(t => ({ team:t, ...s[t], gd: s[t].gf - s[t].ga }))
    .sort((a,b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.wc{min-height:100vh;background:#07090f;color:#e2e8f0;font-family:'Outfit',sans-serif;background-image:radial-gradient(ellipse 70% 40% at 50% 0%,rgba(234,179,8,.07) 0%,transparent 70%)}
.hdr{padding:18px 22px 14px;border-bottom:1px solid rgba(255,255,255,.06)}
.hdr-top{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}
.htitle{font-family:'Bebas Neue',sans-serif;font-size:clamp(24px,5vw,40px);letter-spacing:3px;color:#fbbf24;line-height:1}
.hsub{font-size:11px;color:#475569;letter-spacing:2px;text-transform:uppercase;margin-top:3px}
.cdown{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.cdbox{background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.18);border-radius:8px;padding:8px 13px;text-align:center;min-width:58px}
.cdnum{font-family:'Bebas Neue',sans-serif;font-size:26px;color:#fbbf24;line-height:1}
.cdlbl{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:1px}
.cdsep{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#1e293b;padding-bottom:10px}
.tz-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);border-radius:5px;padding:2px 8px;font-size:10px;color:#fbbf24;font-weight:600;margin-left:6px;align-self:center}
.tabs{display:flex;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.06);overflow-x:auto}
.tbtn{padding:11px 17px;font-size:10.5px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;border:none;background:none;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;font-family:'Outfit',sans-serif;white-space:nowrap}
.tbtn:hover{color:#94a3b8}.tbtn.on{color:#fbbf24;border-bottom-color:#fbbf24}
.body{padding:18px 22px;max-width:1100px}
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:22px}
.scard{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:13px;text-align:center}
.snum{font-family:'Bebas Neue',sans-serif;font-size:38px;color:#fbbf24;line-height:1}
.slbl{font-size:9.5px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
.sec{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:#64748b;margin:0 0 9px}
.tl{display:flex;flex-direction:column;gap:5px}
.tlrow{display:flex;align-items:center;gap:11px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:7px;padding:9px 12px;border-left-width:3px}
.tlname{font-weight:600;font-size:12.5px;flex:1}.tldet{flex:2;font-size:10.5px;color:#64748b}.tldt{font-size:10.5px;color:#94a3b8;white-space:nowrap}
.gl{display:grid;grid-template-columns:195px 1fr;gap:16px}
.glist{display:flex;flex-direction:column;gap:4px}
.gbtn{display:flex;align-items:flex-start;gap:8px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:7px;padding:8px 10px;cursor:pointer;text-align:left;transition:all .15s;width:100%}
.gbtn:hover{background:rgba(255,255,255,.045)}.gbtn.on{background:rgba(251,191,36,.08);border-color:rgba(251,191,36,.28)}
.gltr{font-family:'Bebas Neue',sans-serif;font-size:19px;color:#fbbf24;line-height:1;min-width:13px}
.gtmini{font-size:9.5px;color:#64748b;line-height:1.65}
.ghead{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:#fbbf24;margin-bottom:11px}
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
.msc{font-family:'Bebas Neue',sans-serif;font-size:17px;color:#fbbf24;min-width:46px;text-align:center;cursor:pointer;padding:2px 4px;border-radius:4px;transition:background .15s}
.msc:hover{background:rgba(251,191,36,.1)}.msc.pend{color:#334155;font-size:10.5px;font-family:'Outfit',sans-serif;font-weight:500}
/* schedule tab */
.stg-filt{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px}
.sfbtn{padding:5px 10px;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#64748b;cursor:pointer;font-family:'Outfit',sans-serif;font-size:10.5px;font-weight:500;transition:all .15s}
.sfbtn:hover{background:rgba(255,255,255,.06)}.sfbtn.on{background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.3);color:#fbbf24}
.sched-day{margin-bottom:18px}
.sday-hdr{font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:2px;color:#64748b;padding:6px 11px;background:rgba(255,255,255,.025);border-radius:6px;margin-bottom:7px;border-left:3px solid rgba(251,191,36,.3)}
.srow{display:flex;align-items:stretch;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:7px;margin-bottom:4px;overflow:hidden}
.srow-grp{font-family:'Bebas Neue',sans-serif;font-size:11px;color:#fbbf24;writing-mode:vertical-rl;padding:5px 6px;background:rgba(251,191,36,.04);border-right:1px solid rgba(255,255,255,.05);min-width:24px;display:flex;align-items:center;justify-content:center}
.srow-body{flex:1;padding:7px 11px}
.srow-teams{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:500;margin-bottom:4px}
.srow-vs{color:#334155;font-size:10px;font-family:'Bebas Neue',sans-serif}
.srow-meta{display:flex;flex-wrap:wrap;gap:5px;font-size:9.5px;color:#64748b}
.srow-time{background:rgba(255,255,255,.04);border-radius:4px;padding:2px 6px;color:#94a3b8}
/* cities */
.ctry{margin-bottom:18px}
.ctitle{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:2px;margin-bottom:8px;display:flex;align-items:center;gap:8px}
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:5px}
.ccard{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:6px;padding:7px 11px;font-size:11.5px;font-weight:500}
/* modal */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:98}
.modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#0f1623;border:1px solid rgba(251,191,36,.25);border-radius:13px;padding:22px;z-index:99;min-width:270px;box-shadow:0 30px 60px rgba(0,0,0,.9)}
.mtitle{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;color:#fbbf24;margin-bottom:3px;text-align:center}
.msub{text-align:center;font-size:10.5px;color:#475569;margin-bottom:14px}
.sinp-row{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:16px}
.sinp{width:56px;height:56px;text-align:center;font-family:'Bebas Neue',sans-serif;font-size:26px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:7px;color:#fbbf24;outline:none}
.sinp:focus{border-color:rgba(251,191,36,.45)}
.svs{font-family:'Bebas Neue',sans-serif;font-size:17px;color:#1e293b}
.mbtns{display:flex;gap:6px}
.btn{flex:1;padding:9px;border:none;border-radius:7px;cursor:pointer;font-family:'Outfit',sans-serif;font-weight:600;font-size:11px;transition:all .15s}
.btn-p{background:#fbbf24;color:#000}.btn-p:hover{background:#fcd34d}
.btn-s{background:rgba(255,255,255,.05);color:#94a3b8}.btn-s:hover{background:rgba(255,255,255,.08)}
.btn-d{background:rgba(239,68,68,.12);color:#f87171}.btn-d:hover{background:rgba(239,68,68,.22)}
.note{margin-top:7px;font-size:10px;color:#334155}
@media(max-width:640px){.gl{grid-template-columns:1fr}.glist{display:grid;grid-template-columns:repeat(4,1fr)}.body{padding:13px}}
`;

export default function WorldCup2026() {
  const [tab, setTab] = useState("overview");
  const [sel, setSel] = useState("A");
  const [results, setResults] = useState(() => {
    const r = {};
    GROUPS.forEach(g => { r[g.id] = getGroupMatches(g.teams); });
    return r;
  });
  const [editM, setEditM] = useState(null);
  const [sc, setSc] = useState({h:"",a:""});
  const [cd, setCd] = useState({d:0,h:0,m:0,s:0});
  const [schedStage, setSchedStage] = useState("Group Stage");
  const tzAbbr = getTzAbbr();

  useEffect(() => {
    const target = new Date("2026-06-11T19:00:00Z");
    const tick = () => {
      const diff = target - new Date();
      if (diff <= 0) { setCd({d:0,h:0,m:0,s:0}); return; }
      setCd({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) });
    };
    tick(); const t = setInterval(tick,1000); return ()=>clearInterval(t);
  }, []);

  function saveScore() {
    const hv=parseInt(sc.h), av=parseInt(sc.a);
    if (!editM||isNaN(hv)||isNaN(av)||hv<0||av<0) return;
    setResults(p => { const n={...p}; n[editM.g]=n[editM.g].map((m,i)=>i===editM.i?{...m,homeScore:hv,awayScore:av}:m); return n; });
    setEditM(null);
  }
  function clearScore() {
    setResults(p => { const n={...p}; n[editM.g]=n[editM.g].map((m,i)=>i===editM.i?{...m,homeScore:null,awayScore:null}:m); return n; });
    setEditM(null);
  }

  const curGroup = GROUPS.find(g=>g.id===sel);
  const curMatches = results[sel];
  const standings = calcStandings(curGroup.teams, curMatches);
  const em = editM ? results[editM.g][editM.i] : null;
  const p2 = v => String(v).padStart(2,"0");

  // Schedule: group by local day
  const schedMatches = schedStage==="Group Stage"
    ? GROUP_MATCHES
    : KNOCKOUT_MATCHES.filter(m=>m.stage===schedStage);

  const byDay = schedMatches.reduce((acc,m) => {
    const {dateStr} = formatLocal(m.utc);
    if (!acc[dateStr]) acc[dateStr]=[];
    acc[dateStr].push(m);
    return acc;
  }, {});

  return (
    <>
      <style>{CSS}</style>
      <div className="wc">
        {/* CREDIT TOP */}
        <div style={{textAlign:"center",padding:"7px 16px",background:"rgba(251,191,36,.04)",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:11,color:"#475569",letterSpacing:.5}}>
          Generated with <span style={{color:"#fbbf24",fontWeight:600}}>Claude</span> &nbsp;|&nbsp; Concept by <span style={{color:"#e2e8f0",fontWeight:500}}>Radwan Khawlie</span>
        </div>

        {/* HEADER */}
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

        {/* TABS */}
        <div className="tabs">
          {[["overview","Overview"],["groups","Groups & Scores"],["schedule","Full Schedule"],["cities","Host Cities"]].map(([v,l])=>(
            <button key={v} className={`tbtn ${tab===v?"on":""}`} onClick={()=>setTab(v)}>{l}</button>
          ))}
        </div>

        <div className="body">

          {/* OVERVIEW */}
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
                {name:"THE FINAL",dt:"Jul 19",det:"MetLife Stadium, East Rutherford NJ",c:"#fbbf24"},
              ].map(s=>(
                <div key={s.name} className="tlrow" style={{borderLeftColor:s.c}}>
                  <div className="tlname" style={{color:s.name==="THE FINAL"?"#fbbf24":undefined}}>{s.name}</div>
                  <div className="tldet">{s.det}</div>
                  <div className="tldt">{s.dt}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20}}>
              <div className="sec">Key Kickoffs (your local time)</div>
              <div className="tl">
                <div className="tlrow" style={{borderLeftColor:"#fbbf24"}}>
                  <div className="tlname">Opening Match</div>
                  <div className="tldet">🇲🇽 Mexico vs 🇿🇦 South Africa · Estadio Azteca, Mexico City</div>
                  <div className="tldt">Jun 11 · {formatLocal("2026-06-11T19:00:00Z").timeStr} {tzAbbr}</div>
                </div>
                <div className="tlrow" style={{borderLeftColor:"#fbbf24"}}>
                  <div className="tlname">World Cup Final</div>
                  <div className="tldet">MetLife Stadium, East Rutherford, New Jersey</div>
                  <div className="tldt">Jul 19 · {formatLocal("2026-07-19T19:00:00Z").timeStr} {tzAbbr}</div>
                </div>
              </div>
            </div>
          </>}

          {/* GROUPS & SCORES */}
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
                            onClick={()=>{ setEditM({g:sel,i}); setSc({h:m.homeScore??"",a:m.awayScore??""});}}>
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

          {/* FULL SCHEDULE */}
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
                  const label = m.mn ? `M${m.mn}` : m.g ? `Grp ${m.g}` : "";
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

          {/* HOST CITIES */}
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
            <div style={{marginTop:12,padding:"12px 14px",background:"rgba(251,191,36,.04)",border:"1px solid rgba(251,191,36,.12)",borderRadius:8,fontSize:11,color:"#64748b",lineHeight:1.8}}>
              <strong style={{color:"#fbbf24"}}>Historic first:</strong> three nations jointly hosting a FIFA World Cup. USA hosts 78 of 104 matches · Mexico and Canada host 13 each.
            </div>
          </>}

        </div>

        {/* SCORE MODAL */}
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
        {/* CREDIT BOTTOM */}
        <div style={{textAlign:"center",padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,.05)",marginTop:8,fontSize:11,color:"#475569",letterSpacing:.5}}>
          Generated with <span style={{color:"#fbbf24",fontWeight:600}}>Claude</span> &nbsp;|&nbsp; Concept by <span style={{color:"#e2e8f0",fontWeight:500}}>Radwan Khawlie</span>
        </div>

      </div>
    </>
  );
}
