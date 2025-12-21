import React from "react";
import "./Toptab.css";

const Toptab = ({ tabs = [], active, onChange }) => {
  const items = tabs.map((t) =>
    typeof t === "string" ? { label: t, path: t } : t
  );

  return (
    <nav className="toptab" aria-label="Top navigation tabs">
      {items.map((item) => {
        const isActive = active === item.path;
        const className = `toptab-btn${isActive ? " is-active" : ""}`;
        return (
          <button
            key={item.path || item.label}
            type="button"
            className={className}
            onClick={() => onChange && onChange(item.path)}
            aria-pressed={isActive}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

export default Toptab;
