import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx"; // App이 .jsx 파일이니까 이렇게

import "./styles/globals.css"; // 🔥 Figma 전역 스타일 추가

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
