import "./Desktop3.css";
import Today24HourChart from "../features/weather/components/Today24HourChart.jsx";
import WeeklyDiaryChart from "../features/weather/components/WeeklyDiaryChart.jsx";
import WeeklyForecastChart from "../features/weather/components/WeeklyForecastChart.jsx";


export const Desktop3 = ({ className, ...props }) => {
  return (
    <div className={"desktop-3 " + className}>

                <div className="weather-chart">

                  <div className="container5">
                    <div className="card">
                      <div className="weather-chart2">

                        <div className="container6">
                          <div className="div2">온도 </div>
                          <div className="paragraph2">
                            <div className="_29-c">29°C </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card2">
                      <div className="weather-chart2">

                        <div className="container7">
                          <div className="paragraph3">
                            <div className="div3">습도 </div>
                          </div>
                          <div className="paragraph2">
                            <div className="_58">58% </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card3">
                      <div className="weather-chart2">

                        <div className="container8">
                          <div className="paragraph3">
                            <div className="div4">강수량 </div>
                          </div>
                          <div className="paragraph2">
                            <div className="_0-mm">0mm </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card4">
                      <div className="weather-chart2">

                        <div className="container9">
                          <div className="paragraph3">
                            <div className="div5">풍속 </div>
                          </div>
                          <div className="paragraph2">
                            <div className="_11-km-h">11 km/h </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="container10">

                    <div className="card5">
                      <Today24HourChart />
                    </div>
                    
                    <div className="card6">
                      <WeeklyForecastChart />
                    </div>

                  </div>

                  <div className="card7">
                    <WeeklyDiaryChart />


                  </div>

                </div>
    </div>
  );
};
