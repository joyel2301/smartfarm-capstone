// src/Layout/Layout.js
import Toptab from "../components/Toptab";

const pageShellStyle = {
  width: "100%",
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "0 16px",
  boxSizing: "border-box",
};
export default function Layout({ tabs, active, onChangeTab, children }) {
  return (
    <div className="app">
      <div className="page-shell" style={pageShellStyle}>
        <section className="page-header">
          <h1 className="page-title">Smart Farm Dashboard</h1>
          <h3 className="page-subtitle">실시간 환경·생육·기상 모니터링 및 자동 알림 시스템</h3>
        </section>

        <Toptab tabs={tabs} active={active} onChange={onChangeTab} />

        <main className="main">{children}</main>
      </div>
    </div>
  );
}



