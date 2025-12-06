// Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const BOT_API = "http://localhost:5002/api/bot/message";
const BOT_HEALTH = "http://localhost:5002/api/bot/health";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "Xin chào! Tôi là trợ lý AI của T-Music. Bạn có điều gì đang thắc mắc?", ts: Date.now() }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [serverStatus, setServerStatus] = useState({ ok: null, info: null });
  const [typing, setTyping] = useState(false);

  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const idRef = useRef(2);

  useEffect(() => {
    // auto-check health on mount
    checkHealth();
  }, []);

  // auto-scroll when messages change
  useEffect(() => {
    if (open && boxRef.current) {
      // small timeout ensures DOM updated
      setTimeout(() => {
        try {
          boxRef.current.scrollTop = boxRef.current.scrollHeight;
        } catch (e) {}
      }, 60);
    }
    if (open) setUnread(0);
  }, [messages, open]);

  const pushMessage = (m) => {
    setMessages(prev => [...prev, { id: idRef.current++, ...m, ts: Date.now() }]);
    if (!open && m.from === "bot") setUnread(u => u + 1);
  };

  // health ping
  const checkHealth = async () => {
    try {
      const res = await axios.get(BOT_HEALTH, { timeout: 4000 });
      setServerStatus({ ok: true, info: res?.data || null });
    } catch (err) {
      setServerStatus({ ok: false, info: err.message || String(err) });
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    pushMessage({ from: "user", text });
    setInput("");
    setSending(true);
    setLastError(null);
    setTyping(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(BOT_API, { text }, { headers, timeout: 20000 });

      if (!res?.data) throw new Error("No response data from bot");

      // If API returns LLM docs (RAG), show them optionally
      let reply = res.data.reply || null;

      // If reply is not provided but docs exist, build a short reply from docs
      if ((!reply || String(reply).trim() === "") && Array.isArray(res.data.docs) && res.data.docs.length) {
        // Show a small summary message + list top sources
        reply = "Mình tìm thấy những thông tin liên quan — xem nguồn bên dưới.";
      }

      if (!reply) reply = "Xin lỗi, mình chưa hiểu. Bạn thử hỏi lại ngắn gọn hơn nhé.";

      pushMessage({ from: "bot", text: reply });

      // If docs exist, append them as separate messages (small, not too noisy)
      if (Array.isArray(res.data.docs) && res.data.docs.length) {
        // attach the top 3 docs with score (if present)
        const top = res.data.docs.slice(0, 3);
        top.forEach((d, i) => {
          const textPreview = (d.text || "").slice(0, 300);
          const src = d.source || d.id || `doc ${i+1}`;
          pushMessage({ from: "bot", text: `Nguồn: ${src}\n${textPreview}${(d.text && d.text.length>300) ? "..." : ""}` });
        });
      }

      setServerStatus({ ok: true, info: res?.data || null });
    } catch (err) {
      console.error("Bot request error:", err);
      const errMsg = err?.response?.data?.message || err.message || String(err);
      setLastError(errMsg);
      pushMessage({ from: "bot", text: "Không thể kết nối tới bot. Vui lòng thử lại sau." });
      setServerStatus({ ok: false, info: errMsg });
    } finally {
      setSending(false);
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) send();
    }
  };

  const toggleOpen = () => {
    setOpen(v => !v);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // small helper to render message bubble
  const Bubble = ({ m }) => (
    <div style={{ display: "flex", justifyContent: m.from==="bot" ? "flex-start" : "flex-end" }}>
      <div style={{
        maxWidth:"78%",
        padding:"10px 12px",
        borderRadius:12,
        background: m.from==="bot" ? "#0f1724" : "#1f2937",
        color:"#fff",
        boxShadow:"0 6px 16px rgba(2,6,23,0.6)",
        whiteSpace:"pre-wrap"
      }}>
        <div>{m.text}</div>
        <div style={{ marginTop:6, fontSize:11, color:"#6b7280", textAlign:"right" }}>
          {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* floating button */}
      <div style={{ position: "fixed", right: 20, bottom: 88, zIndex: 60 }}>
        <button
          onClick={toggleOpen}
          className="flex items-center gap-2 px-3 py-2 rounded-full shadow"
          style={{ background: "#111827", color: "#fff", border: "1px solid rgba(255,255,255,0.06)" }}
          aria-expanded={open}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="inline-block">
            <path d="M21 15a2 2 0 0 1-2 2H8l-5 5V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontWeight: 700 }}>Hỗ trợ</span>
          {unread > 0 && (
            <span style={{ marginLeft: 6, background: "#ef4444", color: "#fff", minWidth:20, height:20, display:"inline-flex", alignItems:"center", justifyContent:"center", borderRadius:10, fontSize:12, padding:"0 6px" }}>
              {unread}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div style={{ position:"fixed", right:20, bottom:130, width:380, maxWidth:"calc(100vw - 40px)", zIndex:80 }}>
          <div style={{ borderRadius:12, overflow:"hidden", boxShadow:"0 10px 30px rgba(2,6,23,0.6)" }}>
            {/* Header with health + ping */}
            <div style={{ background:"#0b1220", color:"#fff", padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:36, height:36, borderRadius:8, background:"#111827", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>TM</div>
                <div>
                  <div style={{ fontWeight:700 }}>Trợ lý T-Music</div>
                  <div style={{ fontSize:12, color:"#9ca3af" }}>Hỏi về tính năng, tài khoản, upload...</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize:12, color: serverStatus.ok ? "#86efac" : "#fecaca" }}>
                  {serverStatus.ok === null ? "Checking..." : serverStatus.ok ? "Server: OK" : `Server: Error`}
                </div>
                <button
                  onClick={checkHealth}
                  title="Ping bot server"
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.04)", color: "#9ca3af", padding: "6px 8px", borderRadius: 8, cursor: "pointer" }}
                >
                  Ping
                </button>
                <button onClick={() => setOpen(false)} style={{ background:"transparent", border:"none", color:"#9ca3af", cursor:"pointer" }} aria-label="Đóng">✕</button>
              </div>
            </div>

            {/* Messages */}
            <div ref={boxRef} style={{ background:"#071025", padding:12, maxHeight:"56vh", overflow:"auto" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {messages.map(m => <Bubble key={m.id} m={m} />)}

                {typing && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{
                      maxWidth:"60%",
                      padding:"8px 10px",
                      borderRadius:10,
                      background:"#0f1724",
                      color:"#9ca3af",
                      fontStyle:"italic"
                    }}>
                      Đang trả lời...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div style={{ padding:10, background:"#071025", borderTop:"1px solid rgba(255,255,255,0.02)", display:"flex", gap:8 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Gõ câu hỏi..."
                rows={1}
                style={{ resize:"none", padding:"10px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.03)", background:"#0b1220", color:"#fff", width:"100%", outline:"none", minHeight:38 }}
              />
              <button onClick={send} disabled={sending} style={{ background:"#ff8a00", color:"#07070a", border:"none", padding:"8px 12px", borderRadius:8, fontWeight:700, cursor:"pointer" }}>
                {sending ? "Đang..." : "Gửi"}
              </button>
            </div>

            {lastError && (
              <div style={{ padding:8, fontSize:12, color:"#fecaca", background:"#1f2937", textAlign:"center" }}>
                Lỗi: {lastError}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </>
  );
}
