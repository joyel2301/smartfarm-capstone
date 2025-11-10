import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const StrawberryGrowthChart = ({ data = [] }) => {
  const chartData =
    data.length > 0
      ? data.map((d) => ({ week: d.week, height: d.height, leaves: d.leaves }))
      : [
          { week: "Week 1", height: 10, leaves: 5 },
          { week: "Week 2", height: 20, leaves: 10 },
          { week: "Week 3", height: 30, leaves: 18 },
        ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="week" tick={{ fill: "#6b7280" }} />
        <YAxis tick={{ fill: "#6b7280" }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="height" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="초장 (cm)" />
        <Line type="monotone" dataKey="leaves" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="잎수 (개)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StrawberryGrowthChart;

