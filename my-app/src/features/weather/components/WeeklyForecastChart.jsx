import React from "react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartContainer from "../../../components/chart/ChartContainer.jsx";

const WeeklyForecastChart = ({ data = [] }) => {
  // 데이터 가공
  const chartData = data.map(item => {
    // 날짜 포맷팅 (YYYYMMDD -> 12.08)
    const strDate = String(item.date);
    const month = strDate.substring(4, 6);
    const day = strDate.substring(6, 8);
    const formattedDate = `${month}.${day}`;

    return {
      ...item,
      rainValue: item.rain, 
      rainLabel: item.is_mid ? "강수확률(%)" : "강수량(mm)",
      // [핵심] 툴팁용 제목 생성: "12.08 (Mon)"
      tooltipTitle: `${formattedDate} (${item.day})`
    };
  });

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // payload에서 미리 만들어둔 tooltipTitle을 꺼내 씁니다.
      const { min_temp, max_temp, rain, rainLabel, tooltipTitle } = payload[0].payload;
      
      return (
        <div style={{ background: "#fff", padding: "10px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          {/* 툴팁 제목은 날짜+요일로 자세히 표시 */}
          <p style={{ fontWeight: "bold", marginBottom: "6px", textAlign: "center" }}>{tooltipTitle}</p>
          
          <div style={{ display: "flex", gap: "10px", marginBottom: "4px" }}>
             <span style={{ color: "#ef4444", fontWeight: "bold" }}>최고: {max_temp}°C</span>
             <span style={{ color: "#3b82f6", fontWeight: "bold" }}>최저: {min_temp}°C</span>
          </div>
          <p style={{ color: "#60a5fa", margin: 0, textAlign: "right" }}>
            {rainLabel}: {rain}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer title="주간 예보">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          
          {/* [변경] X축은 깔끔하게 요일(day)만 표시 */}
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#666" }} 
            interval={0} // 모든 요일 표시
          />
          
          <YAxis 
            yAxisId="left" 
            hide={false} 
            axisLine={false} 
            tickLine={false}
            width={30}
            tick={{ fontSize: 11 }}
            label={{ value: '강수', position: 'insideTopLeft', fontSize: 10, offset: 10 }}
          />
          
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            hide={false} 
            axisLine={false} 
            tickLine={false}
            unit="°C"
            width={35}
            tick={{ fontSize: 11 }}
            domain={['auto', 'auto']} 
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          
          <Bar 
            yAxisId="left" 
            dataKey="rainValue" 
            barSize={16} 
            fill="#93c5fd" 
            name="강수" 
            radius={[4, 4, 0, 0]} 
          />
          
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="min_temp" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            name="최저기온" 
            dot={{ r: 3, fill: "#3b82f6", strokeWidth: 1, stroke: "#fff" }}
          />

          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="max_temp" 
            stroke="#ef4444" 
            strokeWidth={2} 
            name="최고기온" 
            dot={{ r: 3, fill: "#ef4444", strokeWidth: 1, stroke: "#fff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default WeeklyForecastChart;