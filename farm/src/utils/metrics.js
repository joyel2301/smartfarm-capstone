export const statusColor = (status) => {
  switch (status) {
    case "정상":
      return "#28a745";
    case "주의":
      return "#ffd700";
    case "위험":
      return "#ff4d4f";
    default:
      return "#6b7280";
  }
};

export const calcSummary = (rows) => {
  const n = rows.length || 1;
  const avgTemp = (rows.reduce((a, c) => a + (c.temp || 0), 0) / n).toFixed(1);
  const avgHum = (rows.reduce((a, c) => a + (c.hum || 0), 0) / n).toFixed(1);
  const totalRain = rows.reduce((a, c) => a + (c.rain || 0), 0);
  return { avgTemp, avgHum, totalRain };
};

