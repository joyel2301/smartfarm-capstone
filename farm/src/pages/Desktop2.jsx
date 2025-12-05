import "./Desktop2.css";
import { useEffect, useState } from "react";
import StrawberryGrowthChart from "../features/weather/components/StrawberryGrowthChart";
import StrawberryGrowthSummaryTable from "../features/weather/components/StrawberryGrowthSummaryTable";
import StemDiameterChart from "../features/weather/components/StemDiameterChart";
import GrowthDataPanel from "../features/growth/components/GrowthDataPanel";
import { fetchGrowthWeekly } from "../features/growth/api/growthApi";

export const Desktop2 = ({ className, ...props }) => {
  const [gwData, setGwData] = useState([]);
  const [loadError, setLoadError] = useState("");

  const reload = () =>
    fetchGrowthWeekly()
      .then((rows) => {
        setGwData(rows);
        setLoadError("");
      })
      .catch((e) => setLoadError(e?.message || "데이터 불러오기 실패"));

  useEffect(() => {
    reload();
  }, []);

  const summaryData = gwData.map((r) => ({
    week: r.week,
    date: `Week ${r.week}`,
    height: r.height,
    leaves: r.leaves,
    stem: r.diameter ?? r.stem ?? null,
    status: null,
  }));

  // 평균 초장 계산: gwData에서 height 필드의 평균을 계산.
  const avgHeight =
    gwData && gwData.length
      ? Math.round(
          gwData.reduce((sum, row) => sum + (Number(row.height) || 0), 0) /
            gwData.length
        )
      : null;
  const avgHeightDisplay = avgHeight !== null ? avgHeight.toLocaleString() : "-";

  return (
    <div className={"desktop-2 " + (className || "")}>
      <div className="crop-chart">
        <div className="container5">
          <div className="card">
            <div className="crop-chart2">

              <div className="container6">
                <div className="div2">평균 초장</div>
                <div className="paragraph2">
                  <div className="_1-247">{avgHeightDisplay}cm</div>
                </div>
              </div>
            </div>
          </div>
          <div className="card2">
            <div className="crop-chart2">

              <div className="container7">
                <div className="paragraph3">
                  <div className="div3">평균 잎수</div>
                </div>
                <div className="paragraph2">
                  <div className="_12">+12%</div>
                </div>
              </div>
            </div>
          </div>



          <div className="card3">
            <div className="crop-chart2">

              <div className="container8">
                <div className="paragraph3">
                  <div className="div4">평균직경</div>
                </div>
                <div className="paragraph2">
                  <div className="_23">23</div>
                </div>
              </div>
            </div>
        </div>

        <div className="card4">
            <div className="crop-chart2">

              <div className="container9">
                <div className="paragraph3">
                  <div className="div5">성장률</div>
                </div>
                <div className="paragraph2">
                  <div className="_850-kg">8%</div>
                </div>
              </div>
            </div>
        </div>
        </div>

        <div className="card8">
          <div className="card-title2">
            <div className="div6">생육 데이터 입력</div>
          </div>
          <div className="card-content">
            <GrowthDataPanel onSaved={reload} />
          </div>
        </div>

        <div className="container10">
          <div className="card5">
            <div className="card-title">
              <div className="div6">주간 관부직경 변화</div>
            </div>
            <div className="card-content">
              {loadError ? (
                <div style={{ color: "#b91c1c" }}>{loadError}</div>
              ) : (
                <StemDiameterChart data={gwData} />
              )}
            </div>
          </div>

          <div className="card7">
            <div className="card-title">
              <div className="div6">주간 생육기록 요약</div>
            </div>
            <div className="card-content">
              {loadError ? (
                <div style={{ color: "#b91c1c" }}>{loadError}</div>
              ) : (
                <StrawberryGrowthSummaryTable data={summaryData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

