import React, { useState, useEffect } from "react";
import { Mail, Server, Loader2 } from "lucide-react";
import { LOGO_SRC } from "../../shared/logo.js";
import { apiFetch } from "../../api/client.js";

export function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim()) { setError("Bitte E-Mail eingeben."); return; }
    if (!password.trim()) { setError("Bitte Passwort eingeben."); return; }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLogin({ ...data.user, isAdmin: data.user.role === "super-admin" || data.user.role === "Super Admin" }, data.token);
    } catch (err) {
      if (err.status === 401) {
        setError("E-Mail oder Passwort ist falsch.");
      } else if (err.status) {
        setError("Anmeldung fehlgeschlagen. Bitte später erneut versuchen.");
      } else {
        setError("Keine Verbindung zum Server. Bitte Internetverbindung prüfen.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      display: "flex",
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #111 inset !important; -webkit-text-fill-color: #fff !important; }
        ::placeholder { color: #3a3a3a; }
        input:focus { outline: none; border-color: #D91B1B !important; }
      `}</style>

      {/* Left panel — branding */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "#000", borderRight: "1px solid #1a1a1a", padding: 60,
      }}>
        <img src={LOGO_SRC} alt="Lord of Döner" style={{ width: 280, marginBottom: 48, display: "block" }} />
        <div style={{ width: 40, height: 3, background: "#D91B1B", marginBottom: 28 }} />
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 10px 0", letterSpacing: "-0.01em", textAlign: "center" }}>
          Internes Management-Portal
        </h2>
        <p style={{ color: "#555", fontSize: 14, margin: 0, textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>
          Zentrales System für Filialverwaltung, Aufgaben, KI-Agent und Wissensdatenbank.
        </p>

        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 280 }}>
          {[
            { label: "Aktive Filialen", value: "15" },
            { label: "Franchisepartner", value: "12" },
            { label: "Städte", value: "10" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
              <span style={{ color: "#555", fontSize: 13 }}>{s.label}</span>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{
        width: 440, flexShrink: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "60px 48px",
        background: "#0A0A0A",
      }}>
        <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ width: 32, height: 4, background: "#D91B1B", marginBottom: 16 }} />
              <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>Anmelden</h1>
              <p style={{ color: "#555", fontSize: 14, margin: 0 }}>Willkommen zurück.</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>E-Mail</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="name@lordofdoner.com"
                type="email"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#111", border: "1px solid #222",
                  borderRadius: 6, padding: "14px 16px",
                  color: "#fff", fontSize: 14, transition: "border-color 0.15s",
                }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Passwort</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                type="password"
                placeholder="••••••••"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#111", border: "1px solid #222",
                  borderRadius: 6, padding: "14px 16px",
                  color: "#fff", fontSize: 14,
                }}
              />
            </div>

            {error && (
              <div style={{ color: "#E05555", fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%", background: "#D91B1B",
                border: "none", borderRadius: 6, padding: "15px",
                color: "#fff", fontWeight: 800, fontSize: 14,
                letterSpacing: "0.04em", textTransform: "uppercase",
                cursor: loading ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
              {loading ? "Wird angemeldet…" : "Anmelden"}
            </button>
          </div>

        <p style={{ color: "#2a2a2a", fontSize: 11, marginTop: 48, textAlign: "center" }}>
          Lord of Döner Franchising GmbH · Köln
        </p>
      </div>
    </div>
  );
}
