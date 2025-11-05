// src/App.js
import "./App.css";
import Layout from "./Layout/Layout";
import { Desktop1 } from "./pages/Desktop1";
import { Desktop2 } from "./pages/Desktop2";
import { Desktop3 } from "./pages/Desktop3";
import { Desktop4 } from "./pages/Desktop4";
import { Desktop5 } from "./pages/Desktop5";
import { routes, tabs } from "./routes";
import useHashRoute from "./router/useHashRoute";

export default function App() {
  const { path, navigate } = useHashRoute(routes.env);

  const renderPage = () => {
    switch (path) {
      case routes.env:
        return <Desktop1 />;
      case routes.growth:
        return <Desktop2 />;
      case routes.weather:
        return <Desktop3 />;
      case routes.analytics:
        return <Desktop4 />;
      case routes.alerts:
        return <Desktop5 />;
      default:
        return <div>Page not found.</div>;
    }
  };

  return (
    <Layout tabs={tabs} active={path} onChangeTab={navigate}>
      {renderPage()}
    </Layout>
  );
}

