import React from "react";
import Pill from "../../../components/ui/Pill.jsx";
import { statusColor } from "../../../utils/metrics.js";
import { useWeeklyDiary } from "../hooks/useWeeklyDiary.js";

const MOCK = [
  { date: "11/1", temp: 22, hum: 65, rain: 5, action: "관수 줄이기", status: "주의" },
  { date: "11/2", temp: 18, hum: 70, rain: 2, action: "환기 유지", status: "정상" },
  { date: "11/3", temp: 29, hum: 58, rain: 0, action: "차광·환기 강화", status: "위험" },
  { date: "11/4", temp: 20, hum: 68, rain: 10, action: "관수 중지", status: "주의" },
  { date: "11/5", temp: 19, hum: 75, rain: 4, action: "환기 유지", status: "정상" },
];

export default function WeeklyDiaryChart({ apiUrl, auto = false }) {
  const { rows, loading, error, summary } = useWeeklyDiary({ apiUrl, auto });
  const data = rows && rows.length ? rows : MOCK;
  const { avgTemp = 0, avgHum = 0, totalRain = 0 } = summary || {};

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>주간 일지 · 권장 조치</h2>
        <div>
          <button style={{ backgroundColor: "#ffeaa7", border: "none", borderRadius: 8, padding: "8px 12px", marginRight: 8 }}>
            주간 평균기온: {avgTemp}°C
          </button>
          <button style={{ backgroundColor: "#a3d5ff", border: "none", borderRadius: 8, padding: "8px 12px", marginRight: 8 }}>
            주간 평균습도: {avgHum}%
          </button>
          <button style={{ backgroundColor: "#b7e4c7", border: "none", borderRadius: 8, padding: "8px 12px" }}>
            주간 총강수량: {totalRain}mm
          </button>
        </div>
      </div>

      {error && <div style={{ marginTop: 8, color: "#ef4444", fontSize: 12 }}>데이터 로드 오류: {error}</div>}

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", marginTop: 15 }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f2f5" }}>
            <th style={{ padding: 8 }}>날짜</th>
            <th style={{ padding: 8 }}>기온(°C)</th>
            <th style={{ padding: 8 }}>습도(%)</th>
            <th style={{ padding: 8 }}>강수(mm)</th>
            <th style={{ padding: 8 }}>권장 조치</th>
            <th style={{ padding: 8 }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.date} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{item.date}</td>
              <td style={{ padding: 8 }}>{item.temp}</td>
              <td style={{ padding: 8 }}>{item.hum}</td>
              <td style={{ padding: 8 }}>{item.rain}</td>
              <td style={{ padding: 8, textAlign: "left" }}>{item.action}</td>
              <td style={{ padding: 8 }}>
                <Pill bg={statusColor(item.status)}>{item.status}</Pill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>불러오는 중…</div>}
    </div>
  );
}

