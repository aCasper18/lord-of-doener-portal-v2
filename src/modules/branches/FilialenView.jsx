import React, { useState, useEffect } from "react";
import { X, Plus, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { C } from "../../shared/theme.js";
import { StatCard } from "../../shared/components/StatCard.jsx";
import { apiFetch } from "../../api/client.js";
import { usePolling } from "../../hooks/usePolling.js";

const BRANCH_STATUS = {
  active: { label: "Aktiv", color: C.green },
  in_eroeffnung: { label: "In Eröffnung", color: C.blue },
  pausiert: { label: "Pausiert", color: "#C97A4B" },
};



function BranchFormModal({ branch, onClose, onSave }) {
  const isEdit = !!branch;
  const [form, setForm] = useState(
    branch || { name: "", address: "", manager: "", phone: "", altContact: "", status: "in_eroeffnung" }
  );

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{isEdit ? "Filiale bearbeiten" : "Neue Filiale"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim }}><X size={18} /></button>
        </div>

        {[
          { key: "name", label: "Name" },
          { key: "address", label: "Adresse" },
          { key: "manager", label: "Inhaber / Kontaktperson" },
          { key: "phone", label: "Telefon" },
          { key: "altContact", label: "Alternativkontakt (optional)" },
        ].map((f) => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>{f.label}</label>
            <input
              value={form[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14 }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>Status</label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            style={{ width: "100%", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14 }}
          >
            {Object.entries(BRANCH_STATUS).map(([key, s]) => (
              <option key={key} value={key}>{s.label}</option>
            ))}
          </select>
        </div>

        <button
          disabled={!form.name.trim()}
          onClick={() => onSave(form)}
          style={{ width: "100%", background: form.name.trim() ? C.orange : "#2a2a2a", border: "none", borderRadius: 8, padding: "11px", color: form.name.trim() ? "#0A0A0B" : C.textDim, fontWeight: 700, fontSize: 14, cursor: form.name.trim() ? "pointer" : "not-allowed" }}
        >
          {isEdit ? "Speichern" : "Filiale anlegen"}
        </button>
      </div>
    </div>
  );
}

export function FilialenView() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(null); // null | "new" | branch object
  const [error, setError] = useState("");

  function loadBranches() {
    apiFetch("/branches")
      .then((data) => { if (Array.isArray(data)) setBranches(data); })
      .catch((err) => console.error("Konnte Filialen nicht laden:", err))
      .finally(() => setLoading(false));
  }

  usePolling(loadBranches, 20000);

  const activeCount = branches.filter((b) => b.status === "active").length;
  const inOpeningCount = branches.filter((b) => b.status === "in_eroeffnung").length;
  const pausedCount = branches.filter((b) => b.status === "pausiert").length;

  async function saveBranch(data) {
    setError("");
    try {
      if (data.id) {
        const updated = await apiFetch(`/branches/${data.id}`, { method: "PUT", body: JSON.stringify(data) });
        setBranches((prev) => prev.map((b) => (b.id === data.id ? updated : b)));
      } else {
        const created = await apiFetch("/branches", { method: "POST", body: JSON.stringify(data) });
        setBranches((prev) => [...prev, created]);
      }
      setModalState(null);
    } catch (err) {
      setError(err.message || "Filiale konnte nicht gespeichert werden.");
    }
  }

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, margin: "0 0 6px 0" }}>Filialen</h1>
          <p style={{ color: C.textDim, fontSize: 14, margin: 0 }}>Alle Standorte im Franchise-Netzwerk im Überblick.</p>
        </div>
        <button
          onClick={() => setModalState("new")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: C.orange, border: "none", borderRadius: 8, padding: "10px 16px", color: "#0A0A0B", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          <Plus size={15} /> Filiale anlegen
        </button>
      </div>

      {error && <div style={{ color: "#E0664B", fontSize: 13, marginBottom: 14 }}>{error}</div>}

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Filialen Gesamt" value={String(branches.length)} sub={<span style={{ color: C.textDim }}>Im Netzwerk</span>} />
        <StatCard label="Aktiv" value={String(activeCount)} sub={<span style={{ color: C.green }}>Im laufenden Betrieb</span>} />
        <StatCard label="In Eröffnung" value={String(inOpeningCount)} sub={<span style={{ color: C.blue }}>In Vorbereitung</span>} />
        <StatCard label="Pausiert" value={String(pausedCount)} sub={<span style={{ color: "#C97A4B" }}>Aktuell ohne Betrieb</span>} />
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.4fr 1fr 0.8fr", padding: "12px 20px", borderBottom: `1px solid ${C.panelBorder}` }}>
          {["Filiale", "Inhaber / Kontaktperson", "Telefon", "Status", ""].map((h) => (
            <div key={h} style={{ color: C.textDim, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {branches.map((b) => {
          const status = BRANCH_STATUS[b.status];
          return (
            <div
              key={b.id}
              style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.4fr 1fr 0.8fr", padding: "16px 20px", borderBottom: `1px solid ${C.panelBorder}`, alignItems: "center" }}
            >
              <div>
                <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                <div style={{ color: C.textDim, fontSize: 12, display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                  <MapPin size={11} /> {b.address}
                </div>
              </div>
              <div style={{ color: b.manager === "—" ? C.textDim : C.text, fontSize: 13 }}>{b.manager}</div>
              <div>
                <div style={{ color: C.textDim, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                  {b.phone !== "—" && <Phone size={11} />} {b.phone}
                </div>
                {b.altContact && (
                  <div style={{ color: C.textDim, fontSize: 11, marginTop: 3, opacity: 0.75 }}>
                    {b.altContact}
                  </div>
                )}
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: status.color, border: `1px solid ${status.color}55`, borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap" }}>
                  {status.label}
                </span>
              </div>
              <button
                onClick={() => setModalState(b)}
                style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 7, padding: "6px 10px", color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer", justifySelf: "start" }}
              >
                Details <ArrowUpRight size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {modalState && (
        <BranchFormModal
          branch={modalState === "new" ? null : modalState}
          onClose={() => setModalState(null)}
          onSave={saveBranch}
        />
      )}
    </div>
  );
}

// ─── BENUTZERVERWALTUNG ──────────────────────────────────────────────────────
