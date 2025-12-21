import { useEffect, useState } from "react";

// Placeholder hook for future KMA forecast integration
export function useWeeklyForecast({ auto = false } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auto) return;
    // TODO: implement API call and setData
  }, [auto]);

  return { data, loading, error };
}

