export async function fetchWeeklyDiary({ apiBase = "", nx, ny, signal } = {}) {
  const params = new URLSearchParams();
  if (nx != null) params.set("nx", String(nx));
  if (ny != null) params.set("ny", String(ny));
  const url = `${apiBase}/api/weekly-diary${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

