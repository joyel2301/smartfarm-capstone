import React from "react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartContainer from "../../../components/chart/ChartContainer.jsx";

// 간단한 더미 데이터 (월~일)
const data = [
  { day: "Mon", temp: 15, rain: 5 },
  { day: "Tue", temp: 17, rain: 2 },
  { day: "Wed", temp: 19, rain: 10 },
  { day: "Thu", temp: 21, rain: 0 },
  { day: "Fri", temp: 18, rain: 8 },
  { day: "Sat", temp: 20, rain: 4 },
  { day: "Sun", temp: 22, rain: 1 },
];

const WeeklyForecastChart = () => (
  <ChartContainer title="주간 예보">
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="rain" barSize={20} fill="#007bff" name="강수(mm)" />
        <Line type="monotone" dataKey="temp" stroke="#ff0000" strokeWidth={2} name="평균기온(°C)" />
      </ComposedChart>
    </ResponsiveContainer>
  </ChartContainer>
);

export default WeeklyForecastChart;
