import { useEffect, useRef, useState } from "react";
import {
  ApiOutlined,
  ApartmentOutlined,
  CheckCircleFilled,
  CheckOutlined,
  CloseOutlined,
  DashboardOutlined,
  DeleteOutlined,
  DownOutlined,
  EnvironmentOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  TagOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";

/* ============================================================
   CONFIG
   ============================================================ */

const MAX_GAUGE = 3;
const STORAGE_KEY = "cognisense.devices";

const MECH_SENSORS = [
  "temperature", "humidity", "noise", "smoke",
  "vibrations_x", "vibrations_y", "vibrations_z",
  "pressure", "magnetometer_x", "magnetometer_y", "magnetometer_z",
];

// NOTE: replace with your real electrical sensor names
const ELEC_SENSORS = [
  "voltage_r", "voltage_y", "voltage_b",
  "current_r", "current_y", "current_b",
  "power_factor", "frequency", "active_power", "energy",
];

const GPS_SENSORS = ["latitude", "longitude", "speed"];

const DEVICE_TYPES = [
  {
    value: "mechanical",
    label: "Cognisense (Mechanical)",
    description: "Vibration, temperature, noise and magnetometer sensing",
    icon: ToolOutlined,
    sensors: MECH_SENSORS,
    lockedGauge: null,
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  {
    value: "electrical",
    label: "Cognisense (Electrical)",
    description: "Voltage, current, power and frequency monitoring",
    icon: ThunderboltOutlined,
    sensors: ELEC_SENSORS,
    lockedGauge: null,
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    value: "gps",
    label: "Cognisense (GPS)",
    description: "Location and speed tracking",
    icon: EnvironmentOutlined,
    sensors: GPS_SENSORS,
    lockedGauge: GPS_SENSORS, // GPS always shows these 3 on the dashboard
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    value: "hybrid",
    label: "Cognisense - Hybrid (Mech + GPS)",
    description: "Mechanical sensing combined with GPS tracking",
    icon: ApartmentOutlined,
    sensors: [...MECH_SENSORS, ...GPS_SENSORS],
    lockedGauge: null,
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
  },
];

const getDeviceType = (value) =>
  DEVICE_TYPES.find((t) => t.value === value) || null;

const loadDevices = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

/* ============================================================
   FORM BUILDING BLOCKS
   ============================================================ */

const initialForm = {
  type: "",
  zone: "",
  totalSensors: "",
  secret: "",
  name: "",
  deviceId: "",
  confirmId: "",
  gauge: [],
};

const inputBase =
  "w-full h-11 rounded-lg border bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function Field({ label, hint, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        {label}
        {hint && (
          <span title={hint} className="cursor-help text-slate-400">
            <QuestionCircleOutlined />
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function IconInput({ icon, suffix, error, className = "", ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
        {icon}
      </span>
      <input
        {...props}
        className={`${inputBase} pl-10 ${suffix ? "pr-10" : "pr-3"} ${
          error ? "border-red-400" : "border-slate-200"
        } ${className}`}
      />
      {suffix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">{suffix}</span>
      )}
    </div>
  );
}

function DeviceTypeSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = getDeviceType(value);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputBase} flex items-center justify-between px-3.5 text-left ${
          error ? "border-red-400" : "border-slate-200"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <span className="flex items-center gap-2.5 text-slate-800">
            <selected.icon className="text-blue-600" />
            {selected.label}
          </span>
        ) : (
          <span className="text-slate-400">Select device type</span>
        )}
        <DownOutlined
          className={`text-xs text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          {DEVICE_TYPES.map((t) => {
            const active = t.value === value;
            return (
              <li key={t.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(t.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50 ${
                    active ? "bg-blue-50/70" : ""
                  }`}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <t.icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-900">{t.label}</span>
                    <span className="block text-xs text-slate-500">{t.description}</span>
                  </span>
                  {active && <CheckOutlined className="mt-1 text-blue-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ============================================================
   ADD MACHINE MODAL
   ============================================================ */

function AddMachineModal({ open, onClose, onSubmit, existingIds }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showSecret, setShowSecret] = useState(false);

  const type = getDeviceType(form.type);
  const locked = !!type?.lockedGauge;

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setErrors({});
      setShowSecret(false);
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

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleTypeChange = (value) => {
    const t = getDeviceType(value);
    setForm((f) => ({
      ...f,
      type: value,
      totalSensors: String(t.sensors.length),
      gauge: t.lockedGauge ? [...t.lockedGauge] : [],
    }));
    setErrors((er) => ({ ...er, type: undefined, gauge: undefined }));
  };

  const toggleSensor = (s) => {
    if (locked) return;
    setForm((f) => {
      if (f.gauge.includes(s)) return { ...f, gauge: f.gauge.filter((x) => x !== s) };
      if (f.gauge.length >= MAX_GAUGE) return f;
      return { ...f, gauge: [...f.gauge, s] };
    });
    setErrors((er) => ({ ...er, gauge: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.type) e.type = "Choose a device type.";
    if (!form.zone.trim()) e.zone = "Enter the zone or area.";
    if (form.type && form.gauge.length !== MAX_GAUGE)
      e.gauge = `Select exactly ${MAX_GAUGE} sensors for the dashboard gauge.`;
    if (!form.totalSensors || Number(form.totalSensors) < 1)
      e.totalSensors = "Enter the total number of sensors.";
    if (form.secret.length < 8) e.secret = "Use at least 8 characters.";
    if (!form.name.trim()) e.name = "Enter a device name.";
    if (!form.deviceId.trim()) e.deviceId = "Enter a device ID.";
    else if (existingIds.includes(form.deviceId.trim()))
      e.deviceId = "This device ID is already in use.";
    if (form.confirmId !== form.deviceId) e.confirmId = "Device IDs don't match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      id: form.deviceId.trim(),
      name: form.name.trim(),
      type: form.type,
      zone: form.zone.trim(),
      totalSensors: Number(form.totalSensors),
      dashboardSensors: form.gauge,
      createdAt: new Date().toISOString(),
      _secret: form.secret, // send to your API; never stored in the list
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 py-8 backdrop-blur-sm sm:py-12"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-machine-title"
        className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl"
      >
        {/* header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
          <div>
            <h2 id="add-machine-title" className="text-xl font-bold text-slate-900">
              Add new machine
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Register a Cognisense device and choose what it shows on the dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* body */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 px-6 py-6 sm:px-8 md:grid-cols-2">
          <Field label="Device Type" error={errors.type}>
            <DeviceTypeSelect value={form.type} onChange={handleTypeChange} error={errors.type} />
          </Field>

          <Field label="Zone / Area" error={errors.zone}>
            <IconInput
              icon={<EnvironmentOutlined />}
              placeholder="e.g. Zone A, Floor 2"
              value={form.zone}
              onChange={set("zone")}
              error={errors.zone}
            />
          </Field>

          <Field
            label="Dashboard Sensors"
            hint="These sensors appear on the dashboard gauge for this device."
            error={errors.gauge}
            className="md:row-span-2"
          >
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              {!type ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Select a device type to see its available sensors.
                </p>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Available sensors data</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        form.gauge.length === MAX_GAUGE
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {form.gauge.length}/{MAX_GAUGE} selected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {type.sensors.map((s) => {
                      const on = form.gauge.includes(s);
                      const full = !on && form.gauge.length >= MAX_GAUGE;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSensor(s)}
                          disabled={locked || full}
                          aria-pressed={on}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                            on
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-blue-100/70 text-slate-800 hover:bg-blue-100"
                          } ${full ? "cursor-not-allowed opacity-40" : ""} ${
                            locked ? "cursor-default" : ""
                          }`}
                        >
                          {on && <CheckOutlined className="text-xs" />}
                          {s}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    {locked
                      ? "GPS devices always show latitude, longitude and speed."
                      : `Tap to pick exactly ${MAX_GAUGE} sensors for the dashboard gauge.`}
                  </p>
                </>
              )}
            </div>
          </Field>

          <div className="flex flex-col gap-6">
            <Field label="Total Sensors" error={errors.totalSensors}>
              <input
                type="number"
                min={1}
                value={form.totalSensors}
                onChange={set("totalSensors")}
                placeholder="Filled automatically from device type"
                className={`${inputBase} px-3.5 ${
                  errors.totalSensors ? "border-red-400" : "border-slate-200"
                }`}
              />
            </Field>

            <Field label="Secret Code" error={errors.secret}>
              <IconInput
                icon={<LockOutlined />}
                type={showSecret ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                value={form.secret}
                onChange={set("secret")}
                error={errors.secret}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowSecret((s) => !s)}
                    aria-label={showSecret ? "Hide secret code" : "Show secret code"}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                  >
                    {showSecret ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                }
              />
            </Field>
          </div>

          <Field label="Device Name" error={errors.name}>
            <IconInput
              icon={<UserOutlined />}
              placeholder="e.g. Pump-01"
              value={form.name}
              onChange={set("name")}
              error={errors.name}
            />
          </Field>

          <div className="hidden md:block" />

          <Field label="Device ID" error={errors.deviceId}>
            <IconInput
              icon={<TagOutlined />}
              placeholder="Unique device identifier"
              value={form.deviceId}
              onChange={set("deviceId")}
              error={errors.deviceId}
            />
          </Field>

          <Field label="Confirm Device ID" error={errors.confirmId}>
            <IconInput
              icon={<TagOutlined />}
              placeholder="Re-enter device ID"
              value={form.confirmId}
              onChange={set("confirmId")}
              error={errors.confirmId}
            />
          </Field>
        </div>

        {/* footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <PlusOutlined />
            Add machine
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   MACHINE CARD (VIEW)
   ============================================================ */

function MachineCard({ device, highlight, onDelete }) {
  const type = getDeviceType(device.type);
  const Icon = type?.icon;

  return (
    <article
      className={`group rounded-2xl border bg-white p-5 transition ${
        highlight
          ? "border-blue-400 ring-4 ring-blue-100"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
            {Icon && <Icon />}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">{device.name}</h3>
            <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
              <TagOutlined /> {device.id}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(device.id)}
          aria-label={`Remove ${device.name}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        >
          <DeleteOutlined />
        </button>
      </div>

      <div className="mt-4">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${type?.badge}`}>
          {type?.label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Zone / Area</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-slate-800">
            <EnvironmentOutlined className="text-slate-400" />
            <span className="truncate">{device.zone}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Total sensors</dt>
          <dd className="mt-0.5 font-medium text-slate-800">{device.totalSensors}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
          <DashboardOutlined /> Dashboard gauge
        </p>
        <div className="flex flex-wrap gap-1.5">
          {device.dashboardSensors.map((s) => (
            <span key={s} className="rounded-md bg-blue-100/70 px-2.5 py-1 text-xs text-slate-800">
              {s}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   MACHINES PAGE (default export)
   ============================================================ */

export default function Machines() {
  const [devices, setDevices] = useState(loadDevices);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [newId, setNewId] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
    } catch {
      /* storage unavailable */
    }
  }, [devices]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleAdd = ({ _secret, ...device }) => {
    // TODO: send `device` + `_secret` to your backend here.
    setDevices((d) => [device, ...d]);
    setOpen(false);
    setNewId(device.id);
    setToast(`${device.name} added`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setToast(null);
      setNewId(null);
    }, 4000);
  };

  const handleDelete = (id) => setDevices((d) => d.filter((x) => x.id !== id));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Machines</h1>
            <p className="mt-1 text-sm text-slate-500">
              {devices.length === 0
                ? "No machines registered yet"
                : `${devices.length} machine${devices.length > 1 ? "s" : ""} registered`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <PlusOutlined />
            Add machine
          </button>
        </header>

        {devices.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
              <ApiOutlined />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Add your first machine</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Register a Cognisense device to start seeing its sensor data on the dashboard.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <PlusOutlined /> Add machine
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {devices.map((d) => (
              <MachineCard
                key={d.id}
                device={d}
                highlight={d.id === newId}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <AddMachineModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleAdd}
        existingIds={devices.map((d) => d.id)}
      />

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