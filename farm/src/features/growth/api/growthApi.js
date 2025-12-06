//supabase 클라이언트 가져오기
import { supabase } from '../../../lib/supabaseClient'; 

// 주간 생육 데이터 조회
export async function fetchGrowthWeekly() {
  if (!supabase)
    throw new Error(
      'Supabase가 구성되지 않았습니다. REACT_APP_SUPABASE_URL/ANON_KEY를 설정하고 개발 서버를 다시 시작하세요.'
    );

  // growth_weekly 테이블에서 시간순으로 전체 조회
  const { data, error } = await supabase
    .from('growth_weekly')
    .select('*')
    .order('time', { ascending: true });

  if (error) throw error; // 에러 처리

  // Supabase에서 받은 원본 데이터를 프론트에서 쓰기 좋은 형태로 변환
  return (data || []).map((r) => ({
    week: r.time,                       // 주차
    plantCode: r.plant_code || null,    // ✅ 새로 추가: 식물 코드
    height: Number(r.height),
    leaves: Number(r.leaf_count),
    diameter:
      r.diameter != null
        ? Number(r.diameter)
        : r.stem != null
        ? Number(r.stem)
        : undefined,
  }));
}


// DB에 생육 데이터 저장하는 함수
export async function upsertGrowthWeekly({
  week,
  plantCode,   // ✅ 식물 코드도 같이 받기
  height,
  leaves,
  diameter,
}) {
  if (!supabase)
    throw new Error(
      'Supabase가 구성되지 않았습니다. REACT_APP_SUPABASE_URL/ANON_KEY를 설정하고 개발 서버를 다시 시작하세요.'
    );

  // Supabase에 보낼 데이터 형태 (DB 컬럼명에 맞춰줌)
  const payload = {
    time: Number(week),
    plant_code: plantCode,          // ✅ 새로 추가: 식물 코드
    height: Number(height),
    leaf_count: Number(leaves),
  };

  // 직경은 값이 있을 때만 넣기
  if (diameter !== undefined && diameter !== null && diameter !== "") {
    const d = Number(diameter);
    if (Number.isFinite(d)) payload.diameter = d;
  }

  const { error } = await supabase
    .from('growth_weekly')
    .upsert(payload)
    .select();

  if (error) throw error;
}

