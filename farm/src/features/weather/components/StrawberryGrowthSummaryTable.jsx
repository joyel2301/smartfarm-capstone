import React from "react";

const StrawberryGrowthSummaryTable = ({ data = [] }) => {
  const withWeek = (Array.isArray(data) ? data : []).map((d) => {
    const explicit = Number(d?.week);
    if (Number.isFinite(explicit)) return { ...d, _week: explicit };
    const m = String(d?.date || "").match(/\d+/);
    const parsed = m ? Number(m[0]) : NaN;
    return { ...d, _week: Number.isFinite(parsed) ? parsed : null };
  });

  const sortedData = withWeek.sort((a, b) => {
    if (a._week != null && b._week != null) return a._week - b._week;
    if (a._week != null) return -1;
    if (b._week != null) return 1;
    return String(a?.date || "").localeCompare(String(b?.date || ""));
  });

  const rowCount = Math.max(sortedData.length, 5);

  const formatNumber = (num) => {
    if (num == null || isNaN(num)) return "-";
    return parseFloat(num).toFixed(1);
  };

  return (
    <div style={{ height: "100%", overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
          fontSize: "14px",
          tableLayout: "fixed",
        }}
      >
        <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 1 }}>
          <tr>
            <th style={{ ...thStyle, width: "20%" }}>날짜</th>
            <th style={{ ...thStyle, width: "18%" }}>초장</th>
            <th style={{ ...thStyle, width: "18%" }}>잎수</th>
            <th style={{ ...thStyle, width: "18%" }}>관부직경</th>
            <th style={{ ...thStyle, width: "26%" }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, idx) => {
            const row = sortedData[idx];
            return (
              <tr key={idx}>
                <td style={tdStyle}>{row?.date || (row?._week != null ? `Week ${row._week}` : "-")}</td>
                <td style={tdStyle}>{row ? formatNumber(row?.height) : "-"}</td>
                <td style={tdStyle}>{row ? formatNumber(row?.leaves) : "-"}</td>
                <td style={tdStyle}>{row ? formatNumber(row?.stem) : "-"}</td>
                <td
                  style={{
                    ...tdStyle,
                    color: row?.status === "양호" ? "green" : row?.status ? "#d97706" : "#9ca3af",
                    fontWeight: row?.status ? "600" : "400",
                  }}
                >
                  {row?.status || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "10px 0",
  fontWeight: "600",
  backgroundColor: "#f8fafc",
  position: "sticky",
  top: 0,
  whiteSpace: "nowrap",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  backgroundColor: "#fff",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export default StrawberryGrowthSummaryTable;

