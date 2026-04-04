import React, { useState, useEffect, useRef } from "react";
import { PieChart, SimpleBarChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";

import { Shipments } from "../ui/filters";
import ScheduleCalendar from "../ui/calendar";

import data from "../utils/pieData";
import pieOption from "../utils/pieOption";

import { getAnalytics } from "../api/reports";

import { useToast } from "../context/useToast";
import { useLoading } from "../context/useLoading";
import { useStatusShipment } from "../context/useStatusShipment";
import { useModal } from "../context/useModal";

// ─── Bar chart options ────────────────────────────────────────────────────────
const barOptions = {
  title: "Shipments Over Time",
  axes: {
    left: { mapsTo: "value", title: "Boxes" },
    bottom: { mapsTo: "group", scaleType: "labels", title: "Period" },
  },
  height: "280px",
  theme: "white",
  toolbar: { enabled: false },
};

// ─── Region color map ─────────────────────────────────────────────────────────
const REGION_META = {
  LUZ: { label: "Luzon",    color: "#2563eb", bg: "#eff6ff" },
  VIS: { label: "Visayas",  color: "#16a34a", bg: "#f0fdf4" },
  MIN: { label: "Mindanao", color: "#d97706", bg: "#fffbeb" },
  NCR: { label: "NCR",      color: "#7c3aed", bg: "#faf5ff" },
};

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return setValue(0);
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, accent }) {
  const count = useCountUp(value);
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: accent + "20", color: accent }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-3xl font-black text-gray-800 leading-tight">{count.toLocaleString()}</p>
      </div>
    </div>
  );
}

// ─── Region Card ──────────────────────────────────────────────────────────────
function RegionCard({ row, total, onClick }) {
  const meta = REGION_META[row.destination] ?? { label: row.destination, color: "#64748b", bg: "#f8fafc" };
  const pct = total ? Math.round(((row.totalBoxes ?? row.totalQty ?? 0) / total) * 100) : 0;
  const count = useCountUp(row.totalBoxes ?? row.totalQty ?? 0);

  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 cursor-pointer
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: meta.bg, color: meta.color }}
          >
            {row.destination}
          </span>
          <p className="text-xs text-gray-400 mt-1">{meta.label}</p>
        </div>
        <span className="text-xs font-semibold text-gray-400">{pct}%</span>
      </div>

      <p className="text-3xl font-black text-gray-800">{count.toLocaleString()}</p>
      <p className="text-xs text-gray-400 mb-3">total boxes</p>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: meta.color }}
        />
      </div>

      <p className="text-xs text-right mt-2 text-gray-400 group-hover:text-gray-600 transition-colors">
        View breakdown →
      </p>
    </div>
  );
}

// ─── Status Table ─────────────────────────────────────────────────────────────
function StatusTable({ totalBoxes }) {
  const [sortKey, setSortKey] = useState("destination");
  const [sortDir, setSortDir] = useState(1);
  const [filter, setFilter] = useState("");

  // Flatten all statusBreakdown entries into rows
  const rows = totalBoxes.flatMap((row) =>
    Object.entries(row.statusBreakdown ?? {}).map(([status, qty]) => ({
      destination: row.destination,
      status,
      qty,
    }))
  );

  const filtered = rows.filter(
    (r) =>
      r.destination.toLowerCase().includes(filter.toLowerCase()) ||
      r.status.toLowerCase().includes(filter.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "number") return (av - bv) * sortDir;
    return av.localeCompare(bv) * sortDir;
  });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => -d);
    else { setSortKey(key); setSortDir(1); }
  };

  const SortIcon = ({ col }) => (
    <span className="ml-1 text-gray-300">
      {sortKey === col ? (sortDir === 1 ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">Status Breakdown</h3>
        <input
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-48"
          placeholder="Filter region / status…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[["destination","Region"], ["status","Status"], ["qty","Qty"]].map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 cursor-pointer hover:text-gray-600 select-none"
                >
                  {label}<SortIcon col={key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-xs">No data</td></tr>
            )}
            {sorted.map((r, i) => {
              const meta = REGION_META[r.destination] ?? { color: "#64748b", bg: "#f8fafc" };
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {r.destination}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">{r.status}</td>
                  <td className="py-2.5 px-3 font-bold text-gray-800">{r.qty.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Export helper ────────────────────────────────────────────────────────────
function exportCSV(totalBoxes) {
  const rows = [["Region", "Status", "Qty"]];
  totalBoxes.forEach((row) => {
    Object.entries(row.statusBreakdown ?? {}).forEach(([status, qty]) => {
      rows.push([row.destination, status, qty]);
    });
  });
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "report.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Report Component ────────────────────────────────────────────────────
const Report = () => {
  const { setLoading } = useLoading();
  const { shipmentNumber, shipmentNumbers, setShipmentNumber, statusOptions } = useStatusShipment();
  const { showModal } = useModal();
  const toast = useToast();

  const [pieData, setPieData] = useState(data);
  const [totalBoxes, setTotalBoxes] = useState([]);

  // Derived KPIs from statusBreakdown
  const kpis = React.useMemo(() => {
    let delivered = 0, outForDel = 0, none = 0, total = 0;
    totalBoxes.forEach((row) => {
      const breakdown = row.statusBreakdown ?? {};
      Object.entries(breakdown).forEach(([status, qty]) => {
        const s = status.toLowerCase();
        if (s.includes("deliver")) delivered += qty;
        else if (s.includes("picked up")) outForDel += qty;
        else if (s.includes("none") || s.includes("none")) none += qty;
        
        total += qty;
      });
      // fallback if no breakdown
      if (!Object.keys(breakdown).length) {
        total += row.totalBoxes ?? row.totalQty ?? 0;
      }
    });
    
    return { total, delivered, outForDel, none };
  }, [totalBoxes]);

  const grandTotal = totalBoxes.reduce((s, r) => s + (r.totalBoxes ?? r.totalQty ?? 0), 0);

  // Mock bar chart data derived from destinations
  const barData = totalBoxes.map((row) => ({
    group: row.destination,
    value: row.totalBoxes ?? row.totalQty ?? 0,
  }));

  useEffect(() => {
    setLoading(true);
    if (!shipmentNumber) return;
    getAnalytics(shipmentNumber, statusOptions)
      .then((res) => {
        setPieData(res.destinationSummary);
        if (res.destinations?.length) {
          setTotalBoxes(res.destinations);
        } else {
          setTotalBoxes([
            { destination: "LUZ", totalBoxes: 0, totalQty: 0, statusBreakdown: {} },
            { destination: "VIS", totalBoxes: 0, totalQty: 0, statusBreakdown: {} },
            { destination: "MIN", totalBoxes: 0, totalQty: 0, statusBreakdown: {} },
            { destination: "NCR", totalBoxes: 0, totalQty: 0, statusBreakdown: {} },
          ]);
        }
      })
      .catch((error) => toast.error(`${error.message}`))
      .finally(() => setLoading(false));
  }, [shipmentNumber]);

  const openBreakdownModal = (row) => {
    showModal({
      title: `Status Breakdown — ${row.destination} (${REGION_META[row.destination]?.label ?? ""})`,
      content: (
        <div className="space-y-2 min-w-[260px]">
          {row.statusBreakdown && Object.keys(row.statusBreakdown).length ? (
            Object.entries(row.statusBreakdown).map(([status, qty]) => {
              const meta = REGION_META[row.destination] ?? { color: "#64748b" };
              return (
                <div key={status} className="flex items-center justify-between gap-4 py-1 border-b border-gray-50">
                  <span className="text-sm text-gray-600">{status}</span>
                  <span className="font-bold text-gray-800">{qty.toLocaleString()}</span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400">No breakdown data available.</p>
          )}
        </div>
      ),
    });
  };

  return (
    <div className="flex h-full w-full bg-gray-50 min-h-screen">
      <main className="h-full w-full flex-1 p-6 space-y-6 ">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col items-start gap-3">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Reports</h2>
            </div>
            <Shipments
              value={shipmentNumber}
              options={shipmentNumbers}
              label="Shipment No"
              onChange={setShipmentNumber}
              canAll={false}
              onEdit={false}
            />
          </div>
          <button
            onClick={() => exportCSV(totalBoxes)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold
              hover:bg-gray-700 active:scale-95 transition-all duration-150 shadow-sm"
          >
            ↓ Export CSV
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Total Boxes"  value={kpis.total}     icon="📦" accent="#2563eb" />
          <KpiCard label="Delivered"    value={kpis.delivered} icon="✅" accent="#16a34a" />
          <KpiCard label="Picked up"   value={kpis.outForDel} icon="🚚" accent="#d97706" />
          <KpiCard label="Pending"      value={kpis.none}   icon="⏳" accent="#7c3aed" />
        </div>

        {/* ── Regional Cards ── */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">By Region</h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {totalBoxes.map((row, i) => (
              <RegionCard
                key={i}
                row={row}
                total={grandTotal}
                onClick={() => openBreakdownModal(row)}
              />
            ))}
            {totalBoxes.length === 0 && (
              <p className="col-span-4 text-center text-sm text-gray-400 py-8">No data for this shipment.</p>
            )}
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Distribution by Region</h3>
            <SimpleBarChart data={barData} options={barOptions} />
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Destination Split</h3>
            <PieChart data={pieData} options={pieOption} />
          </div>
        </div>

        {/* ── Status Breakdown Table ── */}
        {totalBoxes.length > 0 && <StatusTable totalBoxes={totalBoxes} />}

        {/* ── Calendar ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Schedule</h3>
          <ScheduleCalendar />
        </div>

      </main>
    </div>
  );
};

export default Report;