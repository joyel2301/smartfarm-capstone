// src/App.js
import "./App.css";
import { useEffect, useState } from "react";
import Layout from "./Layout/Layout";
import { Desktop1 } from "./pages/Desktop1";
import { Desktop2 } from "./pages/Desktop2";
import { Desktop3 } from "./pages/Desktop3";
import { Desktop4 } from "./pages/Desktop4";
import { Desktop5 } from "./pages/Desktop5";
import { Desktop6 } from "./pages/Desktop6";
import { Login } from "./pages/Login";
import { routes, tabs } from "./routes";
import useHashRoute from "./router/useHashRoute";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const { path, navigate } = useHashRoute(routes.login);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!supabase) return;

    // 현재 세션 확인
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data?.user?.email || "");
    });

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || "");
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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
      case routes.ai:
        return <Desktop6 />;
      case routes.login:
        return <Login />;
      default:
        return <div>Page not found.</div>;
    }
  };

  return (
    <Layout
      tabs={tabs}
      active={path}
      onChangeTab={navigate}
      userEmail={userEmail}
      hideTabs={path === routes.login}
    >
      {renderPage()}
    </Layout>
  );
}
