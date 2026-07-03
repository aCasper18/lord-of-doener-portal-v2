import React, { useState, useEffect } from "react";
import { Mail, Check, X, Users, Plus, Server, Lock, ShieldCheck, Loader2, Unplug, ArrowLeft, CornerDownRight } from "lucide-react";
import { C } from "../../shared/theme.js";
import { AccessModal } from "../../shared/components/AccessModal.jsx";

const IMAP_PRESETS = [
  { label: "Eigener / anderer Server", host: "", port: 993 },
  { label: "Microsoft 365 / Outlook", host: "outlook.office365.com", port: 993 },
  { label: "Google Workspace / Gmail", host: "imap.gmail.com", port: 993 },
  { label: "IONOS", host: "imap.ionos.de", port: 993 },
  { label: "Strato", host: "imap.strato.de", port: 993 },
];


const MAILBOXES_INITIAL = [
  { id: "mb1", username: "info@lordofdoner.com", host: "outlook.office365.com", port: 993, ssl: true, access: ["u3", "u4"] },
  { id: "mb2", username: "buchhaltung@lordofdoner.com", host: "outlook.office365.com", port: 993, ssl: true, access: ["u3"] },
];

const MAIL_SAMPLE = {
  mb1: [
    { id: "e1", from: "Lieferando Support <support@lieferando.de>", subject: "Abweichung in der Auszahlung – Filiale Köln-Ehrenfeld", preview: "Bei der letzten Auszahlung ist eine Differenz von 84,20 € aufgetreten, die wir gemeinsam prüfen möchten…", time: "09:14", read: false },
    { id: "e2", from: "Ruhan Alica <ruhan.alica@gmx.de>", subject: "Frage zur neuen Speisekarte", preview: "Hallo, wann genau wird die neue Karte in Essen ausgerollt? Wir brauchen noch Zeit für die Schilder…", time: "08:47", read: false },
    { id: "e3", from: "DocuSign <noreply@docusign.net>", subject: "Dokument zur Unterschrift bereit: Anlage 5", preview: "Bünyamin Arslan hat Sie zur Unterzeichnung eines Dokuments eingeladen…", time: "Gestern", read: true },
    { id: "e4", from: "Mehmet Tosun <mehmet.tosun@web.de>", subject: "Kühlhaus-Ausfall Wiesbaden-Biebrich", preview: "Seit heute Morgen funktioniert die Kühlung nicht richtig, wir brauchen dringend einen Techniker…", time: "Gestern", read: false },
    { id: "e5", from: "GLS Bank <service@gls.de>", subject: "Kontoauszug Juni 2026", preview: "Ihr Kontoauszug für den Zeitraum 01.06.2026 – 30.06.2026 steht zum Abruf bereit…", time: "Mo", read: true },
  ],
  mb2: [
    { id: "e6", from: "DATEV <service@datev.de>", subject: "Export bereit zur Übernahme", preview: "Der angeforderte Buchungsexport für Juni 2026 steht in Ihrem DATEV-Postfach bereit…", time: "10:02", read: false },
    { id: "e7", from: "Steuerberatung Klein & Partner", subject: "Rückfrage zu Provisionsrechnung Q2", preview: "Uns ist bei der Prüfung eine Unstimmigkeit bei der Provisionsabrechnung für Mönchengladbach aufgefallen…", time: "Gestern", read: false },
    { id: "e8", from: "PayPal <service@paypal.de>", subject: "Zahlungseingang bestätigt", preview: "Sie haben eine Zahlung in Höhe von 1.240,00 € erhalten…", time: "Di", read: true },
  ],
};


function MailboxModal({ mailbox, onClose, onSave, onDelete }) {
  const existing = mailbox;
  const [presetIdx, setPresetIdx] = useState(0);
  const [host, setHost] = useState(existing?.host || "");
  const [port, setPort] = useState(existing?.port || 993);
  const [username, setUsername] = useState(existing?.username || "");
  const [password, setPassword] = useState("");
  const [ssl, setSsl] = useState(existing?.ssl ?? true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | "success" | "error"

  function applyPreset(idx) {
    setPresetIdx(idx);
    const preset = IMAP_PRESETS[idx];
    if (preset.host) {
      setHost(preset.host);
      setPort(preset.port);
    }
  }

  function testConnection() {
    if (!host || !username || !password) {
      setTestResult("error");
      return;
    }
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult("success");
    }, 1100);
  }

  const canConnect = host.trim() && username.trim() && (password.trim() || existing);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Server size={17} color={C.orange} /> {existing ? "Postfach bearbeiten" : "Neues Postfach verbinden"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim }}><X size={18} /></button>
        </div>
        <p style={{ color: C.textDim, fontSize: 13, margin: "0 0 18px 0" }}>
          Zugangsdaten eines Postfachs hinterlegen, um Mails im Portal sichtbar zu machen.
        </p>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>Anbieter</label>
          <select
            value={presetIdx}
            onChange={(e) => applyPreset(Number(e.target.value))}
            style={{ width: "100%", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14 }}
          >
            {IMAP_PRESETS.map((p, idx) => (
              <option key={p.label} value={idx}>{p.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 3 }}>
            <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>IMAP-Server</label>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="imap.beispiel.de"
              style={{ width: "100%", boxSizing: "border-box", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>Port</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              style={{ width: "100%", boxSizing: "border-box", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>E-Mail-Adresse / Benutzername</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="name@lordofdoner.com"
            style={{ width: "100%", boxSizing: "border-box", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14 }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>
            Passwort {existing && <span style={{ opacity: 0.6 }}>(leer lassen, um bestehendes zu behalten)</span>}
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={14} color={C.textDim} style={{ position: "absolute", left: 12, top: 13 }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={existing ? "••••••••" : ""}
              style={{ width: "100%", boxSizing: "border-box", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px 10px 34px", color: C.text, fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, padding: "10px 12px", background: "#0F0F0F", borderRadius: 8, border: `1px solid ${C.panelBorder}` }}>
          <span style={{ color: C.text, fontSize: 13 }}>SSL/TLS verwenden (empfohlen)</span>
          <button
            onClick={() => setSsl((s) => !s)}
            style={{ width: 36, height: 20, borderRadius: 999, border: "none", cursor: "pointer", background: ssl ? C.orange : "#2a2a2a", position: "relative" }}
          >
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#0A0A0B", position: "absolute", top: 3, left: ssl ? 19 : 3, transition: "left 0.15s" }} />
          </button>
        </div>

        <button
          onClick={testConnection}
          disabled={testing}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px", color: C.text, fontSize: 13, fontWeight: 600, cursor: testing ? "default" : "pointer", marginBottom: 10 }}
        >
          {testing ? <Loader2 size={14} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} /> : <ShieldCheck size={14} />}
          {testing ? "Verbindung wird geprüft…" : "Verbindung testen"}
        </button>

        {testResult === "success" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.green, fontSize: 12, marginBottom: 14 }}>
            <Check size={14} /> Verbindung erfolgreich (Demo-Simulation, keine echte Prüfung).
          </div>
        )}
        {testResult === "error" && (
          <div style={{ color: "#E0664B", fontSize: 12, marginBottom: 14 }}>
            Bitte Server, Benutzername und Passwort ausfüllen.
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {existing && (
            <button
              onClick={() => onDelete(existing.id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "11px", color: "#E0664B", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              <Unplug size={14} /> Entfernen
            </button>
          )}
          <button
            disabled={!canConnect}
            onClick={() => onSave({ id: existing?.id, host, port, username, ssl })}
            style={{ flex: 2, background: canConnect ? C.orange : "#2a2a2a", border: "none", borderRadius: 8, padding: "11px", color: canConnect ? "#0A0A0B" : C.textDim, fontWeight: 700, fontSize: 14, cursor: canConnect ? "pointer" : "not-allowed" }}
          >
            {existing ? "Speichern" : "Verbinden"}
          </button>
        </div>
      </div>
    </div>
  );
}


function MailboxCard({ mailbox, onOpen, onEdit, onManageAccess }) {
  const unreadCount = (MAIL_SAMPLE[mailbox.id] || []).filter((m) => !m.read).length;
  return (
    <div
      onClick={() => onOpen(mailbox.id)}
      style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: "18px 20px", flex: "1 1 300px", minWidth: 280, cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "#1d1d1d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Mail size={16} color={C.orange} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mailbox.username}</div>
          <div style={{ color: C.textDim, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
            {mailbox.host}:{mailbox.port} {mailbox.ssl ? "· SSL" : ""}
          </div>
        </div>
        {unreadCount > 0 && (
          <span style={{ background: C.orange, color: "#0A0A0B", fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "2px 8px", flexShrink: 0 }}>
            {unreadCount} neu
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={13} color={C.textDim} />
          <span style={{ color: C.textDim, fontSize: 12 }}>
            {mailbox.access.length === 0 ? "Niemand zugewiesen" : `${mailbox.access.length} Mitarbeiter`}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onManageAccess(mailbox.id)}
            style={{ background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 7, padding: "6px 12px", color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Zugriff
          </button>
          <button
            onClick={() => onEdit(mailbox)}
            style={{ background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 7, padding: "6px 12px", color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Bearbeiten
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailInboxView({ mailbox, onBack }) {
  const [emails, setEmails] = useState(MAIL_SAMPLE[mailbox.id] || []);
  const [taskCreatedFor, setTaskCreatedFor] = useState(null);

  function markRead(id) {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
  }

  function createTask(id) {
    markRead(id);
    setTaskCreatedFor(id);
    setTimeout(() => setTaskCreatedFor((cur) => (cur === id ? null : cur)), 2200);
  }

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <button
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.textDim, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 18 }}
      >
        <ArrowLeft size={14} /> Zurück zu Mails
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1d1d1d", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={18} color={C.orange} />
        </div>
        <div>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 800, margin: 0 }}>{mailbox.username}</h1>
          <p style={{ color: C.textDim, fontSize: 12, margin: "2px 0 0 0" }}>
            {mailbox.host}:{mailbox.port} · {emails.length} Mails im Posteingang (Demo-Daten)
          </p>
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, overflow: "hidden" }}>
        {emails.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: C.textDim, fontSize: 13 }}>Keine Mails vorhanden.</div>
        )}
        {emails.map((mail, idx) => (
          <div
            key={mail.id}
            onClick={() => markRead(mail.id)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", cursor: "pointer",
              borderBottom: idx < emails.length - 1 ? `1px solid ${C.panelBorder}` : "none",
              background: mail.read ? "transparent" : "#1a1611",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: mail.read ? "transparent" : C.orange, marginTop: 6, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ color: C.text, fontWeight: mail.read ? 500 : 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {mail.from}
                </span>
                <span style={{ color: C.textDim, fontSize: 11, flexShrink: 0 }}>{mail.time}</span>
              </div>
              <div style={{ color: C.text, fontSize: 13.5, fontWeight: mail.read ? 400 : 600, margin: "3px 0 4px 0" }}>{mail.subject}</div>
              <div style={{ color: C.textDim, fontSize: 12.5, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mail.preview}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); createTask(mail.id); }}
              style={{
                display: "flex", alignItems: "center", gap: 5, flexShrink: 0, marginTop: 2,
                background: taskCreatedFor === mail.id ? "#1d2e1d" : "none",
                border: `1px solid ${taskCreatedFor === mail.id ? C.green + "66" : C.panelBorder}`,
                borderRadius: 7, padding: "6px 10px",
                color: taskCreatedFor === mail.id ? C.green : C.text,
                fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {taskCreatedFor === mail.id ? <Check size={12} /> : <CornerDownRight size={12} />}
              {taskCreatedFor === mail.id ? "Aufgabe erstellt" : "Aufgabe erstellen"}
            </button>
          </div>
        ))}
      </div>

      <p style={{ color: C.textDim, fontSize: 11, marginTop: 16, opacity: 0.6 }}>
        Demo-Posteingang mit Beispieldaten. Sobald die echte IMAP-Verbindung steht, laufen hier die tatsächlichen Mails auf.
      </p>
    </div>
  );
}

export function MailsView() {
  const [mailboxes, setMailboxes] = useState(MAILBOXES_INITIAL);
  const [modalState, setModalState] = useState(null); // null | "new" | mailbox object
  const [managingAccess, setManagingAccess] = useState(null); // mailbox id
  const [openInbox, setOpenInbox] = useState(null); // mailbox id

  function saveMailbox(data) {
    if (data.id) {
      setMailboxes((prev) => prev.map((m) => (m.id === data.id ? { ...m, ...data } : m)));
    } else {
      setMailboxes((prev) => [...prev, { ...data, id: "mb" + (prev.length + 1), access: [] }]);
    }
    setModalState(null);
  }

  function deleteMailbox(id) {
    setMailboxes((prev) => prev.filter((m) => m.id !== id));
    setModalState(null);
  }

  function saveAccess(id, access) {
    setMailboxes((prev) => prev.map((m) => (m.id === id ? { ...m, access } : m)));
    setManagingAccess(null);
  }

  const currentAccessTarget = mailboxes.find((m) => m.id === managingAccess);
  const inboxTarget = mailboxes.find((m) => m.id === openInbox);

  if (inboxTarget) {
    return <EmailInboxView mailbox={inboxTarget} onBack={() => setOpenInbox(null)} />;
  }

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, margin: "0 0 6px 0" }}>Mails</h1>
          <p style={{ color: C.textDim, fontSize: 14, margin: 0 }}>
            Beliebig viele Postfächer per IMAP verbinden und einzeln Mitarbeitern zuweisen.
          </p>
        </div>
        <button
          onClick={() => setModalState("new")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: C.orange, border: "none", borderRadius: 8, padding: "10px 16px", color: "#0A0A0B", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          <Plus size={15} /> Postfach verbinden
        </button>
      </div>

      {mailboxes.length === 0 ? (
        <div style={{ background: C.panel, border: `1px dashed ${C.panelBorder}`, borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
          <Mail size={22} color={C.textDim} style={{ marginBottom: 10 }} />
          <div style={{ color: C.textDim, fontSize: 14 }}>Noch kein Postfach verbunden.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {mailboxes.map((m) => (
            <MailboxCard key={m.id} mailbox={m} onOpen={setOpenInbox} onEdit={setModalState} onManageAccess={setManagingAccess} />
          ))}
        </div>
      )}

      {modalState && (
        <MailboxModal
          mailbox={modalState === "new" ? null : modalState}
          onClose={() => setModalState(null)}
          onSave={saveMailbox}
          onDelete={deleteMailbox}
        />
      )}

      {currentAccessTarget && (
        <AccessModal
          integration={{ name: currentAccessTarget.username, access: currentAccessTarget.access }}
          onClose={() => setManagingAccess(null)}
          onSave={(access) => saveAccess(currentAccessTarget.id, access)}
        />
      )}
    </div>
  );
}
