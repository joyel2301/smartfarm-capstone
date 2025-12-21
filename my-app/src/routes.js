// src/routes.js
export const routes = {
  env: "/env",
  growth: "/growth",
  weather: "/weather",
  analytics: "/analytics",
  alerts: "/alerts",
  ai: "/ai",
  login: "/login",
};

export const tabs = [
  { label: "환경데이터", path: routes.env },
  { label: "생육 데이터", path: routes.growth },
  { label: "날씨 데이터", path: routes.weather },
  { label: "온실제어", path: routes.analytics },
  { label: "방제 기록 ", path: routes.alerts },
  { label: "AI 상담", path: routes.ai },
];
