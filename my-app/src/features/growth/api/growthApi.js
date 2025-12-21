

import { BACKEND_URL } from "../../../utils/api";
import { getAuthHeader } from "../../../lib/supabaseClient";

// 주간 생육 데이터 조회 - 백엔드 API 사용
export async function fetchGrowthWeekly() {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${BACKEND_URL}/api/growth-data`, { headers });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('No growth data available');
    }
    
    // 백엔드에서 받은 데이터를 프론트에서 쓰기 좋은 형태로 변환
    return result.data.map((r) => ({
      week: r.week,
      plantCode: r.plantCode || null,
      height: Number(r.height),
      leaves: Number(r.leaves),
      diameter: r.diameter != null ? Number(r.diameter) : undefined,
    }));
  } catch (error) {
    console.error('Growth data fetch error:', error);
    throw error;
  }
}


// DB에 생육 데이터 저장하는 함수 - 백엔드 API 사용
export async function upsertGrowthWeekly({
  week,
  plantCode,
  height,
  leaves,
  diameter,
}) {
  try {
    const payload = {
      week: Number(week),
      plantCode: plantCode,
      height: Number(height),
      leaves: Number(leaves),
    };

    if (diameter !== undefined && diameter !== null && diameter !== "") {
      const d = Number(diameter);
      if (Number.isFinite(d)) payload.diameter = d;
    }

    const response = await fetch(`${BACKEND_URL}/api/growth-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeader()),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Growth data save error:', error);
    throw error;
  }
}
