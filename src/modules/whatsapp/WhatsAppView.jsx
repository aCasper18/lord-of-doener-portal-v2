import React, { useState } from "react";
import { MessageCircle, Send, ArrowLeft, Loader2 } from "lucide-react";
import { C } from "../../shared/theme.js";
import { apiFetch } from "../../api/client.js";
import { usePolling } from "../../hooks/usePolling.js";

function formatTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function ConversationThread({ conversation, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function loadMessages() {
    apiFetch(`/whatsapp/conversations/${conversation.id}/messages`)
      .then((data) => { if (Array.isArray(data)) setMessages(data); })
      .catch((err) => console.error("Konnte WhatsApp-Nachrichten nicht laden:", err))
      .finally(() => setLoading(false));
  }

  usePolling(loadMessages, 15000);

  async function send() {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError("");
    try {
      const message = await apiFetch(`/whatsapp/conversations/${conversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      setError(err.message || "Nachricht konnte nicht gesendet werden.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <button
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.textDim, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 18 }}
      >
        <ArrowLeft size={14} /> Zurück zu WhatsApp
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1d1d1d", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MessageCircle size={18} color={C.green} />
        </div>
        <div>
          <h1 style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: 0 }}>{conversation.contactName || conversation.phoneNumber}</h1>
          <p style={{ color: C.textDim, fontSize: 12, margin: "2px 0 0 0" }}>{conversation.phoneNumber}</p>
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: 20, minHeight: 300, display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {!loading && messages.length === 0 && (
          <div style={{ color: C.textDim, fontSize: 13, textAlign: "center", padding: "30px 0" }}>Noch keine Nachrichten.</div>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.direction === "out" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "70%", padding: "9px 12px", borderRadius: 10,
              background: m.direction === "out" ? C.orange : "#1d1d1d",
              color: m.direction === "out" ? "#0A0A0B" : C.text,
            }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>{m.body}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: "right" }}>{formatTime(m.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>

      {error && <div style={{ color: "#E0664B", fontSize: 13, marginBottom: 10 }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Nachricht schreiben…"
          style={{ flex: 1, background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "11px 14px", color: C.text, fontSize: 14 }}
        />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          style={{ display: "flex", alignItems: "center", gap: 6, background: C.orange, border: "none", borderRadius: 8, padding: "0 18px", color: "#0A0A0B", fontWeight: 700, fontSize: 13, cursor: sending || !draft.trim() ? "not-allowed" : "pointer", opacity: sending || !draft.trim() ? 0.6 : 1 }}
        >
          {sending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
          Senden
        </button>
      </div>
    </div>
  );
}

export function WhatsAppView() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openConversation, setOpenConversation] = useState(null);

  function loadConversations() {
    apiFetch("/whatsapp/conversations")
      .then((data) => { if (Array.isArray(data)) setConversations(data); })
      .catch((err) => console.error("Konnte WhatsApp-Konversationen nicht laden:", err))
      .finally(() => setLoading(false));
  }

  usePolling(loadConversations, 15000);

  if (openConversation) {
    return <ConversationThread conversation={openConversation} onBack={() => setOpenConversation(null)} />;
  }

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, margin: "0 0 6px 0" }}>WhatsApp</h1>
        <p style={{ color: C.textDim, fontSize: 14, margin: 0 }}>
          Eingehende Konversationen ueber die WhatsApp Business Cloud API.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div style={{ background: C.panel, border: `1px dashed ${C.panelBorder}`, borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
          <MessageCircle size={22} color={C.textDim} style={{ marginBottom: 10 }} />
          <div style={{ color: C.textDim, fontSize: 14 }}>
            {loading ? "Lade Konversationen…" : "Noch keine Konversationen. Sobald jemand eine WhatsApp-Nachricht schickt, erscheint sie hier."}
          </div>
        </div>
      ) : (
        <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, overflow: "hidden" }}>
          {conversations.map((c, idx) => (
            <div
              key={c.id}
              onClick={() => setOpenConversation(c)}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer",
                borderBottom: idx < conversations.length - 1 ? `1px solid ${C.panelBorder}` : "none",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "#1d1d1d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MessageCircle size={16} color={C.green} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{c.contactName || c.phoneNumber}</div>
                <div style={{ color: C.textDim, fontSize: 12 }}>{c.phoneNumber}</div>
              </div>
              <div style={{ color: C.textDim, fontSize: 11 }}>{formatTime(c.lastMessageAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
