import "./Desktop3.css";
import React, { useEffect, useState } from "react";
import axios from "axios"; 
import Today24HourChart from "../features/weather/components/Today24HourChart.jsx";
import WeeklyForecastChart from "../features/weather/components/WeeklyForecastChart.jsx";
import WeatherAlerts from "../features/weather/components/WeatherAlerts.jsx"; // 경로 확인

export const Desktop3 = ({ className, ...props }) => {
  // 1. 상태 관리 (현재 날씨 + 24시간 예보 + 주간 예보)
  const [weatherData, setWeatherData] = useState({
    current: null,  // 현재 실황
    forecast: [],   // 24시간 예보 (시간별)
    weekly: [],
    status: { rain: false, snow: false, typhoon: false },
    alerts: []
    // 주간 예보 (일별) -> 추가됨
  });
  const [loading, setLoading] = useState(true);

  // 2. API 데이터 호출
useEffect(() => {
    const fetchWeather = async () => {
      try {
        // 로딩 상태는 '최초 실행' 때만 보여주는 게 자연스러우므로
        // 여기서는 setLoading(true)를 생략하거나, 
        // 데이터가 아예 없을 때만 로딩을 띄우는 식으로 처리할 수도 있습니다.
        
        const response = await axios.get("http://127.0.0.1:8000/api/dashboard/weather");
        
        if (response.data.status === "success") {
          setWeatherData({
            current: response.data.data.current,
            forecast: response.data.data.forecast,
            weekly: response.data.data.weekly,
            status: response.data.data.status,  
            alerts: response.data.data.alerts
          });
        }
      } catch (error) {
        console.error("날씨 데이터 가져오기 실패:", error);
      } finally {
        setLoading(false); // 최초 로딩 끝남
      }
    };

    fetchWeather(); // 1. 접속하자마자 즉시 실행

    // 2. 10분(600,000ms)마다 주기적으로 실행
    const intervalId = setInterval(fetchWeather, 600000);

    // 3. 페이지 나갈 때 타이머 정리 (메모리 누수 방지)
    return () => clearInterval(intervalId);
  }, []);
  // 3. 로딩 중일 때
  if (loading) {
    return <div className={"desktop-3 " + className}>데이터를 불러오는 중...</div>;
  }

  // 4. 데이터 방어 코드
  if (!weatherData.current) {
    return <div className={"desktop-3 " + className}>날씨 정보를 불러올 수 없습니다.</div>;
  }

  // 데이터 단축
  const { T1H, REH, RN1, WSD } = weatherData.current;

  return (
    <div className={"desktop-3 " + className}>
      <div className="weather-chart">
        <div className="container5">
          {/* --- 카드 1: 온도 --- */}
          <div className="card">
            <div className="weather-chart2">
              <div className="container6">
                <div className="div2">온도 </div>
                <div className="paragraph2">
                  <div className="_29-c">{T1H}°C </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- 카드 2: 습도 --- */}
          <div className="card2">
            <div className="weather-chart2">
              <div className="container7">
                <div className="paragraph3">
                  <div className="div3">습도 </div>
                </div>
                <div className="paragraph2">
                  <div className="_58">{REH}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* --- 카드 3: 강수량 --- */}
          <div className="card3">
            <div className="weather-chart2">
              <div className="container8">
                <div className="paragraph3">
                  <div className="div4">강수량 </div>
                </div>
                <div className="paragraph2">
                  <div className="_0-mm">{RN1}mm</div>
                </div>
              </div>
            </div>
          </div>

          {/* --- 카드 4: 풍속 --- */}
          <div className="card4">
            <div className="weather-chart2">
              <div className="container9">
                <div className="paragraph3">
                  <div className="div5">풍속 </div>
                </div>
                <div className="paragraph2">
                  <div className="_11-km-h">{WSD} m/s</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container10">
          {/* --- 주간 예보 차트 --- */}
          <div className="card5">
            {/* [수정] weekly 데이터를 props로 전달 */}
            <WeeklyForecastChart data={weatherData.weekly} />
          </div>
          
          {/* --- 24시간 예보 차트 --- */}
          <div className="card6">
            <Today24HourChart data={weatherData.forecast} />
          </div>
        </div>

        <div className="card7">
        <WeatherAlerts 
    data={weatherData}
  />
        </div>
      </div>
    </div>
  );
};