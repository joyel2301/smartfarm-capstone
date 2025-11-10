import { useEffect, useMemo, useState } from "react";
import { fetchWeeklyDiary } from "../services/kmaApi.js";
import { calcSummary } from "../../../utils/metrics.js";

export function useWeeklyDiary({ apiBase = "", apiUrl, nx, ny, auto = false } = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auto) return;
    let mounted = true;
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const data = apiUrl
          ? await (await fetch(apiUrl, { signal: ctrl.signal })).json()
          : await fetchWeeklyDiary({ apiBase, nx, ny, signal: ctrl.signal });
        if (mounted) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      ctrl.abort();
    };
  }, [apiBase, apiUrl, nx, ny, auto]);

  const summary = useMemo(() => calcSummary(rows), [rows]);
  return { rows, setRows, loading, error, summary };
}

