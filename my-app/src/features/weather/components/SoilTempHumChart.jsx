import React, { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { fetchEnvironmentData, getNowKSTDate } from "../api/environmentApi";

// [변경 1] 디폴트 데이터 주석 처리
// const defaultData = [
//   { timestamp: Date.now() - 6 * 60 * 60 * 1000, soilTemp: 12, soilHum: 55 },
//   { timestamp: Date.now() - 4 * 60 * 60 * 1000, soilTemp: 15, soilHum: 50 },
//   { timestamp: Date.now() - 3 * 60 * 60 * 1000, soilTemp: 19, soilHum: 45 },
//   { timestamp: Date.now() - 2 * 60 * 60 * 1000, soilTemp: 21, soilHum: 42 },
//   { timestamp: Date.now() - 1 * 60 * 60 * 1000, soilTemp: 18, soilHum: 48 },
//   { timestamp: Date.now(), soilTemp: 16, soilHum: 52 },
// ];

export default function SoilTempHumChart({ data, limit = 2000, refreshMs = 60_000 }) {
  // 디폴트 데이터 대신 빈 배열([])로 시작
  const [chartData, setChartData] = useState(data || []);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (data) {
      setChartData(data);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const envData = await fetchEnvironmentData(limit);
        if (cancelled) return;

        // [중요] API 데이터(temp, rh)를 차트 키(soilTemp, soilHum)로 변환
        const formattedData = envData.map((item) => ({
          timestamp: new Date(item.time).getTime(), // 시간 변환
          soilTemp: item.temp, // API의 temp -> 차트의 soilTemp
          soilHum: item.rh,    // API의 rh -> 차트의 soilHum
        }));

        setChartData(formattedData);
        setLoadError("");
      } catch (e) {
        if (cancelled) return;
        console.error("Failed to load environment data:", e);
        setLoadError(e?.message || "load error");
        setChartData([]); // 에러 시 빈 배열
      }
    };

    load();
    const id = setInterval(load, refreshMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [data, limit, refreshMs]);

  // === [변경 2] X축: 현재 시간 기준 24시간 범위 설정 ===
  // 렌더링 될 때마다 다시 계산하지 않도록 useMemo 사용
  const { domain, ticks, nowTs } = useMemo(() => {
    const nowKST = getNowKSTDate();
    const currentMs = nowKST.getTime();
    
    // 현재로부터 24시간 전 (24 * 60 * 60 * 1000)
    const startMs = currentMs - 24 * 60 * 60 * 1000;

    // 틱(눈금) 생성: 1시간 단위로 정시(00분)에 맞춤
    const ticksArr = [];
    const tickStart = new Date(startMs);
    tickStart.setMinutes(0, 0, 0); // 시작점의 '분'을 0으로 초기화 (정시 맞춤)
    
    // startMs 근처 정시부터 1시간씩 더해서 currentMs까지 생성
    let t = tickStart.getTime();
    while (t <= currentMs) {
      if (t >= startMs) { // 범위 안에 있는 것만 추가
         ticksArr.push(t);
      }
      t += 60 * 60 * 1000; // 1시간 추가
    }

    return { 
        domain: [startMs, currentMs], 
        ticks: ticksArr,
        nowTs: currentMs 
    };
  }, [chartData]); // 데이터가 갱신될 때 시간 축도 최신화

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {loadError && (
        <div style={{ color: "#b91c1c", marginBottom: "10px" }}>
          데이터 로드 실패: {loadError}
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="timestamp"
            type="number"
            domain={domain} // 24시간 범위 적용
            ticks={ticks}   // 1시간 간격 눈금
            tickFormatter={(ts) =>
              new Date(ts).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false, // 24시간제 표시 (13:00, 14:00...)
                timeZone: "Asia/Seoul",
              })
            }
          />

          <YAxis
            yAxisId="left"
            orientation="left"
            domain={['auto', 'auto']} // 온도 변화가 잘 보이도록 자동 범위
            label={{ value: "온실온도 (℃)", angle: -90, position: "insideLeft" }}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]} // 습도는 0~100 고정
            label={{ value: "온실습도 (%)", angle: 90, position: "insideRight" }}
          />

          <Tooltip
            labelFormatter={(ts) =>
              new Date(ts).toLocaleString("ko-KR", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Seoul",
              })
            }
          />

          <Legend />

          <ReferenceLine
            x={nowTs}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: "현재", position: "top", fill: "#ef4444" }}
          />

          <Area
            yAxisId="right"
            type="monotone"
            dataKey="soilHum" // 매핑된 키 사용
            stroke="#f59e0b"
            fillOpacity={0.6}
            fill="#fde68a"
            name="온실습도 (%)"
            strokeWidth={2}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="soilTemp" // 매핑된 키 사용
            stroke="#2563eb"
            fillOpacity={0.6}
            fill="#bfdbfe"
            name="온실온도 (℃)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}