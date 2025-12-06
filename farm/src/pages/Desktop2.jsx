import "./Desktop2.css";
import { useEffect, useState } from "react";
import StrawberryGrowthSummaryTable from "../features/growth/components/StrawberryGrowthSummaryTable";
import StemDiameterChart from "../features/growth/components/StemDiameterChart";
import GrowthDataPanel from "../features/growth/components/GrowthDataPanel";
import { fetchGrowthWeekly } from "../features/growth/api/growthApi";
import GrowthForm from "../features/growth/components/GrowthForm";

export const Desktop2 = ({ className, ...props }) => {
  const [gwData, setGwData] = useState([]);
  const [loadError, setLoadError] = useState("");
//데이터 새로 불러오기
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
    plantCode: r.plantCode ?? r.plant_code ?? null,
    stem: r.diameter ?? r.stem ?? null,

  }));

// 🔽 gwData가 이미 불러와졌다고 가정 (week, height, leaves, diameter 포함)

// 정렬
const sorted = [...gwData].sort((a, b) => a.week - b.week);

let heightGrowth = 0;
let leafGrowth = 0;
let diameterGrowth = 0;

if (sorted.length >= 2) {
  const prev = sorted[sorted.length - 2]; // 지난주
  const curr = sorted[sorted.length - 1]; // 이번주

  // 🔸 초장 증가율 (%)
  if (prev.height > 0) {
    heightGrowth = ((curr.height - prev.height) / prev.height) * 100;
  }

  // 🔸 잎수 증가율 (%)
  if (prev.leaves > 0) {
    leafGrowth = ((curr.leaves - prev.leaves) / prev.leaves) * 100;
  }

  // 🔸 직경 증가율 (%)
  if (prev.diameter > 0) {
    diameterGrowth = ((curr.diameter - prev.diameter) / prev.diameter) * 100;
  }
}

// 🔸 기록률 (입력된 주차 수 / 전체 주차)
const totalWeeks = sorted.length > 0 ? sorted[sorted.length - 1].week : 1;
const filledWeeks = sorted.length;
const recordRate = (filledWeeks / totalWeeks) * 100/2;

// 🔸 보기 좋게 반올림
const fmt = (n) => isFinite(n) ? n.toFixed(1) + "%" : "-";


  return (
    <div className={"desktop-2 " + (className || "")}>
      <div className="crop-chart">
        <div className="container5">
          <div className="card">
            <div className="crop-chart2">

              <div className="container6">
                <div className="div2">초장 성장률</div>
                <div className="paragraph2">
                  <div className="_1-247">{fmt(heightGrowth)}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="card2">
            <div className="crop-chart2">

              <div className="container7">
                <div className="paragraph3">
                  <div className="div3">잎수 증가율</div>
                </div>
                <div className="paragraph2">
                  <div className="_12">{fmt(leafGrowth)}</div>
                </div>
              </div>
            </div>
          </div>



          <div className="card3">
            <div className="crop-chart2">

              <div className="container8">
                <div className="paragraph3">
                  <div className="div4"> 직경 증가율</div>
                </div>
                <div className="paragraph2">
                  <div className="_23">{fmt(diameterGrowth)}</div>
                </div>
              </div>
            </div>
        </div>

        <div className="card4">
            <div className="crop-chart2">

              <div className="container9">
                <div className="paragraph3">
                  <div className="div5">기록률</div>
                </div>
                <div className="paragraph2">
                  <div className="_850-kg">{fmt(recordRate)}</div>
                </div>
              </div>
            </div>
        </div>
        </div>
<div className="container11">
        <div className="card8">
          <div className="card-title2">
            <div className="div6">작물 성장 현황</div>
          </div>
          <div className="card-content">
            <GrowthDataPanel
      data={gwData}
      loading={!gwData.length && !loadError}
      err={loadError}
            />
          </div>
        </div>
        <div className="card12">

          <div className="card-content">
          <GrowthForm onSaved={reload} />
          </div>
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

