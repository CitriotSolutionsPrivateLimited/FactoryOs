/**
 * Overview.js: Factory OS "Overview" page content (no sidebar; the sidebar lives in Home.js).
 * Stack: React + Tailwind CSS + @ant-design/icons (light theme).
 *
 * Install:  npm i @ant-design/icons   (Tailwind v3 must already be set up)
 * Use:      import Overview from "./Overview";  then render <Overview /> inside your Dashboard page
 * Note:     the file contains JSX. With Vite, name it Overview.jsx. Create React App accepts Overview.js.
 *
 * Site: TIEI, divided into Station 1, Station 2, Station 3 and Station 4.
 */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BulbOutlined,
  CheckCircleFilled,
  CheckOutlined,
  CloseCircleFilled,
  CloseOutlined,
  DownOutlined,
  ExclamationCircleFilled,
  InboxOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  SendOutlined
} from "@ant-design/icons";

/* ======================================================================
   Site structure
   ====================================================================== */
const SITE = "TIEI";
const ALL = "All stations";
const STATIONS = ["Station 1", "Station 2", "Station 3", "Station 4"];

/* ======================================================================
   Formatting helpers
   ====================================================================== */
const nf = (opts) => new Intl.NumberFormat("en", opts);

const fN = (n) => nf().format(n);
const f1 = (n) => nf({ minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
const f2 = (n) => nf({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fC = (n) => nf({ notation: "compact", maximumFractionDigits: 1 }).format(n);
const fP = (n) => `${Math.round(n * 100)}%`;

const signed = (n, dec = 0) => {
  const abs = Math.abs(n);
  const body = abs >= 10000 ? fC(abs) : dec === 2 ? f2(abs) : dec === 1 ? f1(abs) : fN(abs);
  return `${n > 0 ? "+" : n < 0 ? "-" : ""}${body}`;
};

/* ======================================================================
   Sample data (replace with your API responses)
   ====================================================================== */
// Sample data for layout review. Replace with your API responses.
// All numeric fields are real numbers (no string parsing needed).
// The "plant" field of every record holds the station it belongs to
// ("Station 1" ... "Station 4") or "All stations" for site-wide items.

const data = {
  kpis: [
    { metric: "fleet_health", value: 87, prior: 84 },
    { metric: "defect_rate", value: 0.92, prior: 1.21 },
    { metric: "safety_events", value: 14, prior: 22 },
    { metric: "open_proposals", value: 23, prior: 29 },
    { metric: "downtime_avoided_hours", value: 118, prior: 92 },
    { metric: "verified_closures", value: 61, prior: 52 },
  ],

  funnel: [
    { stage: "Signals ingested (M)", count: 412, prior: 388 },
    { stage: "Detections and diagnoses", count: 1864, prior: 2012 },
    { stage: "Proposals drafted", count: 298, prior: 241 },
    { stage: "Approved by a human", count: 231, prior: 176 },
    { stage: "Executed in target system", count: 214, prior: 163 },
    { stage: "Verified on closure", count: 131, prior: 96 },
  ],

  sparks: {
    health: [81, 82, 82, 83, 84, 84, 85, 85, 86, 86, 87, 87],
    actions: [12, 15, 18, 21, 24, 27, 29, 31, 33, 36, 38, 41],
    safety: [31, 29, 27, 26, 24, 23, 22, 20, 19, 17, 15, 14],
    inspected: [176200,178400,175900,180100,171300,168900,179800,181200,182600,179100,183400,177200,172800,180900,182300,184100,181700,183900,176400,170200,182800,184600,183100,185200,182400,179600,174800,184900,185800,184260],
    defects: [2310,2290,2250,2410,2180,2120,2260,2240,2190,2130,2160,2060,1990,2040,2010,1980,1920,1900,1810,1740,1820,1790,1760,1730,1700,1660,1610,1710,1690,1695],
  },

  integrations: [
    { system: "Citriot sensor nodes", direction: "Backward", product: "CogniSense", protocol: "MQTT", status: "OK", last_sync_min: 1, latency_ms: 120, records_24h: 2910000 },
    { system: "Siemens S7 PLCs (Station 1)", direction: "Backward", product: "CogniSense", protocol: "OPC-UA", status: "OK", last_sync_min: 2, latency_ms: 85, records_24h: 860000 },
    { system: "Rockwell PLCs (Station 2)", direction: "Backward", product: "CogniSense", protocol: "OPC-UA", status: "OK", last_sync_min: 2, latency_ms: 92, records_24h: 640000 },
    { system: "HVAC BMS (Station 3)", direction: "Backward", product: "CogniSense", protocol: "Modbus TCP", status: "Degraded", last_sync_min: 18, latency_ms: 410, records_24h: 42000 },
    { system: "SCADA historian", direction: "Backward", product: "CogniSense", protocol: "SQL", status: "OK", last_sync_min: 5, latency_ms: 160, records_24h: 1200000 },
    { system: "Machine-vision cameras (Inspect)", direction: "Backward", product: "CogniVision Inspect", protocol: "GigE Vision", status: "OK", last_sync_min: 0, latency_ms: 34, records_24h: 184260 },
    { system: "CCTV / NVR (Insight)", direction: "Backward", product: "CogniVision Insight", protocol: "RTSP", status: "OK", last_sync_min: 0, latency_ms: 210, records_24h: 236 },
    { system: "MES production schedule", direction: "Backward", product: "Factory OS", protocol: "REST", status: "OK", last_sync_min: 10, latency_ms: 330, records_24h: 1840 },
    { system: "SAP PM", direction: "Forward", product: "Factory OS", protocol: "OData", status: "OK", last_sync_min: 3, latency_ms: 480, records_24h: 96 },
    { system: "Maximo", direction: "Forward", product: "Factory OS", protocol: "REST", status: "OK", last_sync_min: 4, latency_ms: 520, records_24h: 41 },
    { system: "Fiix", direction: "Forward", product: "Factory OS", protocol: "REST", status: "OK", last_sync_min: 6, latency_ms: 390, records_24h: 18 },
    { system: "SAP MM procurement", direction: "Forward", product: "Factory OS", protocol: "OData", status: "OK", last_sync_min: 3, latency_ms: 510, records_24h: 27 },
    { system: "SAP QM (NCR)", direction: "Forward", product: "CogniVision Inspect", protocol: "OData", status: "OK", last_sync_min: 7, latency_ms: 560, records_24h: 19 },
    { system: "EHS ticketing", direction: "Forward", product: "CogniVision Insight", protocol: "REST", status: "Error", last_sync_min: 142, latency_ms: 0, records_24h: 0 },
    { system: "Email and reports", direction: "Forward", product: "Factory OS", protocol: "SMTP", status: "OK", last_sync_min: 60, latency_ms: 900, records_24h: 12 },
  ],

  triage: [
    { rank: 1, asset: "Compressor C-204", plant: "Station 1", fault: "Outer race bearing defect", iso_zone: "D", rul_days: 9, lead_time_days: 14, criticality: "A", risk_score: 94, evidence: "BPFO at 3.2x shaft speed rose 41% in 14 days; velocity 7.8 mm/s (Zone D)" },
    { rank: 2, asset: "Cooling tower fan CT-3", plant: "Station 2", fault: "Imbalance", iso_zone: "C", rul_days: 21, lead_time_days: 7, criticality: "A", risk_score: 82, evidence: "1x radial amplitude up 2.3x since blade clean on 12 Oct" },
    { rank: 3, asset: "Hydraulic pump HP-11", plant: "Station 3", fault: "Cavitation", iso_zone: "C", rul_days: 18, lead_time_days: 21, criticality: "A", risk_score: 80, evidence: "Broadband noise 2-5 kHz; suction pressure 0.3 bar below spec" },
    { rank: 4, asset: "Main spindle motor SM-07", plant: "Station 4", fault: "Misalignment", iso_zone: "C", rul_days: 30, lead_time_days: 10, criticality: "A", risk_score: 71, evidence: "2x axial 180 deg phase shift across coupling" },
    { rank: 5, asset: "AHU-2 supply fan", plant: "Station 3", fault: "Belt wear", iso_zone: "C", rul_days: 14, lead_time_days: 5, criticality: "B", risk_score: 66, evidence: "Belt frequency sidebands; motor current ripple 6%" },
    { rank: 6, asset: "Chiller compressor CH-1", plant: "Station 4", fault: "Inner race defect", iso_zone: "C", rul_days: 27, lead_time_days: 28, criticality: "A", risk_score: 65, evidence: "BPFI harmonics with 1x sidebands; oil Fe ppm 34" },
    { rank: 7, asset: "Conveyor gearbox GB-18", plant: "Station 1", fault: "Gear mesh wear", iso_zone: "B", rul_days: 45, lead_time_days: 21, criticality: "B", risk_score: 52, evidence: "GMF sidebands growing; temperature +6 C vs baseline" },
    { rank: 8, asset: "Exhaust blower EB-5", plant: "Station 2", fault: "Looseness", iso_zone: "B", rul_days: 38, lead_time_days: 7, criticality: "B", risk_score: 47, evidence: "Sub-harmonics 0.5x present; mount bolt torque flagged" },
    { rank: 9, asset: "Coolant pump CP-22", plant: "Station 3", fault: "Cavitation", iso_zone: "B", rul_days: 52, lead_time_days: 14, criticality: "B", risk_score: 41, evidence: "Random high-frequency bursts correlate with low tank level" },
    { rank: 10, asset: "Boiler feed pump BFP-2", plant: "Station 4", fault: "Imbalance", iso_zone: "B", rul_days: 60, lead_time_days: 21, criticality: "B", risk_score: 37, evidence: "1x radial trending up 12% per week" },
  ],

  inspect_lines: [
    { line: "Line 1 Cylinder head", plant: "Station 1", part: "Cylinder head", inspected_24h: 8420, defect_rate: 0.72, model_version: "v4.2", model_accuracy: 99.1, drift: "Low", yield: 99.28, status: "OK" },
    { line: "Line 2 Crankcase", plant: "Station 1", part: "Crankcase", inspected_24h: 6180, defect_rate: 1.42, model_version: "v3.9", model_accuracy: 98.4, drift: "Medium", yield: 98.58, status: "Watch" },
    { line: "Line 3 Brake disc", plant: "Station 2", part: "Brake disc", inspected_24h: 11240, defect_rate: 0.66, model_version: "v5.0", model_accuracy: 99.3, drift: "Low", yield: 99.34, status: "OK" },
    { line: "Line 4 Piston", plant: "Station 4", part: "Piston", inspected_24h: 14360, defect_rate: 1.4, model_version: "v4.6", model_accuracy: 98.9, drift: "High", yield: 98.6, status: "Retrain" },
    { line: "Line 5 Gear blank", plant: "Station 2", part: "Gear blank", inspected_24h: 5120, defect_rate: 0.43, model_version: "v2.8", model_accuracy: 99.0, drift: "Low", yield: 99.57, status: "OK" },
    { line: "Line 6 Bottle cap", plant: "Station 3", part: "Closure", inspected_24h: 91000, defect_rate: 0.35, model_version: "v6.1", model_accuracy: 99.6, drift: "Low", yield: 99.65, status: "OK" },
    { line: "Line 7 Label", plant: "Station 3", part: "Label", inspected_24h: 47940, defect_rate: 0.26, model_version: "v3.3", model_accuracy: 98.7, drift: "Medium", yield: 99.74, status: "Watch" },
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

  insight_areas: [
    { area: "Machining bay A", plant: "Station 1", cameras: 24, ppe_compliance: 97.2, sop_compliance: 95.1, intrusions_7d: 2, near_misses_7d: 1, idle_minutes_7d: 340, status: "OK" },
    { area: "Assembly line 2", plant: "Station 2", cameras: 18, ppe_compliance: 94.8, sop_compliance: 92.6, intrusions_7d: 4, near_misses_7d: 3, idle_minutes_7d: 610, status: "Watch" },
    { area: "Dispatch yard", plant: "Station 1", cameras: 12, ppe_compliance: 89.5, sop_compliance: 88.0, intrusions_7d: 7, near_misses_7d: 5, idle_minutes_7d: 220, status: "Alert" },
    { area: "Press shop", plant: "Station 2", cameras: 20, ppe_compliance: 96.1, sop_compliance: 94.4, intrusions_7d: 1, near_misses_7d: 2, idle_minutes_7d: 415, status: "OK" },
    { area: "Paint shop", plant: "Station 3", cameras: 14, ppe_compliance: 98.4, sop_compliance: 96.8, intrusions_7d: 0, near_misses_7d: 0, idle_minutes_7d: 180, status: "OK" },
    { area: "Warehouse", plant: "Station 4", cameras: 22, ppe_compliance: 91.3, sop_compliance: 90.2, intrusions_7d: 5, near_misses_7d: 4, idle_minutes_7d: 520, status: "Watch" },
    { area: "Filling hall", plant: "Station 3", cameras: 16, ppe_compliance: 98.9, sop_compliance: 97.5, intrusions_7d: 0, near_misses_7d: 1, idle_minutes_7d: 95, status: "OK" },
    { area: "Loading dock", plant: "Station 4", cameras: 10, ppe_compliance: 93.0, sop_compliance: 91.1, intrusions_7d: 3, near_misses_7d: 2, idle_minutes_7d: 260, status: "Watch" },
  ],

  rootcause: [
    { link_id: "RC-014", plant: "Station 4", signal_a: "Line 4 Piston dimensional defects", product_a: "CogniVision Inspect", signal_b: "Main spindle motor SM-07 2x axial vibration", product_b: "CogniSense", correlation: 0.81, finding: "Defect spikes follow spindle misalignment within one shift; alignment WO-3115 approved", status: "Linked to WO-3115" },
    { link_id: "RC-015", plant: "Station 1", signal_a: "Line 2 Crankcase surface scratches", product_a: "CogniVision Inspect", signal_b: "Conveyor gearbox GB-18 mesh wear", product_b: "CogniSense", correlation: 0.64, finding: "Scratch rate rises with conveyor speed variance; gearbox inspection pending", status: "Under review" },
    { link_id: "RC-016", plant: "Station 1", signal_a: "Dispatch yard forklift near-misses", product_a: "CogniVision Insight", signal_b: "Shift change 14:00 footfall peak", product_b: "CogniVision Insight", correlation: 0.72, finding: "80% of near-misses within 20 min of shift change; staggered start proposed", status: "Proposed" },
    { link_id: "RC-017", plant: "Station 3", signal_a: "Line 6 cap misalignment", product_a: "CogniVision Inspect", signal_b: "AHU-2 supply fan belt wear (hall humidity)", product_b: "CogniSense", correlation: 0.58, finding: "Humidity drift in filling hall tracks AHU-2 degradation; belt WO-3114 approved", status: "Linked to WO-3114" },
  ],

  proposals: [
    { id: "WO-3118", product: "CogniSense", agent: "Work-order agent", asset: "Compressor C-204", plant: "Station 1", action: "Replace DE bearing 6314; align; LOTO", target_system: "SAP PM", status: "Pending", created: "2026-11-05" },
    { id: "PR-0442", product: "CogniSense", agent: "Spares agent", asset: "Compressor C-204", plant: "Station 1", action: "Purchase request 2x SKF 6314 bearings", target_system: "SAP MM", status: "Pending", created: "2026-11-05" },
    { id: "SCH-0211", product: "CogniSense", agent: "Scheduling agent", asset: "Compressor C-204", plant: "Station 1", action: "Maintenance window Sat 08 Nov 06:00-14:00", target_system: "MES", status: "Pending", created: "2026-11-05" },
    { id: "NCR-0871", product: "CogniVision Inspect", agent: "Quality agent", asset: "Line 4 Piston", plant: "Station 4", action: "Raise NCR for porosity batch 2411-P04; hold 240 units", target_system: "SAP QM", status: "Pending", created: "2026-11-05" },
    { id: "RT-0192", product: "CogniVision Inspect", agent: "Quality agent", asset: "Line 4 Piston", plant: "Station 4", action: "Retrain porosity model; 312 new labelled samples", target_system: "CogniVision Inspect", status: "Pending", created: "2026-11-05" },
    { id: "EHS-0334", product: "CogniVision Insight", agent: "Safety agent", asset: "Dispatch yard", plant: "Station 1", action: "EHS ticket: 5 forklift near-misses; propose staggered shift start", target_system: "EHS ticketing", status: "Pending", created: "2026-11-05" },
    { id: "EHS-0333", product: "CogniVision Insight", agent: "Safety agent", asset: "Warehouse", plant: "Station 4", action: "EHS ticket: PPE compliance 91.3%; toolbox talk", target_system: "EHS ticketing", status: "Pending", created: "2026-11-04" },
    { id: "WO-3117", product: "CogniSense", agent: "Work-order agent", asset: "Cooling tower fan CT-3", plant: "Station 2", action: "Dynamic balancing; inspect blade erosion", target_system: "SAP PM", status: "Pending", created: "2026-11-04" },
    { id: "WO-3116", product: "CogniSense", agent: "Work-order agent", asset: "Hydraulic pump HP-11", plant: "Station 3", action: "Check suction strainer; verify NPSH", target_system: "Maximo", status: "Approved", created: "2026-11-04" },
    { id: "PR-0441", product: "CogniSense", agent: "Spares agent", asset: "Hydraulic pump HP-11", plant: "Station 3", action: "Purchase request impeller kit", target_system: "SAP MM", status: "Pending", created: "2026-11-04" },
    { id: "NCR-0870", product: "CogniVision Inspect", agent: "Quality agent", asset: "Line 2 Crankcase", plant: "Station 1", action: "Raise NCR for surface scratches; inspect conveyor guide", target_system: "SAP QM", status: "Approved", created: "2026-11-04" },
    { id: "WO-3115", product: "CogniSense", agent: "Work-order agent", asset: "Main spindle motor SM-07", plant: "Station 4", action: "Laser alignment; check coupling", target_system: "Maximo", status: "Approved", created: "2026-11-03" },
    { id: "WO-3114", product: "CogniSense", agent: "Work-order agent", asset: "AHU-2 supply fan", plant: "Station 3", action: "Replace drive belts; tension check", target_system: "Fiix", status: "Approved", created: "2026-11-03" },
    { id: "SCH-0210", product: "CogniSense", agent: "Scheduling agent", asset: "AHU-2 supply fan", plant: "Station 3", action: "Maintenance window Thu 06 Nov 22:00-02:00", target_system: "MES", status: "Approved", created: "2026-11-03" },
    { id: "EHS-0332", product: "CogniVision Insight", agent: "Safety agent", asset: "Assembly line 2", plant: "Station 2", action: "EHS ticket: zone intrusion x4; relocate barrier", target_system: "EHS ticketing", status: "Executed", created: "2026-11-03" },
    { id: "WO-3113", product: "CogniSense", agent: "Work-order agent", asset: "Chiller compressor CH-1", plant: "Station 4", action: "Bearing inspection; oil analysis", target_system: "Fiix", status: "Pending", created: "2026-11-02" },
    { id: "PR-0440", product: "CogniSense", agent: "Spares agent", asset: "Chiller compressor CH-1", plant: "Station 4", action: "Purchase request bearing set", target_system: "SAP MM", status: "Rejected", created: "2026-11-02" },
    { id: "RT-0191", product: "CogniVision Inspect", agent: "Quality agent", asset: "Line 7 Label", plant: "Station 3", action: "Recalibrate label skew threshold after reel change", target_system: "CogniVision Inspect", status: "Executed", created: "2026-11-02" },
    { id: "WO-3112", product: "CogniSense", agent: "Work-order agent", asset: "Conveyor gearbox GB-18", plant: "Station 1", action: "Oil change; gear inspection", target_system: "SAP PM", status: "Approved", created: "2026-11-01" },
    { id: "WO-3111", product: "CogniSense", agent: "Work-order agent", asset: "Exhaust blower EB-5", plant: "Station 2", action: "Tighten foundation bolts; re-check", target_system: "Maximo", status: "Approved", created: "2026-10-31" },
    { id: "REP-0098", product: "Factory OS", agent: "Reporting agent", asset: "All assets", plant: ALL, action: "October reliability quality safety and ESG report", target_system: "Email", status: "Executed", created: "2026-11-01" },
  ],

  agents: [
    { agent: "Work-order agent", product: "CogniSense", proposals_30d: 148, approved: 109, rejected: 14 },
    { agent: "Spares agent", product: "CogniSense", proposals_30d: 52, approved: 37, rejected: 9 },
    { agent: "Scheduling agent", product: "CogniSense", proposals_30d: 61, approved: 48, rejected: 5 },
    { agent: "Quality agent", product: "CogniVision Inspect", proposals_30d: 44, approved: 36, rejected: 3 },
    { agent: "Safety agent", product: "CogniVision Insight", proposals_30d: 38, approved: 31, rejected: 4 },
    { agent: "Root-cause agent", product: "Factory OS", proposals_30d: 4, approved: 3, rejected: 0 },
    { agent: "Reporting agent", product: "Factory OS", proposals_30d: 4, approved: 4, rejected: 0 },
  ],

  activity: [
    { at: "2026-11-05 10:42", agent: "Quality agent", product: "CogniVision Inspect", plant: "Station 4", event: "Drafted NCR-0871 for porosity on Line 4 Piston; 240 units on hold pending approval" },
    { at: "2026-11-05 10:31", agent: "Root-cause agent", product: "Factory OS", plant: "Station 4", event: "Linked Line 4 dimensional defects to spindle SM-07 misalignment (r = 0.81)" },
    { at: "2026-11-05 09:58", agent: "Work-order agent", product: "CogniSense", plant: "Station 1", event: "Drafted WO-3118 bearing replacement for Compressor C-204 with parts and LOTO steps" },
    { at: "2026-11-05 09:58", agent: "Spares agent", product: "CogniSense", plant: "Station 1", event: "Stock check: SKF 6314 not in stock; drafted PR-0442 with 14-day lead" },
    { at: "2026-11-05 09:12", agent: "Safety agent", product: "CogniVision Insight", plant: "Station 1", event: "Drafted EHS-0334: 5 forklift near-misses in Dispatch yard clustered at shift change" },
    { at: "2026-11-05 08:30", agent: "Data-quality agent", product: "CogniSense", plant: "Station 3", event: "Flagged HVAC BMS feed degraded: 18 min since last sync; diagnoses on AHU assets suppressed" },
    { at: "2026-11-05 08:05", agent: "Camera-health agent", product: "CogniVision Insight", plant: "Station 1", event: "Camera DY-07 lens occluded; marked out of service and notified facilities" },
    { at: "2026-11-05 07:15", agent: "Context agent", product: "Factory OS", plant: ALL, event: "Pulled 61 closed work orders from SAP PM and Maximo; 37 verified against original diagnosis" },
    { at: "2026-11-05 06:00", agent: "Connector agent", product: "Factory OS", plant: "Station 2", event: "Proposed tag mapping for new Rockwell PLC on Line 5: 142 tags to 9 asset models awaiting engineer confirmation" },
  ],
};

/* ======================================================================
   Copilot reasoning and Q&A
   ====================================================================== */
/**
 * Rule-based "copilot" that reasons over the current data and returns
 * ranked improvement suggestions. Swap this for an API call when ready.
 */
function reason({ proposals, inPlant, product }) {
  const out = [];
  const hasPending = (asset) => proposals.some((p) => p.asset === asset && p.status === "Pending");
  const verified = data.kpis.find((k) => k.metric === "verified_closures");

  // 1. Remaining useful life shorter than spare lead time
  for (const r of data.triage.filter((r) => r.rul_days < r.lead_time_days)) {
    const gap = r.lead_time_days - r.rul_days;
    out.push({
      id: `rul-${r.rank}`, product: "CogniSense", plant: r.plant,
      prio: r.criticality === "A" ? "high" : "med",
      score: 100 - r.rank + (r.criticality === "A" ? 20 : 0),
      title: `${r.asset}: the spare arrives ${gap} days after the predicted failure`,
      why: [
        `Diagnosis: ${r.fault}, ISO 10816-3 zone ${r.iso_zone}, risk ${r.risk_score}/100`,
        `Remaining useful life ${r.rul_days} days, spare lead time ${r.lead_time_days} days`,
        r.evidence,
      ],
      impact: `Avoids an unplanned stop on a criticality-${r.criticality} asset; an unplanned bearing failure typically costs 8–24 h of downtime`,
      action: hasPending(r.asset)
        ? "Proposals already in the queue; approve to start the clock"
        : "Expedite the spare (air freight or alternate vendor) and pull the maintenance window forward",
      draft: hasPending(r.asset) ? null : {
        product: "CogniSense", agent: "Spares agent", asset: r.asset, plant: r.plant,
        action: `Expedite spare: ${r.fault} on ${r.asset}; lead ${r.lead_time_days} d > RUL ${r.rul_days} d`,
        target_system: "SAP MM",
      },
    });
  }

  // 2. Defect types rising more than 10% week on week
  for (const d of data.inspect_defects.filter((d) => d.count_7d > d.prior_7d * 1.1)) {
    const line = data.inspect_lines.find((l) => l.line === d.top_line) || {};
    const rc = data.rootcause.find((r) => r.signal_a.includes(d.top_line.split(" ").slice(0, 2).join(" ")));
    const rise = d.count_7d / d.prior_7d - 1;
    out.push({
      id: `def-${d.defect_type}`, product: "CogniVision Inspect", plant: line.plant || "",
      prio: "high", score: 80 + (d.count_7d - d.prior_7d) / 10,
      title: `${d.defect_type} up ${fP(rise)} week on week, mostly on ${d.top_line}`,
      why: [
        `${d.count_7d} this week vs ${d.prior_7d} the week before`,
        line.drift ? `${d.top_line} model drift is ${line.drift}; accuracy ${line.model_accuracy}%` : "",
        rc ? `Root-cause agent links it to ${rc.signal_b} (r = ${f2(rc.correlation)})` : "No machine-health correlation found yet",
      ].filter(Boolean),
      impact: `Each 0.1 pt of defect rate on ${d.top_line} is about ${fN(Math.round((line.inspected_24h || 0) * 0.001 * 30))} rejected units a month`,
      action: rc
        ? `Fix the upstream cause first (${rc.status}); retrain only if the rate stays high afterwards`
        : `Pull 50 recent rejects for the quality team and check fixture and tooling on ${d.top_line}`,
      draft: {
        product: "CogniVision Inspect", agent: "Quality agent", asset: d.top_line, plant: line.plant || "",
        action: `Containment review: ${d.defect_type} +${fP(rise)} WoW`, target_system: "SAP QM",
      },
    });
  }

  // 3. Inspection lines flagged for retraining
  for (const l of data.inspect_lines.filter((l) => l.status === "Retrain")) {
    out.push({
      id: `retrain-${l.line}`, product: "CogniVision Inspect", plant: l.plant, prio: "med", score: 60,
      title: `${l.line}: retrain the ${l.model_version} model before false rejects climb`,
      why: [
        `Drift ${l.drift}; accuracy ${l.model_accuracy}% against a 99.3%`,
        `${fC(l.inspected_24h)} units a day pass this model`,
      ],
      impact: "Restores accuracy and cuts false rejects, which are scrap you did not need to make",
      action: hasPending(l.line)
        ? "Retraining job is drafted; approve it in the queue"
        : "Approve the retraining job and schedule a 2 h validation run",
      draft: null,
    });
  }

  // 4. CCTV areas on Alert or Watch
  for (const a of data.insight_areas.filter((a) => a.status !== "OK")) {
    out.push({
      id: `area-${a.area}`, product: "CogniVision Insight", plant: a.plant,
      prio: a.status === "Alert" ? "high" : "med",
      score: a.status === "Alert" ? 85 : 50 + a.near_misses_7d * 3,
      title: `${a.area} (${a.plant}): ${a.near_misses_7d} near-misses and PPE compliance at ${a.ppe_compliance}%`,
      why: [
        `${a.intrusions_7d} zone intrusions in 7 days across ${a.cameras} cameras`,
        `SOP compliance ${a.sop_compliance}%, target 95%`,
        data.rootcause.some((r) => r.signal_a.includes(a.area))
          ? "Root-cause agent: 80% of near-misses within 20 min of the 14:00 shift change"
          : `${a.idle_minutes_7d} idle minutes recorded this week`,
      ],
      impact: "A recordable forklift incident costs 2–5 lost days plus investigation; compliance gaps show up in customer audits",
      action: a.status === "Alert"
        ? "Stagger shift start by 15 min and add a spotter at the yard gate for two weeks, then re-measure"
        : "Toolbox talk this week; review the camera angle if PPE detections look wrong",
      draft: hasPending(a.area) ? null : {
        product: "CogniVision Insight", agent: "Safety agent", asset: a.area, plant: a.plant,
        action: `EHS ticket: ${a.status} area, ${a.near_misses_7d} near-misses, PPE ${a.ppe_compliance}%`,
        target_system: "EHS ticketing",
      },
    });
  }

  // 5. Integrations degraded or down
  for (const i of data.integrations.filter((i) => i.status !== "OK")) {
    const blocked = i.direction === "Forward"
      ? proposals.filter((p) => p.target_system === i.system && p.status === "Pending").length : 0;
    out.push({
      id: `intg-${i.system}`, product: "Factory OS", plant: "",
      prio: i.status === "Error" ? "high" : "med", score: i.status === "Error" ? 90 : 55,
      title: i.status === "Error"
        ? `${i.system} has been down ${i.last_sync_min} min; ${blocked} proposals are stuck`
        : `${i.system} is degraded: ${i.last_sync_min} min since last sync`,
      why: [
        `Protocol ${i.protocol}, latency ${fN(i.latency_ms)} ms, ${fC(i.records_24h)} records in 24 h`,
        i.direction === "Backward"
          ? "Data-quality agent has suppressed diagnoses on the affected assets to avoid false alarms"
          : "Forward agents keep drafting; nothing reaches the target until it returns",
      ],
      impact: i.direction === "Backward"
        ? "Blind spot on the assets behind this feed until it recovers"
        : "Approved actions are not executing; approvers may assume they are",
      action: i.direction === "Backward"
        ? "Check the gateway and the BMS Modbus poll rate; the connector agent can re-propose the register map"
        : "Ask IT to restore the API token; proposals will flush automatically",
      draft: null,
    });
  }

  // 6. Agents under the 60% approval gate
  for (const a of data.agents.filter((a) => a.proposals_30d > 0 && a.approved / a.proposals_30d < 0.6)) {
    out.push({
      id: `agent-${a.agent}`, product: a.product, plant: "", prio: "med", score: 40,
      title: `${a.agent} is below the 60% approval gate`,
      why: [`${a.approved} of ${a.proposals_30d} approved, ${a.rejected} rejected`],
      impact: "Low approval means planners stop trusting the drafts",
      action: "Review the rejected drafts with the planner and tighten the agent's rules",
      draft: null,
    });
  }

  // 7. Learning loop: verified closures
  if (verified.value < 70) {
    out.push({
      id: "verify", product: "Factory OS", plant: "", prio: "med", score: 45,
      title: `Only ${verified.value}% of closed work orders carry technician findings`,
      why: [
        `Up from ${verified.prior}% last week, but ${100 - verified.value}% of closures give the engines nothing to learn from`,
        "The context agent pulls findings from SAP PM and Maximo closure notes only when the technician fills the fault-found field",
      ],
      impact: "Every verified closure improves the next diagnosis; unverified ones leave accuracy flat",
      action: "Make fault-found a required field on closure in SAP PM and Maximo for agent-drafted work orders",
      draft: null,
    });
  }

  return out
    .filter((s) => inPlant(s.plant || ALL) && (!product || s.product === product))
    .sort((a, b) => (a.prio === "high" ? 0 : 1) - (b.prio === "high" ? 0 : 1) || b.score - a.score);
}

/** Answers free-text questions using the same data. */
function answer(question, { proposals, suggestions }) {
  const t = question.toLowerCase();
  const line = data.inspect_lines.find(
    (l) => t.includes(l.line.toLowerCase().split(" ").slice(0, 2).join(" ")) || t.includes(l.part.toLowerCase())
  );
  const asset = data.triage.find(
    (a) => t.includes(a.asset.toLowerCase().split(" ")[0]) || t.includes(a.asset.toLowerCase())
  );
  const area = data.insight_areas.find((a) => t.includes(a.area.toLowerCase()));
  const stationKey = STATIONS.find((s) => t.includes(s.toLowerCase()) || t.includes(s.toLowerCase().replace(" ", "")));

  if (line) {
    const rc = data.rootcause.find((r) => r.signal_a.includes(line.line.split(" ").slice(0, 2).join(" ")));
    const d = data.inspect_defects.find((x) => x.top_line === line.line);
    return [
      `${line.line} (${line.plant}) ran ${fC(line.inspected_24h)} units in 24 h at ${line.defect_rate}% defects (yield ${line.yield}%). Model ${line.model_version} is at ${line.model_accuracy}% with ${line.drift.toLowerCase()} drift.`,
      d ? `The leading defect is ${d.defect_type.toLowerCase()}: ${d.count_7d} this week vs ${d.prior_7d} last week.` : "",
      rc ? `Most likely cause: ${rc.signal_b} (r = ${f2(rc.correlation)}). ${rc.finding}.` : "No machine-health correlation yet; the root-cause agent re-runs nightly.",
      line.status === "Retrain"
        ? "Recommendation: fix the upstream cause, then approve the retraining job in the queue."
        : "Recommendation: keep on watch; no action needed today.",
    ].filter(Boolean).join(" ");
  }

  if (asset) {
    const ps = proposals.filter((p) => p.asset === asset.asset);
    return `${asset.asset} (${asset.plant}) is rank ${asset.rank} with ${asset.fault.toLowerCase()} in ISO zone ${asset.iso_zone}. Evidence: ${asset.evidence}. Remaining useful life ${asset.rul_days} days against a ${asset.lead_time_days}-day spare lead time${asset.rul_days < asset.lead_time_days ? ", so the spare must be expedited" : ""}. ${
      ps.length
        ? `${ps.length} proposals are in the queue: ${ps.map((p) => `${p.id} ${p.status.toLowerCase()}`).join(", ")}.`
        : "No proposals yet; the work-order agent drafts one when risk crosses 70."
    }`;
  }

  if (area) {
    return `${area.area} (${area.plant}) is ${area.status}: PPE compliance ${area.ppe_compliance}%, SOP ${area.sop_compliance}%, ${area.intrusions_7d} intrusions and ${area.near_misses_7d} near-misses in 7 days on ${area.cameras} cameras. ${
      area.status === "Alert"
        ? "The safety agent has drafted an EHS ticket; the near-misses cluster at the 14:00 shift change, so a staggered start is the cheapest fix."
        : "A toolbox talk this week should bring it back above 95%."
    }`;
  }

  if (stationKey) {
    const station = stationKey;
    const top = data.triage.filter((r) => r.plant === station).sort((a, b) => a.rank - b.rank)[0];
    const pend = proposals.filter((p) => p.plant === station && p.status === "Pending");
    const bad = data.insight_areas.filter((a) => a.plant === station && a.status !== "OK");
    return `${station} first: approve the ${pend.length} pending proposals${pend.length ? ` (${pend.slice(0, 3).map((p) => p.id).join(", ")}${pend.length > 3 ? "…" : ""})` : ""}. ${
      top ? `The highest-risk machine is ${top.asset} (${top.fault.toLowerCase()}, RUL ${top.rul_days} d).` : "No machines are flagged."
    }${
      bad.length ? ` Safety: ${bad.map((a) => `${a.area} is ${a.status.toLowerCase()}`).join(", ")}.` : ""
    } The copilot cards above are already filtered when you pick the station.`;
  }

  if (t.includes("first") || t.includes("priorit") || t.includes("today")) {
    const s = suggestions[0];
    return s ? `Start with: ${s.title}. ${s.why[0]}. ${s.action}.` : "Nothing urgent today.";
  }

  if (t.includes("integration") || t.includes("down") || t.includes("sync")) {
    const bad = data.integrations.filter((i) => i.status !== "OK");
    return bad.length
      ? `${bad.map((i) => `${i.system} is ${i.status.toLowerCase()} (${i.last_sync_min} min since sync).`).join(" ")} Backward problems create blind spots; forward problems hold approved actions.`
      : "All integrations are healthy.";
  }

  return 'I can answer about a machine, an inspection line, a CCTV area, a station, integrations, or what to do first. Try "why is Line 4 defect rate up" or "what should Station 1 do first".';
}

/* ======================================================================
   Shared UI pieces
   ====================================================================== */
const PRODUCT_COLORS = {
  CogniSense: "#0d9488",
  "CogniVision Inspect": "#d97706",
  "CogniVision Insight": "#7c3aed",
  CogniVision: "#d97706",
  "Factory OS": "#64748b",
};

function ProductDot({ product, className = "" }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-sm ${className}`}
      style={{ background: PRODUCT_COLORS[product] || "#64748b" }}
    />
  );
}

function Card({ title, note, children, className = "" }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {title && <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>}
      {note && <p className="mb-3 mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-500">{note}</p>}
      {children}
    </section>
  );
}

function Chip({ active, onClick, color, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
        active
          ? "border-slate-800 bg-slate-800 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  );
}

const TONES = {
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-rose-200 bg-rose-50 text-rose-700",
};
const STATUS_TONE = {
  Pending: "amber", Watch: "amber", Degraded: "amber", Proposed: "amber", Under: "amber",
  Approved: "green", Executed: "green", OK: "green", Linked: "green",
  Rejected: "red", Alert: "red", Error: "red", Retrain: "red",
};

function StatusPill({ status }) {
  const tone = TONES[STATUS_TONE[status.split(" ")[0]]] || "border-slate-200 bg-slate-50 text-slate-600";
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${tone}`}>
      {status}
    </span>
  );
}

/* ======================================================================
   Sparkline
   ====================================================================== */
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

/* ======================================================================
   KPI tile
   ====================================================================== */
function KpiTile({ label, value, prior, decimals = 0, betterWhen = "up", color, spark }) {
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
            {signed(delta, decimals).replace(/^[+-]/, "")}
          </span>
        )}
        vs last week
      </p>
    </div>
  );
}

/* ======================================================================
   Closed-loop funnel
   ====================================================================== */
function LoopFunnel({ rows }) {
  const W = 960, H = 150, gap = 18;
  const n = rows.length;
  const bw = (W - gap * (n - 1)) / n;
  const losses = rows.map((r, i) => (i ? 1 - r.count / rows[i - 1].count : 0));
  const worst = losses.indexOf(Math.max(...losses));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[680px] w-full" role="img" aria-label="Closed-loop funnel from signals to verified closures">
        <defs>
          <linearGradient id="loop-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#0d9488" />
            <stop offset="0.5" stopColor="#d97706" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <line className="flow-line" x1={bw / 2} x2={W - bw / 2} y1="46" y2="46" stroke="url(#loop-grad)" strokeWidth="2.5" />

        {rows.map((r, i) => {
          const words = r.stage.split(" ");
          const mid = Math.ceil(words.length / 2);
          const isWorst = i === worst;
          const barW = Math.max(4, (bw - 16) * (i === 0 ? 1 : r.count / rows[1].count));
          return (
            <g key={r.stage} transform={`translate(${i * (bw + gap)},0)`}>
              <text x={bw / 2} y="22" textAnchor="middle" fontSize="18" fontWeight="600" fill="#0f172a">
                {fN(r.count)}{i === 0 ? "M" : ""}
              </text>
              <circle cx={bw / 2} cy="46" r="7" fill="#fff" stroke={isWorst ? "#e11d48" : "url(#loop-grad)"} strokeWidth="2.5" />
              <text x={bw / 2} y="72" textAnchor="middle" fontSize="12" fill="#475569">
                <tspan x={bw / 2}>{words.slice(0, mid).join(" ")}</tspan>
                <tspan x={bw / 2} dy="15">{words.slice(mid).join(" ")}</tspan>
              </text>
              <rect x="8" y="114" width={bw - 16} height="6" rx="3" fill="#e2e8f0" />
              <rect x="8" y="114" width={barW} height="6" rx="3" fill={isWorst ? "#e11d48" : "#94a3b8"} opacity={i === 0 ? 0.5 : 1} />
              {i > 1 && (
                <text x={bw / 2} y="138" textAnchor="middle" fontSize="11.5" fill={isWorst ? "#e11d48" : "#94a3b8"}>
                  −{fP(losses[i])} from previous stage
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ======================================================================
   Station breakdown (TIEI divided into Station 1-4)
   ====================================================================== */
function StationBreakdown({ proposals, station, onStation }) {
  const rows = STATIONS.map((s) => {
    const assets = data.triage.filter((r) => r.plant === s).sort((a, b) => a.rank - b.rank);
    const lines = data.inspect_lines.filter((l) => l.plant === s);
    const areas = data.insight_areas.filter((a) => a.plant === s);
    const inspected = lines.reduce((sum, l) => sum + l.inspected_24h, 0);
    const defectRate = inspected
      ? lines.reduce((sum, l) => sum + l.defect_rate * l.inspected_24h, 0) / inspected
      : 0;
    return {
      name: s,
      top: assets[0],
      assets: assets.length,
      lines: lines.length,
      inspected,
      defectRate,
      pending: proposals.filter((p) => p.plant === s && p.status === "Pending").length,
      nearMisses: areas.reduce((sum, a) => sum + a.near_misses_7d, 0),
      alerts: areas.filter((a) => a.status !== "OK").length,
    };
  });

  return (
    <Card
      title={`${SITE} by station`}
      note="The site split into its four stations. Click a station to filter the whole page; click it again to go back to the full site."
    >
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {rows.map((r) => {
          const active = station === r.name;
          return (
            <button
              key={r.name}
              type="button"
              onClick={() => onStation(active ? "" : r.name)}
              className={`rounded-xl border p-3.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                active ? "border-slate-800 bg-slate-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-slate-900">{r.name}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                    r.pending ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {r.pending} pending
                </span>
              </div>
              <dl className="mt-2.5 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Highest-risk machine</dt>
                  <dd className="text-right font-medium text-slate-800">{r.top ? `${r.top.asset} (${r.top.risk_score})` : "None"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Machines tracked</dt>
                  <dd className="font-medium text-slate-800">{r.assets}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Inspection lines</dt>
                  <dd className="font-medium text-slate-800">{r.lines}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Defect rate, 24 h</dt>
                  <dd className="font-medium text-slate-800">{r.lines ? `${f2(r.defectRate)}%` : "n/a"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Near-misses, 7 d</dt>
                  <dd className="font-medium text-slate-800">{r.nearMisses}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Areas on watch or alert</dt>
                  <dd className={`font-medium ${r.alerts ? "text-rose-600" : "text-slate-800"}`}>{r.alerts}</dd>
                </div>
              </dl>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ======================================================================
   Copilot panel
   ====================================================================== */
const FILTERS = ["CogniSense", "CogniVision Inspect", "CogniVision Insight", "Factory OS"];

function Copilot({ suggestions, proposals, product, onProduct, drafted, onDraft }) {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setReply(answer(question, { proposals, suggestions }));
  };

  return (
    <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 shadow-sm sm:p-5">
      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <BulbOutlined />
        </span>
        Copilot: what to improve next
      </h3>
      <p className="mb-3 mt-1 max-w-4xl text-[13px] leading-relaxed text-slate-500">
        Reasoned from today's data by the Factory OS supervisor agent. Each card shows the evidence chain, the expected
        impact and the proposal the agents can draft. Nothing is sent until you approve it in the queue.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        <Chip active={!product} onClick={() => onProduct("")}>All</Chip>
        {FILTERS.map((p) => (
          <Chip key={p} active={product === p} color={PRODUCT_COLORS[p]} onClick={() => onProduct(product === p ? "" : p)}>
            {p}
          </Chip>
        ))}
      </div>

      {suggestions.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-slate-400">
          Nothing to improve for this filter. The agents will raise the next item as data arrives.
        </p>
      ) : (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
          {suggestions.map((s) => {
            const done = drafted[s.id];
            return (
              <article key={s.id} className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-slate-500">
                  <span
                    className={`rounded-full border px-2 py-0.5 font-medium ${
                      s.prio === "high" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {s.prio === "high" ? "Act today" : "This week"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ProductDot product={s.product} />
                    {s.product}{s.plant ? ` · ${s.plant}` : ""}
                  </span>
                </div>

                <h4 className="text-[13.5px] font-semibold leading-snug text-slate-900">{s.title}</h4>

                <ul className="list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-slate-600 marker:text-slate-300">
                  {s.why.map((w) => <li key={w}>{w}</li>)}
                </ul>

                <p className="text-xs text-slate-600">
                  <b className="font-semibold text-slate-900">Impact: </b>{s.impact}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  {s.draft && (
                    <button
                      type="button"
                      disabled={!!done}
                      onClick={() => onDraft(s)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100 disabled:cursor-default disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700"
                    >
                      {done ? <CheckOutlined /> : <PlusOutlined />}
                      {done ? `Drafted ${done}` : "Draft proposal"}
                    </button>
                  )}
                  <span className="text-xs text-slate-500">{s.action}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <form onSubmit={submit} className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the copilot, e.g. why is Line 4 defect rate up, or what should Station 1 do first"
          aria-label="Ask the copilot"
          className="min-w-[220px] flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
        >
          <SendOutlined /> Ask
        </button>
      </form>

      {reply && (
        <div className="mt-3 rounded-r-lg border-l-4 border-sky-400 bg-white px-4 py-2.5 text-[13px] leading-relaxed text-slate-600">
          <b className="font-semibold text-slate-900">Copilot: </b>{reply}
        </div>
      )}
    </section>
  );
}

/* ======================================================================
   Approval queue
   ====================================================================== */
const PRODUCTS = ["CogniSense", "CogniVision Inspect", "CogniVision Insight"];

function ApprovalQueue({ rows, pendingCount, product, onProduct, status, onStatus, onDecide }) {
  return (
    <Card
      title="Approval queue"
      note="Drafted by the forward agents into each target system's pending state. Approve or reject here; nothing executes without a named approver."
      className="col-span-full"
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Chip active={status === "Pending"} onClick={() => onStatus(status === "Pending" ? "" : "Pending")}>
          Pending {pendingCount}
        </Chip>
        {PRODUCTS.map((p) => (
          <Chip key={p} active={product === p} color={PRODUCT_COLORS[p]} onClick={() => onProduct(product === p ? "" : p)}>
            {p}
          </Chip>
        ))}
      </div>

      <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11.5px] font-medium text-slate-500">
            <tr>
              <th className="px-3 py-2.5">ID</th>
              <th className="px-3 py-2.5">Product</th>
              <th className="hidden px-3 py-2.5 md:table-cell">Agent</th>
              <th className="px-3 py-2.5">Station</th>
              <th className="px-3 py-2.5">Asset or area</th>
              <th className="px-3 py-2.5">Proposed action</th>
              <th className="hidden px-3 py-2.5 lg:table-cell">Target</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  <InboxOutlined className="mb-1 block text-2xl" />
                  Nothing waiting. Clear a filter to see decided proposals.
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="align-top hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-900">{p.id}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <ProductDot product={p.product} />{p.product}
                  </span>
                </td>
                <td className="hidden px-3 py-2.5 md:table-cell">{p.agent}</td>
                <td className="whitespace-nowrap px-3 py-2.5">{p.plant}</td>
                <td className="px-3 py-2.5">{p.asset}</td>
                <td className="min-w-[220px] px-3 py-2.5">{p.action}</td>
                <td className="hidden px-3 py-2.5 lg:table-cell">{p.target_system}</td>
                <td className="px-3 py-2.5"><StatusPill status={p.status} /></td>
                <td className="px-3 py-2.5">
                  {p.status === "Pending" && (
                    <div className="flex gap-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onDecide(p, "Approved")}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11.5px] font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <CheckOutlined /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onDecide(p, "Rejected")}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11.5px] font-medium text-rose-700 transition hover:bg-rose-100"
                      >
                        <CloseOutlined /> Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ======================================================================
   Root-cause table
   ====================================================================== */
function RootCauseTable({ rows }) {
  const [open, setOpen] = useState(null);

  return (
    <Card
      title="Root-cause links found by the agents"
      note="Where one product's signal explains another's. The link becomes a work order or EHS action once approved. Click a row for the finding."
    >
      <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11.5px] font-medium text-slate-500">
            <tr>
              <th className="px-3 py-2.5">Effect</th>
              <th className="px-3 py-2.5">Likely cause</th>
              <th className="px-3 py-2.5 text-right">r</th>
              <th className="px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {rows.length === 0 && (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">No links for this filter.</td></tr>
            )}
            {rows.map((r) => {
              const isOpen = open === r.link_id;
              return (
                <Fragment key={r.link_id}>
                  <tr
                    onClick={() => setOpen(isOpen ? null : r.link_id)}
                    className="cursor-pointer border-t border-slate-100 align-top hover:bg-slate-50/70"
                  >
                    <td className="px-3 py-2.5">
                      <span className="flex items-start gap-1.5">
                        <span className="mt-1 text-[10px] text-slate-400">{isOpen ? <DownOutlined /> : <RightOutlined />}</span>
                        <span>
                          <ProductDot product={r.product_a} className="mr-1.5" />{r.signal_a}
                          <span className="ml-1.5 text-[11px] text-slate-400">· {r.plant}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5"><ProductDot product={r.product_b} className="mr-1.5" />{r.signal_b}</td>
                    <td className="px-3 py-2.5 text-right font-medium tabular-nums">{f2(r.correlation)}</td>
                    <td className="px-3 py-2.5"><StatusPill status={r.status} /></td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-slate-50/60">
                      <td colSpan={4} className="px-3 pb-3 pt-0 text-xs text-slate-600">
                        <div className="rounded-r-lg border-l-2 border-sky-300 bg-white px-3 py-2 italic">{r.finding}</div>
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
   Agent activity feed
   ====================================================================== */
function ActivityFeed({ rows }) {
  return (
    <Card title="Agent activity today" note="Newest first.">
      <ul className="max-h-[420px] divide-y divide-slate-100 overflow-auto">
        {rows.length === 0 && <li className="py-8 text-center text-[13px] text-slate-400">No activity for this filter.</li>}
        {rows.map((a, i) => (
          <li key={`${a.at}-${i}`} className="grid grid-cols-[44px_1fr] gap-3 py-2.5 text-[12.5px]">
            <span className="pt-0.5 text-xs tabular-nums text-slate-400">{a.at.slice(11, 16)}</span>
            <div>
              <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                <ProductDot product={a.product} />
                {a.agent} · {a.plant}
              </p>
              <p className="text-slate-600">{a.event}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ======================================================================
   Integration health
   ====================================================================== */
const STATUS = {
  OK: { icon: CheckCircleFilled, cls: "text-emerald-500", ring: "border-slate-200" },
  Degraded: { icon: ExclamationCircleFilled, cls: "text-amber-500", ring: "border-amber-200 bg-amber-50/40" },
  Error: { icon: CloseCircleFilled, cls: "text-rose-500", ring: "border-rose-200 bg-rose-50/40" },
};

const sync = (i) =>
  i.status === "OK" ? `synced ${i.last_sync_min} min ago`
  : i.status === "Degraded" ? `degraded, ${i.last_sync_min} min since sync`
  : `down for ${i.last_sync_min} min`;

function Group({ label, items }) {
  return (
    <>
      <p className="mb-2 mt-4 text-xs font-medium text-slate-500 first:mt-0">{label}</p>
      <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
        {items.map((i) => {
          const s = STATUS[i.status];
          const Icon = s.icon;
          return (
            <div key={i.system} className={`rounded-xl border px-3 py-2.5 text-xs ${s.ring}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-900">{i.system}</span>
                <Icon className={`mt-0.5 ${s.cls}`} />
              </div>
              <p className="mt-0.5 text-slate-500">{i.protocol} · {sync(i)}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

function IntegrationHealth({ integrations }) {
  return (
    <Card
      title="Integration health"
      note="Every backward and forward connection the agents depend on. A degraded backward feed suppresses diagnoses on its assets; a failed forward system queues proposals until it returns."
      className="col-span-full"
    >
      <Group label="Backward: station data into Factory OS" items={integrations.filter((i) => i.direction === "Backward")} />
      <Group label="Forward: Factory OS into customer systems" items={integrations.filter((i) => i.direction === "Forward")} />
    </Card>
  );
}

/* ======================================================================
   Header
   ====================================================================== */
const STATION_OPTIONS = [
  { value: "", label: `${SITE} (all)` },
  ...STATIONS.map((s) => ({ value: s, label: s })),
];

function Header({ pendingCount, topAsset, badIntegrations, station, onStation, query, onQuery, searchRef }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 px-4 pt-2 sm:px-6">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
          {SITE} command console{station ? ` · ${station}` : ""}
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
          Today across CogniSense, Inspect and Insight:{" "}
          <b className="font-semibold text-slate-900">{pendingCount} proposals</b> are waiting for a human,{" "}
          {topAsset ? (
            <>
              the highest-risk machine is <b className="font-semibold text-slate-900">{topAsset.asset} ({topAsset.plant})</b>, and{" "}
            </>
          ) : (
            <>no machine is flagged at risk here, and </>
          )}
          <b className={`font-semibold ${badIntegrations ? "text-rose-600" : "text-slate-900"}`}>{badIntegrations} integrations</b>{" "}
          need attention.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Station" className="inline-flex flex-wrap rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {STATION_OPTIONS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onStation(p.value)}
              className={`rounded-full px-3 py-1.5 text-[13px] transition ${
                station === p.value ? "bg-slate-800 font-medium text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="flex min-w-[240px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
          <SearchOutlined className="text-slate-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search assets, lines, areas, proposals"
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
   Toast
   ====================================================================== */
function Toast({ message }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-700 shadow-xl transition duration-200 ${
        message ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <CheckCircleFilled className="text-emerald-500" />
      {message}
    </div>
  );
}

/* ======================================================================
   Overview page
   ====================================================================== */
const kpi = (metric) => data.kpis.find((k) => k.metric === metric);
const defectSpark = data.sparks.defects.map((d, i) => (d / data.sparks.inspected[i]) * 100);

export default function Overview() {
  const [station, setStation] = useState("");
  const [query, setQuery] = useState("");
  const [proposals, setProposals] = useState(data.proposals);
  const [qProduct, setQProduct] = useState("");
  const [qStatus, setQStatus] = useState("Pending");
  const [cProduct, setCProduct] = useState("");
  const [drafted, setDrafted] = useState({});
  const [toast, setToast] = useState("");
  const searchRef = useRef(null);

  const q = query.trim().toLowerCase();
  const inPlant = useCallback((p) => !station || p === station || p === ALL, [station]);
  const matches = useCallback((...s) => !q || s.join(" ").toLowerCase().includes(q), [q]);

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

  // auto-hide toast
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const pendingCount = useCallback(
    (product) =>
      proposals.filter((p) => p.status === "Pending" && (!product || p.product === product) && inPlant(p.plant)).length,
    [proposals, inPlant]
  );

  const decide = (p, status) => {
    setProposals((list) => list.map((x) => (x.id === p.id ? { ...x, status } : x)));
    setToast(
      status === "Approved"
        ? `${p.id} approved and sent to ${p.target_system}`
        : `${p.id} rejected; the agent will learn from this`
    );
  };

  const suggestions = useMemo(
    () => reason({ proposals, inPlant, product: cProduct }),
    [proposals, inPlant, cProduct]
  );

  const draft = (s) => {
    const id = `AI-${String(Object.keys(drafted).length + 101).padStart(4, "0")}`;
    setProposals((list) => [{ id, ...s.draft, status: "Pending", created: "2026-11-05" }, ...list]);
    setDrafted((d) => ({ ...d, [s.id]: id }));
    setToast(`${id} drafted by the ${s.draft.agent}; review it in the approval queue`);
  };

  const queueRows = proposals
    .filter(
      (p) =>
        inPlant(p.plant) &&
        (!qProduct || p.product === qProduct) &&
        (!qStatus || p.status === qStatus) &&
        matches(p.asset, p.action, p.id, p.plant)
    )
    .sort(
      (a, b) =>
        (a.status === "Pending" ? 0 : 1) - (b.status === "Pending" ? 0 : 1) || b.created.localeCompare(a.created)
    );

  const rootRows = data.rootcause
    .filter((r) => inPlant(r.plant) && matches(r.signal_a, r.signal_b, r.finding))
    .sort((a, b) => b.correlation - a.correlation);

  const feedRows = data.activity
    .filter((r) => inPlant(r.plant) && matches(r.event, r.agent))
    .sort((a, b) => b.at.localeCompare(a.at));

  const topAsset = [...data.triage].filter((r) => inPlant(r.plant)).sort((a, b) => a.rank - b.rank)[0];
  const badIntegrations = data.integrations.filter((i) => i.status !== "OK").length;

  const tile = (metric, label, opts) => {
    const k = kpi(metric);
    return <KpiTile key={metric} label={label} value={k.value} prior={k.prior} {...opts} />;
  };

  return (
    <div className="text-slate-700">
      <div className="min-w-0">
        <Header
          pendingCount={pendingCount()}
          topAsset={topAsset}
          badIntegrations={badIntegrations}
          station={station}
          onStation={setStation}
          query={query}
          onQuery={setQuery}
          searchRef={searchRef}
        />

        <main className="space-y-4 px-4 pb-10 pt-4 sm:px-6">
          {/* Closed loop */}
          <Card
            title="The closed loop, last 30 days"
            note="Every signal from sensors, PLCs and cameras moves left to right until a human verifies the outcome. The widest fall is where the agents work next."
          >
            <LoopFunnel rows={data.funnel} />
          </Card>

          {/* KPI tiles */}
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
            {tile("defect_rate", "Defect rate, %", { color: "#d97706", spark: defectSpark, decimals: 2, betterWhen: "down" })}
            {tile("safety_events", "Safety events, 7 d", { color: "#7c3aed", spark: data.sparks.safety, betterWhen: "down" })}
            {tile("open_proposals", "Open proposals", { color: "#64748b", betterWhen: "down" })}
            {tile("downtime_avoided_hours", "Downtime avoided, h", { color: "#0d9488", spark: data.sparks.actions })}
            {tile("verified_closures", "Closures verified, %", { color: "#64748b" })}
          </div>

          {/* TIEI divided into stations */}
          <StationBreakdown proposals={proposals} station={station} onStation={setStation} />

          {/* Copilot */}
          <Copilot
            suggestions={suggestions}
            proposals={proposals}
            product={cProduct}
            onProduct={setCProduct}
            drafted={drafted}
            onDraft={draft}
          />

          {/* Queue, root cause, activity, integrations */}
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr))]">
            <ApprovalQueue
              rows={queueRows}
              pendingCount={pendingCount()}
              product={qProduct}
              onProduct={setQProduct}
              status={qStatus}
              onStatus={setQStatus}
              onDecide={decide}
            />
            <RootCauseTable rows={rootRows} />
            <ActivityFeed rows={feedRows} />
            <IntegrationHealth integrations={data.integrations} />
          </div>
        </main>
      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .flow-line { stroke-dasharray: 4 6; animation: flow-dash 1.6s linear infinite; }
          @keyframes flow-dash { to { stroke-dashoffset: -20; } }
        }
      `}</style>
      <Toast message={toast} />
    </div>
  );
}