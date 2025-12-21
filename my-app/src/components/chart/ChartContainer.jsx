import React from "react";

export default function ChartContainer({ title, subtitle, children, style }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", ...style }}>
      {(title || subtitle) && (
        <div style={{ padding: "8px 12px 0 12px" }}>
          {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          {subtitle && (
            <p style={{ margin: "2px 0 0 0", color: "#6b7280", fontSize: 13 }}>{subtitle}</p>
          )}
        </div>
      )}
      <div style={{ flex: "1 1 auto", minHeight: 0, padding: "8px 12px 12px 12px" }}>{children}</div>
    </div>
  );
}

