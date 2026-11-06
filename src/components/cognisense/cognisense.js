/**
 * CogniSense.js: Factory OS "CogniSense" (predictive maintenance) page in one file.
 * Stack: React + Tailwind CSS + @ant-design/icons (light theme).
 *
 * Install:  npm i @ant-design/icons   (Tailwind v3 must already be set up)
 * Use:      import CogniSense from "./CogniSense";  then render <CogniSense /> inside your page
 *           (for example, the "/home/cognisense" route in Home.js).
 * Note:     the file contains JSX. With Vite, name it CogniSense.jsx. Create React App accepts .js.
 */
import { Fragment, useEffect, useRef, useState } from "react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DownOutlined,
  RightOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

/* ======================================================================
   Constants and helpers
   ====================================================================== */
const SENSE = "#0d9488"; // CogniSense product colour
const nf = (o) => new Intl.NumberFormat("en", o);
const fN = (n) => nf().format(n);
const f1 = (n) => nf({ minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
const fC = (n) => nf({ notation: "compact", maximumFractionDigits: 1 }).format(n);
const fDate = (d) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(d);

const signed = (n, dec = 0) => {
  const abs = Math.abs(n);
  const body = abs >= 10000 ? fC(abs) : dec === 1 ? f1(abs) : fN(abs);
  return body;
};

function useElementWidth(ref, fallback = 600) {
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setW(Math.max(280, el.clientWidth));
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

const niceStep = (raw) => {
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

/* ======================================================================
   Sample data (replace with your API responses)
   ====================================================================== */
const data = {
  kpis: {
    assets_monitored: { value: 412, prior: 398 },
    fleet_health: { value: 87, prior: 84 },
    data_quality: { value: 96.4, prior: 95.1 },
    approved_this_week: { value: 58, prior: 47 },
    energy_saved_mwh: { value: 42, prior: 38 },
  },

  health_trend: [
    { week: "2026-08-17", health_score: 81, alerts: 64, actions_approved: 12 },
    { week: "2026-08-24", health_score: 82, alerts: 58, actions_approved: 15 },
    { week: "2026-08-31", health_score: 82, alerts: 61, actions_approved: 18 },
    { week: "2026-09-07", health_score: 83, alerts: 55, actions_approved: 21 },
    { week: "2026-09-14", health_score: 84, alerts: 52, actions_approved: 24 },
    { week: "2026-09-21", health_score: 84, alerts: 49, actions_approved: 27 },
    { week: "2026-09-28", health_score: 85, alerts: 47, actions_approved: 29 },
    { week: "2026-10-05", health_score: 85, alerts: 44, actions_approved: 31 },
    { week: "2026-10-12", health_score: 86, alerts: 43, actions_approved: 33 },
    { week: "2026-10-19", health_score: 86, alerts: 40, actions_approved: 36 },
    { week: "2026-10-26", health_score: 87, alerts: 38, actions_approved: 38 },
    { week: "2026-11-02", health_score: 87, alerts: 36, actions_approved: 41 },
  ],

  triage: [
    { rank: 1, asset: "Compressor C-204", plant: "Hosur", fault: "Outer race bearing defect", iso_zone: "D", rul_days: 9, lead_time_days: 14, criticality: "A", risk_score: 94, evidence: "BPFO at 3.2x shaft speed rose 41% in 14 days; velocity 7.8 mm/s (Zone D)" },
    { rank: 2, asset: "Cooling tower fan CT-3", plant: "Hosur", fault: "Imbalance", iso_zone: "C", rul_days: 21, lead_time_days: 7, criticality: "A", risk_score: 82, evidence: "1x radial amplitude up 2.3x since blade clean on 12 Oct" },
    { rank: 3, asset: "Hydraulic pump HP-11", plant: "Chakan", fault: "Cavitation", iso_zone: "C", rul_days: 18, lead_time_days: 21, criticality: "A", risk_score: 80, evidence: "Broadband noise 2-5 kHz; suction pressure 0.3 bar below spec" },
    { rank: 4, asset: "Main spindle motor SM-07", plant: "Chakan", fault: "Misalignment", iso_zone: "C", rul_days: 30, lead_time_days: 10, criticality: "A", risk_score: 71, evidence: "2x axial 180 deg phase shift across coupling" },
    { rank: 5, asset: "AHU-2 supply fan", plant: "Dubai JAFZA", fault: "Belt wear", iso_zone: "C", rul_days: 14, lead_time_days: 5, criticality: "B", risk_score: 66, evidence: "Belt frequency sidebands; motor current ripple 6%" },
    { rank: 6, asset: "Chiller compressor CH-1", plant: "Dubai JAFZA", fault: "Inner race defect", iso_zone: "C", rul_days: 27, lead_time_days: 28, criticality: "A", risk_score: 65, evidence: "BPFI harmonics with 1x sidebands; oil Fe ppm 34" },
    { rank: 7, asset: "Conveyor gearbox GB-18", plant: "Hosur", fault: "Gear mesh wear", iso_zone: "B", rul_days: 45, lead_time_days: 21, criticality: "B", risk_score: 52, evidence: "GMF sidebands growing; temperature +6 C vs baseline" },
    { rank: 8, asset: "Exhaust blower EB-5", plant: "Chakan", fault: "Looseness", iso_zone: "B", rul_days: 38, lead_time_days: 7, criticality: "B", risk_score: 47, evidence: "Sub-harmonics 0.5x present; mount bolt torque flagged" },
    { rank: 9, asset: "Coolant pump CP-22", plant: "Hosur", fault: "Cavitation", iso_zone: "B", rul_days: 52, lead_time_days: 14, criticality: "B", risk_score: 41, evidence: "Random high-frequency bursts correlate with low tank level" },
    { rank: 10, asset: "Boiler feed pump BFP-2", plant: "Chakan", fault: "Imbalance", iso_zone: "B", rul_days: 60, lead_time_days: 21, criticality: "B", risk_score: 37, evidence: "1x radial trending up 12% per week" },
  ],
};

const SPARKS = {
  health: data.health_trend.map((r) => r.health_score),
  actions: data.health_trend.map((r) => r.actions_approved),
};

/* ======================================================================
   Shared UI pieces
   ====================================================================== */
function Card({ title, note, children, className = "" }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {title && <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>}
      {note && <p className="mb-3 mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-500">{note}</p>}
      {children}
    </section>
  );
}

function Sparkline({ values, color, width = 64, height = 22 }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = 1 + (i / (values.length - 1)) * (width - 2);
      const y = height - 2 - ((v - min) / span) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KpiTile({ label, value, prior, decimals = 0, betterWhen = "up", color = SENSE, spark }) {
  const delta = value - prior;
  const good = delta === 0 ? null : betterWhen === "down" ? delta < 0 : delta > 0;
  const shown = decimals === 1 ? f1(value) : value >= 10000 ? fC(value) : fN(value);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="absolute bottom-4 left-0 top-4 w-1 rounded-r-full" style={{ background: color }} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {spark && <Sparkline values={spark} color={color} />}
      </div>
      <p className="mb-1 mt-2 text-[28px] font-semibold leading-none tracking-tight text-slate-900">{shown}</p>
      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        {delta !== 0 && (
          <span className={`inline-flex items-center gap-0.5 font-semibold ${good ? "text-emerald-600" : "text-rose-600"}`}>
            {delta > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {signed(delta, decimals)}
          </span>
        )}
        vs last week
      </p>
    </div>
  );
}

/* ======================================================================
   Header (title, plant filter, search)
   ====================================================================== */
const PLANTS = [
  { value: "", label: "All plants" },
  { value: "Hosur", label: "Hosur" },
  { value: "Chakan", label: "Chakan" },
  { value: "Dubai JAFZA", label: "Dubai JAFZA" },
];

function Header({ plant, onPlant, query, onQuery, searchRef }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 px-4 pt-2 sm:px-6">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2.5 text-[22px] font-semibold tracking-tight text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-base text-teal-600">
            <ThunderboltOutlined />
          </span>
          CogniSense · predictive maintenance
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
          Machine health from vibration, temperature and PLC signals, ranked by the fleet triage agent so the riskiest
          assets get attention first.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Plant" className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {PLANTS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onPlant(p.value)}
              className={`rounded-full px-3 py-1.5 text-[13px] transition ${
                plant === p.value ? "bg-slate-800 font-medium text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="flex min-w-[240px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-100">
          <SearchOutlined className="text-slate-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search assets and faults"
            aria-label="Search"
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
          <kbd className="rounded border border-slate-200 px-1.5 text-[11px] text-slate-400">/</kbd>
        </label>
      </div>
    </header>
  );
}

/* ======================================================================
   Top 10 at-risk machines
   ====================================================================== */
function RiskBar({ score, hot }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-block h-[7px] rounded ${hot ? "bg-rose-500" : "bg-teal-500"}`}
        style={{ width: Math.max(3, (score / 100) * 60) }}
      />
      <span className="tabular-nums">{score}</span>
    </span>
  );
}

function TriageTable({ rows }) {
  const [open, setOpen] = useState(null);

  return (
    <Card
      title="Top 10 at-risk machines"
      note="Ranked by the fleet triage agent: failure probability × criticality × spare lead time. Red: remaining useful life is shorter than the spare lead time. Click a row for the copilot's evidence."
    >
      <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11.5px] font-medium text-slate-500">
            <tr>
              <th className="px-3 py-2.5 text-right">#</th>
              <th className="px-3 py-2.5">Asset</th>
              <th className="hidden px-3 py-2.5 md:table-cell">Plant</th>
              <th className="px-3 py-2.5">Fault</th>
              <th className="hidden px-3 py-2.5 text-right md:table-cell">ISO</th>
              <th className="px-3 py-2.5 text-right">RUL d</th>
              <th className="hidden px-3 py-2.5 text-right md:table-cell">Lead d</th>
              <th className="px-3 py-2.5">Risk</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">No machines match this filter.</td>
              </tr>
            )}
            {rows.map((r) => {
              const hot = r.rul_days < r.lead_time_days;
              const isOpen = open === r.rank;
              return (
                <Fragment key={r.rank}>
                  <tr
                    onClick={() => setOpen(isOpen ? null : r.rank)}
                    className="cursor-pointer border-t border-slate-100 align-top hover:bg-slate-50/70"
                  >
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">{r.rank}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-900">
                      <span className="flex items-start gap-1.5">
                        <span className="mt-1 text-[10px] text-slate-400">{isOpen ? <DownOutlined /> : <RightOutlined />}</span>
                        {r.asset}
                      </span>
                    </td>
                    <td className="hidden px-3 py-2.5 md:table-cell">{r.plant}</td>
                    <td className="px-3 py-2.5">{r.fault}</td>
                    <td className="hidden px-3 py-2.5 text-right md:table-cell">{r.iso_zone}</td>
                    <td className={`px-3 py-2.5 text-right tabular-nums ${hot ? "font-semibold text-rose-600" : ""}`}>{fN(r.rul_days)}</td>
                    <td className="hidden px-3 py-2.5 text-right tabular-nums md:table-cell">{fN(r.lead_time_days)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5"><RiskBar score={r.risk_score} hot={hot} /></td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-slate-50/60">
                      <td colSpan={8} className="px-3 pb-3 pt-0 text-xs text-slate-600">
                        <div className="rounded-r-lg border-l-2 border-teal-300 bg-white px-3 py-2 italic">
                          Copilot evidence: {r.evidence}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ======================================================================
   Alerts raised vs actions approved (line chart)
   ====================================================================== */
function TrendChart({ rows }) {
  const wrapRef = useRef(null);
  const W = useElementWidth(wrapRef);
  const [hover, setHover] = useState(null);

  const H = 240;
  const m = { t: 14, r: 16, b: 28, l: 40 };
  const n = rows.length;
  const maxV = Math.max(...rows.flatMap((r) => [r.alerts, r.approved]));
  const step = niceStep((maxV * 1.1) / 4);
  const top = step * Math.ceil((maxV * 1.1) / step);
  const yTicks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);

  const x = (i) => m.l + (i / (n - 1)) * (W - m.l - m.r);
  const y = (v) => H - m.b - (v / top) * (H - m.t - m.b);
  const line = (key) => rows.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(" ");
  const area = `${line("approved")} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;

  const every = Math.ceil(n / Math.max(2, Math.floor(W / 90)));
  const last = rows[n - 1];
  const alertsBelow = last.alerts < last.approved;

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - m.l) / (W - m.l - m.r)) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  const hr = hover != null ? rows[hover] : null;

  return (
    <div ref={wrapRef} className="relative">
      <div className="mb-1.5 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />Alerts raised</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: SENSE }} />Actions approved</span>
      </div>

      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="block"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Weekly alerts raised versus actions approved, last 12 weeks"
      >
        <defs>
          <linearGradient id="sense-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={SENSE} stopOpacity="0.22" />
            <stop offset="1" stopColor={SENSE} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid + y axis */}
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
            <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11.5" fill="#94a3b8">{fN(t)}</text>
          </g>
        ))}

        {/* x axis */}
        {rows.map((r, i) =>
          i % every === 0 ? (
            <text key={r.week} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11.5" fill="#94a3b8">{r.label}</text>
          ) : null
        )}

        {/* series */}
        <path d={area} fill="url(#sense-area)" />
        <path d={line("alerts")} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={line("approved")} fill="none" stroke={SENSE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* end labels */}
        <text x={x(n - 1) - 4} y={y(last.alerts) + (alertsBelow ? 16 : -8)} textAnchor="end" fontSize="11.5" fill="#64748b">
          {last.alerts} alerts
        </text>
        <text x={x(n - 1) - 4} y={y(last.approved) + (alertsBelow ? -8 : 16)} textAnchor="end" fontSize="11.5" fill="#0f766e">
          {last.approved} approved
        </text>

        {/* hover rule + dots */}
        {hr && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={H - m.b} stroke="#cbd5e1" />
            <circle cx={x(hover)} cy={y(hr.alerts)} r="4" fill="#94a3b8" stroke="#fff" strokeWidth="2" />
            <circle cx={x(hover)} cy={y(hr.approved)} r="4" fill={SENSE} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hr && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: Math.min(W - 150, Math.max(0, x(hover) + 12)), top: 34 }}
        >
          <div className="text-slate-400">Week of {hr.label}</div>
          <div className="text-slate-700"><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-slate-300" />Alerts raised {fN(hr.alerts)}</div>
          <div className="text-slate-700"><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: SENSE }} />Actions approved {fN(hr.approved)}</div>
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   CogniSense page
   ====================================================================== */
export default function CogniSense() {
  const [plant, setPlant] = useState("");
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);

  // "/" focuses search, Esc clears it
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const triageRows = data.triage
    .filter((r) => (!plant || r.plant === plant) && (!q || `${r.asset} ${r.fault}`.toLowerCase().includes(q)))
    .sort((a, b) => a.rank - b.rank);

  const trendRows = data.health_trend.map((r) => ({
    week: r.week,
    label: fDate(new Date(r.week)),
    alerts: r.alerts,
    approved: r.actions_approved,
  }));

  const k = data.kpis;

  return (
    <div className="text-slate-700">
      <Header plant={plant} onPlant={setPlant} query={query} onQuery={setQuery} searchRef={searchRef} />

      <main className="space-y-4 px-4 pb-10 pt-4 sm:px-6">
        {/* KPI tiles */}
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
          <KpiTile label="Assets monitored" value={k.assets_monitored.value} prior={k.assets_monitored.prior} />
          <KpiTile label="Fleet health score" value={k.fleet_health.value} prior={k.fleet_health.prior} spark={SPARKS.health} />
          <KpiTile label="Data-quality score, %" value={k.data_quality.value} prior={k.data_quality.prior} decimals={1} />
          <KpiTile label="Actions approved" value={k.approved_this_week.value} prior={k.approved_this_week.prior} spark={SPARKS.actions} />
          <KpiTile label="Energy saved, MWh" value={k.energy_saved_mwh.value} prior={k.energy_saved_mwh.prior} />
        </div>

        {/* Triage table + trend chart */}
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr))]">
          <TriageTable rows={triageRows} />
          <Card
            title="Alerts raised vs actions approved"
            note="Weekly, last 12 weeks. The gap is what the agents are closing."
          >
            <TrendChart rows={trendRows} />
          </Card>
        </div>
      </main>
    </div>
  );
}