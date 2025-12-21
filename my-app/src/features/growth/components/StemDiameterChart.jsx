import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const StemDiameterChart = ({ data = [] }) => {
  // ✅ 주차별 평균 관부직경 계산
  const chartData =
    Array.isArray(data) && data.length > 0
      ? (() => {
          // week별로 sum / count 누적
          const buckets = data.reduce((acc, d) => {
            const w = d?.week;
            if (w == null) return acc;

            // diameter 우선, 없으면 stem 사용
            let raw =
              d && d.diameter != null && d.diameter !== ""
                ? Number(d.diameter)
                : d && d.stem != null && d.stem !== ""
                ? Number(d.stem)
                : NaN;

            if (!Number.isFinite(raw)) return acc;

            if (!acc[w]) {
              acc[w] = { week: w, sum: 0, count: 0 };
            }
            acc[w].sum += raw;
            acc[w].count += 1;
            return acc;
          }, {});

          // week 오름차순 정렬 + 평균값 계산
          return Object.values(buckets)
            .sort((a, b) => Number(a.week) - Number(b.week))
            .map((b) => ({
              week: b.week,
              diameter: b.count > 0 ? b.sum / b.count : null,
            }));
        })()
      : [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="week" tick={{ fill: "#6b7280" }} />
        <YAxis
          label={{
            
            angle: -90,
            position: "left",
            style: { fill: "#6b7280" },
          }}
          tick={{ fill: "#6b7280" }}
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="diameter"
          stroke="#f43f5e"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="관부직경 (mm, 평균)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StemDiameterChart;
