import "./Desktop5.css";
import { PestControlManager } from "../components/PestControlManager";

export const Desktop5 = ({ className = "", ...props }) => {
  return (
    <div className={`desktop-5 ${className}`} {...props}>
      <div className="pest-layout">
        <PestControlManager />
      </div>
    </div>
  );
};
