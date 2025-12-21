import React, { useMemo } from "react";
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
import ChartContainer from "../../../components/chart/ChartContainer.jsx";

// 한국 시간(KST) Date 객체 구하기 (타임존 이슈 방지)
function getNowKST() {
  const now = new Date();
  const kstString = now.toLocaleString("en-US", { timeZone: "Asia/Seoul" });
  return new Date(kstString);
}

// YYYYMMDD 문자열 반환
function getYYYYMMDD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// HH00 문자열 반환
function getHH00(d) {
  const hour = String(d.getHours()).padStart(2, '0');
  return `${hour}00`;
}

// 툴팁 커스텀
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload; 

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 8,
        padding: "8px 10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        fontSize: 12,
        color: "#111827",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {data.fullDate}
      </div>
      <div style={{ marginBottom: 4 }}>
        예상 온도: <b>{data.temp !== null ? `${data.temp}°C` : "-"}</b>
      </div>
    </div>
  );
};

export default function Today24HourChart({ data = [] }) {
  
  // [핵심 로직] 현재 시간부터 24시간 슬롯 생성 및 데이터 매핑
  const chartData = useMemo(() => {
    // 1. 현재 한국 시간 가져오기
    const start = getNowKST();
    // 분/초 초기화 (정시 기준)
    start.setMinutes(0, 0, 0);

    const slots = [];
    
    // 2. 향후 24시간 슬롯 생성
    for (let i = 0; i < 24; i++) {
      // i시간 뒤의 시간 계산
      const future = new Date(start.getTime() + i * 60 * 60 * 1000);
      
      const dateKey = getYYYYMMDD(future); // 예: "20241208"
      const timeKey = getHH00(future);     // 예: "1500"
      
      // X축 표시용 (예: 15:00)
      const displayHour = String(future.getHours()).padStart(2, '0');
      const displayTime = `${displayHour}:00`;

      // 3. API 데이터(data)에서 일치하는 예보 찾기
      // data item 구조: { date: "20241208", time: "1500", temp: "15" }
      const matched = data.find(item => item.date === dateKey && item.time === timeKey);
      
      slots.push({
        displayTime, 
        temp: matched ? Number(matched.temp) : null,
        fullDate: `${future.getMonth() + 1}월 ${future.getDate()}일 ${displayTime}` // 툴팁용 상세 날짜
      });
    }

    return slots;
  }, [data]);

  return (
    <ChartContainer
      title="향후 24시간 온도 예보"
      subtitle="기상청 단기 예보 기준"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          
          <XAxis 
            dataKey="displayTime" 
            tick={{ fontSize: 11 }} 
            axisLine={false}
            tickLine={false}
            interval={3} // 3칸 간격 (혼잡 방지)
          />
          
          <YAxis 
            domain={['auto', 'auto']} 
            hide={false}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#ff6b6b", strokeWidth: 1 }} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />

          <Area
            type="monotone" 
            dataKey="temp"
            stroke="#ff4d4f"
            fillOpacity={1}
            fill="url(#gradTemp)"
            strokeWidth={3}
            name="예상 온도 (°C)"
            animationDuration={1500}
            connectNulls={true} // 데이터가 중간에 비어도 선을 이어줌
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}