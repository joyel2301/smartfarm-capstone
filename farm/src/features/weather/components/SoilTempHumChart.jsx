import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// 시간대별 토양 온도/습도 샘플 데이터
const defaultData = [
  { time: "6AM", soilTemp: 12, soilHum: 55 },
  { time: "9AM", soilTemp: 15, soilHum: 50 },
  { time: "12PM", soilTemp: 19, soilHum: 45 },
  { time: "3PM", soilTemp: 21, soilHum: 42 },
  { time: "6PM", soilTemp: 18, soilHum: 48 },
  { time: "9PM", soilTemp: 16, soilHum: 52 },
];

export default function SoilTempHumChart({ data = defaultData }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis
          yAxisId="left"
          orientation="left"
          label={{ value: "온도 (°C)", angle: -90, position: "insideLeft" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "토양습도 (%)", angle: 90, position: "insideRight" }}
        />
        <Tooltip />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="soilTemp"
          stroke="#2563eb"
          fillOpacity={0.6}
          fill="#bfdbfe"
          name="토양온도 (°C)"
          strokeWidth={2}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="soilHum"
          stroke="#f59e0b"
          fillOpacity={0.6}
          fill="#fde68a"
          name="토양습도 (%)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

