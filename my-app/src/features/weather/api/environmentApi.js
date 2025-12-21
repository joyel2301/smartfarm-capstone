import { BACKEND_URL } from '../../../utils/api';

// 한국 시간(now) Date 객체 구하기 (24시간 필터링 기준점용)
export function getNowKSTDate() {
  const now = new Date();
  const kstString = now.toLocaleString("en-US", { timeZone: "Asia/Seoul" });
  return new Date(kstString);
}

export async function fetchEnvironmentData(limit = 500, offset = 0) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/environment-data?limit=${limit}&offset=${offset}`
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error("No environment data available");
    }

    // 1) 백엔드 데이터(ISO 8601) → 프론트엔드 포맷으로 변환
    let rows = result.data.map((r) => {
      // 백엔드가 표준 포맷(예: "2024-12-08T15:00:00+09:00")으로 주므로 바로 변환 가능
      const ts = new Date(r.time).getTime();

      return {
        timestamp: ts, // 차트 X축용 timestamp (ms)
        time: r.time,  // 원본 시간 문자열 (ISO)
        soilTemp: r.temp !== null ? Number(r.temp) : null, // 백엔드: temp -> 프론트: soilTemp
        soilHum: r.rh !== null ? Number(r.rh) : null,      // 백엔드: rh -> 프론트: soilHum
        co2: r.co2 !== null ? Number(r.co2) : null,
        ah: r.ah !== null ? Number(r.ah) : null,
        radiation: r.radiation !== null ? Number(r.radiation) : null 
      };
    });

    // timestamp 유효한 데이터만 필터링
    rows = rows.filter((row) => !Number.isNaN(row.timestamp));

    // 오래된 → 최신 순으로 정렬 (차트가 꼬이지 않도록)
    rows.sort((a, b) => a.timestamp - b.timestamp);

    // 2) 한국 시간 기준 '지난 24시간' 데이터만 남기기
    const nowKST = getNowKSTDate().getTime();
    const DAY_24 = 24 * 60 * 60 * 1000;
    const start = nowKST - DAY_24;

    rows = rows.filter((row) => row.timestamp >= start && row.timestamp <= nowKST);

    return rows;
  } catch (error) {
    console.error("Environment data fetch error:", error);
    throw error;
  }
}
