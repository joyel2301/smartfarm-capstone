import "./Desktop3.css";

export const Desktop3 = ({ className, ...props }) => {
  return (
    <div className={"desktop-3 " + className}>

                <div className="weather-chart">

                  <div className="container5">
                    <div className="card">
                      <div className="weather-chart2">
                        <img className="icon" src="icon0.svg" />
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
                        <img className="icon2" src="icon1.svg" />
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
                        <img className="icon3" src="icon2.svg" />
                        <div className="container8">
                          <div className="paragraph3">
                            <div className="div4">조도 </div>
                          </div>
                          <div className="paragraph2">
                            <div className="_0-mm">0mm </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card4">
                      <div className="weather-chart2">
                        <img className="icon4" src="icon3.svg" />
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
                      <div className="card-title">
                        <div className="div6">오늘의 날씨 예보(온/습도) </div>
                      </div>
                    </div>
                    
                    <div className="card6">
                      <div className="div26">주간 예보 그래프 </div>
                    </div>

                  </div>

                  <div className="card7">
                    <div className="div27">주간 일기 예보 </div>


                  </div>

                </div>
    </div>
  );
};
