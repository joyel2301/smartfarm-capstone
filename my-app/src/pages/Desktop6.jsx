import "./Desktop6.css";
import { useState } from "react";
import { Send, MessageCircle, Sparkles, Info } from "lucide-react";
import { getAuthHeader } from "../lib/supabaseClient";

export const Desktop6 = ({ className = "", ...props }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "안녕하세요! 농사 비서 AI Chat입니다. 무엇을 도와드릴까요?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const appendMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const sendMessage = async (text) => {
    const content = text.trim();
    if (!content) return;

    appendMessage({ id: Date.now(), role: "user", text: content });
    setLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(await getAuthHeader()),
      };
      const res = await fetch(`${backendUrl}/api/ask_strawberry`, {
        method: "POST",
        headers,
        body: JSON.stringify({ question: content }),
      });
      if (!res.ok) throw new Error(`백엔드 응답 오류: ${res.status}`);
      const data = await res.json();
      const answer = data?.answer || "답변을 생성하지 못했습니다.";
      appendMessage({ id: Date.now() + 1, role: "assistant", text: answer });
    } catch (err) {
      console.error(err);
      appendMessage({
        id: Date.now() + 2,
        role: "assistant",
        text: "답변 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const current = input;
    setInput("");
    await sendMessage(current);
  };

  const quickPrompts = [
    "딸기는 몇도 이하로 내려가면 안되나요?",
    "방제 작업 스케줄 짜줘",
    "최근 환경데이터 이상징후 있나?",
    "금주 수확 체크리스트 만들어줘",
  ];

  return (
    <div className={`desktop-6 ${className}`} {...props}>
      <div className="ai-shell">
        <header className="ai-header">
          <div className="ai-title">
            <Sparkles className="icon" />
            <div>
              <h2>AI Chat봇</h2>
              <p>농사 비서 RAG와 연결된 대화형 어시스턴트</p>
            </div>
          </div>
          <div className="ai-hint">
            <Info className="icon" /> 질문은 백엔드 /api/ask_strawberry로 전송됩니다.
          </div>
        </header>

        <section className="ai-body">
          <aside className="ai-prompts">
            <h3>빠른 질문</h3>
            <div className="prompt-list">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="prompt"
                  onClick={() => sendMessage(p)}
                  disabled={loading}
                >
                  <MessageCircle className="icon" /> {p}
                </button>
              ))}
            </div>
          </aside>

          <div className="ai-chat">
            <div className="chat-window">
              {messages.map((m) => (
                <div key={m.id} className={`chat-bubble ${m.role === "assistant" ? "bot" : "user"}`}>
                  {m.text}
                </div>
              ))}
              {loading && <div className="chat-bubble bot">답변을 생성하고 있어요...</div>}
            </div>
            <form className="chat-input" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="무엇이든 물어보세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                <Send className="icon" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
