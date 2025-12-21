// src/router/useHashRoute.js
import { useEffect, useState } from "react";

export default function useHashRoute(defaultPath) {
  const getPath = () => window.location.hash.replace(/^#/, "") || defaultPath;
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    const onHashChange = () => setPath(getPath());
    window.addEventListener("hashchange", onHashChange);
    if (!window.location.hash && defaultPath) {
      window.location.hash = defaultPath;
    }
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [defaultPath]);

  const navigate = (to) => {
    if (to && to !== path) window.location.hash = to;
  };

  return { path, navigate };
}

