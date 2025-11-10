import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const StemDiameterChart = ({ data = [] }) => {
  const chartData =
    data.length > 0
      ? data.map((d) => ({ week: d.week, diameter: d.stem }))
      : [
          { week: "Week 1", diameter: 3.2 },
          { week: "Week 2", diameter: 3.6 },
          { week: "Week 3", diameter: 4.1 },
        ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="week" tick={{ fill: "#6b7280" }} />
        <YAxis
          label={{ value: "관부직경 (mm)", angle: -90, position: "insideLeft", style: { fill: "#6b7280" } }}
          tick={{ fill: "#6b7280" }}
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="diameter" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="관부직경 (mm)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StemDiameterChart;

