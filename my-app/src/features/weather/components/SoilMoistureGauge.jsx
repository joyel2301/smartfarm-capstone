import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const getStatus = (v) => {
  if (v < 40)
    return {
      status: "건조",
      color: "#ff6b6b",
      desc: "온실이 건조한 상태입니다. 창을 닫고 관수가 필요합니다.",
    };
  if (v <= 80)
    return {
      status: "적정",
      color: "#10b981",
      desc: "최적의 수분 상태입니다. 현재 상태를 유지하세요.",
    };
  return {
    status: "과습",
    color: "#f59e0b",
    desc: "온실이 과습 상태입니다. 환기가 필요합니다.",
  };
};

export default function SoilMoistureGauge({ data = [] }) {
  // 최신 습도 데이터 (상대습도를 수분으로 사용)
  const latestData = Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null;
  const currentPercent = latestData?.soilHum ?? 65;

  // 도넛 파이 차트 데이터
  const pieData = [
    { name: "moisture", value: currentPercent },
    { name: "rest", value: 100 - currentPercent },
  ];

  const status = getStatus(currentPercent);
  // 0 -> -90deg, 100 -> 90deg
  const angle = -90 + currentPercent * 1.8;

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", height: "100%" }}>
      <div style={{ width: 220, height: 160, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={40}
              outerRadius={60}
              startAngle={180}
              endAngle={0}
              dataKey="value"
            >
              <Cell key="c1" fill={status.color} />
              <Cell key="c2" fill="#e6e6e6" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Arrow (overlay) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 22,
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: "center bottom",
            width: 4,
            height: 70,
            background: "#374151",
            borderRadius: 4,
          }}
        />

        {/* center circle */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 18,
            transform: "translateX(-50%)",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#374151",
          }}
        />
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0 }}>습도 상태</h3>
        <p style={{ margin: "6px 0 0 0", color: "#6b7280" }}>
          현재 습도: <strong style={{ color: status.color }}>{currentPercent}%</strong>
        </p>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <div style={{ padding: 8, background: "#fdecea", borderRadius: 8, flex: 1 }}>
            <strong style={{ color: "#b91c1c" }}>건조 (0-40%)</strong>
            <div style={{ fontSize: 13, color: "#6b7280" }}>창을 닫고 관수가 필요합니다.</div>
          </div>
          <div style={{ padding: 8, background: "#ecfdf5", borderRadius: 8, flex: 1 }}>
            <strong style={{ color: "#047857" }}>적정 (40-80%)</strong>
            <div style={{ fontSize: 13, color: "#6b7280" }}>현재 상태가 적정합니다.</div>
          </div>
          <div style={{ padding: 8, background: "#fff7ed", borderRadius: 8, flex: 1 }}>
            <strong style={{ color: "#92400e" }}>과습 (80-100%)</strong>
            <div style={{ fontSize: 13, color: "#6b7280" }}>환기가 필요합니다.</div>
          </div>
        </div>

        {/* slider representation (visual) */}
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 8, background: "#e6e6e6", borderRadius: 8, position: "relative" }}>
            <div style={{ width: `${currentPercent}%`, height: "100%", background: status.color, borderRadius: 8 }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>수분 조정: {currentPercent}%</div>
        </div>
      </div>
    </div>
  );
}

