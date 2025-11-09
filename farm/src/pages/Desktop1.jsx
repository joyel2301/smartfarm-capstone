import "./Desktop1.css";
import EnvTimeSeries from "./chart/EnvTimeSeries.jsx";
import "chartjs-adapter-date-fns";

export const Desktop1 = ({ className, ...props }) => {
  return (
    <div className={"desktop-1 " + className}>

      <div className="soil-chart">       {/* 차트 간격 유지용 */}

        <div className="card-container">
          <div className="card">
            <div className="soil-chart2">
              <img className="icon" src="icon0.svg" />
              <div className="container6">
                <div className="div2">토양 습도 </div>
                <div className="paragraph2">
                  <div className="_33">33% </div>
                </div>
              </div>
            </div>
          </div>

                    <div className="card2">
                      <div className="soil-chart2">
                        <img className="icon2" src="icon1.svg" />
                        <div className="container7">
                          <div className="paragraph3">
                            <div className="div3">토양 온도 </div>
                          </div>
                          <div className="paragraph2">
                            <div className="_24-c">24°C </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card3">
                      <div className="soil-chart2">
                        <img className="icon3" src="icon2.svg" />
                        <div className="container8">
                          <div className="paragraph3">
                            <div className="p-h">pH </div>
                          </div>
                          <div className="paragraph2">
                            <div className="_6-9">6.9 </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card4">
                      <div className="soil-chart2">
                        <img className="icon4" src="icon3.svg" />
                        <div className="container9">
                          <div className="paragraph3">
                            <div className="div4">토양 상태 </div>
                          </div>
                          <div className="paragraph2">
                            <div className="good">Good </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="container10"> {/* 차트 간격 유지용 윗쪽 표 */}

                    <div className="card5">
                              <section className="sf-card">
                                <h2 className="sf-card-title">토양 온도 & 습도</h2>
                                <EnvTimeSeries
                                  // fetchEnv={async () => {
                                  //   const res = await fetch("/api/env/latest"); // ts,tempC,soilHumidity 반환
                                  //   return await res.json();
                                  // }}
                                />
                              </section>
                    </div>

                    <div className="card6">
                      <div className="card-title">
                        <div className="div5">토양 수분 상태 </div>
                      </div>
                    </div>
                  </div>

                  <div className="card7">
                    <div className="card-title2">
                      <div className="p-h-level">하루 pH level </div>
                    </div>
                  </div>
              </div>
      
    </div>
  );
};

