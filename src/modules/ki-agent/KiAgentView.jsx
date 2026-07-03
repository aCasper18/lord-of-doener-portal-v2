import React, { useState, useEffect } from "react";
import { Check, X, Store, Loader2, ListTodo, Bot, Sparkles, BookOpen, Send, Paperclip, FileUp, CheckCircle2 } from "lucide-react";
import { C } from "../../shared/theme.js";
import { EMPLOYEES } from "../../shared/constants/employees.js";

export function KiAgentView({ knowledge, tasks, branches, setKnowledge }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hallo! Ich bin der Lord of Döner KI-Agent. Ich kenne eure Filialen, offenen Aufgaben und die Wissensdatenbank.\n\nDu kannst mir Dateien hochladen (PDF, TXT, CSV, Excel) — ich extrahiere automatisch alle relevanten Informationen und schlage dir passende Wissenseinträge vor." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCtx, setActiveCtx] = useState(["tasks", "branches", "knowledge"]);
  const [uploadedFile, setUploadedFile] = useState(null); // { name, type, content, b64 }
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = React.useRef(null);
  const bottomRef = React.useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function toggleCtx(key) {
    setActiveCtx((p) => p.includes(key) ? p.filter((k) => k !== key) : [...p, key]);
  }

  function buildSystemPrompt() {
    let sys = `Du bist der interne KI-Agent von Lord of Döner Franchising GmbH, einem Döner-Kebab-Franchise-Unternehmen mit Sitz in Köln. Du hilfst dem Management mit Aufgaben, Analysen und Wissensmanagement. Antworte immer auf Deutsch, präzise und unternehmensbezogen.`;
    if (activeCtx.includes("branches")) {
      sys += `\n\nAKTIVE FILIALEN (${branches.length}):\n`;
      branches.forEach((b) => { sys += `- ${b.name}: ${b.address} | ${b.manager} | ${b.phone}\n`; });
    }
    if (activeCtx.includes("tasks")) {
      const open = tasks.filter((t) => t.status !== "archived");
      sys += `\n\nOFFENE AUFGABEN:\n`;
      open.forEach((t) => {
        const emp = EMPLOYEES.find((e) => e.id === t.assignee);
        sys += `- [${t.status}] ${t.title} → ${emp?.name || "—"}\n`;
      });
    }
    if (activeCtx.includes("knowledge")) {
      sys += `\n\nWISSENSDATENBANK:\n`;
      knowledge.forEach((k) => { sys += `[${k.category}] ${k.title}: ${k.content}\n`; });
    }
    return sys;
  }

  // ── File reading ─────────────────────────────────────────────────────────
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isText  = file.type.startsWith("text/") || /\.(csv|txt|md)$/i.test(file.name);
    const isPdf   = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    const reader  = new FileReader();

    if (isExcel) {
      reader.onload = (ev) => {
        const buf = ev.target.result;
        function parseWithXLSX(XLSX) {
          try {
            const wb    = XLSX.read(buf, { type: "array" });
            const parts = wb.SheetNames.map((name) => {
              const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name]);
              return `=== Sheet: ${name} ===\n${csv}`;
            });
            setUploadedFile({ name: file.name, type: "text", content: parts.join("\n\n").slice(0, 40000) });
          } catch {
            setUploadedFile({ name: file.name, type: "text", content: "(Excel-Datei konnte nicht gelesen werden)" });
          }
        }
        // SheetJS ist im Artifact-Runtime als globales Objekt verfügbar
        if (window.XLSX) {
          parseWithXLSX(window.XLSX);
        } else {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
          script.onload = () => parseWithXLSX(window.XLSX);
          script.onerror = () => setUploadedFile({ name: file.name, type: "text", content: "(SheetJS konnte nicht geladen werden)" });
          document.head.appendChild(script);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (isPdf) {
      reader.onload = (ev) => {
        const b64 = ev.target.result.split(",")[1];
        setUploadedFile({ name: file.name, type: "pdf", b64, mediaType: "application/pdf" });
      };
      reader.readAsDataURL(file);
    } else if (isText) {
      reader.onload = (ev) => setUploadedFile({ name: file.name, type: "text", content: ev.target.result });
      reader.readAsText(file, "UTF-8");
    } else {
      setUploadedFile({ name: file.name, type: "text", content: "(Dateiformat nicht unterstützt)" });
    }
    e.target.value = "";
  }

  // ── Extract knowledge from file ──────────────────────────────────────────
  async function analyzeFile() {
    if (!uploadedFile || analyzing) return;
    setAnalyzing(true);

    const fileMsg = {
      role: "assistant",
      content: null,
      isFileAnalysis: true,
      fileName: uploadedFile.name,
      status: "loading",
      proposals: [],
    };
    setMessages((p) => [...p, fileMsg]);

    try {
      const extractPrompt = `Analysiere dieses Dokument sorgfältig und extrahiere ALLE relevanten Informationen als strukturierte Wissenseinträge für die Lord of Döner Franchise-Wissensdatenbank.

Antworte NUR mit einem JSON-Array, kein Text davor oder danach, keine Markdown-Backticks. Format:
[
  {
    "title": "Kurzer prägnanter Titel",
    "category": "Franchiseregeln|Prozesse|Produkte|Verträge|Kontakte|Allgemein",
    "content": "Vollständiger, klarer Inhalt des Eintrags"
  }
]

Extrahiere so viele Einträge wie sinnvoll. Jeder Eintrag soll eigenständig verständlich sein. Kategorisiere treffend nach den vorgegebenen Kategorien.`;

      let userContent;
      if (uploadedFile.type === "text") {
        // Texte und konvertierte Excel-Dateien → direkt als Text
        userContent = [
          { type: "text", text: extractPrompt + "\n\nDokument:\n" + uploadedFile.content.slice(0, 30000) }
        ];
      } else if (uploadedFile.type === "pdf") {
        // PDF → Claude Document API (Base64)
        userContent = [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: uploadedFile.b64 } },
          { type: "text", text: extractPrompt }
        ];
      } else {
        userContent = [{ type: "text", text: extractPrompt + "\n\nKein lesbarer Inhalt." }];
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system: "Du bist ein Datenextraktion-Spezialist für Lord of Döner Franchising GmbH. Antworte ausschließlich mit validem JSON.",
          messages: [{ role: "user", content: userContent }],
        }),
      });

      const data = await res.json();
      const raw = data.content?.[0]?.text || "[]";
      const clean = raw.replace(/```json|```/g, "").trim();
      const proposals = JSON.parse(clean);

      setMessages((p) =>
        p.map((m) =>
          m.isFileAnalysis && m.status === "loading"
            ? { ...m, status: "done", proposals, accepted: proposals.map((_, i) => i) }
            : m
        )
      );
    } catch (err) {
      setMessages((p) =>
        p.map((m) =>
          m.isFileAnalysis && m.status === "loading"
            ? { ...m, status: "error", proposals: [] }
            : m
        )
      );
    } finally {
      setAnalyzing(false);
      setUploadedFile(null);
    }
  }

  function toggleProposal(msgIdx, propIdx) {
    setMessages((p) =>
      p.map((m, i) =>
        i !== msgIdx ? m : {
          ...m,
          accepted: m.accepted.includes(propIdx)
            ? m.accepted.filter((x) => x !== propIdx)
            : [...m.accepted, propIdx],
        }
      )
    );
  }

  function importProposals(msg) {
    const toAdd = msg.proposals
      .filter((_, i) => msg.accepted.includes(i))
      .map((p, i) => ({ ...p, id: "k_" + Date.now() + "_" + i }));
    setKnowledge((prev) => [...prev, ...toAdd]);
    setMessages((p) =>
      p.map((m) => (m === msg ? { ...m, status: "imported" } : m))
    );
  }

  // ── Normal chat send ─────────────────────────────────────────────────────
  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg = { role: "user", content: text };
    const history = [...messages.filter((m) => !m.isFileAnalysis), userMsg];
    setMessages((p) => [...p, userMsg]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((p) => [...p, { role: "assistant", content: data.content?.[0]?.text || "Keine Antwort." }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Verbindungsfehler." }]);
    } finally {
      setLoading(false);
    }
  }

  const CTX_ITEMS = [
    { key: "tasks", label: "Aufgaben", icon: ListTodo },
    { key: "branches", label: "Filialen", icon: Store },
    { key: "knowledge", label: "Wissensdatenbank", icon: BookOpen },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

      {/* Context sidebar */}
      <div style={{ width: 224, flexShrink: 0, borderRight: `1px solid ${C.panelBorder}`, padding: "24px 14px", display: "flex", flexDirection: "column", gap: 4, background: "#0D0D0D" }}>
        <div style={{ color: C.textDim, fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Kontext des Agenten</div>
        {CTX_ITEMS.map(({ key, label, icon: Icon }) => {
          const on = activeCtx.includes(key);
          return (
            <button key={key} onClick={() => toggleCtx(key)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 8, border: `1px solid ${on ? C.orange + "55" : C.panelBorder}`, background: on ? "#1e1a14" : "transparent", cursor: "pointer" }}>
              <Icon size={14} color={on ? C.orange : C.textDim} />
              <span style={{ color: on ? C.text : C.textDim, fontSize: 13 }}>{label}</span>
              <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: on ? C.orange : "#2a2a2a" }} />
            </button>
          );
        })}

        <div style={{ marginTop: 16, padding: "12px", background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 9 }}>
          <div style={{ color: C.textDim, fontSize: 10.5, marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>Aktiver Kontext</div>
          {activeCtx.includes("branches") && <div style={{ color: C.text, fontSize: 11.5, marginBottom: 3 }}>✓ {branches.length} Filialen</div>}
          {activeCtx.includes("tasks") && <div style={{ color: C.text, fontSize: 11.5, marginBottom: 3 }}>✓ {tasks.filter((t) => t.status !== "archived").length} Aufgaben</div>}
          {activeCtx.includes("knowledge") && <div style={{ color: C.text, fontSize: 11.5 }}>✓ {knowledge.length} Wissenseinträge</div>}
        </div>

        <div style={{ marginTop: 12, padding: "11px 12px", background: "#0D1A14", border: `1px solid #1a3a2a`, borderRadius: 9 }}>
          <div style={{ color: "#5FBF6E", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>Datei-Analyse</div>
          <div style={{ color: C.textDim, fontSize: 11.5, lineHeight: 1.5 }}>Lade PDF, TXT, CSV oder Excel hoch — der Agent extrahiert Wissen automatisch.</div>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.panelBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "#1e1a14", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={18} color={C.orange} />
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>Lord of Döner KI-Agent</div>
            <div style={{ color: C.textDim, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} /> Claude · {activeCtx.length} Kontexte aktiv
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((m, msgIdx) => {
            // ── File analysis message ──────────────────────────────────────
            if (m.isFileAnalysis) {
              return (
                <div key={msgIdx} style={{ background: C.panel, border: `1px solid ${m.status === "error" ? "#E0664B55" : C.orange + "44"}`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <FileUp size={15} color={C.orange} />
                    <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{m.fileName}</span>
                    {m.status === "loading" && <Loader2 size={13} color={C.orange} style={{ marginLeft: "auto", animation: "spin 1s linear infinite" }} />}
                    {m.status === "done" && <span style={{ marginLeft: "auto", color: C.green, fontSize: 11.5, fontWeight: 700 }}>{m.proposals.length} Einträge extrahiert</span>}
                    {m.status === "imported" && <span style={{ marginLeft: "auto", color: C.green, fontSize: 11.5, fontWeight: 700 }}>✓ In Wissensdatenbank übernommen</span>}
                    {m.status === "error" && <span style={{ marginLeft: "auto", color: "#E0664B", fontSize: 11.5 }}>Fehler beim Analysieren</span>}
                  </div>

                  {m.status === "loading" && (
                    <div style={{ color: C.textDim, fontSize: 12.5 }}>Agent liest das Dokument und extrahiert relevante Informationen…</div>
                  )}

                  {(m.status === "done" || m.status === "imported") && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: m.status === "done" ? 14 : 0 }}>
                        {m.proposals.map((p, pi) => {
                          const selected = m.accepted.includes(pi);
                          return (
                            <div
                              key={pi}
                              onClick={() => m.status === "done" && toggleProposal(msgIdx, pi)}
                              style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${selected ? C.orange + "66" : C.panelBorder}`, background: selected ? "#1a1611" : "#0F0F0F", cursor: m.status === "done" ? "pointer" : "default" }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.orange, border: `1px solid ${C.orange}44`, borderRadius: 5, padding: "1px 6px" }}>{p.category}</span>
                                <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{p.title}</span>
                                {m.status === "done" && (
                                  <div style={{ marginLeft: "auto", width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${selected ? C.orange : C.panelBorder}`, background: selected ? C.orange : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {selected && <Check size={10} color="#0A0A0B" />}
                                  </div>
                                )}
                              </div>
                              <div style={{ color: C.textDim, fontSize: 12, lineHeight: 1.5 }}>{p.content}</div>
                            </div>
                          );
                        })}
                      </div>
                      {m.status === "done" && (
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            onClick={() => setMessages((p) => p.map((msg, i) => i !== msgIdx ? msg : { ...msg, accepted: msg.proposals.map((_, x) => x) }))}
                            style={{ fontSize: 12, fontWeight: 600, color: C.textDim, background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 7, padding: "6px 12px", cursor: "pointer" }}
                          >Alle auswählen</button>
                          <button
                            onClick={() => setMessages((p) => p.map((msg, i) => i !== msgIdx ? msg : { ...msg, accepted: [] }))}
                            style={{ fontSize: 12, fontWeight: 600, color: C.textDim, background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 7, padding: "6px 12px", cursor: "pointer" }}
                          >Keine</button>
                          <button
                            disabled={m.accepted.length === 0}
                            onClick={() => importProposals(m)}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: m.accepted.length > 0 ? C.orange : "#2a2a2a", border: "none", borderRadius: 7, padding: "8px 14px", color: m.accepted.length > 0 ? "#0A0A0B" : C.textDim, fontWeight: 700, fontSize: 13, cursor: m.accepted.length > 0 ? "pointer" : "not-allowed" }}
                          >
                            <CheckCircle2 size={14} /> {m.accepted.length} Einträge in Wissensdatenbank übernehmen
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            }

            // ── Normal message ─────────────────────────────────────────────
            return (
              <div key={msgIdx} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && (
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1e1a14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 10, marginTop: 2 }}>
                    <Bot size={14} color={C.orange} />
                  </div>
                )}
                <div style={{ maxWidth: "70%", padding: "11px 14px", borderRadius: 12, background: m.role === "user" ? C.orange : C.panel, border: m.role === "user" ? "none" : `1px solid ${C.panelBorder}`, color: m.role === "user" ? "#0A0A0B" : C.text, fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                  {m.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1e1a14", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={14} color={C.orange} />
              </div>
              <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <Loader2 size={14} color={C.orange} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ color: C.textDim, fontSize: 13 }}>Agent denkt…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts — only on fresh chat */}
        {messages.length <= 1 && (
          <div style={{ padding: "0 24px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Welche Aufgaben sind offen?", "Was ist die Franchisegebühr?", "Wer leitet die Filiale in Essen?", "Wie läuft das Beschwerdemanagement?"].map((s) => (
              <button key={s} onClick={() => setInput(s)} style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "7px 12px", color: C.textDim, fontSize: 12, cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* File preview bar */}
        {uploadedFile && (
          <div style={{ margin: "0 24px 8px", padding: "10px 14px", background: "#0D1A14", border: `1px solid #1a3a2a`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <FileUp size={15} color={C.green} />
            <span style={{ color: C.text, fontSize: 13, flex: 1 }}>{uploadedFile.name}</span>
            <button
              onClick={analyzeFile}
              disabled={analyzing}
              style={{ display: "flex", alignItems: "center", gap: 6, background: C.orange, border: "none", borderRadius: 7, padding: "7px 14px", color: "#0A0A0B", fontWeight: 700, fontSize: 12.5, cursor: analyzing ? "default" : "pointer" }}
            >
              {analyzing ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={13} />}
              Analysieren & extrahieren
            </button>
            <button onClick={() => setUploadedFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim }}><X size={15} /></button>
          </div>
        )}

        {/* Input row */}
        <div style={{ padding: "12px 24px 18px", borderTop: `1px solid ${C.panelBorder}`, display: "flex", gap: 10 }}>
          <input type="file" ref={fileInputRef} accept=".pdf,.txt,.csv,.md,.xlsx,.xls" style={{ display: "none" }} onChange={handleFileSelect} />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Datei hochladen und analysieren"
            style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 10, padding: "0 14px", color: C.textDim, cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <Paperclip size={16} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Frage stellen — oder Datei per 📎 hochladen…"
            style={{ flex: 1, background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 10, padding: "12px 14px", color: C.text, fontSize: 14, outline: "none" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{ background: input.trim() && !loading ? C.orange : "#2a2a2a", border: "none", borderRadius: 10, padding: "0 18px", color: input.trim() && !loading ? "#0A0A0B" : C.textDim, cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center" }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
