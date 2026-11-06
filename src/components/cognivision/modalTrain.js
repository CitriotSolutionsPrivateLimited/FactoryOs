import { useEffect, useRef, useState } from "react";
import {
  AimOutlined, ArrowLeftOutlined, ArrowRightOutlined, CheckCircleFilled, CheckOutlined, CloudUploadOutlined,
  DeleteOutlined, ExperimentOutlined, LoadingOutlined, PlayCircleOutlined, PlusOutlined, StopOutlined, ThunderboltOutlined,
} from "@ant-design/icons";

/* ================= helpers ================= */
const PALETTE = ["#7c3aed", "#0d9488", "#d97706", "#dc2626", "#2563eb", "#db2777", "#65a30d", "#0891b2"];
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const pct = (v) => `${(v * 100).toFixed(1)}%`;

const inputCls = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:opacity-60";
const cardCls = "rounded-2xl border border-slate-200 bg-white";
const primaryBtn = "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300";
const ghostBtn = "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

// tiny built-in sample images so the demo works without files
const sampleImg = (seed) => {
  const shapes = [
    [[120, 130, 60, 180, "#1e293b"], [360, 170, 190, 140, "#d97706"]],
    [[80, 140, 55, 170, "#1e293b"], [300, 150, 55, 160, "#1e293b"]],
    [[200, 160, 230, 150, "#d97706"]],
  ][seed % 3];
  const body = shapes.map(([x, y, w, h, f]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${f}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#cbd5e1"/><rect y="310" width="640" height="90" fill="#64748b"/>${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const AUGS = [
  { key: "flipH", label: "Horizontal flip", hint: "Mirror left to right", imgStyle: { transform: "scaleX(-1)" }, box: (b) => ({ ...b, x: 1 - b.x - b.w }) },
  { key: "flipV", label: "Vertical flip", hint: "Mirror top to bottom", imgStyle: { transform: "scaleY(-1)" }, box: (b) => ({ ...b, y: 1 - b.y - b.h }) },
  { key: "bright", label: "Brighten", hint: "+30% brightness", imgStyle: { filter: "brightness(1.3)" } },
  { key: "dark", label: "Darken", hint: "-30% brightness", imgStyle: { filter: "brightness(0.7)" } },
  { key: "gray", label: "Grayscale", hint: "Remove colour", imgStyle: { filter: "grayscale(1)" } },
  { key: "blur", label: "Blur", hint: "Simulate motion / focus loss", imgStyle: { filter: "blur(2px)" } },
];

const BASE_MODELS = [
  { value: "YOLOv8 Nano", note: "Fastest, lowest accuracy" },
  { value: "YOLOv8 Small", note: "Balanced" },
  { value: "YOLOv8 Medium", note: "Most accurate, slowest" },
];

const STEPS = ["Upload", "Annotate", "Augment", "Train", "Try it"];

/* ================= shared pieces ================= */
function BoxOverlay({ box, color, label, strong }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%`,
        border: `${strong ? 3 : 2}px solid ${color}`, background: `${color}${strong ? "33" : "1a"}`,
      }}
    >
      {label && (
        <span className="absolute -top-5 left-[-2px] whitespace-nowrap rounded-t px-1.5 text-[11px] font-semibold text-white" style={{ background: color }}>
          {label}
        </span>
      )}
    </div>
  );
}

function Stepper({ step, maxStep, onGo }) {
  return (
    <ol className="flex items-center overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        const locked = i > maxStep;
        return (
          <li key={s} className="flex flex-1 items-center">
            <button
              type="button"
              disabled={locked}
              onClick={() => onGo(i)}
              className="flex items-center gap-2.5 whitespace-nowrap px-2 py-1 disabled:cursor-not-allowed"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                done ? "bg-emerald-500 text-white" : active ? "bg-violet-600 text-white ring-4 ring-violet-100" : "bg-slate-100 text-slate-400"}`}>
                {done ? <CheckOutlined /> : i + 1}
              </span>
              <span className={`text-sm font-medium ${active ? "text-violet-700" : done ? "text-slate-800" : "text-slate-400"}`}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`mx-2 h-0.5 min-w-4 flex-1 rounded ${i < step ? "bg-emerald-400" : "bg-slate-200"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

function LossChart({ history, total }) {
  const W = 420, H = 170, pad = { l: 34, r: 10, t: 10, b: 22 }, maxY = 1.6;
  const x = (e) => pad.l + (e / total) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - Math.min(v, maxY) / maxY) * (H - pad.t - pad.b);
  const line = (k) => history.map((h) => `${x(h.epoch)},${y(h[k])}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Loss by epoch">
      {[0, 0.4, 0.8, 1.2, 1.6].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
          <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#94a3b8">{t.toFixed(1)}</text>
        </g>
      ))}
      {history.length > 1 && (
        <>
          <polyline points={line("val")} fill="none" stroke="#d97706" strokeWidth="2" />
          <polyline points={line("loss")} fill="none" stroke="#7c3aed" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

/* ================= STEP 1: upload ================= */
function UploadStep({ images, setImages, fileRef, notify }) {
  const [over, setOver] = useState(false);
  const add = (list) => {
    const files = Array.from(list || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return notify("Only image files can be uploaded");
    setImages((p) => [...p, ...files.map((f) => ({ id: uid(), name: f.name, src: URL.createObjectURL(f), boxes: [] }))]);
  };
  const addSamples = () =>
    setImages((p) => [...p, ...[0, 1, 2].map((i) => ({ id: uid(), name: `sample_${p.length + i + 1}.png`, src: sampleImg(i), boxes: [] }))]);

  return (
    <div className="flex flex-col gap-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
        className={`flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${over ? "border-violet-500 bg-violet-50" : "border-slate-300 bg-white"}`}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600"><CloudUploadOutlined /></span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Drag and drop your images</h2>
        <p className="mt-1 text-sm text-slate-500">JPG, PNG or WebP. Upload at least a few images of what you want to detect.</p>
        <div className="mt-5 flex gap-2">
          <button type="button" className={primaryBtn} onClick={() => fileRef.current?.click()}>Browse files</button>
          <button type="button" className={ghostBtn} onClick={addSamples}>Use sample images</button>
        </div>
      </div>

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
          {images.map((im) => (
            <li key={im.id} className={`${cardCls} group overflow-hidden`}>
              <div className="relative aspect-[8/5] bg-slate-100">
                <img src={im.src} alt={im.name} className="h-full w-full object-cover" />
                <button type="button" aria-label={`Remove ${im.name}`} onClick={() => setImages((p) => p.filter((i) => i.id !== im.id))}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-500 shadow-sm hover:text-red-600">
                  <DeleteOutlined />
                </button>
              </div>
              <p className="truncate p-2.5 text-xs font-medium text-slate-700" title={im.name}>{im.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ================= STEP 2: annotate ================= */
function AnnotateStep({ images, setImages, classes, setClasses, notify }) {
  const [idx, setIdx] = useState(0);
  const [activeClass, setActiveClass] = useState(classes[0]?.id || null);
  const [newClass, setNewClass] = useState("");
  const [draft, setDraft] = useState(null);
  const [selected, setSelected] = useState(null);
  const surface = useRef(null);

  const image = images[Math.min(idx, images.length - 1)];
  const cls = (id) => classes.find((c) => c.id === id);
  const active = cls(activeClass);
  const setBoxes = (boxes) => setImages((p) => p.map((i) => (i.id === image.id ? { ...i, boxes } : i)));

  useEffect(() => { setSelected(null); setDraft(null); }, [idx]);
  useEffect(() => { if (!active && classes.length) setActiveClass(classes[0].id); }, [classes, active]);

  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        e.preventDefault();
        setBoxes(image.boxes.filter((b) => b.id !== selected));
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const addClass = (e) => {
    e.preventDefault();
    const name = newClass.trim();
    if (!name) return;
    if (classes.some((c) => c.name.toLowerCase() === name.toLowerCase())) return notify(`"${name}" already exists`);
    const c = { id: uid(), name, color: PALETTE[classes.length % PALETTE.length] };
    setClasses((p) => [...p, c]);
    setActiveClass(c.id);
    setNewClass("");
  };

  const removeClass = (id) => {
    setClasses((p) => p.filter((c) => c.id !== id));
    setImages((p) => p.map((i) => ({ ...i, boxes: i.boxes.filter((b) => b.cls !== id) })));
  };

  const pt = (e) => {
    const r = surface.current.getBoundingClientRect();
    return { x: clamp01((e.clientX - r.left) / r.width), y: clamp01((e.clientY - r.top) / r.height) };
  };
  const down = (e) => {
    if (!active) return notify("Type a class name first, then draw");
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pt(e);
    setDraft({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
    setSelected(null);
  };
  const move = (e) => { if (draft) { const p = pt(e); setDraft((d) => ({ ...d, x1: p.x, y1: p.y })); } };
  const up = () => {
    if (!draft) return;
    const b = { id: uid(), cls: active.id, x: Math.min(draft.x0, draft.x1), y: Math.min(draft.y0, draft.y1), w: Math.abs(draft.x1 - draft.x0), h: Math.abs(draft.y1 - draft.y0) };
    setDraft(null);
    if (b.w < 0.015 || b.h < 0.015) return;
    setBoxes([...image.boxes, b]);
    setSelected(b.id);
  };

  if (!image) return <p className={`${cardCls} p-10 text-center text-sm text-slate-500`}>Upload images first.</p>;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
      <div className={`${cardCls} p-4`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{image.name}</p>
            <p className="text-xs text-slate-500">Image {idx + 1} of {images.length} · {image.boxes.length} boxes</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className={ghostBtn} disabled={!image.boxes.length} onClick={() => setBoxes([])}>Clear</button>
            <button type="button" aria-label="Previous" className={ghostBtn} disabled={idx === 0} onClick={() => setIdx(idx - 1)}><ArrowLeftOutlined /></button>
            <button type="button" aria-label="Next" className={ghostBtn} disabled={idx >= images.length - 1} onClick={() => setIdx(idx + 1)}><ArrowRightOutlined /></button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-slate-900">
          <div ref={surface} className="relative mx-auto w-full cursor-crosshair touch-none select-none"
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <img src={image.src} alt={image.name} draggable={false} className="block max-h-[60vh] w-full object-contain" />
            {image.boxes.map((b) => {
              const c = cls(b.cls);
              if (!c) return null;
              return (
                <div key={b.id}>
                  <BoxOverlay box={b} color={c.color} strong={b.id === selected} />
                  <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => setSelected(b.id)}
                    className="absolute whitespace-nowrap rounded-t px-1.5 text-[11px] font-semibold text-white"
                    style={{ left: `${b.x * 100}%`, top: `calc(${b.y * 100}% - 20px)`, background: c.color }}>
                    {c.name}
                  </button>
                </div>
              );
            })}
            {draft && active && (
              <div className="pointer-events-none absolute" style={{
                left: `${Math.min(draft.x0, draft.x1) * 100}%`, top: `${Math.min(draft.y0, draft.y1) * 100}%`,
                width: `${Math.abs(draft.x1 - draft.x0) * 100}%`, height: `${Math.abs(draft.y1 - draft.y0) * 100}%`,
                border: `2px dashed ${active.color}`, background: `${active.color}22`,
              }} />
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">Select a class, then click and drag on the image. Click a box label and press Delete to remove it.</p>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {images.map((im, i) => (
            <button key={im.id} type="button" onClick={() => setIdx(i)} aria-label={`Open ${im.name}`}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${i === idx ? "border-violet-500" : "border-transparent opacity-70 hover:opacity-100"}`}>
              <img src={im.src} alt="" className="h-full w-full object-cover" />
              <span className={`absolute right-1 top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${im.boxes.length ? "bg-emerald-500" : "bg-amber-500"}`} />
            </button>
          ))}
        </div>
      </div>

      <div className={`${cardCls} h-fit p-4`}>
        <h3 className="mb-1 text-sm font-semibold text-slate-900">Classes</h3>
        <p className="mb-3 text-xs text-slate-500">Type the name of each object you want to detect.</p>
        <form onSubmit={addClass} className="flex gap-2">
          <input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="e.g. Helmet" maxLength={24} className={inputCls} />
          <button type="submit" aria-label="Add class" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700"><PlusOutlined /></button>
        </form>
        {classes.length === 0 ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">No classes yet. Add one to start drawing boxes.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1.5">
            {classes.map((c) => (
              <li key={c.id} className="flex items-center gap-1.5">
                <button type="button" aria-pressed={c.id === activeClass} onClick={() => setActiveClass(c.id)}
                  className={`flex flex-1 items-center justify-between rounded-lg border px-3 py-2 text-sm ${c.id === activeClass ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:bg-slate-50"}`}>
                  <span className="flex items-center gap-2 font-medium text-slate-800"><span className="h-3 w-3 rounded-sm" style={{ background: c.color }} />{c.name}</span>
                  <span className="text-xs text-slate-500">{images.reduce((n, i) => n + i.boxes.filter((b) => b.cls === c.id).length, 0)}</span>
                </button>
                <button type="button" aria-label={`Delete class ${c.name}`} onClick={() => removeClass(c.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><DeleteOutlined /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ================= STEP 3: augment ================= */
function AugTile({ image, aug, classes }) {
  const boxes = image.boxes.map((b) => (aug?.box ? aug.box(b) : b));
  return (
    <figure className={`${cardCls} overflow-hidden`}>
      <div className="relative aspect-[8/5] overflow-hidden bg-slate-100">
        <img src={image.src} alt="" className="h-full w-full object-cover" style={aug?.imgStyle} />
        {boxes.map((b) => {
          const c = classes.find((x) => x.id === b.cls);
          return c ? <BoxOverlay key={b.id} box={b} color={c.color} /> : null;
        })}
      </div>
      <figcaption className="px-3 py-2 text-xs font-medium text-slate-700">{aug ? aug.label : "Original"}</figcaption>
    </figure>
  );
}

function AugmentStep({ images, classes, augOn, setAugOn }) {
  const annotated = images.filter((i) => i.boxes.length);
  const [previewId, setPreviewId] = useState(annotated[0]?.id);
  const preview = annotated.find((i) => i.id === previewId) || annotated[0];
  const enabled = AUGS.filter((a) => augOn[a.key]);
  const total = annotated.length * (1 + enabled.length);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]">
      <div className={`${cardCls} h-fit p-4`}>
        <h3 className="text-sm font-semibold text-slate-900">Augmentations</h3>
        <p className="mb-3 mt-1 text-xs text-slate-500">Each option you turn on creates one extra copy of every annotated image, with the boxes adjusted automatically.</p>
        <ul className="flex flex-col gap-2">
          {AUGS.map((a) => (
            <li key={a.key}>
              <label className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 ${augOn[a.key] ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <span>
                  <span className="block text-sm font-medium text-slate-900">{a.label}</span>
                  <span className="text-xs text-slate-500">{a.hint}</span>
                </span>
                <input type="checkbox" checked={!!augOn[a.key]} onChange={(e) => setAugOn((p) => ({ ...p, [a.key]: e.target.checked }))} className="h-4 w-4 accent-violet-600" />
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-sm text-slate-700">
          <p><b>{annotated.length}</b> annotated images</p>
          <p><b>{enabled.length}</b> augmentations on</p>
          <p className="mt-1 text-base font-bold text-violet-700">{total} training images</p>
        </div>
      </div>

      <div className={`${cardCls} p-4`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Preview</h3>
          <select value={preview?.id} onChange={(e) => setPreviewId(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm">
            {annotated.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        {preview ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <AugTile image={preview} classes={classes} />
            {enabled.map((a) => <AugTile key={a.key} image={preview} aug={a} classes={classes} />)}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-slate-500">Annotate at least one image to see previews.</p>
        )}
        {preview && enabled.length === 0 && <p className="mt-3 text-xs text-slate-500">Turn on an augmentation to see how it changes your image.</p>}
      </div>
    </div>
  );
}

/* ================= STEP 4: train ================= */
function TrainStep({ cfg, setCfg, training, setTraining, datasetSize, classCount }) {
  const running = training.status === "running";
  const last = training.history[training.history.length - 1];
  const progress = training.total ? Math.round((training.epoch / training.total) * 100) : 0;

  const start = () => setTraining({ status: "running", epoch: 0, total: cfg.epochs, history: [], cfg: { ...cfg } });

  // simulated training loop: replace with real progress from your backend
  useEffect(() => {
    if (training.status !== "running") return;
    const t = setInterval(() => {
      setTraining((s) => {
        if (s.status !== "running") return s;
        const e = s.epoch + 1, p = e / s.total, n = () => (Math.random() - 0.5) * 0.04;
        const loss = Math.max(0.05, 1.3 * Math.exp(-3 * p) + 0.12 + n());
        return {
          ...s, epoch: e, status: e >= s.total ? "completed" : "running",
          history: [...s.history, { epoch: e, loss, val: Math.max(0.08, loss + 0.07 + n()), map: Math.min(0.95, 0.88 * (1 - Math.exp(-4 * p)) + 0.03 + n() / 2) }],
        };
      });
    }, 500);
    return () => clearInterval(t);
  }, [training.status, setTraining]);

  const Pills = ({ options, value, k }) => (
    <div className="flex gap-2">
      {options.map((o) => (
        <button key={o} type="button" disabled={running} aria-pressed={value === o} onClick={() => setCfg((c) => ({ ...c, [k]: o }))}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${value === o ? "border-violet-500 bg-violet-50 text-violet-800" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{o}</button>
      ))}
    </div>
  );
  const lbl = "mb-2 block text-sm font-semibold text-slate-900";

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[400px_1fr]">
      <div className={`${cardCls} flex flex-col gap-5 p-5`}>
        <div>
          <label className={lbl} htmlFor="mn">Model name</label>
          <input id="mn" className={inputCls} value={cfg.name} disabled={running} onChange={(e) => setCfg((c) => ({ ...c, name: e.target.value }))} />
        </div>
        <div>
          <span className={lbl}>Base model</span>
          <div className="flex flex-col gap-2">
            {BASE_MODELS.map((b) => (
              <button key={b.value} type="button" disabled={running} onClick={() => setCfg((c) => ({ ...c, base: b.value }))}
                className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left disabled:opacity-60 ${cfg.base === b.value ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <span className="text-sm font-medium">{b.value}</span><span className="text-xs text-slate-500">{b.note}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={lbl} htmlFor="ep">Epochs <span className="ml-1 font-normal text-slate-500">{cfg.epochs}</span></label>
          <input id="ep" type="range" min={5} max={60} step={5} value={cfg.epochs} disabled={running} className="w-full accent-violet-600" onChange={(e) => setCfg((c) => ({ ...c, epochs: Number(e.target.value) }))} />
        </div>
        <div><span className={lbl}>Batch size</span><Pills k="batch" options={[8, 16, 32]} value={cfg.batch} /></div>
        <div><span className={lbl}>Image size</span><Pills k="imgsz" options={[320, 640, 960]} value={cfg.imgsz} /></div>
        <p className="rounded-xl bg-slate-50 p-3.5 text-sm text-slate-700">{datasetSize} images (after augmentation) · {classCount} classes</p>
        {running ? (
          <button type="button" onClick={() => setTraining((t) => ({ ...t, status: "stopped" }))} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-sm font-semibold text-red-700 hover:bg-red-100"><StopOutlined /> Stop</button>
        ) : (
          <button type="button" className={`${primaryBtn} h-11`} disabled={!cfg.name.trim()} onClick={start}><PlayCircleOutlined /> {training.status === "completed" ? "Train again" : "Start training"}</button>
        )}
      </div>

      <div className={`${cardCls} p-5`}>
        {training.status === "idle" ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600"><ExperimentOutlined /></span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Ready when you are</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Pick your settings and start training. Loss and accuracy update here live.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">{running && <LoadingOutlined className="text-violet-600" />}{training.cfg.name}</h2>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${training.status === "completed" ? "bg-emerald-50 text-emerald-700" : training.status === "stopped" ? "bg-slate-100 text-slate-600" : "bg-violet-50 text-violet-700"}`}>
                  {training.status === "completed" ? "Completed" : training.status === "stopped" ? "Stopped" : "Training"}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
              <p className="mt-2 text-xs text-slate-500">Epoch {training.epoch} of {training.total} · {progress}%</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["Train loss", last ? last.loss.toFixed(3) : "—"], ["Val loss", last ? last.val.toFixed(3) : "—"], ["mAP50", last ? pct(last.map) : "—"]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-50 p-3.5"><p className="text-xs text-slate-500">{k}</p><p className="mt-1 text-xl font-bold tabular-nums">{v}</p></div>
              ))}
            </div>
            <div>
              <div className="mb-2 flex gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-violet-600" /> Train</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-amber-600" /> Validation</span>
              </div>
              <LossChart history={training.history} total={training.total} />
            </div>
            {training.status === "completed" && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800"><CheckCircleFilled /> Training finished. Continue to try your model.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STEP 5: try ================= */
function TryStep({ images, classes, model }) {
  const [test, setTest] = useState(null); // { src, boxes? }
  const [preds, setPreds] = useState(null);
  const [busy, setBusy] = useState(false);
  const [thr, setThr] = useState(0.5);
  const ref = useRef(null);

  const choose = (t) => { setTest(t); setPreds(null); };

  // simulated inference: replace with a call to your backend / model endpoint
  const run = () => {
    setBusy(true);
    setTimeout(() => {
      const j = () => (Math.random() - 0.5) * 0.03;
      const out = test.boxes?.length
        ? test.boxes.map((b) => ({ id: uid(), cls: b.cls, x: clamp01(b.x + j()), y: clamp01(b.y + j()), w: b.w, h: b.h, conf: 0.55 + Math.random() * 0.43 }))
        : Array.from({ length: 2 }, () => {
            const w = 0.15 + Math.random() * 0.2, h = 0.25 + Math.random() * 0.3;
            return { id: uid(), cls: classes[Math.floor(Math.random() * classes.length)].id, x: Math.random() * (1 - w), y: Math.random() * (1 - h), w, h, conf: 0.3 + Math.random() * 0.6 };
          });
      setPreds(out);
      setBusy(false);
    }, 900);
  };

  const shown = (preds || []).filter((p) => p.conf >= thr);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
      <div className={`${cardCls} p-4`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Testing with <span className="text-violet-700">{model?.name}</span></h3>
          <button type="button" className={ghostBtn} onClick={() => ref.current?.click()}><CloudUploadOutlined /> Upload test image</button>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) choose({ src: URL.createObjectURL(f) }); e.target.value = ""; }} />
        </div>
        {test ? (
          <div className="overflow-hidden rounded-xl bg-slate-900">
            <div className="relative mx-auto w-full">
              <img src={test.src} alt="Test" className="block max-h-[60vh] w-full object-contain" />
              {shown.map((p) => {
                const c = classes.find((x) => x.id === p.cls);
                return c ? <BoxOverlay key={p.id} box={p} color={c.color} label={`${c.name} ${(p.conf * 100).toFixed(0)}%`} strong /> : null;
              })}
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 py-20 text-center text-sm text-slate-500">Upload a test image or pick one from your dataset on the right.</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button type="button" className={primaryBtn} disabled={!test || busy} onClick={run}>
            {busy ? <LoadingOutlined /> : <ThunderboltOutlined />} Detect objects
          </button>
          <label className="flex items-center gap-3 text-sm text-slate-700">
            Confidence ≥ {(thr * 100).toFixed(0)}%
            <input type="range" min={0.1} max={0.95} step={0.05} value={thr} onChange={(e) => setThr(Number(e.target.value))} className="accent-violet-600" />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">Demo mode: results are simulated. Connect your trained model endpoint inside <code>run()</code> to get real detections.</p>
      </div>

      <div className="flex flex-col gap-5">
        <div className={`${cardCls} p-4`}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><AimOutlined className="text-violet-600" /> Detections</h3>
          {!preds ? <p className="text-sm text-slate-500">Run detection to see results.</p> : shown.length === 0 ? <p className="text-sm text-slate-500">Nothing above the confidence threshold.</p> : (
            <ul className="flex flex-col gap-1.5">
              {shown.map((p) => {
                const c = classes.find((x) => x.id === p.cls);
                return (
                  <li key={p.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 font-medium"><span className="h-3 w-3 rounded-sm" style={{ background: c?.color }} />{c?.name}</span>
                    <span className="tabular-nums text-slate-600">{pct(p.conf)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className={`${cardCls} p-4`}>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Pick from your dataset</h3>
          <div className="grid grid-cols-3 gap-2">
            {images.map((im) => (
              <button key={im.id} type="button" aria-label={`Test ${im.name}`} onClick={() => choose({ src: im.src, boxes: im.boxes })}
                className={`overflow-hidden rounded-lg border-2 ${test?.src === im.src ? "border-violet-500" : "border-transparent"}`}>
                <img src={im.src} alt="" className="aspect-[8/5] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */
export default function ModelTrain() {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState([]);
  const [classes, setClasses] = useState([]);
  const [augOn, setAugOn] = useState({ flipH: true, bright: true });
  const [cfg, setCfg] = useState({ name: "my-detector-v1", base: "YOLOv8 Small", epochs: 20, batch: 16, imgsz: 640 });
  const [training, setTraining] = useState({ status: "idle", epoch: 0, total: 0, history: [], cfg: null });
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);
  const notify = (m) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), 3500); };

  const annotated = images.filter((i) => i.boxes.length).length;
  const augCount = AUGS.filter((a) => augOn[a.key]).length;
  const datasetSize = annotated * (1 + augCount);
  const trained = training.status === "completed";
  const model = trained ? training.cfg : null;

  // which steps are complete -> gates "Next"
  const canNext = [
    images.length >= 1,
    classes.length >= 1 && annotated >= 1,
    annotated >= 1,
    trained,
    false,
  ];
  const hints = [
    "Upload at least one image to continue.",
    "Add a class and annotate at least one image to continue.",
    "",
    "Finish training to continue.",
    "",
  ];
  const maxStep = canNext.reduce((m, ok, i) => (i === m && ok ? m + 1 : m), 0);

  const addFiles = (list) => {
    const files = Array.from(list || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return notify("Only image files can be uploaded");
    setImages((p) => [...p, ...files.map((f) => ({ id: uid(), name: f.name, src: URL.createObjectURL(f), boxes: [] }))]);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />

      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Model Train</h1>
        <p className="mt-1 text-sm text-slate-500">Upload images, label them, augment, train, then test your own detector.</p>
      </header>

      <Stepper step={step} maxStep={maxStep} onGo={setStep} />

      <div className="mt-6">
        {step === 0 && <UploadStep images={images} setImages={setImages} fileRef={fileRef} notify={notify} />}
        {step === 1 && <AnnotateStep images={images} setImages={setImages} classes={classes} setClasses={setClasses} notify={notify} />}
        {step === 2 && <AugmentStep images={images} classes={classes} augOn={augOn} setAugOn={setAugOn} />}
        {step === 3 && <TrainStep cfg={cfg} setCfg={setCfg} training={training} setTraining={setTraining} datasetSize={datasetSize} classCount={classes.length} />}
        {step === 4 && <TryStep images={images} classes={classes} model={model} />}
      </div>

      <footer className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button type="button" className={ghostBtn} disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeftOutlined /> Back</button>
        <p className="hidden text-xs text-slate-500 sm:block">{!canNext[step] ? hints[step] : ""}</p>
        {step < STEPS.length - 1 && (
          <button type="button" className={primaryBtn} disabled={!canNext[step]} onClick={() => setStep(step + 1)}>Next <ArrowRightOutlined /></button>
        )}
      </footer>

      {toast && (
        <div role="status" className="fixed right-4 top-4 z-[60] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-lg">{toast}</div>
      )}
    </div>
  );
}