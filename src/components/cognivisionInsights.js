/**
 * CogniVisionInsight.js: Factory OS "CogniVision Insight" (safety and operations) page in one file.
 * Stack: React + Tailwind CSS + @ant-design/icons (light theme).
 *
 * Install:  npm i @ant-design/icons   (Tailwind v3 must already be set up)
 * Use:      import CogniVisionInsight from "./CogniVisionInsight";  then render <CogniVisionInsight />
 *           inside your page (for example, the "/home/insight" route in Home.js).
 * Note:     the file contains JSX. With Vite, name it CogniVisionInsight.jsx. Create React App accepts .js.
 */
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  SearchOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

/* ======================================================================
   Constants and helpers
   ====================================================================== */
const INSIGHT = "#7c3aed"; // CogniVision Insight product colour
const RED = "#e11d48";
const GREY = "#cbd5e1";

const nf = (o) => new Intl.NumberFormat("en", o);
const fN = (n) => nf().format(n);
const f1 = (n) => nf({ minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
const fC = (n) => nf({ notation: "compact", maximumFractionDigits: 1 }).format(n);
const fDate = (d) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(d);

const absFmt = (n, dec = 0) => {
  const a = Math.abs(n);
  return a >= 10000 ? fC(a) : dec === 1 ? f1(a) : fN(a);
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
    safety_events: { value: 14, prior: 22 },
    sop_compliance: { value: 94.2, prior: 91.8 },
    cameras_online: { value: 236, prior: 231 },
  },

  insight_trend: [
    { week: "2026-08-17", safety_events: 31, sop_violations: 88, near_misses: 9 },
    { week: "2026-08-24", safety_events: 29, sop_violations: 84, near_misses: 8 },
    { week: "2026-08-31", safety_events: 27, sop_violations: 81, near_misses: 9 },
    { week: "2026-09-07", safety_events: 26, sop_violations: 76, near_misses: 7 },
    { week: "2026-09-14", safety_events: 24, sop_violations: 72, near_misses: 7 },
    { week: "2026-09-21", safety_events: 23, sop_violations: 70, near_misses: 6 },
    { week: "2026-09-28", safety_events: 22, sop_violations: 66, near_misses: 6 },
    { week: "2026-10-05", safety_events: 20, sop_violations: 61, near_misses: 5 },
    { week: "2026-10-12", safety_events: 19, sop_violations: 58, near_misses: 5 },
    { week: "2026-10-19", safety_events: 17, sop_violations: 55, near_misses: 4 },
    { week: "2026-10-26", safety_events: 15, sop_violations: 51, near_misses: 4 },
    { week: "2026-11-02", safety_events: 14, sop_violations: 48, near_misses: 3 },
  ],

  insight_areas: [
    { area: "Machining bay A", plant: "Hosur", cameras: 24, ppe_compliance: 97.2, sop_compliance: 95.1, intrusions_7d: 2, near_misses_7d: 1, idle_minutes_7d: 340, status: "OK" },
    { area: "Assembly line 2", plant: "Hosur", cameras: 18, ppe_compliance: 94.8, sop_compliance: 92.6, intrusions_7d: 4, near_misses_7d: 3, idle_minutes_7d: 610, status: "Watch" },
    { area: "Dispatch yard", plant: "Hosur", cameras: 12, ppe_compliance: 89.5, sop_compliance: 88.0, intrusions_7d: 7, near_misses_7d: 5, idle_minutes_7d: 220, status: "Alert" },
    { area: "Press shop", plant: "Chakan", cameras: 20, ppe_compliance: 96.1, sop_compliance: 94.4, intrusions_7d: 1, near_misses_7d: 2, idle_minutes_7d: 415, status: "OK" },
    { area: "Paint shop", plant: "Chakan", cameras: 14, ppe_compliance: 98.4, sop_compliance: 96.8, intrusions_7d: 0, near_misses_7d: 0, idle_minutes_7d: 180, status: "OK" },
    { area: "Warehouse", plant: "Chakan", cameras: 22, ppe_compliance: 91.3, sop_compliance: 90.2, intrusions_7d: 5, near_misses_7d: 4, idle_minutes_7d: 520, status: "Watch" },
    { area: "Filling hall", plant: "Dubai JAFZA", cameras: 16, ppe_compliance: 98.9, sop_compliance: 97.5, intrusions_7d: 0, near_misses_7d: 1, idle_minutes_7d: 95, status: "OK" },
    { area: "Loading dock", plant: "Dubai JAFZA", cameras: 10, ppe_compliance: 93.0, sop_compliance: 91.1, intrusions_7d: 3, near_misses_7d: 2, idle_minutes_7d: 260, status: "Watch" },
  ],
};

const SAFETY_SPARK = data.insight_trend.map((r) => r.safety_events);

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

const TONES = {
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-rose-200 bg-rose-50 text-rose-700",
};
const STATUS_TONE = { Watch: "amber", OK: "green", Alert: "red" };

function StatusPill({ status }) {
  const tone = TONES[STATUS_TONE[status]] || "border-slate-200 bg-slate-50 text-slate-600";
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${tone}`}>
      {status}
    </span>
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

function KpiTile({ label, value, prior, decimals = 0, betterWhen = "up", color = INSIGHT, spark }) {
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
            {absFmt(delta, decimals)}
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
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-base text-violet-600">
            <VideoCameraOutlined />
          </span>
          CogniVision Insight · safety and operations
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
          PPE, SOP and zone-intrusion monitoring from your existing CCTV, with an EHS ticket drafted when an area goes
          to Alert.
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

        <label className="flex min-w-[240px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-100">
          <SearchOutlined className="text-slate-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search areas"
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
   Areas on existing CCTV
   ====================================================================== */
const complianceTone = (v) => (v >= 95 ? "bg-emerald-500" : v >= 92 ? "bg-amber-500" : "bg-rose-500");

function ComplianceBar({ value }) {
  // 80% to 100% mapped onto a 60 px bar
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span
        className={`inline-block h-[7px] rounded ${complianceTone(value)}`}
        style={{ width: Math.max(3, ((value - 80) / 20) * 60) }}
      />
      <span className="tabular-nums">{f1(value)}</span>
    </span>
  );
}

const STATUS_ORDER = { Alert: 0, Watch: 1, OK: 2 };

function AreasTable({ rows }) {
  return (
    <Card
      title="Areas on existing CCTV"
      note="Last 7 days per area. The safety agent drafts an EHS ticket when an area goes to Alert."
    >
      <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11.5px] font-medium text-slate-500">
            <tr>
              <th className="px-3 py-2.5">Area</th>
              <th className="hidden px-3 py-2.5 md:table-cell">Plant</th>
              <th className="hidden px-3 py-2.5 text-right md:table-cell">Cams</th>
              <th className="px-3 py-2.5">PPE %</th>
              <th className="px-3 py-2.5">SOP %</th>
              <th className="px-3 py-2.5 text-right">Intrusions</th>
              <th className="px-3 py-2.5 text-right">Near-misses</th>
              <th className="px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">No areas match this filter.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.area} className="align-top hover:bg-slate-50/70">
                <td className="px-3 py-2.5 font-medium text-slate-900">{r.area}</td>
                <td className="hidden px-3 py-2.5 md:table-cell">{r.plant}</td>
                <td className="hidden px-3 py-2.5 text-right tabular-nums md:table-cell">{r.cameras}</td>
                <td className="px-3 py-2.5"><ComplianceBar value={r.ppe_compliance} /></td>
                <td className="px-3 py-2.5"><ComplianceBar value={r.sop_compliance} /></td>
                <td className="px-3 py-2.5 text-right tabular-nums">{r.intrusions_7d}</td>
                <td className={`px-3 py-2.5 text-right tabular-nums ${r.near_misses_7d >= 4 ? "font-semibold text-rose-600" : ""}`}>
                  {r.near_misses_7d}
                </td>
                <td className="px-3 py-2.5"><StatusPill status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ======================================================================
   Safety events, SOP violations and near-misses (line chart)
   ====================================================================== */
const SERIES = [
  { key: "sopViolations", name: "SOP violations", short: "SOP", color: GREY, labelColor: "#64748b" },
  { key: "safetyEvents", name: "Safety events", short: "events", color: INSIGHT, labelColor: "#6d28d9", area: true },
  { key: "nearMisses", name: "Near-misses", short: "near-misses", color: RED, labelColor: "#be123c" },
];

function TrendChart({ rows }) {
  const wrapRef = useRef(null);
  const W = useElementWidth(wrapRef);
  const [hover, setHover] = useState(null);

  const H = 240;
  const m = { t: 14, r: 16, b: 28, l: 40 };
  const n = rows.length;
  const maxV = Math.max(...rows.flatMap((r) => SERIES.map((s) => r[s.key])));
  const step = niceStep((maxV * 1.1) / 4);
  const top = step * Math.ceil((maxV * 1.1) / step);
  const yTicks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);

  const x = (i) => m.l + (i / (n - 1)) * (W - m.l - m.r);
  const y = (v) => H - m.b - (v / top) * (H - m.t - m.b);
  const line = (key) => rows.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(" ");
  const areaPath = (key) => `${line(key)} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;

  const every = Math.ceil(n / Math.max(2, Math.floor(W / 90)));
  const last = rows[n - 1];

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
        {[SERIES[1], SERIES[0], SERIES[2]].map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name}
          </span>
        ))}
      </div>

      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="block"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Weekly safety events, SOP violations and near-misses, last 12 weeks"
      >
        <defs>
          <linearGradient id="insight-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={INSIGHT} stopOpacity="0.22" />
            <stop offset="1" stopColor={INSIGHT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
            <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11.5" fill="#94a3b8">{fN(t)}</text>
          </g>
        ))}

        {rows.map((r, i) =>
          i % every === 0 ? (
            <text key={r.week} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11.5" fill="#94a3b8">{r.label}</text>
          ) : null
        )}

        <path d={areaPath("safetyEvents")} fill="url(#insight-area)" />
        {SERIES.map((s) => (
          <path key={s.key} d={line(s.key)} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {SERIES.map((s) => (
          <text key={s.key} x={x(n - 1) - 4} y={y(last[s.key]) - 8} textAnchor="end" fontSize="11.5" fill={s.labelColor}>
            {fN(last[s.key])} {s.short}
          </text>
        ))}

        {hr && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={H - m.b} stroke="#cbd5e1" />
            {SERIES.map((s) => (
              <circle key={s.key} cx={x(hover)} cy={y(hr[s.key])} r="4" fill={s.color} stroke="#fff" strokeWidth="2" />
            ))}
          </g>
        )}
      </svg>

      {hr && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: Math.min(W - 160, Math.max(0, x(hover) + 12)), top: 34 }}
        >
          <div className="text-slate-400">Week of {hr.label}</div>
          {SERIES.map((s) => (
            <div key={s.key} className="text-slate-700">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.name} {fN(hr[s.key])}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   CogniVision Insight page
   ====================================================================== */
export default function CogniVisionInsight() {
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
  const areaRows = data.insight_areas
    .filter((r) => (!plant || r.plant === plant) && (!q || r.area.toLowerCase().includes(q)))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.ppe_compliance - b.ppe_compliance);

  const trendRows = data.insight_trend.map((r) => ({
    week: r.week,
    label: fDate(new Date(r.week)),
    safetyEvents: r.safety_events,
    sopViolations: r.sop_violations,
    nearMisses: r.near_misses,
  }));

  const k = data.kpis;

  return (
    <div className="text-slate-700">
      <Header plant={plant} onPlant={setPlant} query={query} onQuery={setQuery} searchRef={searchRef} />

      <main className="space-y-4 px-4 pb-10 pt-4 sm:px-6">
        {/* KPI tiles */}
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
          <KpiTile label="Safety events, 7 d" value={k.safety_events.value} prior={k.safety_events.prior} betterWhen="down" spark={SAFETY_SPARK} />
          <KpiTile label="SOP compliance, %" value={k.sop_compliance.value} prior={k.sop_compliance.prior} decimals={1} />
          <KpiTile label="Cameras online" value={k.cameras_online.value} prior={k.cameras_online.prior} />
        </div>

        {/* Areas table + trend chart */}
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr))]">
          <AreasTable rows={areaRows} />
          <Card
            title="Safety events, SOP violations and near-misses"
            note="Weekly, last 12 weeks, all plants."
          >
            <TrendChart rows={trendRows} />
          </Card>
        </div>
      </main>
    </div>
  );
}