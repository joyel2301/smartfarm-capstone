import "./Desktop2.css";
import { useEffect, useState } from "react";
import StrawberryGrowthSummaryTable from "../features/growth/components/StrawberryGrowthSummaryTable";
import StemDiameterChart from "../features/growth/components/StemDiameterChart";
import GrowthDataPanel from "../features/growth/components/GrowthDataPanel";
import { fetchGrowthWeekly } from "../features/growth/api/growthApi";
import GrowthForm from "../features/growth/components/GrowthForm";

import { BACKEND_URL } from '../utils/api';

export const Desktop2 = ({ className, ...props }) => {
  const [gwData, setGwData] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [summary, setSummary] = useState(null);

  // 데이터 새로 불러오기
  const reload = () =>
    fetchGrowthWeekly()
      .then((rows) => {
        setGwData(rows);
        setLoadError("");
        // 백엔드에서 요약 데이터 가져오기
        fetchGrowthSummary(rows);
      })
      .catch((e) => setLoadError(e?.message || "데이터 불러오기 실패"));

  // 백엔드에서 생육 요약 데이터 가져오기
  const fetchGrowthSummary = async (rows) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/growth-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSummary(data);
    } catch (e) {
      console.error("Growth summary fetch error:", e);
    }
  };

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

  // 백엔드에서 받은 요약 데이터 사용
  const heightGrowth = summary?.heightGrowth || "-";
  const leafGrowth = summary?.leafGrowth || "-";
  const diameterGrowth = summary?.diameterGrowth || "-";
  const recordRate = summary?.recordRate || "-";

  return (
    <div className={"desktop-2 " + (className || "")}>
      <div className="crop-chart">
        <div className="container5">
          <div className="card">
            <div className="crop-chart2">
              <div className="container6">
                <div className="div2">초장 성장률</div>
                <div className="paragraph2">
                  <div className="_1-247">{heightGrowth}</div>
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
                  <div className="_12">{leafGrowth}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card3">
            <div className="crop-chart2">
              <div className="container8">
                <div className="paragraph3">
                  <div className="div4">직경 증가율</div>
                </div>
                <div className="paragraph2">
                  <div className="_23">{diameterGrowth}</div>
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
                  <div className="_850-kg">{recordRate}</div>
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

