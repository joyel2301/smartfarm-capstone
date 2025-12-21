
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import httpx
from datetime import datetime, timedelta
import pytz
from dateutil import parser as date_parser

from rag_service import run_rag
from kma_service import get_dashboard_weather  # [추가] 대시보드용 날씨 데이터 함수 import

# 1. 환경변수 로드
load_dotenv()

# 2. 한국 시간대 설정
KST = pytz.timezone("Asia/Seoul")

# 3. FastAPI 앱 생성
app = FastAPI(title="SmartFarm API")

# ==================== CORS 설정 ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Supabase 설정 ====================
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip('"')
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip('"')
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", SUPABASE_KEY).strip('"')


# ==================== 데이터 모델 (Pydantic) ====================

class WeatherData(BaseModel):
    """(샘플용) 개별 기상 데이터 포인트"""
    temp: Optional[float] = None
    hum: Optional[float] = None
    rain: Optional[float] = None


class WeatherSummary(BaseModel):
    """(샘플용) 기상 요약 데이터 응답"""
    avgTemp: str
    avgHum: str
    totalRain: float


class GrowthData(BaseModel):
    """생육 데이터 한 주차 기록"""
    week: int
    height: float
    leaves: int
    diameter: Optional[float] = None
    plantCode: Optional[str] = None


class GrowthSummary(BaseModel):
    """생육 요약 데이터"""
    heightGrowth: str  # "%" 문자열로 표현
    leafGrowth: str
    diameterGrowth: str
    recordRate: str


class GrowthSaveRequest(BaseModel):
    """생육 데이터 저장 요청"""
    week: int
    plantCode: Optional[str] = None
    height: float
    leaves: int
    diameter: Optional[float] = None


class EnvironmentData(BaseModel):
    """환경(온실) 센서 데이터"""
    time: str  # ISO 형식 문자열
    co2: Optional[float] = None
    rh: Optional[float] = None     # 상대습도
    ah: Optional[float] = None     # 절대습도
    temp: Optional[float] = None   # 온도
    radiation: Optional[float] = None  # 일사량


class PestControl(BaseModel):
    """방제 기록 조회용 모델"""
    id: Optional[str] = None
    date: str
    area: str
    pesticide: str
    amount: float
    memo: Optional[str] = None


class PestControlCreate(BaseModel):
    """방제 기록 생성용 요청 모델"""
    date: str
    area: str
    pesticide: str
    amount: float
    memo: Optional[str] = None


class QueryRequest(BaseModel):
    """RAG 질의 요청"""
    question: str


class AssistantResponse(BaseModel):
    """RAG 응답"""
    answer: str


# ==================== 로컬 유틸 함수 (요약 계산 / 시간 파싱) ====================

def calc_summary(rows: List[WeatherData]) -> WeatherSummary:
    """기상 데이터 리스트로부터 평균/합계를 계산"""
    n = len(rows) or 1
    avg_temp = sum(r.temp or 0 for r in rows) / n
    avg_hum = sum(r.hum or 0 for r in rows) / n
    total_rain = sum(r.rain or 0 for r in rows)

    return WeatherSummary(
        avgTemp=f"{avg_temp:.1f}",
        avgHum=f"{avg_hum:.1f}",
        totalRain=total_rain,
    )


def calc_growth_summary(rows: List[GrowthData]) -> GrowthSummary:
    """생육 데이터의 요약 통계 계산"""
    sorted_rows = sorted(rows, key=lambda r: r.week)

    height_growth = 0.0
    leaf_growth = 0.0
    diameter_growth = 0.0

    if len(sorted_rows) >= 2:
        prev = sorted_rows[-2]
        curr = sorted_rows[-1]

        if prev.height:
            height_growth = ((curr.height - prev.height) / prev.height) * 100
        if prev.leaves:
            leaf_growth = ((curr.leaves - prev.leaves) / prev.leaves) * 100
        if prev.diameter and curr.diameter:
            diameter_growth = ((curr.diameter - prev.diameter) / prev.diameter) * 100

    unique_weeks = len(set(r.week for r in sorted_rows if r.week is not None))
    max_week = sorted_rows[-1].week if sorted_rows else 1
    record_rate = (unique_weeks / max_week) * 100 if max_week else 0
    def fmt(n: float) -> str:
        return f"{n:.1f}%" if n == n else "-"

    return GrowthSummary(
        heightGrowth=fmt(height_growth),
        leafGrowth=fmt(leaf_growth),
        diameterGrowth=fmt(diameter_growth),
        recordRate=fmt(record_rate),
    )


def parse_env_time_to_kst(time_str: str) -> datetime | None:
    """환경 데이터의 time 문자열을 KST 기준 datetime으로 변환"""
    if not time_str:
        return None
    try:
        dt = date_parser.parse(time_str)
        if dt.tzinfo is None:
            return KST.localize(dt)
        return dt.astimezone(KST)
    except Exception as e:
        print(f"Date Parsing Error: {e} for data {time_str}")
        return None


# ==================== Supabase 연동 함수들 ====================

async def fetch_growth_data_from_supabase(auth_header: str | None = None) -> List[GrowthData]:
    """Supabase에서 주차별 생육 데이터 조회 (week/leaves 우선, 실패 시 time/leaf_count 재시도)"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase 설정이 되어 있지 않습니다.")

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": auth_header or f"Bearer {SUPABASE_SERVICE_KEY}",
    }

    attempts = [
        ({"select": "week,plant_code,height,leaves,diameter", "order": "week.asc"}, "new"),
        ({"select": "time,plant_code,height,leaf_count,diameter", "order": "time.asc"}, "legacy"),
    ]

    async with httpx.AsyncClient() as client:
        last_response = None
        for params, _mode in attempts:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/growth_weekly",
                headers=headers,
                params=params,
            )
            last_response = response
            if response.status_code == 200:
                data = response.json()
                return [
                    GrowthData(
                        week=int(r.get("week") or r.get("time") or 0),
                        height=float(r.get("height", 0) or 0),
                        leaves=int(r.get("leaves") or r.get("leaf_count") or 0),
                        diameter=float(r["diameter"]) if r.get("diameter") is not None else None,
                        plantCode=r.get("plant_code"),
                    )
                    for r in (data if isinstance(data, list) else [])
                ]

        detail = last_response.text if last_response is not None else "Supabase 생육 데이터 조회 실패"
        status = last_response.status_code if last_response is not None else 500
        raise HTTPException(status_code=status, detail=detail)


async def save_growth_data_to_supabase(data: GrowthSaveRequest, auth_header: str | None = None) -> dict:
    """Supabase에 생육 데이터를 저장 (week/leaves 우선, 실패 시 time/leaf_count 재시도)"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase 설정이 되어 있지 않습니다.")

    payloads = [
        {
            "week": data.week,
            "plant_code": data.plantCode,
            "height": data.height,
            "leaves": data.leaves,
            **({"diameter": data.diameter} if data.diameter is not None else {}),
        },
        {
            "time": data.week,
            "plant_code": data.plantCode,
            "height": data.height,
            "leaf_count": data.leaves,
            **({"diameter": data.diameter} if data.diameter is not None else {}),
        },
    ]

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": auth_header or f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    async with httpx.AsyncClient() as client:
        last_response = None
        for payload in payloads:
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/growth_weekly",
                headers=headers,
                json=payload,
            )
            last_response = response
            if response.status_code in [200, 201]:
                return {"success": True, "message": "생육 데이터가 저장되었습니다."}

        detail = last_response.text if last_response is not None else "Supabase 생육 데이터 저장 실패"
        status = last_response.status_code if last_response is not None else 500
        raise HTTPException(status_code=status, detail=detail)


async def fetch_environment_data_from_supabase() -> List[EnvironmentData]:
    """Supabase에서 최근 24시간 환경 데이터 조회"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase 설정이 되어 있지 않습니다.")

    now = datetime.now(KST)
    start = now - timedelta(hours=24)
    time_fmt = "%Y-%m-%d %H%M%S"

    params = [
        ("select", "time,CO2,RH,AH,TEMP,RADIATION"),
        ("time", f"gte.{start.strftime(time_fmt)}"),
        ("time", f"lte.{now.strftime(time_fmt)}"),
        ("order", "time.asc"),
    ]

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/Enviro",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Prefer": "count=none",
            },
            params=params,
            timeout=10.0,
        )

        if response.status_code != 200:
            print(f"Supabase Error: {response.text}")
            raise HTTPException(status_code=response.status_code, detail="환경 데이터 조회 실패")

        data = response.json()

        result_list: List[EnvironmentData] = []
        for r in data:
            dt = parse_env_time_to_kst(r.get("time"))
            iso_time = dt.isoformat() if dt else None

            if iso_time:
                result_list.append(
                    EnvironmentData(
                        time=iso_time,
                        co2=float(r.get("CO2")) if r.get("CO2") is not None else None,
                        rh=float(r.get("RH")) if r.get("RH") is not None else None,
                        ah=float(r.get("AH")) if r.get("AH") is not None else None,
                        temp=float(r.get("TEMP")) if r.get("TEMP") is not None else None,
                        radiation=float(r.get("RADIATION")) if r.get("RADIATION") is not None else None,
                    )
                )
        return result_list


async def fetch_pest_controls_from_supabase(auth_header: str | None = None) -> List[PestControl]:
    """Supabase에서 방제 기록 리스트 조회"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase 설정이 되어 있지 않습니다.")

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": auth_header or f"Bearer {SUPABASE_SERVICE_KEY}",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/pest_controls",
            headers=headers,
            params={"select": "*", "order": "date.desc"},
            timeout=10.0,
        )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="방제 기록 조회 실패")

    data = response.json()
    return [
        PestControl(
            id=r.get("id"),
            date=r.get("date"),
            area=r.get("area"),
            pesticide=r.get("pesticide"),
            amount=float(r.get("amount", 0)),
            memo=r.get("memo"),
        )
        for r in (data if isinstance(data, list) else [])
    ]


async def create_pest_control_to_supabase(data: PestControlCreate, auth_header: str | None) -> PestControl:
    """Supabase에 방제 기록 생성"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase 설정이 되어 있지 않습니다.")

    payload = data.dict()

    headers = {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    # 사용자 토큰이 들어오면 그걸 사용, 없으면 서비스 키 사용
    headers["Authorization"] = auth_header or f"Bearer {SUPABASE_SERVICE_KEY}"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/pest_controls",
            headers=headers,
            json=payload,
            timeout=10.0,
        )

    if response.status_code not in [200, 201]:
        raise HTTPException(status_code=response.status_code, detail="방제 기록 생성 실패")

    rows = response.json()
    row = rows[0] if isinstance(rows, list) and rows else rows
    return PestControl(
        id=row.get("id"),
        date=row.get("date"),
        area=row.get("area"),
        pesticide=row.get("pesticide"),
        amount=float(row.get("amount", 0)),
        memo=row.get("memo"),
    )


async def delete_pest_control_from_supabase(record_id: str, auth_header: str | None = None) -> None:
    """Supabase에서 방제 기록 삭제"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase 설정이 되어 있지 않습니다.")

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": auth_header or f"Bearer {SUPABASE_SERVICE_KEY}",
    }

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{SUPABASE_URL}/rest/v1/pest_controls",
            headers=headers,
            params={"id": f"eq.{record_id}"},
            timeout=10.0,
        )

    if response.status_code not in [200, 204]:
        raise HTTPException(status_code=response.status_code, detail="방제 기록 삭제 실패")


# ==================== API 엔드포인트 ====================

@app.get("/")
def read_root():
    return {"message": "SmartFarm Backend API is running"}


@app.post("/api/weather-summary", response_model=WeatherSummary)
def get_weather_summary(data: List[WeatherData]):
    """(샘플) 기상 데이터 요약"""
    return calc_summary(data)


@app.post("/api/growth-summary", response_model=GrowthSummary)
def get_growth_summary(data: List[GrowthData]):
    """생육 데이터 요약"""
    return calc_growth_summary(data)


@app.get("/api/growth-data")
async def get_growth_data(request: Request):
    """생육 데이터 조회 (Supabase)"""
    try:
        auth_header = request.headers.get("authorization")
        data = await fetch_growth_data_from_supabase(auth_header)
        return {"success": True, "data": data}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/growth-data")
async def create_growth_data(data: GrowthSaveRequest, request: Request):
    """생육 데이터 저장 (Supabase)"""
    try:
        auth_header = request.headers.get("authorization")
        result = await save_growth_data_to_supabase(data, auth_header)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/environment-data")
async def get_environment_data():
    """환경 데이터 조회 (최근 24시간)"""
    try:
        data = await fetch_environment_data_from_supabase()
        return {"success": True, "data": data}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Server Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/pest-controls", response_model=List[PestControl])
async def get_pest_controls(request: Request):
    """방제 기록 조회"""
    try:
        auth_header = request.headers.get("authorization")
        data = await fetch_pest_controls_from_supabase(auth_header)
        return data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pest-controls", response_model=PestControl)
async def post_pest_control(payload: PestControlCreate, request: Request):
    """방제 기록 생성"""
    try:
        auth_header = request.headers.get("authorization")
        return await create_pest_control_to_supabase(payload, auth_header)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/pest-controls/{record_id}")
async def remove_pest_control(record_id: str, request: Request):
    """방제 기록 삭제"""
    try:
        auth_header = request.headers.get("authorization")
        await delete_pest_control_from_supabase(record_id, auth_header)
        return {"success": True}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== [NEW] 대시보드용 날씨 API ====================

@app.get("/api/dashboard/weather")
async def dashboard_weather_api():
    """
    대시보드에서 사용하는 현재 + 단기 예보 날씨 데이터
    응답 형식: { "status": "success", "data": { "current": {...}, "forecast": [...] } }
    """
    result = await get_dashboard_weather()
    return {
        "status": "success",
        "data": result,
    }


# ==================== [NEW] 딸기 스마트팜 Q&A (RAG) ====================

@app.post("/api/ask_strawberry", response_model=AssistantResponse)
async def ask_strawberry(request: QueryRequest):
    """RAG 기반 딸기 재배 질의 응답"""
    try:
        answer = await run_rag(request.question)
        return AssistantResponse(answer=answer)
    except Exception as e:
        print("RAG 오류:", e)
        raise HTTPException(status_code=500, detail="질문에 대한 답변을 생성하는 중 오류가 발생했습니다.")


# ==================== 개발용 로컬 실행 ====================

if __name__ == "__main__":
    import uvicorn

    # reload=True 설정 시 코드 수정하면 서버가 자동으로 재시작됨
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
