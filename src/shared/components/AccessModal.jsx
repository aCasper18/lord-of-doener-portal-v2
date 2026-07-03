import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { C } from "../theme.js";
import { Avatar } from "./Avatar.jsx";
import { EMPLOYEES } from "../constants/employees.js";

export function AccessModal({ integration, onClose, onSave }) {
  const [selected, setSelected] = useState(integration.access);

  function toggle(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>Zugriff: {integration.name}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim }}><X size={18} /></button>
        </div>
        <p style={{ color: C.textDim, fontSize: 13, margin: "0 0 18px 0" }}>Wer darf diese Integration nutzen?</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {EMPLOYEES.map((u) => {
            const checked = selected.includes(u.id);
            return (
              <button
                key={u.id}
                onClick={() => toggle(u.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  borderRadius: 8, border: `1px solid ${checked ? C.orange + "66" : C.panelBorder}`,
                  background: checked ? "#1e1a14" : "#121212", cursor: "pointer", textAlign: "left",
                }}
              >
                <Avatar initials={u.initials} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                  <div style={{ color: C.textDim, fontSize: 11 }}>{u.role}</div>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${checked ? C.orange : C.panelBorder}`,
                  background: checked ? C.orange : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {checked && <Check size={12} color="#0A0A0B" />}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onSave(selected)}
          style={{ width: "100%", background: C.orange, border: "none", borderRadius: 8, padding: "11px", color: "#0A0A0B", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Speichern
        </button>
      </div>
    </div>
  );
}
