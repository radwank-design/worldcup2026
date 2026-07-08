export const FLAGS: Record<string, string> = {
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

export const GROUPS = [
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
] as const;

// ET = UTC-4 in summer
export function etToUtc(dateStr: string, timeET: string): string {
  const [h, m] = timeET.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCHours(h + 4, m);
  return d.toISOString();
}

export interface RawMatch {
  g: string;
  home: string;
  away: string;
  date: string;
  et: string;
  venue: string;
}

export interface GroupMatch extends RawMatch {
  utc: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface KnockoutMatch {
  stage: string;
  mn: number;
  home: string;
  away: string;
  date: string;
  et: string;
  venue: string;
  utc: string;
}

export const GM_RAW: RawMatch[] = [
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
  {stage:"Round of 32",mn:73,home:"South Africa",away:"Canada",date:"2026-06-28",et:"15:00",venue:"SoFi Stadium, Los Angeles"},
  {stage:"Round of 32",mn:76,home:"Brazil",away:"Japan",date:"2026-06-29",et:"13:00",venue:"NRG Stadium, Houston"},
  {stage:"Round of 32",mn:74,home:"Germany",away:"Paraguay",date:"2026-06-29",et:"16:30",venue:"Gillette Stadium, Boston"},
  {stage:"Round of 32",mn:75,home:"Netherlands",away:"Morocco",date:"2026-06-29",et:"21:00",venue:"Estadio BBVA, Monterrey"},
  {stage:"Round of 32",mn:78,home:"Ivory Coast",away:"Norway",date:"2026-06-30",et:"13:00",venue:"AT&T Stadium, Dallas"},
  {stage:"Round of 32",mn:77,home:"France",away:"Sweden",date:"2026-06-30",et:"17:00",venue:"MetLife Stadium, New York/NJ"},
  {stage:"Round of 32",mn:79,home:"Mexico",away:"Ecuador",date:"2026-06-30",et:"21:00",venue:"Estadio Azteca, Mexico City"},
  {stage:"Round of 32",mn:80,home:"England",away:"DR Congo",date:"2026-07-01",et:"12:00",venue:"Mercedes-Benz Stadium, Atlanta"},
  {stage:"Round of 32",mn:82,home:"Belgium",away:"Senegal",date:"2026-07-01",et:"16:00",venue:"Lumen Field, Seattle"},
  {stage:"Round of 32",mn:81,home:"USA",away:"Bosnia & Herz.",date:"2026-07-01",et:"20:00",venue:"Levi's Stadium, San Francisco"},
  {stage:"Round of 32",mn:84,home:"Spain",away:"Austria",date:"2026-07-02",et:"15:00",venue:"SoFi Stadium, Los Angeles"},
  {stage:"Round of 32",mn:83,home:"Portugal",away:"Croatia",date:"2026-07-02",et:"19:00",venue:"BMO Field, Toronto"},
  {stage:"Round of 32",mn:85,home:"Switzerland",away:"Algeria",date:"2026-07-02",et:"23:00",venue:"BC Place, Vancouver"},
  {stage:"Round of 32",mn:88,home:"Australia",away:"Egypt",date:"2026-07-03",et:"14:00",venue:"AT&T Stadium, Dallas"},
  {stage:"Round of 32",mn:86,home:"Argentina",away:"Cape Verde",date:"2026-07-03",et:"18:00",venue:"Hard Rock Stadium, Miami"},
  {stage:"Round of 32",mn:87,home:"Colombia",away:"Ghana",date:"2026-07-03",et:"21:30",venue:"Arrowhead Stadium, Kansas City"},
  {stage:"Round of 16",mn:90,home:"Canada",away:"Morocco",date:"2026-07-04",et:"13:00",venue:"NRG Stadium, Houston"},
  {stage:"Round of 16",mn:89,home:"Paraguay",away:"France",date:"2026-07-04",et:"17:00",venue:"Lincoln Financial Field, Philadelphia"},
  {stage:"Round of 16",mn:91,home:"Brazil",away:"Norway",date:"2026-07-05",et:"16:00",venue:"MetLife Stadium, New York/NJ"},
  {stage:"Round of 16",mn:92,home:"Mexico",away:"England",date:"2026-07-05",et:"20:00",venue:"Estadio Azteca, Mexico City"},
  {stage:"Round of 16",mn:93,home:"Portugal",away:"Spain",date:"2026-07-06",et:"15:00",venue:"AT&T Stadium, Dallas"},
  {stage:"Round of 16",mn:94,home:"USA",away:"Belgium",date:"2026-07-06",et:"20:00",venue:"Lumen Field, Seattle"},
  {stage:"Round of 16",mn:95,home:"Argentina",away:"Egypt",date:"2026-07-07",et:"12:00",venue:"Mercedes-Benz Stadium, Atlanta"},
  {stage:"Round of 16",mn:96,home:"Switzerland",away:"Colombia",date:"2026-07-07",et:"16:00",venue:"BC Place, Vancouver"},
  {stage:"Quarterfinals",mn:97,home:"France",away:"Morocco",date:"2026-07-09",et:"16:00",venue:"Gillette Stadium, Boston"},
  {stage:"Quarterfinals",mn:98,home:"Spain",away:"Belgium",date:"2026-07-10",et:"15:00",venue:"SoFi Stadium, Los Angeles"},
  {stage:"Quarterfinals",mn:99,home:"Norway",away:"England",date:"2026-07-11",et:"17:00",venue:"Hard Rock Stadium, Miami"},
  {stage:"Quarterfinals",mn:100,home:"Argentina",away:"Switzerland",date:"2026-07-11",et:"21:00",venue:"Arrowhead Stadium, Kansas City"},
  {stage:"Semifinals",mn:101,home:"W97 vs W98",away:"",date:"2026-07-14",et:"15:00",venue:"AT&T Stadium, Dallas"},
  {stage:"Semifinals",mn:102,home:"W99 vs W100",away:"",date:"2026-07-15",et:"15:00",venue:"Mercedes-Benz Stadium, Atlanta"},
  {stage:"3rd Place",mn:103,home:"Loser M101",away:"Loser M102",date:"2026-07-18",et:"17:00",venue:"Hard Rock Stadium, Miami"},
  {stage:"Final",mn:104,home:"Winner M101",away:"Winner M102",date:"2026-07-19",et:"15:00",venue:"MetLife Stadium, New York/NJ"},
];

export const GROUP_MATCHES: GroupMatch[] = GM_RAW.map(m => ({
  ...m,
  utc: etToUtc(m.date, m.et),
  homeScore: null,
  awayScore: null,
}));

export const KNOCKOUT_MATCHES: KnockoutMatch[] = KO_RAW.map(m => ({
  ...m,
  utc: etToUtc(m.date, m.et),
}));

export function getGroupMatches(teams: readonly string[]): GroupMatch[] {
  return teams.flatMap((t, i) =>
    teams.slice(i + 1).map(t2 => {
      const gm = GROUP_MATCHES.find(m => m.home === t && m.away === t2);
      return gm ? { ...gm } : { g: "", home: t, away: t2, date: "", et: "", venue: "", utc: "", homeScore: null, awayScore: null };
    })
  );
}
