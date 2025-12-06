import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const StrawberryGrowthChart = ({ data = [] }) => {
  // ✅ 주차별 평균 계산
  const chartData =
    data.length > 0
      ? Object.values(
          data.reduce((acc, row) => {
            const w = row.week;

            if (!acc[w]) {
              acc[w] = {
                week: w,
                sumHeight: 0,
                sumLeaves: 0,
                count: 0,
              };
            }

            const bucket = acc[w];
            if (Number.isFinite(row.height)) {
              bucket.sumHeight += row.height;
            }
            if (Number.isFinite(row.leaves)) {
              bucket.sumLeaves += row.leaves;
            }
            bucket.count += 1;

            return acc;
          }, {})
        ).map((bucket) => ({
          week: bucket.week, // 필요하면 `Week ${bucket.week}` 로 바꿔도 됨
          height:
            bucket.count > 0 ? bucket.sumHeight / bucket.count : 0,
          leaves:
            bucket.count > 0 ? bucket.sumLeaves / bucket.count : 0,
        }))
      : [
          { week: "Week 1", height: 10, leaves: 5 },
          { week: "Week 2", height: 20, leaves: 10 },
          { week: "Week 3", height: 30, leaves: 18 },
          { week: "Week 4", height: 30, leaves: 18 },
          { week: "Week 5", height: 30, leaves: 20 },
          { week: "Week 6", height: 30, leaves: 20 },
        ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="week" tick={{ fill: "#6b7280" }} />
        <YAxis tick={{ fill: "#6b7280" }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="height"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="초장 (cm)"
        />
        <Line
          type="monotone"
          dataKey="leaves"
          stroke="#22c55e"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="잎수 (개)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StrawberryGrowthChart;

