import "./Desktop4.css";

export const Desktop4 = ({ className = "", ...props }) => {
  return (
    <div className={"desktop-4" + className}>

              <div className="irrigation-chart">
                <div className="container5">

                  <div className="card">
                    <div className="irrigation-chart2">
                      <img className="icon" src="icon0.svg" />
                      <div className="container6">
                        <div className="paragraph2">
                          <div className="water-usage">Water Usage </div>
                        </div>
                        <div className="paragraph3">
                          <div className="_678-l">678L </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card2">
                    <div className="irrigation-chart2">
                      <img className="icon2" src="icon1.svg" />
                      <div className="container7">
                        <div className="paragraph2">
                          <div className="efficiency">Efficiency </div>
                        </div>
                        <div className="paragraph3">
                          <div className="_97">97% </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card3">
                    <div className="irrigation-chart2">
                      <img className="icon3" src="icon2.svg" />
                      <div className="container8">
                        <div className="paragraph2">
                          <div className="active-zones">Active Zones </div>
                        </div>
                        <div className="paragraph3">
                          <div className="_3-5">3/5 </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card4">
                    <div className="irrigation-chart2">
                      <img className="icon4" src="icon3.svg" />
                      <div className="container9">
                        <div className="paragraph2">
                          <div className="pressure">Pressure </div>
                        </div>
                        <div className="paragraph3">
                          <div className="_51-psi">51 PSI </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="container10">

                  <div className="card5">
                    <div className="card-title">
                      <div className="zone-water-usage">Zone Water Usage </div>
                    </div>
                  </div>

                  <div className="card6">
                    <div className="card-title">
                      <div className="irrigation-schedule">
                        Irrigation Schedule{" "}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="card7">
                  <div className="card-title2">
                    <div className="system-pressure-flow-rate">
                      System Pressure &amp; Flow Rate{" "}
                    </div>
                  </div>

                </div>
              </div>

    </div>
  );
};
