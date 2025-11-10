import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const defaultData = [
  { time: "6AM", pH: 6.8 },
  { time: "9AM", pH: 6.9 },
  { time: "12PM", pH: 7.0 },
  { time: "3PM", pH: 7.1 },
  { time: "6PM", pH: 6.9 },
  { time: "9PM", pH: 6.8 },
];

export default function DailyPHLevelChart({ data }) {
  const chartData = Array.isArray(data) && data.length
    ? data
        .map((item) => ({
          time: item.time ?? item.label ?? item.date ?? item.Date ?? "",
          pH: item.pH ?? item.ph ?? null,
        }))
        .filter((d) => d.pH !== null)
    : defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="time" tick={{ fill: "#6b7280" }} />
        <YAxis domain={[6.5, 7.5]} tick={{ fill: "#6b7280" }} />
        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }} />
        <Line type="monotone" dataKey="pH" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 7 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

