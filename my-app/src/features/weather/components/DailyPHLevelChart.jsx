import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const defaultData = [
  { time: "06:00", co2: 680 },
  { time: "09:00", co2: 690 },
  { time: "12:00", co2: 700 },
  { time: "15:00", co2: 710 },
  { time: "18:00", co2: 690 },
  { time: "21:00", co2: 680 },
];

export default function DailyCO2Chart({ data = [] }) {
  // 데이터 포맷팅 로직 (기존과 동일하게 유지하되 안전성 보강)
  const chartData = Array.isArray(data) && data.length > 0
    ? data
        .map((item) => {
          const timeStr = item.time || "";
          // "2024-12-06 090000" -> "09:00" 변환
          // 혹은 이미 "09:00" 형식일 수도 있으니 유연하게 처리
          let displayTime = timeStr;
          
          // 긴 형식일 경우 파싱
          const match = timeStr.match(/(\d{2})(\d{2})(\d{2})$/); 
          if (match) {
             displayTime = `${match[1]}:${match[2]}`;
          } else if (timeStr.includes("T")) {
             // ISOString 등의 경우 (예: 2024-12-06T09:00:00)
             const dateObj = new Date(timeStr);
             if (!isNaN(dateObj)) {
               displayTime = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
             }
          }

          return {
            time: displayTime,
            co2: item.co2 ?? null,
          };
        })
        .filter((d) => d.co2 !== null)
    : defaultData;

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {/* 그라데이션 정의 */}
          <defs>
            <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="time" 
            tick={{ fill: "#6b7280", fontSize: 12 }} 
            tickMargin={10}
            minTickGap={30} // X축 라벨이 너무 겹치지 않게 자동 조절
          />
          
          <YAxis 
            tick={{ fill: "#6b7280", fontSize: 12 }} 
            domain={['auto', 'auto']} // 데이터 범위에 맞춰 자동으로 Y축 조정
            tickFormatter={(value) => `${value}`}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(255, 255, 255, 0.95)", 
              border: "none", 
              borderRadius: "8px", 
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)" 
            }}
            labelStyle={{ color: "#374151", fontWeight: "bold" }}
          />
          
          <Area 
            type="monotone" 
            dataKey="co2" 
            stroke="#ef4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCo2)" 
            dot={false} // [핵심] 지저분한 점 제거
            activeDot={{ r: 6, strokeWidth: 0 }} // 마우스 올렸을 때만 점 표시
            name="CO2 (ppm)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}