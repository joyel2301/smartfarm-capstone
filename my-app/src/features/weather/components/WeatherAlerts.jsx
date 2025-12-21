import React from "react";
import "./WeatherAlertBoard.css";

/**
 * props.data 예시 (백엔드와 상의 필요)
 * {
 *   status: { rain: boolean, snow: boolean, typhoon: boolean },
 *   alerts: [{ type, level, message, issuedAt }, ...],
 *   current: {...},
 *   forecast: [...],
 *   weekly: [...]
 * }
 */
function WeatherAlertBoard({ data }) {
  // 기본 상태 값
  const status = data?.status || {
    rain: true  ,
    snow: false,
    typhoon: false,
  };

  // 알림 없을 때 예시로 호우 주의보를 노출
  const defaultAlerts = [
    {
      type: "호우",
      level: "주의보",
      message: "시간당 30mm 이상 강우 예상, 배수시설 점검 바랍니다.",
      issuedAt: "현재 기준",
    },
  ];

  const disasterAlerts =
    data?.alerts && data.alerts.length > 0 ? data.alerts : defaultAlerts;

  // 왼쪽 카드용 배열
  const weatherStatus = [
    {
      id: "rain",
      label: "비",
      hasForecast: !!true,
    },
    {
      id: "snow",
      label: "눈",
      hasForecast: !!status.snow,
    },
    {
      id: "typhoon",
      label: "태풍",
      hasForecast: !!status.typhoon,
    },
  ];

  return (
    <div className="weather-board">
      {/* 왼쪽: 기상 현황 (40%) */}
      <section className="panel left-panel">
        <div className="section-title">기상 현황</div>

        <div className="status-list">
          {weatherStatus.map((item) => {
            const on = item.hasForecast;

            // 예보 유무에 따라 스타일 분기
            const cardClass = on
              ? `status-item status-item--on status-item--${item.id}`
              : "status-item status-item--off";

            return (
              <div key={item.id} className={cardClass}>
                <div className="status-left">
                  <div className="status-icon">
                    {item.id === "rain" && "🌧️"}
                    {item.id === "snow" && "🌨️"}
                    {item.id === "typhoon" && "🌀"}
                  </div>
                  <div>
                    <div className="status-label">{item.label}</div>
                    <div className="status-desc">
                      {on ? "예보 있음" : "예보 없음"}
                    </div>
                  </div>
                </div>

                {/* 오른쪽 상태 점 */}
                <div className="status-dot" />
              </div>
            );
          })}
        </div>
      </section>

      {/* 오른쪽: 기상특보 */}
      <section className="panel right-panel">
        <div className="section-title">재난재해 특보</div>

        <div className="alert-list">
          {disasterAlerts.length === 0 ? (
            <div className="empty-alert">현재 발령된 재난재해 특보가 없습니다.</div>
          ) : (
            disasterAlerts.map((alert, idx) => (
              <article key={idx} className="alert-card">
                <div className="alert-main">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-text">
                    <div className="alert-type">{alert.type}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">
                      발령 시각: <span>{alert.issuedAt}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "alert-level " + (alert.level === "경보" ? "danger" : "warning")
                  }
                >
                  {alert.level}
                </div>
              </article>
            ))
          )}
        </div>

        {/* 차트 공간: 현재 숨김 처리됨 */}
        <div className="chart-section"></div>
      </section>
    </div>
  );
}

export default WeatherAlertBoard;
