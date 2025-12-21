import "./Login.css";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { routes } from "../routes";

export const Login = ({ className = "", ...props }) => {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Supabase 설정이 없습니다.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        setMessage("등록한 이메일로 확인 메일이 전송되었습니다. 이메일을 확인해주세요.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        setMessage(`로그인 성공: ${data.user?.email || ""}`);
        // 로그인 후 환경 데이터 페이지로 이동
        window.location.hash = routes.env;
      }
    } catch (err) {
      setMessage(`오류: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${className}`} {...props}>
      <div className="login-card">
        <h2 className="login-title">Supabase 로그인</h2>
        <p className="login-subtitle">이메일과 비밀번호를 입력하세요</p>

        <div className="login-toggle">
          <button
            type="button"
            className={mode === "signin" ? "is-active" : ""}
            onClick={() => setMode("signin")}
          >
            로그인
          </button>
          <button
            type="button"
            className={mode === "signup" ? "is-active" : ""}
            onClick={() => setMode("signup")}
          >
            회원가입
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>이메일</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            <span>비밀번호</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {mode === "signup" ? "회원가입" : "로그인"}
          </button>
        </form>

        {message && <div className="login-hint">{message}</div>}
        <div className="login-hint">.env에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 설정이 필요합니다.</div>
      </div>
    </div>
  );
};
