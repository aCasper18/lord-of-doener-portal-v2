import React, { useState, useEffect } from "react";
import { Mail, MessageCircle, ListChecks, Users, Link2 } from "lucide-react";
import { C } from "../../shared/theme.js";
import { AccessModal } from "../../shared/components/AccessModal.jsx";

const INTEGRATIONS_INITIAL = [
  {
    id: "mail",
    name: "Mail",
    desc: "Verwaltung der einzelnen Postfächer erfolgt im Bereich „Mails“ im Menü.",
    icon: Mail,
    enabled: true,
    access: ["u3", "u4"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    desc: "Filial-Chats zentral empfangen und beantworten.",
    icon: MessageCircle,
    enabled: true,
    access: ["u1", "u2"],
  },
  {
    id: "planner",
    name: "Microsoft Planner",
    desc: "Aufgaben aus Planner synchronisieren und zuweisen.",
    icon: ListChecks,
    enabled: false,
    access: [],
  },
];


function IntegrationTile({ integration, onToggle, onManageAccess, onManageConnection }) {
  const Icon = integration.icon;
  const isImap = integration.connectionType === "imap";
  const connected = !!integration.connection;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: "20px 22px", flex: "1 1 280px", minWidth: 260 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: "#1d1d1d", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={integration.enabled ? C.orange : C.textDim} />
        </div>
        <button
          onClick={() => onToggle(integration.id)}
          style={{
            width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer",
            background: integration.enabled ? C.orange : "#2a2a2a", position: "relative", transition: "background 0.15s",
          }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: "50%", background: "#0A0A0B",
            position: "absolute", top: 3, left: integration.enabled ? 21 : 3, transition: "left 0.15s",
          }} />
        </button>
      </div>
      <div style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{integration.name}</div>
      <div style={{ color: C.textDim, fontSize: 13, lineHeight: 1.5, marginBottom: 12, minHeight: 38 }}>{integration.desc}</div>

      {isImap && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: 12 }}>
          {connected ? (
            <>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
              <span style={{ color: C.text }}>{integration.connection.username}</span>
              <span style={{ color: C.textDim }}>· {integration.connection.host}</span>
            </>
          ) : (
            <>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.textDim }} />
              <span style={{ color: C.textDim }}>Nicht verbunden</span>
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={13} color={C.textDim} />
          <span style={{ color: C.textDim, fontSize: 12 }}>
            {integration.access.length === 0 ? "Niemand zugewiesen" : `${integration.access.length} Mitarbeiter`}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isImap && (
            <button
              onClick={() => onManageConnection(integration.id)}
              style={{ display: "flex", alignItems: "center", gap: 5, background: connected ? "none" : C.orange, border: `1px solid ${connected ? C.panelBorder : C.orange}`, borderRadius: 7, padding: "6px 12px", color: connected ? C.text : "#0A0A0B", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              <Link2 size={12} /> {connected ? "Verwalten" : "Verbinden"}
            </button>
          )}
          <button
            onClick={() => onManageAccess(integration.id)}
            style={{ background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 7, padding: "6px 12px", color: C.text, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Zugriff
          </button>
        </div>
      </div>
    </div>
  );
}

export function IntegrationenView() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS_INITIAL);
  const [managing, setManaging] = useState(null);

  function toggle(id) {
    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
  }

  function saveAccess(id, access) {
    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, access } : i)));
    setManaging(null);
  }

  const current = integrations.find((i) => i.id === managing);

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, margin: "0 0 6px 0" }}>Integrationen</h1>
      <p style={{ color: C.textDim, fontSize: 14, margin: "0 0 28px 0" }}>
        Externe Dienste anbinden und festlegen, welche Mitarbeiter Zugriff haben.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {integrations.map((i) => (
          <IntegrationTile key={i.id} integration={i} onToggle={toggle} onManageAccess={setManaging} onManageConnection={() => {}} />
        ))}
      </div>

      {current && <AccessModal integration={current} onClose={() => setManaging(null)} onSave={(access) => saveAccess(current.id, access)} />}
    </div>
  );
}
