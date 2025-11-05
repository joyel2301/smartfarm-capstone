// src/routes.js
export const routes = {
  env: "/env",
  growth: "/growth",
  weather: "/weather",
  analytics: "/analytics",
  alerts: "/alerts",
};

export const tabs = [
  { label: "환경 데이터", path: routes.env },
  { label: "생육 데이터", path: routes.growth },
  { label: "날씨 데이터", path: routes.weather },
  { label: "데이터 분석", path: routes.analytics },
  { label: "알림", path: routes.alerts },
];

