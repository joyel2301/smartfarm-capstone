import httpx
import asyncio
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from pytz import timezone

# 1. 환경변수 로드
load_dotenv()

SERVICE_KEY = os.getenv("KMA_AUTH_KEY")
NX = os.getenv("NX")
NY = os.getenv("NY")
MID_LAND_CODE = os.getenv("MID_LAND_CODE")
MID_TEMP_CODE = os.getenv("MID_TEMP_CODE")

# API 엔드포인트
URL_NCST = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst"
URL_FCST = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"
URL_MID_LAND = "http://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst"
URL_MID_TEMP = "http://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa"
URL_WARN_STATUS = "http://apis.data.go.kr/1360000/WthrWrnInfoService/getPwnStatus"


WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

def get_base_time_ncst():
    now = datetime.now(timezone('Asia/Seoul'))
    if now.minute < 40:
        target = now - timedelta(hours=1)
    else:
        target = now
    return target.strftime("%Y%m%d"), target.strftime("%H00")

def get_base_time_fcst():
    now = datetime.now(timezone('Asia/Seoul'))
    if now.hour < 2 or (now.hour == 2 and now.minute <= 10):
        target = now - timedelta(days=1)
        base_date = target.strftime("%Y%m%d")
        base_time = "2300"
    else:
        base_date = now.strftime("%Y%m%d")
        base_hour = (now.hour - 2) // 3 * 3 + 2
        base_time = f"{base_hour:02d}00"
    return base_date, base_time

def get_base_time_mid():
    # 중기예보는 06:00, 18:00 하루 2회 발표
    now = datetime.now(timezone('Asia/Seoul'))
    if now.hour < 6:
        target = now - timedelta(days=1)
        return target.strftime("%Y%m%d") + "1800"
    elif now.hour < 18:
        return now.strftime("%Y%m%d") + "0600"
    else:
        return now.strftime("%Y%m%d") + "1800"
def format_kma_time_hhmm(tm: str) -> str:
    """
    KMA 시각(YYYYMMDDHHMM) → 'HH:MM' 로 변환
    """
    if not tm or len(tm) < 12:
        return ""
    try:
        dt = datetime.strptime(tm[:12], "%Y%m%d%H%M")
        return dt.strftime("%H:%M")
    except Exception:
        return tm


def parse_warning_status_items(items):
    """
    getPwnStatus 응답 items 를 받아서
    - 왼쪽 카드 상태(status)
    - 오른쪽 특보 카드(alerts)
    를 만들어 반환.
    """
    # 기본값: 특보 없음
    status = {
        "rain": False,   # 호우/집중호우 관련 특보
        "snow": False,   # 대설 관련 특보
        "typhoon": False # 태풍/강풍/풍랑 관련 특보
    }
    alerts = []

    if not items:
        return status, alerts

    # items 가 dict 하나일 수도 있고 list 일 수도 있어서 통일
    if isinstance(items, dict):
        items_list = [items]
    else:
        items_list = items

    # 가장 최근 발표시각(tmFc)을 가진 항목 하나 선택
    latest = max(items_list, key=lambda x: x.get("tmFc", ""))

    text_main = (latest.get("t6") or "").strip()   # 특보발효현황 내용
    text_prel = (latest.get("t7") or "").strip()   # 예비특보 발효현황
    full_text = (text_main + "\n" + text_prel).strip()

    if not full_text:
        return status, alerts

    # ----- 왼쪽 카드 ON/OFF 판단 -----
    # 비(호우/집중호우)
    if any(k in full_text for k in ["호우", "집중호우"]):
        status["rain"] = True
    # 눈(대설)
    if "대설" in full_text:
        status["snow"] = True
    # 태풍/강풍/풍랑 → 태풍 카드
    if any(k in full_text for k in ["태풍", "강풍", "풍랑"]):
        status["typhoon"] = True

    # ----- 오른쪽 특보 카드 생성 -----
    # 아주 단순하게, 텍스트 안에 키워드가 있으면 하나씩 카드로 뽑아줌.
    hazard_defs = [
        ("호우", ["호우", "집중호우"]),
        ("대설", ["대설"]),
        ("강풍", ["강풍"]),
        ("풍랑", ["풍랑"]),
        ("태풍", ["태풍"]),
    ]

    def detect_level(txt: str) -> str:
        # 경보/주의보 둘 다 있으면 경보 우선
        if "경보" in txt:
            return "경보"
        if "주의보" in txt:
            return "주의"
        return "정보"

    base_level = detect_level(full_text)
    issued_at = format_kma_time_hhmm(latest.get("tmEf") or latest.get("tmFc", ""))

    for label, keywords in hazard_defs:
        if any(k in full_text for k in keywords):
            alerts.append({
                "type": label,          # ex) '강풍'
                "level": base_level,    # '주의' / '경보' / '정보'
                "message": full_text,   # 전체 현황 텍스트 (원하면 나중에 잘라 써도 됨)
                "issuedAt": issued_at,
            })

    return status, alerts

async def fetch_data(client, url, params, tag="API"):
    try:
        # 서비스 키는 인코딩 문제 방지를 위해 params에 직접 할당
        params["serviceKey"] = SERVICE_KEY
        params["dataType"] = "JSON"
        
        response = await client.get(url, params=params, timeout=10.0)
        response.raise_for_status()
        
        # 응답 내용 확인 (디버깅용)
        # print(f"[{tag}] Status: {response.status_code}") 
        
        try:
            data = response.json()
        except Exception:
            print(f"[{tag}] JSON 파싱 실패: {response.text[:100]}")
            return None

        if "response" in data and "header" in data["response"]:
            header = data["response"]["header"]
            if header["resultCode"] != "00":
                print(f"[{tag}] API Error: {header['resultCode']} - {header['resultMsg']}")
                return None
        
        items = data.get('response', {}).get('body', {}).get('items', {}).get('item')
        if not items:
            print(f"[{tag}] 데이터 없음 (items is empty)")
            return None
            
        return items
        
    except Exception as e:
        print(f"[{tag}] 요청 실패: {e}")
        return None

async def get_dashboard_weather():
    ncst_date, ncst_time = get_base_time_ncst()
    fcst_date, fcst_time = get_base_time_fcst()
    mid_time = get_base_time_mid()

    # 중기예보 발표 시각이 18:00이면 5일후부터, 06:00이면 4일후부터 제공됨 (2024.11 변경) 
    print(f"--> 요청시간: 실황({ncst_time}), 단기({fcst_time}), 중기({mid_time})")

    async with httpx.AsyncClient() as client:
        # 1. 단기 예보 (Rows 늘림)
        task_ncst = fetch_data(client, URL_NCST, {
            "base_date": ncst_date, "base_time": ncst_time, "nx": NX, "ny": NY, "numOfRows": "100", "pageNo": "1"
        }, "NCST")
        
        # [수정] numOfRows 1000으로 증가 (단기예보 기간 연장 대응)
        task_fcst = fetch_data(client, URL_FCST, {
            "base_date": fcst_date, "base_time": fcst_time, "nx": NX, "ny": NY, "numOfRows": "1000", "pageNo": "1"
        }, "FCST")
        
        # 2. 중기 예보
        task_mid_land = fetch_data(client, URL_MID_LAND, {
            "regId": MID_LAND_CODE, "tmFc": mid_time, "numOfRows": "10", "pageNo": "1"
        }, "MID_LAND")
        
        task_mid_temp = fetch_data(client, URL_MID_TEMP, {
            "regId": MID_TEMP_CODE, "tmFc": mid_time, "numOfRows": "10", "pageNo": "1"
        }, "MID_TEMP")

        task_warn_status = fetch_data(client, URL_WARN_STATUS, {
            "numOfRows": "50", "pageNo": "1"
        }, "WARN_STATUS")

        ncst_items, fcst_items, mid_land_items, mid_temp_items, warn_status_items = await asyncio.gather(
            task_ncst, task_fcst, task_mid_land, task_mid_temp, task_warn_status
        )


    # --- 1. 실황 데이터 정리 ---
    current_weather = {}
    if ncst_items:
        for item in ncst_items:
            # [수정] 'PTY' (강수형태) 추가
            if item['category'] in ['T1H', 'REH', 'RN1', 'WSD', 'PTY']:
                current_weather[item['category']] = item['obsrValue']

    # 2. 단기 예보 집계 (TMP 리스트에서 min/max 추출)
    daily_short = {}
    forecast_hourly = []

    if fcst_items:
        for item in fcst_items:
            f_date = item['fcstDate']
            val = item['fcstValue']
            cat = item['category']

            if cat == 'TMP':
                forecast_hourly.append({"time": item['fcstTime'], "date": f_date, "temp": val})

            if f_date not in daily_short:
                daily_short[f_date] = {"temps": [], "rain_amt": 0.0}
            
            if cat == 'TMP':
                daily_short[f_date]["temps"].append(float(val))
            elif cat == 'PCP':
                if val == '강수없음':
                    amount = 0.0
                elif 'mm' in val:
                    # 'mm' 단위 제거
                    val_clean = val.replace('mm', '').strip()
                    
                    if '미만' in val_clean:
                        # '1 미만'인 경우 0.5mm로 처리
                        amount = 0.5 
                    elif '이상' in val_clean:
                        # '50 이상'인 경우 ' 이상'을 제거하고 숫자로 변환
                        amount = float(val_clean.replace('이상', '').strip())
                    else:
                        # 일반적인 숫자 값 처리
                        amount = float(val_clean)
                else:
                    amount = 0.0
                
                daily_short[f_date]["rain_amt"] += amount

    # 3. 중기 예보 병합 (Min/Max 그대로 사용)
    daily_mid = []
    
    mid_land = mid_land_items[0] if isinstance(mid_land_items, list) and mid_land_items else (mid_land_items if mid_land_items else {})
    mid_temp = mid_temp_items[0] if isinstance(mid_temp_items, list) and mid_temp_items else (mid_temp_items if mid_temp_items else {})

    if mid_land and mid_temp:
        ref_date = datetime.strptime(mid_time[:8], "%Y%m%d")
        
        for day in range(3, 11): 
            target_date = ref_date + timedelta(days=day)
            date_str = target_date.strftime("%Y%m%d")
            
            min_k, max_k = f"taMin{day}", f"taMax{day}"
            if min_k not in mid_temp:
                continue

            # [변경] 평균 대신 최저/최고 기온 각각 저장
            min_t = float(mid_temp[min_k])
            max_t = float(mid_temp[max_k])
            
            # 강수 확률
            rn_st_am = mid_land.get(f"rnSt{day}Am")
            rn_st_pm = mid_land.get(f"rnSt{day}Pm")
            rn_st_all = mid_land.get(f"rnSt{day}")
            
            probs = [p for p in [rn_st_am, rn_st_pm, rn_st_all] if p is not None]
            max_prob = max(map(int, probs)) if probs else 0
            
            daily_mid.append({
                "date": date_str,
                "min_temp": min_t,  # 최저
                "max_temp": max_t,  # 최고
                "rain": max_prob,
                "is_mid": True
            })

    # 4. 최종 리스트 생성
    final_weekly = []
    
    # (1) 단기 예보 처리
    for d_str in sorted(daily_short.keys()):
        d_data = daily_short[d_str]
        d_obj = datetime.strptime(d_str, "%Y%m%d")
        
        if d_data["temps"]:
            # [변경] 시간별 예보값 중 최소/최대값 추출
            min_t = min(d_data["temps"])
            max_t = max(d_data["temps"])
            
            final_weekly.append({
                "date": d_str,
                "day": WEEKDAYS[int(d_obj.strftime("%w"))],
                "min_temp": min_t,
                "max_temp": max_t,
                "rain": round(d_data["rain_amt"], 1),
                "is_mid": False
            })
        
    # (2) 중기 예보 처리
    existing_dates = set(x["date"] for x in final_weekly)
    for item in daily_mid:
        if item["date"] not in existing_dates:
            d_obj = datetime.strptime(item["date"], "%Y%m%d")
            item["day"] = WEEKDAYS[int(d_obj.strftime("%w"))]
            final_weekly.append(item)

    final_weekly.sort(key=lambda x: x["date"])
    forecast_hourly.sort(key=lambda x: (x['date'], x['time']))
    status, alerts = parse_warning_status_items(warn_status_items)
    return {
        "current": current_weather,
        "forecast": forecast_hourly,
        "weekly": final_weekly,
        "status": status,  
        "alerts": alerts, 
    }