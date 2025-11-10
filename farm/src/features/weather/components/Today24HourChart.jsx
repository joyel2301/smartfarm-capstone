import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import ChartContainer from "../../../components/chart/ChartContainer.jsx";

const data = [
  { time: "00:00", temp: 14 },
  { time: "01:00", temp: 14 },
  { time: "02:00", temp: 13 },
  { time: "03:00", temp: 13 },
  { time: "04:00", temp: 14 },
  { time: "05:00", temp: 15 },
  { time: "06:00", temp: 16 },
  { time: "07:00", temp: 18 },
  { time: "08:00", temp: 22 },
  { time: "09:00", temp: 25 },
  { time: "10:00", temp: 27 },
  { time: "11:00", temp: 28 },
  { time: "12:00", temp: 28 },
  { time: "13:00", temp: 27 },
  { time: "14:00", temp: 26 },
  { time: "15:00", temp: 25 },
  { time: "16:00", temp: 24 },
  { time: "17:00", temp: 22 },
  { time: "18:00", temp: 20 },
  { time: "19:00", temp: 18 },
  { time: "20:00", temp: 17 },
  { time: "21:00", temp: 16 },
  { time: "22:00", temp: 15 },
  { time: "23:00", temp: 15 },
];

// 최소/최대 적정 온도 (예시)
const MIN_OPT = 18;
const MAX_OPT = 24;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const tempEntry = payload.find((p) => p.dataKey === "temp");
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 8,
        padding: "8px 10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        fontSize: 12,
        color: "#111827",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {tempEntry && (
        <div style={{ marginBottom: 4 }}>
          온도: <b>{tempEntry.value}°C</b>
        </div>
      )}
      <div style={{ color: "#065f46" }}>최소적정: {MIN_OPT}°C</div>
      <div style={{ color: "#065f46" }}>최대적정: {MAX_OPT}°C</div>
    </div>
  );
};

export default function Today24HourChart() {
  return (
    <ChartContainer title="오늘 24시간 온도 변화" subtitle={`적정 범위 ${MIN_OPT}~${MAX_OPT}°C에서 최적 생장`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={MIN_OPT} stroke="#10b981" strokeDasharray="4 4" isFront />
          <ReferenceLine y={MAX_OPT} stroke="#10b981" strokeDasharray="4 4" isFront />

          <Area type="monotone" dataKey="temp" stroke="#ff4d4f" fillOpacity={1} fill="url(#gradTemp)" strokeWidth={2} name="온도 (°C)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
