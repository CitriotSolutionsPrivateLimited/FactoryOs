import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DownOutlined,
  FilterOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

/* ============================================================
   CONFIG + HELPERS
   ============================================================ */

const PAGE_SIZE = 5;
const NAME_MAX = 50;

const ASSIGNEES = ["Ravi Kumar", "Anita Sharma", "Suresh Patel", "Meera Nair"];
const ASSETS = [
  "Compressor 1",
  "Chiller 2 Compressor 2",
  "Bangalore Plant AHU",
  "Boiler 3",
  "Pump-01",
  "Conveyor Motor 4",
];
const CATEGORIES = ["Electrical", "Mechanical", "Preventive", "Damage", "Inspection", "Safety"];
const STATUSES = ["Open", "In Progress", "On Hold", "Completed"];
const PRIORITIES = ["None", "Low", "Medium", "High"];

const PRIORITY_STYLE = {
  None: { pill: "bg-slate-100 text-slate-600", dot: null },
  Low: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-600" },
  Medium: { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-600" },
  High: { pill: "bg-red-50 text-red-700", dot: "bg-red-600" },
};

const STATUS_STYLE = {
  Open: "bg-blue-50 text-blue-700 ring-blue-200",
  "In Progress": "bg-violet-50 text-violet-700 ring-violet-200",
  "On Hold": "bg-slate-100 text-slate-600 ring-slate-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const DUE_STYLE = {
  Completed: "bg-lime-50 text-lime-700",
  Overdue: "bg-red-50 text-red-700",
  "Due soon": "bg-amber-50 text-amber-700",
  "On track": "bg-slate-100 text-slate-600",
};

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const offsetDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISO(d);
};

const parseISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDate = (iso) =>
  parseISO(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const getDueStatus = (wo) => {
  if (!wo.dueDate) return null;
  if (wo.status === "Completed") return "Completed";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((parseISO(wo.dueDate) - today) / 86400000);
  if (diff < 0) return "Overdue";
  if (diff <= 3) return "Due soon";
  return "On track";
};

const makeId = () => `WO-${String(Math.floor(Math.random() * 1e10)).padStart(10, "0")}`;

const initials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ---------- dummy work orders ---------- */

const DUMMY_WORK_ORDERS = [
  {
    id: "WO-8953289524",
    title: "Compressor work",
    description: "Replace worn contactor on the main compressor panel.",
    status: "Completed",
    priority: "Medium",
    assignee: "Ravi Kumar",
    asset: "Compressor 1",
    location: "Plant 1, Utility Room",
    categories: ["Electrical"],
    dueDate: "2025-09-26",
  },
  {
    id: "WO-5386676036",
    title: "Chiller 2 Compressor 2 - Maintenance",
    description: "Inspect and repair damaged coolant line.",
    status: "Completed",
    priority: "None",
    assignee: "Suresh Patel",
    asset: "Chiller 2 Compressor 2",
    location: "Building A, Roof",
    categories: ["Damage"],
    dueDate: "",
  },
  {
    id: "WO-5719981208",
    title: "Bangalore - Maintenance",
    description: "Quarterly preventive maintenance on AHU units.",
    status: "Completed",
    priority: "Low",
    assignee: "Anita Sharma",
    asset: "Bangalore Plant AHU",
    location: "Bangalore Plant, Floor 2",
    categories: ["Mechanical", "Preventive"],
    dueDate: "2026-08-08",
  },
  {
    id: "WO-2048117753",
    title: "Boiler 3 pressure valve replacement",
    description: "Pressure relief valve is leaking. Replace and test.",
    status: "In Progress",
    priority: "High",
    assignee: "Meera Nair",
    asset: "Boiler 3",
    location: "Boiler House",
    categories: ["Mechanical", "Safety"],
    dueDate: offsetDate(-3),
  },
  {
    id: "WO-7716630942",
    title: "Pump-01 vibration check",
    description: "Vibration alert on the X axis. Check alignment and bearings.",
    status: "Open",
    priority: "Medium",
    assignee: "Ravi Kumar",
    asset: "Pump-01",
    location: "Zone A, Floor 1",
    categories: ["Inspection"],
    dueDate: offsetDate(2),
  },
  {
    id: "WO-3391520687",
    title: "Conveyor motor lubrication",
    description: "Monthly greasing of the conveyor drive motor.",
    status: "Open",
    priority: "Low",
    assignee: "Anita Sharma",
    asset: "Conveyor Motor 4",
    location: "Packing Line 2",
    categories: ["Preventive"],
    dueDate: offsetDate(14),
  },
];

/* ============================================================
   SMALL UI PIECES
   ============================================================ */

const labelCls = "mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500";
const inputCls =
  "w-full h-10 rounded-lg border bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function FormField({ label, icon, required, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className={labelCls}>
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs normal-case text-red-600">{error}</p>}
    </div>
  );
}

function PriorityBadge({ value }) {
  const s = PRIORITY_STYLE[value];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.pill}`}>
      {s.dot && <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
      {value}
    </span>
  );
}

/* Dropdown that supports single and multiple selection */
function Select({ options, value, onChange, placeholder, multiple = false, dropUp = false, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = multiple ? value : value ? [value] : [];

  const pick = (opt) => {
    if (multiple) {
      onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
    } else {
      onChange(opt);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className={`flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white px-3.5 py-1.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selected.length === 0 && <span className="text-slate-400">{placeholder}</span>}
          {multiple
            ? selected.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                >
                  {s}
                  <span
                    role="button"
                    aria-label={`Remove ${s}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      pick(s);
                    }}
                    className="cursor-pointer text-blue-400 hover:text-blue-700"
                  >
                    <CloseOutlined className="text-[10px]" />
                  </span>
                </span>
              ))
            : selected[0] && <span className="truncate text-slate-800">{selected[0]}</span>}
        </div>
        <DownOutlined className={`shrink-0 text-xs text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <ul
          role="listbox"
          className={`absolute z-30 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ${
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {options.map((opt) => {
            const on = selected.includes(opt);
            return (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => pick(opt)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                    on ? "bg-blue-50/70 font-medium text-slate-900" : "text-slate-700"
                  }`}
                >
                  {opt}
                  {on && <CheckOutlined className="text-xs text-blue-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatCard({ label, value, caption, icon, iconCls, barCls, barPct }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${iconCls}`}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barCls}`} style={{ width: `${barPct}%` }} />
      </div>
      <p className="mt-3 text-xs text-slate-500">{caption}</p>
    </div>
  );
}

/* ============================================================
   NEW JOB MODAL
   ============================================================ */

const emptyForm = {
  title: "",
  description: "",
  assignee: "",
  dueDate: "",
  priority: "None",
  asset: "",
  location: "",
  categories: [],
};

function NewJobModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.title.trim()) e.title = "Enter a job name.";
    if (!form.asset) e.asset = "Select the asset this job is for.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      id: makeId(),
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      status: "Open",
    });
  };

  const divider = "border-t border-slate-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-job-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <h2 id="new-job-title" className="text-lg font-bold text-slate-900">
            New Job
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {/* job name */}
          <div className="pb-5">
            <FormField label="Job name" required error={errors.title}>
              <div className="relative">
                <input
                  value={form.title}
                  maxLength={NAME_MAX}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="What needs to be done?"
                  className={`${inputCls} pr-16 ${errors.title ? "border-red-400" : "border-slate-200"}`}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                  {form.title.length} / {NAME_MAX}
                </span>
              </div>
            </FormField>
          </div>

          {/* description */}
          <div className={`${divider} py-5`}>
            <FormField label="Description">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Describe the work to be done…"
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </FormField>
          </div>

          {/* assign + due date */}
          <div className={`${divider} grid grid-cols-1 gap-5 py-5 sm:grid-cols-2`}>
            <FormField label="Assign to">
              <Select
                options={ASSIGNEES}
                value={form.assignee}
                onChange={(v) => setField("assignee", v)}
                placeholder="Select assignee"
              />
            </FormField>
            <FormField label="Due date" icon={<CalendarOutlined />}>
              <div className="relative">
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setField("dueDate", e.target.value)}
                  className={`${inputCls} border-slate-200 ${
                    form.dueDate ? "" : "text-slate-400"
                  } [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`}
                />
                <CalendarOutlined className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </FormField>
          </div>

          {/* priority */}
          <div className={`${divider} py-5`}>
            <FormField label="Priority" icon={<ThunderboltOutlined />}>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => {
                  const on = form.priority === p;
                  const s = PRIORITY_STYLE[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setField("priority", p)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                        on
                          ? "border-blue-500 bg-blue-50 text-slate-900 ring-4 ring-blue-100"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {s.dot && <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />}
                      {p}
                    </button>
                  );
                })}
              </div>
            </FormField>
          </div>

          {/* asset + location */}
          <div className={`${divider} grid grid-cols-1 gap-5 py-5 sm:grid-cols-2`}>
            <FormField label="Asset" required error={errors.asset}>
              <Select
                options={ASSETS}
                value={form.asset}
                onChange={(v) => setField("asset", v)}
                placeholder="Select asset"
                error={errors.asset}
              />
            </FormField>
            <FormField label="Location">
              <input
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="e.g. Building A, Floor 2"
                className={`${inputCls} border-slate-200`}
              />
            </FormField>
          </div>

          {/* categories */}
          <div className={`${divider} py-5`}>
            <FormField label="Categories">
              <Select
                multiple
                dropUp
                options={CATEGORIES}
                value={form.categories}
                onChange={(v) => setField("categories", v)}
                placeholder="Select categories"
              />
            </FormField>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <PlusOutlined />
            Create job card
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   WORK ORDERS PAGE (default export)
   ============================================================ */

export default function WorkOrders() {
  const [orders, setOrders] = useState(DUMMY_WORK_ORDERS);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [newId, setNewId] = useState(null);
  const [page, setPage] = useState(1);

  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  /* ----- stats ----- */
  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    const inProgress = orders.filter((o) => o.status === "In Progress" || o.status === "Open").length;
    const overdue = orders.filter((o) => getDueStatus(o) === "Overdue").length;
    const high = orders.filter((o) => o.priority === "High" && o.status !== "Completed").length;
    return {
      total,
      completed,
      inProgress,
      overdue,
      high,
      rate: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [orders]);

  /* ----- filtering + paging ----- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (priorityFilter !== "All" && o.priority !== priorityFilter) return false;
      if (q && !`${o.title} ${o.id} ${o.asset} ${o.assignee}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [orders, search, statusFilter, priorityFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilters =
    (statusFilter !== "All" ? 1 : 0) + (priorityFilter !== "All" ? 1 : 0) + (search.trim() ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setPage(1);
  };

  /* ----- add ----- */
  const handleAdd = (order) => {
    // TODO: send `order` to your backend here.
    setOrders((o) => [order, ...o]);
    setOpen(false);
    clearFilters();
    setNewId(order.id);
    setToast(`${order.id} created`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setToast(null);
      setNewId(null);
    }, 4000);
  };

  const th = "px-4 py-3.5 text-left text-sm font-semibold text-slate-900 whitespace-nowrap";
  const td = "px-4 py-4 align-middle text-sm text-slate-700";

  return (
    <div className="mx-auto max-w-7xl">
      {/* header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Work Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            {stats.total} total jobs · {stats.completed} completed · {stats.overdue} overdue
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          <PlusOutlined />
          New Job Card
        </button>
      </header>

      {/* stat cards */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Completion rate"
          value={`${stats.rate}%`}
          caption={`${stats.completed} of ${stats.total} completed`}
          icon={<CheckCircleOutlined />}
          iconCls="bg-emerald-50 text-emerald-700"
          barCls="bg-emerald-700"
          barPct={stats.rate}
        />
        <StatCard
          label="Open jobs"
          value={stats.inProgress}
          caption="open or in progress"
          icon={<UnorderedListOutlined />}
          iconCls="bg-blue-50 text-blue-700"
          barCls="bg-blue-600"
          barPct={stats.total ? (stats.inProgress / stats.total) * 100 : 0}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          caption="past due date"
          icon={<ClockCircleOutlined />}
          iconCls="bg-red-50 text-red-600"
          barCls="bg-red-600"
          barPct={stats.total ? (stats.overdue / stats.total) * 100 : 0}
        />
        <StatCard
          label="High priority"
          value={stats.high}
          caption="need urgent attention"
          icon={<ThunderboltOutlined />}
          iconCls="bg-amber-50 text-amber-700"
          barCls="bg-amber-600"
          barPct={stats.total ? (stats.high / stats.total) * 100 : 0}
        />
      </section>

      {/* filters */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          aria-expanded={showFilters}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <FilterOutlined />
          Filters
          {activeFilters > 0 && (
            <span className="rounded-full bg-blue-700 px-1.5 text-xs text-white">{activeFilters}</span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">
            <div>
              <label className={labelCls}>Search</label>
              <div className="relative">
                <SearchOutlined className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Title, ID, asset or assignee"
                  className={`${inputCls} border-slate-200 pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <div className="flex flex-wrap gap-1.5">
                {["All", ...STATUSES].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      statusFilter === s
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <div className="flex flex-wrap gap-1.5">
                {["All", ...PRIORITIES].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPriorityFilter(p);
                      setPage(1);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      priorityFilter === p
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <div className="md:col-span-3">
                <button type="button" onClick={clearFilters} className="text-sm font-medium text-blue-700 hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* table */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead className="bg-slate-50/70">
              <tr className="border-b border-slate-200">
                <th className={th}>Title</th>
                <th className={th}>Status</th>
                <th className={th}>Priority</th>
                <th className={th}>Asset</th>
                <th className={th}>Assigned to</th>
                <th className={th}>Categories</th>
                <th className={th}>Due Date</th>
                <th className={th}>Due Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center text-sm text-slate-500">
                    No work orders match your filters.{" "}
                    <button type="button" onClick={clearFilters} className="font-medium text-blue-700 hover:underline">
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                rows.map((o) => {
                  const due = getDueStatus(o);
                  return (
                    <tr
                      key={o.id}
                      className={`transition hover:bg-slate-50/70 ${o.id === newId ? "bg-blue-50/60" : ""}`}
                    >
                      <td className={`${td} max-w-xs`}>
                        <p className="font-semibold text-blue-700">{o.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{o.id}</p>
                      </td>
                      <td className={td}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[o.status]}`}
                        >
                          {o.status === "Completed" && <CheckCircleFilled />}
                          {o.status}
                        </span>
                      </td>
                      <td className={td}>
                        <PriorityBadge value={o.priority} />
                      </td>
                      <td className={td}>
                        <p className="font-medium text-slate-800">{o.asset}</p>
                        {o.location && <p className="mt-0.5 text-xs text-slate-500">{o.location}</p>}
                      </td>
                      <td className={td}>
                        {o.assignee ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                              {initials(o.assignee)}
                            </span>
                            {o.assignee}
                          </span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className={td}>
                        {o.categories.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {o.categories.map((c) => (
                              <span key={c} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-700">
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className={`${td} whitespace-nowrap`}>
                        {o.dueDate ? formatDate(o.dueDate) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className={td}>
                        {due ? (
                          <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${DUE_STYLE[due]}`}>{due}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-4 py-3">
          <span className="mr-2 text-sm text-slate-500">
            {filtered.length} work order{filtered.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LeftOutlined />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === currentPage ? "page" : undefined}
              className={`h-8 min-w-8 rounded-md border px-2 text-sm font-semibold transition ${
                n === currentPage
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-slate-600 hover:bg-slate-100"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RightOutlined />
          </button>
        </div>
      </section>

      <NewJobModal open={open} onClose={() => setOpen(false)} onSubmit={handleAdd} />

      {toast && (
        <div
          role="status"
          className="fixed right-4 top-4 z-[60] flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg"
        >
          <CheckCircleFilled className="text-lg text-emerald-500" />
          <span className="text-sm font-medium text-slate-800">{toast}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setToast(null)}
            className="ml-1 text-slate-400 hover:text-slate-700"
          >
            <CloseOutlined />
          </button>
        </div>
      )}
    </div>
  );
}