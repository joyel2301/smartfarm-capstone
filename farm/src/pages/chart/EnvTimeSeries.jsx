import React, { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import "./chart.css"

Chart.register(LineElement, PointElement, TimeScale, LinearScale, CategoryScale, Tooltip, Legend, Filler);

const WINDOW_MS = 24 * 60 * 60 * 1000;          // 24시간 창
const POLL_MS   = 10 * 60 * 1000;               // 10분 주기 (개발 중엔 30*1000으로 줄여 테스트)

export default function EnvTimeSeries({ fetchEnv }) {
  /**
   * fetchEnv: async () => { ts: number(Date.now), tempC: number, soilHumidity: number }
   * 실제 API를 연결하면 됩니다. 데모용 기본 fetcher를 아래에서 제공.
   */
  const fetcher = fetchEnv || demoFetcher;

  const [series, setSeries] = useState(() => seedDemoData()); // 초기 24시간 시드
  const chartRef = useRef(null);

  // 10분마다 폴링
  useEffect(() => {
    let isMounted = true;

    const pull = async () => {
      try {
        const p = await fetcher();
        if (!isMounted) return;
        setSeries(prev => trimWindow([...prev, p]));
      } catch (e) {
        // 실패해도 조용히 넘어감 (로그 필요하면 넣기)
      }
    };

    // 첫 로드 시점에도 갱신 한 번
    pull();

    const id = setInterval(pull, POLL_MS);
    return () => { isMounted = false; clearInterval(id); };
  }, [fetcher]);

  // 차트 데이터/옵션
  const data = useMemo(() => {
    const labels = series.map(d => d.ts);
    const temps  = series.map(d => d.tempC);
    const hums   = series.map(d => d.soilHumidity);

    return (canvas => {
      const ctx = canvas.getContext("2d");

      // 그라디언트
      const gradBlue = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradBlue.addColorStop(0, "rgba(59,130,246,0.25)");
      gradBlue.addColorStop(1, "rgba(59,130,246,0.05)");

      const gradAmber = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradAmber.addColorStop(0, "rgba(251,146,60,0.25)");
      gradAmber.addColorStop(1, "rgba(251,146,60,0.05)");

      return {
        labels,
        datasets: [
          {
            label: "습도 (%)",
            yAxisID: "y1",
            data: hums,
            borderColor: "#3b82f6",
            backgroundColor: gradBlue,
            pointRadius: 0,
            tension: 0.35,
            fill: true,
          },
          {
            label: "온도 (°C)",
            yAxisID: "y",
            data: temps,
            borderColor: "#fb923c",
            backgroundColor: gradAmber,
            pointRadius: 0,
            tension: 0.35,
            fill: true,
          },
        ],
      };
    })(chartRef.current?.canvas ?? document.createElement("canvas"));
  }, [series]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top", labels: { boxWidth: 12, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          title: (items) => {
            const ts = items[0].parsed.x;
            return new Date(ts).toLocaleString();
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "hour", displayFormats: { hour: "haaa" } }, // 6AM, 9AM …
        grid: { color: "rgba(0,0,0,0.08)", drawBorder: false },
        ticks: { maxRotation: 0, autoSkip: true },
      },
      y: {
        title: { display: true, text: "온도 (°C)" },
        grid: { color: "rgba(0,0,0,0.08)", drawBorder: false },
        suggestedMin: 0,
      },
      y1: {
        position: "right",
        title: { display: true, text: "토양습도 (%)" },
        grid: { drawOnChartArea: false }, // 좌/우 그리드 중복 방지
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  }), []);

  return (
    <div style={{ height: 260 }}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}

/* ------------------ 유틸/데모 ------------------ */

// 24시간 가짜 시드 데이터 생성(10분 간격)
function seedDemoData() {
  const now = Date.now();
  const start = now - WINDOW_MS;
  const arr = [];
  for (let t = start; t <= now; t += 10 * 60 * 1000) {
    arr.push({
      ts: t,
      tempC: 15 + 7 * Math.sin((t / 3.6e6) * Math.PI / 6),               // 대충 변동
      soilHumidity: 55 - 8 * Math.sin((t / 3.6e6) * Math.PI / 5),
    });
  }
  return arr;
}

// 창 유지(24h)하며 정렬
function trimWindow(list) {
  const cutoff = Date.now() - WINDOW_MS;
  const trimmed = list.filter(d => d.ts >= cutoff).sort((a, b) => a.ts - b.ts);
  return trimmed;
}

// 데모용 fetcher: 실제로는 API 호출 자리
async function demoFetcher() {
  await sleep(200);
  const ts = Date.now();
  // 마지막 값 기준으로 약간씩 변동
  const last = demoFetcher._last || { tempC: 22, soilHumidity: 52 };
  const tempC = clamp(last.tempC + rand(-0.4, 0.6), 10, 35);
  const soilHumidity = clamp(last.soilHumidity + rand(-1.2, 1.2), 25, 80);
  demoFetcher._last = { tempC, soilHumidity };
  return { ts, tempC, soilHumidity };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
