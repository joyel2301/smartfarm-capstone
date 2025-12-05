import "./Desktop1.css";
import SoilTempHumChart from "../features/weather/components/SoilTempHumChart";
import SoilMoistureGauge from "../features/weather/components/SoilMoistureGauge";
import DailyPHLevelChart from "../features/weather/components/DailyPHLevelChart";
import GrowthDataPanel from "../features/growth/components/GrowthDataPanel";

export const Desktop1 = ({ className, ...props }) => {
  return (
    <div className={"desktop-1 " + className}>
      <div className="soil-chart">
        {/* 상단 지표 카드 4개 */}
        <div className="card-container">
          <div className="card">
            <div className="soil-chart2">

              <div className="container6">
                <div className="div2">토양 습도</div>
                <div className="paragraph2">
                  <div className="_33">33% </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card2">
            <div className="soil-chart2">

              <div className="container7">
                <div className="paragraph3">
                  <div className="div3">온실 온도</div>
                </div>
                <div className="paragraph2">
                  <div className="_24-c">24℃ </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card3">
            <div className="soil-chart2">

              <div className="container8">
                <div className="paragraph3">
                  <div className="p-h">Co2 </div>
                </div>
                <div className="paragraph2">
                  <div className="_6-9">6.9 </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card4">
            <div className="soil-chart2">

              <div className="container9">
                <div className="paragraph3">
                  <div className="div4">상태</div>
                </div>
                <div className="paragraph2">
                  <div className="good">Good </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 카드 영역 */}
        <div className="container10">
          <div className="card5">
            <div className="card-title">
              <div className="chart-title">토양 온도 &amp; 습도</div>
            </div>
            <div className="card-content">
              <SoilTempHumChart />
            </div>
          </div>

          <div className="card6">
            <div className="card-title">
              <div className="chart-title">토양 수분 상태</div>
            </div>
            <div className="card-content">
              <SoilMoistureGauge />
            </div>
          </div>
        </div>

        <div className="card7">
          <div className="card-title2">
            <div className="p-h-level">일일 CO2 변화</div>
          </div>
          <div className="card-content">
            <DailyPHLevelChart />
          </div>
        </div>


      </div>
    </div>
  );
};
