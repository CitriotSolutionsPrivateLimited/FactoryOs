import React, { useMemo, useState } from "react";
import {
  RobotOutlined,
  ApiOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  PercentageOutlined,
} from "@ant-design/icons";

/* ---------------------------------------------------------------
   Data (replace with API responses)
---------------------------------------------------------------- */
const AGENTS = [
  { agent: "Connector agent", product: "Factory OS", layer: "Backward", autonomy: "Autonomous", runs_30d: 9, proposals_30d: 0, approved: 0, rejected: 0, edited: 0 },
  { agent: "Data-quality agent", product: "CogniSense", layer: "Backward", autonomy: "Autonomous", runs_30d: 2160, proposals_30d: 0, approved: 0, rejected: 0, edited: 0 },
  { agent: "Camera-health agent", product: "CogniVision", layer: "Backward", autonomy: "Autonomous", runs_30d: 720, proposals_30d: 0, approved: 0, rejected: 0, edited: 0 },
  { agent: "Context agent", product: "Factory OS", layer: "Backward", autonomy: "Autonomous", runs_30d: 186, proposals_30d: 0, approved: 0, rejected: 0, edited: 0 },
  { agent: "Diagnosis copilot", product: "CogniSense", layer: "Core", autonomy: "Autonomous", runs_30d: 312, proposals_30d: 0, approved: 0, rejected: 0, edited: 0 },
  { agent: "Vision copilot", product: "CogniVision", layer: "Core", autonomy: "Autonomous", runs_30d: 204, proposals_30d: 0, approved: 0, rejected: 0, edited: 0 },
  { agent: "Fleet triage", product: "CogniSense", layer: "Core", autonomy: "Autonomous", runs_30d: 30, proposals_30d: 0, approved: 0, rejected: 0, edited: 0 },
  { agent: "Root-cause agent", product: "Factory OS", layer: "Core", autonomy: "Autonomous", runs_30d: 30, proposals_30d: 4, approved: 3, rejected: 0, edited: 1 },
  { agent: "Work-order agent", product: "CogniSense", layer: "Forward", autonomy: "Propose and approve", runs_30d: 148, proposals_30d: 148, approved: 109, rejected: 14, edited: 25 },
  { agent: "Spares agent", product: "CogniSense", layer: "Forward", autonomy: "Propose and approve", runs_30d: 52, proposals_30d: 52, approved: 37, rejected: 9, edited: 6 },
  { agent: "Scheduling agent", product: "CogniSense", layer: "Forward", autonomy: "Propose and approve", runs_30d: 61, proposals_30d: 61, approved: 48, rejected: 5, edited: 8 },
  { agent: "Quality agent", product: "CogniVision Inspect", layer: "Forward", autonomy: "Propose and approve", runs_30d: 44, proposals_30d: 44, approved: 36, rejected: 3, edited: 5 },
  { agent: "Safety agent", product: "CogniVision Insight", layer: "Forward", autonomy: "Propose and approve", runs_30d: 38, proposals_30d: 38, approved: 31, rejected: 4, edited: 3 },
  { agent: "Reporting agent", product: "Factory OS", layer: "Forward", autonomy: "Autonomous", runs_30d: 4, proposals_30d: 4, approved: 4, rejected: 0, edited: 0 },
];

const INTEGRATIONS = [
  { system: "Citriot sensor nodes", direction: "Backward", product: "CogniSense", protocol: "MQTT", status: "OK", last_sync_min: 1, latency_ms: 120, records_24h: 2910000 },
  { system: "Siemens S7 PLCs (Hosur)", direction: "Backward", product: "CogniSense", protocol: "OPC-UA", status: "OK", last_sync_min: 2, latency_ms: 85, records_24h: 860000 },
  { system: "Rockwell PLCs (Chakan)", direction: "Backward", product: "CogniSense", protocol: "OPC-UA", status: "OK", last_sync_min: 2, latency_ms: 92, records_24h: 640000 },
  { system: "HVAC BMS (Dubai JAFZA)", direction: "Backward", product: "CogniSense", protocol: "Modbus TCP", status: "Degraded", last_sync_min: 18, latency_ms: 410, records_24h: 42000 },
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
];

/* ---------------------------------------------------------------
   Helpers
---------------------------------------------------------------- */
const PRODUCT_COLOR = {
  CogniSense: "#0d9488",
  "CogniVision Inspect": "#d97706",
  "CogniVision Insight": "#7c3aed",
  CogniVision: "#d97706",
  "Factory OS": "#64748b",
};
const BAD = "#dc2626";
const GATE = 0.6;

const fN = new Intl.NumberFormat("en");
const fC = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const fP = (v) => `${Math.round(v * 100)}%`;

const STATUS_STYLE = {
  OK: { cls: "border-[#16a34a]/40 text-[#16a34a]", Icon: CheckCircleFilled },
  Degraded: { cls: "border-[#d97706]/40 text-[#d97706]", Icon: WarningFilled },
  Error: { cls: "border-[#dc2626]/40 text-[#dc2626]", Icon: CloseCircleFilled },
};

/* ---------------------------------------------------------------
   Small building blocks
---------------------------------------------------------------- */
const Card = ({ title, note, className = "", children }) => (
  <div className={`min-w-0 rounded-[14px] border border-[#e3e8ef] bg-[#ffffff] px-[18px] py-4 ${className}`}>
    <h3 className="m-0 font-medium text-[15px] text-[#1f2937]" style={{ fontFamily: "Sora, system-ui, sans-serif" }}>
      {title}
    </h3>
    <p className="mb-3 mt-[3px] max-w-[80ch] text-[12.5px] text-[#4b5563]">{note}</p>
    {children}
  </div>
);

const ProductDot = ({ product }) => (
  <span
    className="mr-[7px] inline-block h-2 w-2 rounded-[2px] align-baseline"
    style={{ background: PRODUCT_COLOR[product] || PRODUCT_COLOR["Factory OS"] }}
  />
);

const StatusPill = ({ status }) => {
  const { cls, Icon } = STATUS_STYLE[status] || { cls: "border-[#d5dce6] text-[#4b5563]", Icon: null };
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-px text-[11.5px] ${cls}`}>
      {Icon && <Icon className="text-[10px]" />}
      {status}
    </span>
  );
};

const DirectionTag = ({ direction }) => {
  const Icon = direction === "Backward" ? ArrowDownOutlined : ArrowUpOutlined;
  return (
    <span className="inline-flex items-center gap-1 text-[#4b5563]">
      <Icon className="text-[10px]" />
      {direction}
    </span>
  );
};

const Th = ({ children, num, hideSm }) => (
  <th
    className={`sticky top-0 z-[1] border-b border-[#e3e8ef] bg-[#ffffff] px-2.5 py-[9px] text-[11.5px] font-medium text-[#6b7280] ${
      num ? "text-right whitespace-nowrap" : "text-left"
    } ${hideSm ? "hidden md:table-cell" : ""}`}
  >
    {children}
  </th>
);

const Td = ({ children, num, hideSm, className = "" }) => (
  <td
    className={`border-b border-[#e3e8ef] px-2.5 py-[9px] align-top text-[12.5px] tabular-nums ${
      num ? "text-right whitespace-nowrap" : "text-left"
    } ${hideSm ? "hidden md:table-cell" : ""} ${className}`}
  >
    {children}
  </td>
);

/* ---------------------------------------------------------------
   Approval rate by forward agent (horizontal bars + 60% gate)
---------------------------------------------------------------- */
const ApprovalChart = ({ agents }) => {
  const [hover, setHover] = useState(null);

  const rows = useMemo(
    () =>
      agents
        .filter((a) => a.proposals_30d > 0)
        .map((a) => {
          const value = a.approved / a.proposals_30d;
          return {
            label: a.agent,
            value,
            color: value >= GATE ? PRODUCT_COLOR[a.product] || PRODUCT_COLOR["Factory OS"] : BAD,
            tip: `${a.agent}: ${a.approved} of ${a.proposals_30d} approved`,
          };
        })
        .sort((a, b) => b.value - a.value),
    [agents]
  );

  return (
    <div className="relative">
      {/* gate line, sits over the bar tracks (label column excluded by padding on the right value) */}
      <div className="relative pr-16">
        <div
          className="pointer-events-none absolute bottom-4 top-0 border-l border-dashed border-[#4b5563]"
          style={{ left: `${GATE * 100}%` }}
        />
        {rows.map((r) => (
          <div
            key={r.label}
            className="relative h-10"
            onMouseEnter={() => setHover(r.label)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="text-[12.5px] leading-[14px] text-[#1f2937]">{r.label}</div>
            <div className="mt-[5px] h-2.5 w-full rounded-[5px] bg-[#e3e8ef]">
              <div
                className="h-full rounded-[5px]"
                style={{ width: `${Math.max(1, r.value * 100)}%`, background: r.color }}
              />
            </div>
            <div
              className="absolute right-[-64px] top-[14px] w-14 pl-2 text-[12.5px] text-[#1f2937]"
              style={{ fontFamily: "Sora, system-ui, sans-serif" }}
            >
              {fP(r.value)}
            </div>
            {hover === r.label && (
              <div className="pointer-events-none absolute left-1 top-[-6px] z-[3] whitespace-nowrap rounded-lg border border-[#d5dce6] bg-[#ffffff] px-2.5 py-1.5 text-xs shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                {r.tip}
              </div>
            )}
          </div>
        ))}
        <div
          className="mt-0.5 text-[11px] text-[#6b7280]"
          style={{ marginLeft: `calc(${GATE * 100}% + 5px)` }}
        >
          gate 60%
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------
   Agent roster table
---------------------------------------------------------------- */
const AgentRoster = ({ agents }) => (
  <div className="max-h-[420px] overflow-auto rounded-[10px]">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <Th>Agent</Th>
          <Th hideSm>Product</Th>
          <Th>Layer</Th>
          <Th hideSm>Autonomy</Th>
          <Th num>Runs</Th>
          <Th num>Approved</Th>
          <Th num>Rejected</Th>
        </tr>
      </thead>
      <tbody>
        {agents.map((a) => {
          const hasProposals = a.proposals_30d > 0;
          return (
            <tr key={a.agent} className="hover:bg-[#f3f6fa]">
              <Td>
                <RobotOutlined className="mr-2 text-[#6b7280]" />
                {a.agent}
              </Td>
              <Td hideSm>
                <ProductDot product={a.product} />
                {a.product}
              </Td>
              <Td>{a.layer}</Td>
              <Td hideSm>{a.autonomy}</Td>
              <Td num>{fN.format(a.runs_30d)}</Td>
              <Td num>{hasProposals ? fN.format(a.approved) : "–"}</Td>
              <Td num>{hasProposals ? fN.format(a.rejected) : "–"}</Td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

/* ---------------------------------------------------------------
   Integration catalogue table
---------------------------------------------------------------- */
const IntegrationCatalogue = ({ integrations }) => (
  <div className="max-h-[420px] overflow-auto rounded-[10px]">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <Th>System</Th>
          <Th>Direction</Th>
          <Th hideSm>Product</Th>
          <Th hideSm>Protocol</Th>
          <Th>Status</Th>
          <Th num>Last sync, min</Th>
          <Th num hideSm>Latency, ms</Th>
          <Th num>Records, 24 h</Th>
        </tr>
      </thead>
      <tbody>
        {integrations.map((i) => (
          <tr key={i.system} className="hover:bg-[#f3f6fa]">
            <Td>
              <ApiOutlined className="mr-2 text-[#6b7280]" />
              {i.system}
            </Td>
            <Td>
              <DirectionTag direction={i.direction} />
            </Td>
            <Td hideSm>
              <ProductDot product={i.product} />
              {i.product}
            </Td>
            <Td hideSm>{i.protocol}</Td>
            <Td>
              <StatusPill status={i.status} />
            </Td>
            <Td num>{i.last_sync_min}</Td>
            <Td num hideSm>{fN.format(i.latency_ms)}</Td>
            <Td num>{fC.format(i.records_24h)}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ---------------------------------------------------------------
   Page: Agents and integrations
---------------------------------------------------------------- */
export default function AgentsIntegrations({ agents = AGENTS, integrations = INTEGRATIONS }) {
  return (
    <section className="min-h-screen bg-[#f5f7fa] px-4 py-5 font-['IBM_Plex_Sans',system-ui,sans-serif] text-sm text-[#1f2937] md:px-7">
      <header className="mb-4">
        <h1 className="m-0 text-[22px] font-medium tracking-tight" style={{ fontFamily: "Sora, system-ui, sans-serif" }}>
          Agents and integrations
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <Card
          title={
            <>
              <PercentageOutlined className="mr-2 text-[#6b7280]" />
              Approval rate by forward agent
            </>
          }
          note="Last 30 days. Edited-then-approved counts as approved. Dashed line: the 60% gate."
        >
          <ApprovalChart agents={agents} />
        </Card>

        <Card
          title="Agent roster and autonomy"
          note="Backward and core agents read only; forward agents propose and a human approves."
        >
          <AgentRoster agents={agents} />
        </Card>

        <Card
          title="Integration catalogue"
          note="Every connection, its protocol, direction and last 24 hours of traffic."
          className="lg:col-span-2"
        >
          <IntegrationCatalogue integrations={integrations} />
        </Card>
      </div>
    </section>
  );
}