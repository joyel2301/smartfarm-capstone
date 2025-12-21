import "./Desktop4.css";
import { EnvironmentControl } from "../components/EnvironmentControl";


export const Desktop4 = ({ className = "", ...props }) => {
  return (
    <div className={"desktop-4" + className}>
      <div className="irrigation-chart">
        <EnvironmentControl />
      </div>
    </div>
  );
};
