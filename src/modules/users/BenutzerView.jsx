import React, { useState, useEffect } from "react";
import { X, Loader2, Users, Plus, Trash2 } from "lucide-react";
import { C } from "../../shared/theme.js";
import { apiFetch } from "../../api/client.js";
import { usePolling } from "../../hooks/usePolling.js";

export const ROLES = [
  { key: "super-admin", label: "Super Admin", color: "#D91B1B" },
  { key: "employee", label: "Mitarbeiter", color: "#4A7FC1" },
  { key: "branch", label: "Filialleitung", color: "#3D9E5C" },
  { key: "operations", label: "Operations", color: "#8A6FC1" },
];

const DEMO_USERS_INITIAL = [
  { id: 1, name: "Super Admin", email: "admin@lordofdoner.com", role: "super-admin", initials: "SA", branch: "Zentrale" },
  { id: 2, name: "Ayse Kaya", email: "ayse@lordofdoner.com", role: "branch", initials: "AK", branch: "Koeln-Mitte" },
  { id: 3, name: "Murat Oezkan", email: "murat@lordofdoner.com", role: "branch", initials: "MO", branch: "Ehrenfeld" },
  { id: 4, name: "Lena Brandt", email: "lena@lordofdoner.com", role: "employee", initials: "LB", branch: "Franchise-Support" },
  { id: 5, name: "Serdal Cevik", email: "serdal@lordofdoner.com", role: "operations", initials: "SC", branch: "Operations" },
];


function UserModal({ user, onClose, onSave }) {
  const isEdit = !!user;
  const [form, setForm] = React.useState(user || { name: "", email: "", password: "", role: "employee", initials: "", branch: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const up = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const method = isEdit ? "PUT" : "POST";
      const path = isEdit ? "/users/" + user.id : "/users";
      const data = await apiFetch(path, { method, body: JSON.stringify(form) });
      onSave(data, isEdit);
    } catch (err) {
      setError(err.message || "Speichern fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  const canSave = form.name.trim() && form.email.trim() && (isEdit || form.password.trim());

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ width: 24, height: 3, background: "#D91B1B", marginBottom: 8 }} />
            <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0 }}>{isEdit ? "Benutzer bearbeiten" : "Neuen Benutzer anlegen"}</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#444" }}><X size={18} /></button>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 2 }}>
            <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Name</label>
            <input value={form.name} onChange={(e) => up("name", e.target.value)} style={{ width: "100%", boxSizing: "border-box", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 14 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Kuerzel</label>
            <input value={form.initials} onChange={(e) => up("initials", e.target.value.toUpperCase().slice(0, 3))} placeholder="AK" style={{ width: "100%", boxSizing: "border-box", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em" }} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>E-Mail</label>
          <input value={form.email} onChange={(e) => up("email", e.target.value)} type="email" style={{ width: "100%", boxSizing: "border-box", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 14 }} />
        </div>
        {!isEdit && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Passwort</label>
            <input value={form.password} onChange={(e) => up("password", e.target.value)} type="password" style={{ width: "100%", boxSizing: "border-box", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 14 }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Rolle</label>
            <select value={form.role} onChange={(e) => up("role", e.target.value)} style={{ width: "100%", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 14 }}>
              {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Bereich</label>
            <input value={form.branch} onChange={(e) => up("branch", e.target.value)} placeholder="z.B. Koeln-Mitte" style={{ width: "100%", boxSizing: "border-box", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 14 }} />
          </div>
        </div>
        {error && (
          <div style={{ color: "#D91B1B", fontSize: 12.5, marginBottom: 14 }}>{error}</div>
        )}
        <button disabled={!canSave || loading} onClick={handleSave} style={{ width: "100%", background: canSave && !loading ? "#D91B1B" : "#1A1A1A", border: "none", borderRadius: 6, padding: "13px", color: canSave && !loading ? "#fff" : "#444", fontWeight: 800, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", cursor: canSave && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
          {isEdit ? "Speichern" : "Anlegen"}
        </button>
      </div>
    </div>
  );
}

export function BenutzerView({ currentUser }) {
  const [users, setUsers] = React.useState(DEMO_USERS_INITIAL);
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal] = React.useState(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [search, setSearch] = React.useState("");

  function loadUsers() {
    apiFetch("/users")
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch((err) => console.error("Konnte Benutzer nicht laden:", err))
      .finally(() => setLoading(false));
  }

  usePolling(loadUsers, 20000);

  function handleSave(user, isEdit) {
    if (isEdit) {
      setUsers((p) => p.map((u) => (u.id === user.id ? { ...u, ...user } : u)));
    } else {
      setUsers((p) => [...p, user]);
    }
    setModal(null);
  }

  async function handleDelete(id) {
    try {
      await apiFetch("/users/" + id, { method: "DELETE" });
      setUsers((p) => p.filter((u) => u.id !== id));
    } catch (err) {
      console.error(`Benutzer ${id} konnte nicht geloescht werden:`, err);
    }
    setDeleteConfirm(null);
  }

  const filtered = users.filter((u) =>
    !search || (u.name && u.name.toLowerCase().includes(search.toLowerCase())) || (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: "32px 36px", fontFamily: "Helvetica Neue, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ width: 28, height: 3, background: "#D91B1B", marginBottom: 10 }} />
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 4px 0" }}>Benutzerverwaltung</h1>
          <p style={{ color: "#555", fontSize: 13, margin: 0 }}>Mitarbeiter anlegen, Rollen vergeben und Zugaenge verwalten.</p>
        </div>
        {currentUser && currentUser.isAdmin && (
          <button onClick={() => setModal("new")} style={{ display: "flex", alignItems: "center", gap: 8, background: "#D91B1B", border: "none", borderRadius: 6, padding: "11px 18px", color: "#fff", fontWeight: 800, fontSize: 12.5, letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer" }}>
            <Plus size={14} /> Benutzer anlegen
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120, background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "16px 18px" }}>
          <div style={{ color: "#555", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Gesamt</div>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>{users.length}</div>
        </div>
        {ROLES.map((r) => (
          <div key={r.key} style={{ flex: 1, minWidth: 120, background: "#111", border: "1px solid " + r.color + "22", borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ color: "#555", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{r.label}</div>
            <div style={{ color: r.color, fontSize: 28, fontWeight: 800 }}>{users.filter((u) => u.role === r.key).length}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16, position: "relative" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen nach Name oder E-Mail..." style={{ width: "100%", boxSizing: "border-box", background: "#111", border: "1px solid #1E1E1E", borderRadius: 6, padding: "10px 14px 10px 38px", color: "#fff", fontSize: 13 }} />
        <Users size={14} color="#444" style={{ position: "absolute", left: 13, top: 12 }} />
      </div>

      <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 1.5fr 1.5fr auto", padding: "11px 20px", borderBottom: "1px solid #1A1A1A", background: "#0D0D0D" }}>
          {["Benutzer", "E-Mail", "Rolle", "Bereich", ""].map((h) => (
            <div key={h} style={{ color: "#444", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {loading && <div style={{ padding: 32, textAlign: "center", color: "#444", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Wird geladen...</div>}
        {!loading && filtered.map((u, idx) => {
          const roleInfo = ROLES.find((r) => r.key === u.role) || { label: u.role, color: "#555" };
          const isSelf = currentUser && u.email === currentUser.email;
          return (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 1.5fr 1.5fr auto", padding: "14px 20px", borderBottom: idx < filtered.length - 1 ? "1px solid #141414" : "none", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 4, background: u.role === "super-admin" ? "#D91B1B" : "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                  {(u.initials || (u.name ? u.name.slice(0, 2) : "??")).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{u.name} {isSelf && <span style={{ color: "#555", fontSize: 10.5, fontWeight: 400 }}>(du)</span>}</div>
                </div>
              </div>
              <div style={{ color: "#666", fontSize: 12.5 }}>{u.email}</div>
              <div><span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: roleInfo.color, border: "1px solid " + roleInfo.color + "33", borderRadius: 3, padding: "3px 7px" }}>{roleInfo.label}</span></div>
              <div style={{ color: "#555", fontSize: 12.5 }}>{u.branch || "—"}</div>
              {currentUser && currentUser.isAdmin && !isSelf ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setModal(u)} style={{ background: "none", border: "1px solid #1E1E1E", borderRadius: 5, padding: "5px 10px", color: "#888", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Bearbeiten</button>
                  <button onClick={() => setDeleteConfirm(u)} style={{ background: "none", border: "1px solid #1E1E1E", borderRadius: 5, padding: "5px 8px", color: "#D91B1B", fontSize: 11, cursor: "pointer" }}><Trash2 size={12} /></button>
                </div>
              ) : <div />}
            </div>
          );
        })}
        {!loading && filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#444", fontSize: 13 }}>Keine Benutzer gefunden.</div>}
      </div>

      {modal && <UserModal user={modal === "new" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setDeleteConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: 28, maxWidth: 360, width: "100%" }}>
            <div style={{ width: 24, height: 3, background: "#D91B1B", marginBottom: 12 }} />
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 800, margin: "0 0 8px 0" }}>Benutzer loeschen?</h3>
            <p style={{ color: "#666", fontSize: 13, margin: "0 0 22px 0" }}><strong style={{ color: "#fff" }}>{deleteConfirm.name}</strong> wird unwiderruflich geloescht.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, background: "none", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px", color: "#666", fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} style={{ flex: 1, background: "#D91B1B", border: "none", borderRadius: 6, padding: "11px", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Loeschen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
