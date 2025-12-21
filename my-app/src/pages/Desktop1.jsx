  import "./Desktop1.css";
  import { useEffect, useState } from "react";
  import SoilTempHumChart from "../features/weather/components/SoilTempHumChart";
  import SoilMoistureGauge from "../features/weather/components/SoilMoistureGauge";
  import DailyPHLevelChart from "../features/weather/components/DailyPHLevelChart";
  import { fetchEnvironmentData } from "../features/weather/api/environmentApi";

  export const Desktop1 = ({ className, ...props }) => {
    const [envData, setEnvData] = useState([]);
    const [loadError, setLoadError] = useState("");

    // 환경 데이터 불러오기 (1번 요청)
    const loadEnvironmentData = async () => {
      try {
        const data = await fetchEnvironmentData(5000); // 최신 5000개 데이터
        setEnvData(data);
        setLoadError("");
      } catch (e) {
        console.error("Environment data load error:", e);
        setLoadError(e?.message || "데이터 불러오기 실패");
        setEnvData([]);
      }
    };

    useEffect(() => {
      loadEnvironmentData();
      // 1분마다 데이터 새로고침
      const interval = setInterval(loadEnvironmentData, 1 * 60 * 1000);
      return () => clearInterval(interval);
    }, []);

    // 최신 데이터 추출 (가장 최근 1개)
    const latestData = envData.length > 0 ? envData[envData.length - 1] : null;
    const currentTemp = latestData?.soilTemp ?? "-";
    const currentHum = latestData?.soilHum ?? "-";
    const currentCo2 = latestData?.co2 ?? "-";
    const currentAh = latestData?.ah ?? "-";
    const currentRadiation = latestData?.radiation ?? "-";

    return (
      <div className={"desktop-1 " + className}>
        <div className="soil-chart">
          {/* 상단 지표 카드 4개 */}
          <div className="card-container">

            <div className="card2">
              <div className="soil-chart2">
                <div className="container6">
                  <div className="div3">온실 습도</div>
                  <div className="paragraph2">
                    <div className="_24-c">{typeof currentHum === "number" ? `${currentHum.toFixed(1)}%` : currentHum} </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="soil-chart2">
                              <div className="container7">
                  <div className="paragraph3">
                    <div className="div2">온실 온도</div>
                  </div>
                  <div className="paragraph2">
                    <div className="_33">{typeof currentTemp === "number" ? `${currentTemp.toFixed(1)}℃` : currentTemp} </div>
                  </div>
                </div>
              </div>
            </div>



            <div className="card3">
              <div className="soil-chart2">
            <div className="container9">
                  <div className="paragraph3">
                    <div className="p-h">절대습도</div>
                  </div>
                  <div className="paragraph2">
                    <div className="good">{typeof currentAh === "number" ? currentAh.toFixed(1) : currentAh} </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card4">
              <div className="s oil-chart2">

                <div className="container9">
                  <div className="paragraph3">
                    <div className="div4">일사량</div>
                  </div>
                  <div className="paragraph2">
                    <div className="good">{typeof currentRadiation === "number" ? `${currentRadiation.toFixed(0)}` : (currentRadiation === null ? "0" : currentRadiation)} </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card10">
                            <div className="container8">
                  <div className="paragraph3">
                    <div className="div4">CO2</div>
                  </div>
                  <div className="paragraph2">
                    <div className="_6-9">{typeof currentCo2 === "number" ? currentCo2.toFixed(0) : currentCo2} </div>
                  </div>
                </div>
                
            </div>
          </div>

          {/* 차트 카드 영역 */}
          <div className="container10">
            <div className="card5">
              <div className="card-title">
                <div className="chart-title">온실 온도 &amp; 습도</div>
              </div>
              <div className="card-content">
                {loadError ? (
                  <div style={{ color: "#b91c1c" }}>{loadError}</div>
                ) : (
                  <SoilTempHumChart data={envData} />
                )}
              </div>
            </div>

            <div className="card6">
              <div className="card-title">
                <div className="chart-title">온실 습도</div>
              </div>
              <div className="card-content">
                {loadError ? (
                  <div style={{ color: "#b91c1c" }}>{loadError}</div>
                ) : (
                  <SoilMoistureGauge data={envData} />
                )}
              </div>
            </div>
          </div>

          <div className="card7">
            <div className="card-title2">
              <div className="p-h-level">일일 CO2 변화</div>
            </div>
            <div className="card-content">
              {loadError ? (
                <div style={{ color: "#b91c1c" }}>{loadError}</div>
              ) : (
                <DailyPHLevelChart data={envData} />
              )}
            </div>
          </div>


        </div>
      </div>
    );
  };
