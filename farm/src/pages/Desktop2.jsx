import "./Desktop2.css";
import StrawberryGrowthChart from "../features/weather/components/StrawberryGrowthChart";
import StemDiameterChart from "../features/weather/components/StemDiameterChart";
import StrawberryGrowthSummaryTable from "../features/weather/components/StrawberryGrowthSummaryTable";

export const Desktop2 = ({ className, ...props }) => {
  return (
    <div className={"desktop-2 " + className}>
                <div className="crop-chart">
                  <div className="container5">
                    <div className="card">
                      <div className="crop-chart2">
                        <img className="icon" src="icon0.svg" />
                        <div className="container6">
                          <div className="div2">평균 초장 </div>
                          <div className="paragraph2">
                            <div className="_1-247">1,247 </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card2">
                      <div className="crop-chart2">
                        <img className="icon2" src="icon1.svg" />
                        <div className="container7">
                          <div className="paragraph3">
                            <div className="div3">평균 엽수 </div>
                          </div>
                          <div className="paragraph2">
                            <div className="_12">+12% </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card3">
                      <div className="crop-chart2">
                        <img className="icon3" src="icon2.svg" />
                        <div className="container8">
                          <div className="paragraph3">
                            <div className="div4">생장속도 </div>
                          </div>
                          <div className="paragraph2">
                            <div className="_23">23 </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card4">
                      <div className="crop-chart2">
                        <img className="icon4" src="icon3.svg" />
                        <div className="container9">
                          <div className="paragraph3">
                            <div className="div5">총수확량 </div>
                          </div>
                          <div className="paragraph2">
                            <div className="_850-kg">850kg </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="container10">
                    <div className="card5">
                      <div className="card-title">
                        <div className="div6">초장 &amp; 잎수</div>
                      </div>
                      <div className="card-content">
                        <StrawberryGrowthChart />
                      </div>
                    </div>

                    <div className="card7">
                      <div className="card-title">
                        <div className="div6">주간 생육기록 요약</div>
                      </div>
                      <div className="card-content">
                        <StrawberryGrowthSummaryTable />
                      </div>
                    </div>
                  </div>

                  <div className="card8">
                    <div className="card-title2">
                      <div className="div6">주간 관부직경 변화</div>
                    </div>
                    <div className="card-content">
                      <StemDiameterChart />
                    </div>
                  </div>
                </div>

    </div>
  );
};
