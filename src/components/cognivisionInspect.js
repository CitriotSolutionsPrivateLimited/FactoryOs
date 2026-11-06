/**
 * CogniVisionInspect.js: Factory OS "CogniVision Inspect" (line quality) page in one file.
 * Stack: React + Tailwind CSS + @ant-design/icons (light theme).
 *
 * Install:  npm i @ant-design/icons   (Tailwind v3 must already be set up)
 * Use:      import CogniVisionInspect from "./CogniVisionInspect";  then render <CogniVisionInspect />
 *           inside your page (for example, the "/home/inspect" route in Home.js).
 * Note:     the file contains JSX. With Vite, name it CogniVisionInspect.jsx. Create React App accepts .js.
 */
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ScanOutlined,
  SearchOutlined,
} from "@ant-design/icons";

/* ======================================================================
   Constants and helpers
   ====================================================================== */
const INSPECT = "#d97706"; // CogniVision Inspect product colour
const RED = "#e11d48";

const nf = (o) => new Intl.NumberFormat("en", o);
const fN = (n) => nf().format(n);
const f1 = (n) => nf({ minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
const f2 = (n) => nf({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fC = (n) => nf({ notation: "compact", maximumFractionDigits: 1 }).format(n);
const fDate = (d) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(d);

const absFmt = (n, dec = 0) => {
  const a = Math.abs(n);
  return a >= 10000 ? fC(a) : dec === 2 ? f2(a) : dec === 1 ? f1(a) : fN(a);
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
const TREND_START = Date.UTC(2026, 9, 7); // 2026-10-07
const inspected = [176200,178400,175900,180100,171300,168900,179800,181200,182600,179100,183400,177200,172800,180900,182300,184100,181700,183900,176400,170200,182800,184600,183100,185200,182400,179600,174800,184900,185800,184260];
const defects = [2310,2290,2250,2410,2180,2120,2260,2240,2190,2130,2160,2060,1990,2040,2010,1980,1920,1900,1810,1740,1820,1790,1760,1730,1700,1660,1610,1710,1690,1695];
const falseRejects = [420,415,402,398,381,377,366,360,352,344,340,331,328,319,312,304,298,291,286,280,272,266,259,251,246,240,236,231,228,224];

const data = {
  kpis: {
    units_inspected: { value: 184260, prior: 179840 },
    defect_rate: { value: 0.92, prior: 1.21 },
    false_reject_rate: { value: 0.18, prior: 0.24 },
  },

  inspect_trend: inspected.map((n, i) => ({
    day: TREND_START + i * 86400000,
    inspected: n,
    defects: defects[i],
    false_rejects: falseRejects[i],
  })),

  inspect_lines: [
    { line: "Line 1 Cylinder head", plant: "Hosur", part: "Cylinder head", inspected_24h: 8420, defects_24h: 61, defect_rate: 0.72, yield: 99.28, model_version: "v4.2", model_accuracy: 99.1, drift: "Low", status: "OK" },
    { line: "Line 2 Crankcase", plant: "Hosur", part: "Crankcase", inspected_24h: 6180, defects_24h: 88, defect_rate: 1.42, yield: 98.58, model_version: "v3.9", model_accuracy: 98.4, drift: "Medium", status: "Watch" },
    { line: "Line 3 Brake disc", plant: "Chakan", part: "Brake disc", inspected_24h: 11240, defects_24h: 74, defect_rate: 0.66, yield: 99.34, model_version: "v5.0", model_accuracy: 99.3, drift: "Low", status: "OK" },
    { line: "Line 4 Piston", plant: "Chakan", part: "Piston", inspected_24h: 14360, defects_24h: 201, defect_rate: 1.4, yield: 98.6, model_version: "v4.6", model_accuracy: 98.9, drift: "High", status: "Retrain" },
    { line: "Line 5 Gear blank", plant: "Chakan", part: "Gear blank", inspected_24h: 5120, defects_24h: 22, defect_rate: 0.43, yield: 99.57, model_version: "v2.8", model_accuracy: 99.0, drift: "Low", status: "OK" },
    { line: "Line 6 Bottle cap", plant: "Dubai JAFZA", part: "Closure", inspected_24h: 91000, defects_24h: 318, defect_rate: 0.35, yield: 99.65, model_version: "v6.1", model_accuracy: 99.6, drift: "Low", status: "OK" },
    { line: "Line 7 Label", plant: "Dubai JAFZA", part: "Label", inspected_24h: 47940, defects_24h: 124, defect_rate: 0.26, yield: 99.74, model_version: "v3.3", model_accuracy: 98.7, drift: "Medium", status: "Watch" },
  ],

  inspect_defects: [
    { defect_type: "Porosity", count_7d: 412, prior_7d: 388, top_line: "Line 4 Piston" },
    { defect_type: "Surface scratch", count_7d: 297, prior_7d: 341, top_line: "Line 2 Crankcase" },
    { defect_type: "Dimensional out of tolerance", count_7d: 214, prior_7d: 176, top_line: "Line 4 Piston" },
    { defect_type: "Missing feature", count_7d: 131, prior_7d: 142, top_line: "Line 1 Cylinder head" },
    { defect_type: "Cap misalignment", count_7d: 118, prior_7d: 164, top_line: "Line 6 Bottle cap" },
    { defect_type: "Label skew", count_7d: 96, prior_7d: 131, top_line: "Line 7 Label" },
    { defect_type: "Burr", count_7d: 74, prior_7d: 69, top_line: "Line 5 Gear blank" },
    { defect_type: "Contamination", count_7d: 41, prior_7d: 55, top_line: "Line 3 Brake disc" },
  ],
};

const SPARKS = {
  defect: data.inspect_trend.map((r) => (r.defects / r.inspected) * 100),
  falseReject: data.inspect_trend.map((r) => (r.false_rejects / r.inspected) * 100),
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

const TONES = {
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-rose-200 bg-rose-50 text-rose-700",
};
const STATUS_TONE = { Watch: "amber", OK: "green", Retrain: "red" };

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

function KpiTile({ label, value, prior, decimals = 0, betterWhen = "up", color = INSPECT, spark }) {
  const delta = value - prior;
  const good = delta === 0 ? null : betterWhen === "down" ? delta < 0 : delta > 0;
  const shown = decimals === 2 ? f2(value) : decimals === 1 ? f1(value) : value >= 10000 ? fC(value) : fN(value);

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
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-base text-amber-600">
            <ScanOutlined />
          </span>
          CogniVision Inspect · line quality
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
          Machine-vision inspection results per line, how healthy each vision model is, and which defect types are
          moving.
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

        <label className="flex min-w-[240px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100">
          <SearchOutlined className="text-slate-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search lines and parts"
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
   Inspection lines and model health
   ====================================================================== */
const DRIFT_CLS = { High: "font-semibold text-rose-600", Medium: "font-medium text-amber-600", Low: "" };

function LinesTable({ rows }) {
  return (
    <Card
      title="Inspection lines and model health"
      note="Last 24 hours per line. Drift is the vision copilot's read of how far live images have moved from the training set; Retrain means the quality agent has drafted a retraining job."
    >
      <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11.5px] font-medium text-slate-500">
            <tr>
              <th className="px-3 py-2.5">Line</th>
              <th className="hidden px-3 py-2.5 md:table-cell">Plant</th>
              <th className="px-3 py-2.5 text-right">Inspected</th>
              <th className="px-3 py-2.5 text-right">Defect %</th>
              <th className="hidden px-3 py-2.5 text-right md:table-cell">Yield %</th>
              <th className="hidden px-3 py-2.5 md:table-cell">Model</th>
              <th className="hidden px-3 py-2.5 text-right md:table-cell">Acc %</th>
              <th className="px-3 py-2.5">Drift</th>
              <th className="px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">No lines match this filter.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.line} className="align-top hover:bg-slate-50/70">
                <td className="px-3 py-2.5 font-medium text-slate-900">{r.line}</td>
                <td className="hidden px-3 py-2.5 md:table-cell">{r.plant}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fC(r.inspected_24h)}</td>
                <td className={`px-3 py-2.5 text-right tabular-nums ${r.defect_rate > 1 ? "font-semibold text-rose-600" : ""}`}>
                  {f2(r.defect_rate)}
                </td>
                <td className="hidden px-3 py-2.5 text-right tabular-nums md:table-cell">{f2(r.yield)}</td>
                <td className="hidden px-3 py-2.5 md:table-cell">{r.model_version}</td>
                <td className="hidden px-3 py-2.5 text-right tabular-nums md:table-cell">{f1(r.model_accuracy)}</td>
                <td className={`px-3 py-2.5 ${DRIFT_CLS[r.drift]}`}>{r.drift}</td>
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
   Defects by type (Pareto)
   ====================================================================== */
function DefectPareto({ rows }) {
  const sorted = [...rows].sort((a, b) => b.count_7d - a.count_7d);
  const max = Math.max(...rows.flatMap((r) => [r.count_7d, r.prior_7d])) * 1.05;

  return (
    <Card
      title="Defects by type, last 7 days"
      note="Pareto across all lines; the tick is the 7 days before. Red: more than 10% above the prior week."
    >
      <ul className="space-y-3">
        {sorted.map((r) => {
          const rising = r.count_7d > r.prior_7d * 1.1;
          return (
            <li key={r.defect_type} className="group relative">
              <div className="mb-1 flex items-baseline justify-between gap-3 text-[12.5px]">
                <span className="text-slate-800">{r.defect_type}</span>
                <span className={`font-semibold tabular-nums ${rising ? "text-rose-600" : "text-slate-900"}`}>{fN(r.count_7d)}</span>
              </div>
              <div className="relative h-2.5 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(r.count_7d / max) * 100}%`, background: rising ? RED : INSPECT }}
                />
                <span
                  className="absolute -top-[3px] h-[17px] w-0.5 rounded bg-slate-500"
                  style={{ left: `calc(${(r.prior_7d / max) * 100}% - 1px)` }}
                  title={`Prior 7 days: ${fN(r.prior_7d)}`}
                />
              </div>
              <div className="pointer-events-none absolute -top-7 left-0 z-10 hidden whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 shadow-lg group-hover:block">
                {r.defect_type}: {fN(r.count_7d)} this week, {fN(r.prior_7d)} before · mostly {r.top_line}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ======================================================================
   Defect rate and false reject rate (line chart)
   ====================================================================== */
function TrendChart({ rows }) {
  const wrapRef = useRef(null);
  const W = useElementWidth(wrapRef);
  const [hover, setHover] = useState(null);

  const H = 240;
  const m = { t: 14, r: 16, b: 28, l: 44 };
  const n = rows.length;
  const maxV = Math.max(...rows.flatMap((r) => [r.defectRate, r.falseRejectRate]));
  const step = niceStep((maxV * 1.1) / 4);
  const top = step * Math.ceil((maxV * 1.1) / step);
  const yTicks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => Math.round(i * step * 1e6) / 1e6);

  const x = (i) => m.l + (i / (n - 1)) * (W - m.l - m.r);
  const y = (v) => H - m.b - (v / top) * (H - m.t - m.b);
  const line = (key) => rows.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(" ");
  const area = `${line("defectRate")} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;

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
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: INSPECT }} />Defect rate %</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />False reject rate %</span>
      </div>

      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="block"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Daily defect rate and false reject rate, last 30 days"
      >
        <defs>
          <linearGradient id="inspect-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={INSPECT} stopOpacity="0.22" />
            <stop offset="1" stopColor={INSPECT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
            <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11.5" fill="#94a3b8">{f2(t)}</text>
          </g>
        ))}

        {rows.map((r, i) =>
          i % every === 0 ? (
            <text key={r.day} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11.5" fill="#94a3b8">{r.label}</text>
          ) : null
        )}

        <path d={area} fill="url(#inspect-area)" />
        <path d={line("falseRejectRate")} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={line("defectRate")} fill="none" stroke={INSPECT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        <text x={x(n - 1) - 4} y={y(last.defectRate) - 8} textAnchor="end" fontSize="11.5" fill="#b45309">
          {f2(last.defectRate)}% defects
        </text>
        <text x={x(n - 1) - 4} y={y(last.falseRejectRate) - 8} textAnchor="end" fontSize="11.5" fill="#64748b">
          {f2(last.falseRejectRate)}% false rejects
        </text>

        {hr && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={H - m.b} stroke="#cbd5e1" />
            <circle cx={x(hover)} cy={y(hr.falseRejectRate)} r="4" fill="#94a3b8" stroke="#fff" strokeWidth="2" />
            <circle cx={x(hover)} cy={y(hr.defectRate)} r="4" fill={INSPECT} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hr && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-lg"
          style={{ left: Math.min(W - 170, Math.max(0, x(hover) + 12)), top: 34 }}
        >
          <div className="text-slate-400">{hr.label}</div>
          <div className="text-slate-700"><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: INSPECT }} />Defect rate % {f2(hr.defectRate)}</div>
          <div className="text-slate-700"><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-slate-300" />False reject rate % {f2(hr.falseRejectRate)}</div>
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   CogniVision Inspect page
   ====================================================================== */
export default function CogniVisionInspect() {
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
  const lineRows = data.inspect_lines
    .filter((r) => (!plant || r.plant === plant) && (!q || `${r.line} ${r.part}`.toLowerCase().includes(q)))
    .sort((a, b) => b.defect_rate - a.defect_rate);

  const trendRows = data.inspect_trend.map((r) => ({
    day: r.day,
    label: fDate(new Date(r.day)),
    defectRate: (r.defects / r.inspected) * 100,
    falseRejectRate: (r.false_rejects / r.inspected) * 100,
  }));

  const k = data.kpis;

  return (
    <div className="text-slate-700">
      <Header plant={plant} onPlant={setPlant} query={query} onQuery={setQuery} searchRef={searchRef} />

      <main className="space-y-4 px-4 pb-10 pt-4 sm:px-6">
        {/* KPI tiles */}
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
          <KpiTile label="Units inspected, 24 h" value={k.units_inspected.value} prior={k.units_inspected.prior} />
          <KpiTile label="Defect rate, %" value={k.defect_rate.value} prior={k.defect_rate.prior} decimals={2} betterWhen="down" spark={SPARKS.defect} />
          <KpiTile label="False reject rate, %" value={k.false_reject_rate.value} prior={k.false_reject_rate.prior} decimals={2} betterWhen="down" spark={SPARKS.falseReject} />
        </div>

        {/* Lines table + Pareto */}
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr))]">
          <LinesTable rows={lineRows} />
          <DefectPareto rows={data.inspect_defects} />
        </div>

        {/* 30-day trend */}
        <Card
          title="Defect rate and false reject rate, last 30 days"
          note="Daily, as a share of units inspected. Falling false rejects is the retraining loop working."
        >
          <TrendChart rows={trendRows} />
        </Card>
      </main>
    </div>
  );
}