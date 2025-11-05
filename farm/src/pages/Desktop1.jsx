import "./Desktop1.css";
import EnvTimeSeries from "./chart/EnvTimeSeries.jsx";
import "chartjs-adapter-date-fns";

export const Desktop1 = ({ className, ...props }) => {
  return (
    <div className={"desktop-1 " + className}>
                <div className="soil-chart">
                  <div className="container5">
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
                  <div className="container10">
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
                      <div className="line-20"></div>
                      <img className="rectangle-8" src="rectangle-80.svg" />
                      <div className="card-title">
                        <div className="div5">토양 수분 상태 </div>
                      </div>
                      <div className="app">
                        <div className="container11">
                          <img className="icon6" src="icon5.svg" />
                          <div className="text">
                            <div className="div7">적정 </div>
                          </div>
                        </div>
                      </div>
                      <div className="app2">
                        <div className="icon7">
                          <img className="group14" src="group18.svg" />
                        </div>
                        <div className="legend">
                          <div className="list-item">
                            <img className="icon8" src="icon7.svg" />
                            <div className="text2">
                              <div className="_0-40">건조 (0-40%) </div>
                            </div>
                          </div>
                          <div className="list-item2">
                            <img className="icon9" src="icon8.svg" />
                            <div className="text3">
                              <div className="_80-100">과습 (80-100%) </div>
                            </div>
                          </div>
                          <div className="list-item3">
                            <img className="icon10" src="icon9.svg" />
                            <div className="text4">
                              <div className="_40-80">적정 (40-80%) </div>
                            </div>
                          </div>
                        </div>
                        <div className="container12">
                          <div className="container13">
                            <img className="icon11" src="icon10.svg" />
                            <div className="text5">
                              <div className="_0-402">건조 (0-40%) </div>
                            </div>
                          </div>
                          <div className="paragraph4">
                            <div className="div8">
                              토양이 건조한 상태입니다. 관수가 필요합니다.
                              딸기는 건조에 취약하므로 즉시 조치가 필요합니다.{" "}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="app3">
                        <div className="container14">
                          <div className="label">
                            <div className="div9">수분 값 조정 </div>
                          </div>
                          <div className="text6">
                            <div className="_65">(65%) </div>
                          </div>
                        </div>
                        <div className="primitive-span">
                          <div className="text7">
                            <div className="text8"></div>
                          </div>
                          <div className="slider"></div>
                        </div>
                        <div className="container15">
                          <div className="text9">
                            <div className="_02">0% </div>
                          </div>
                          <div className="text10">
                            <div className="_502">50% </div>
                          </div>
                          <div className="text11">
                            <div className="_100">100% </div>
                          </div>
                        </div>
                      </div>
                      <div className="container16">
                        <div className="container17">
                          <img className="icon12" src="icon11.svg" />
                          <div className="text12">
                            <div className="_40-802">적정 (40-80%) </div>
                          </div>
                        </div>
                        <div className="paragraph5">
                          <div className="div10">
                            최적의 토양수분 상태입니다. 딸기 생육에 가장
                            이상적인 환경입니다. 현재 상태를 유지하세요.{" "}
                          </div>
                        </div>
                      </div>
                      <div className="container18">
                        <div className="container19">
                          <img className="icon13" src="icon12.svg" />
                          <div className="text13">
                            <div className="_80-1002">과습 (80-100%) </div>
                          </div>
                        </div>
                        <div className="paragraph6">
                          <div className="div11">
                            토양이 과습한 상태입니다. 뿌리 부패 위험이 있으니
                            배수를 개선하고 관수를 중단하세요.{" "}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card7">
                    <div className="card-title2">
                      <div className="p-h-level">하루 pH level </div>
                    </div>

                  </div>
                </div>
            
          
        
        <div className="text14">
          <div className="_6-52">6.5 </div>
        </div>
      
    </div>
  );
};

