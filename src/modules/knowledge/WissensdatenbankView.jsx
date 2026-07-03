import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2 } from "lucide-react";
import { C } from "../../shared/theme.js";
import { apiFetch } from "../../api/client.js";
import { usePolling } from "../../hooks/usePolling.js";

const KNOWLEDGE_CATEGORIES = ["Franchiseregeln", "Prozesse", "Produkte", "Verträge", "Kontakte", "Allgemein"];


function WissensModal({ entry, onClose, onSave }) {
  const isEdit = !!entry;
  const [form, setForm] = useState(entry || { title: "", category: "Allgemein", content: "" });
  const up = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const canSave = form.title.trim() && form.content.trim();
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{isEdit ? "Eintrag bearbeiten" : "Neuer Eintrag"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim }}><X size={18} /></button>
        </div>
        {[{ key: "title", label: "Titel", type: "input" }].map((f) => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>{f.label}</label>
            <input value={form[f.key]} onChange={(e) => up(f.key, e.target.value)} style={{ width: "100%", boxSizing: "border-box", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14 }} />
          </div>
        ))}
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>Kategorie</label>
          <select value={form.category} onChange={(e) => up("category", e.target.value)} style={{ width: "100%", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14 }}>
            {KNOWLEDGE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>Inhalt</label>
          <textarea value={form.content} onChange={(e) => up("content", e.target.value)} rows={5} style={{ width: "100%", boxSizing: "border-box", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, lineHeight: 1.5, fontFamily: "inherit", resize: "vertical" }} />
        </div>
        <button disabled={!canSave} onClick={() => canSave && onSave(form)} style={{ width: "100%", background: canSave ? C.orange : "#2a2a2a", border: "none", borderRadius: 8, padding: "11px", color: canSave ? "#0A0A0B" : C.textDim, fontWeight: 700, fontSize: 14, cursor: canSave ? "pointer" : "not-allowed" }}>
          {isEdit ? "Speichern" : "Eintrag hinzufügen"}
        </button>
      </div>
    </div>
  );
}

export function WissensdatenbankView() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("Alle");
  const [error, setError] = useState("");
  const categories = ["Alle", ...KNOWLEDGE_CATEGORIES];

  function loadEntries() {
    apiFetch("/knowledge")
      .then((data) => { if (Array.isArray(data)) setEntries(data); })
      .catch((err) => console.error("Konnte Wissensdatenbank nicht laden:", err))
      .finally(() => setLoading(false));
  }

  usePolling(loadEntries, 20000);

  async function save(data) {
    setError("");
    try {
      if (data.id) {
        const updated = await apiFetch(`/knowledge/${data.id}`, { method: "PUT", body: JSON.stringify(data) });
        setEntries((p) => p.map((e) => (e.id === data.id ? updated : e)));
      } else {
        const created = await apiFetch("/knowledge", { method: "POST", body: JSON.stringify(data) });
        setEntries((p) => [created, ...p]);
      }
      setModal(null);
    } catch (err) {
      setError(err.message || "Eintrag konnte nicht gespeichert werden.");
    }
  }

  async function del(id) {
    const previous = entries;
    setEntries((p) => p.filter((e) => e.id !== id));
    try {
      await apiFetch(`/knowledge/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(`Eintrag ${id} konnte nicht geloescht werden:`, err);
      setEntries(previous);
    }
  }

  const visible = filter === "Alle" ? entries : entries.filter((e) => e.category === filter);

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, margin: "0 0 6px 0" }}>Wissensdatenbank</h1>
          <p style={{ color: C.textDim, fontSize: 14, margin: 0 }}>Unternehmens-Wissen für den KI-Agenten — alles, was er wissen muss, um richtig zu antworten.</p>
        </div>
        <button onClick={() => setModal("new")} style={{ display: "flex", alignItems: "center", gap: 8, background: C.orange, border: "none", borderRadius: 8, padding: "10px 16px", color: "#0A0A0B", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Plus size={15} /> Eintrag hinzufügen
        </button>
      </div>

      {error && <div style={{ color: "#E0664B", fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)} style={{ background: filter === c ? C.ash : "transparent", border: `1px solid ${C.panelBorder}`, borderRadius: 999, padding: "6px 14px", color: filter === c ? C.text : C.textDim, fontSize: 12, cursor: "pointer" }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {visible.length === 0 && <div style={{ color: C.textDim, fontSize: 13, padding: "30px 0", textAlign: "center" }}>Keine Einträge in dieser Kategorie.</div>}
        {visible.map((e) => (
          <div key={e.id} style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.orange, border: `1px solid ${C.orange}44`, borderRadius: 5, padding: "2px 7px", marginRight: 8 }}>{e.category}</span>
                <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{e.title}</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => setModal(e)} style={{ background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 7, padding: "5px 10px", color: C.text, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  <Edit2 size={11} /> Bearbeiten
                </button>
                <button onClick={() => del(e.id)} style={{ background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 7, padding: "5px 10px", color: "#E0664B", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
            <div style={{ color: C.textDim, fontSize: 13, lineHeight: 1.55 }}>{e.content}</div>
          </div>
        ))}
      </div>

      {modal && <WissensModal entry={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}

// ─── KI-AGENT ────────────────────────────────────────────────────────────────
