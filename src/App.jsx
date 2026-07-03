import React, { useState } from "react";
import { apiFetch, getToken, getStoredUser, setSession, clearSession } from "./api/client.js";
import { C } from "./shared/theme.js";
import { ALL_LABELS } from "./shared/nav.config.js";
import { Sidebar } from "./shared/components/Sidebar.jsx";
import { PlaceholderView } from "./shared/components/PlaceholderView.jsx";

import { LoginScreen } from "./modules/auth/LoginScreen.jsx";
import { DashboardView } from "./modules/dashboard/DashboardView.jsx";
import { ToDosView } from "./modules/todos/ToDosView.jsx";
import { KiAgentView } from "./modules/ki-agent/KiAgentView.jsx";
import { WorkflowsView } from "./modules/workflows/WorkflowsView.jsx";
import { WissensdatenbankView } from "./modules/knowledge/WissensdatenbankView.jsx";
import { MailsView } from "./modules/mailboxes/MailsView.jsx";
import { WhatsAppView } from "./modules/whatsapp/WhatsAppView.jsx";
import { IntegrationenView } from "./modules/integrations/IntegrationenView.jsx";
import { FilialenView } from "./modules/branches/FilialenView.jsx";
import { BenutzerView } from "./modules/users/BenutzerView.jsx";

const ROUTED_KEYS = [
  "dashboard", "todos", "ki_agent", "workflows", "wissensdatenbank",
  "mails", "whatsapp", "integrationen", "filialen", "benutzer",
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [openGroups, setOpenGroups] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => (getToken() ? getStoredUser() : null));

  function handleLogin(user, tok) {
    setSession(user, tok);
    setCurrentUser(user);
  }

  function handleLogout() {
    clearSession();
    setCurrentUser(null);
    setActive("dashboard");
  }

  function toggleGroup(key) {
    setOpenGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <Sidebar
        active={active}
        onSelect={setActive}
        openGroups={openGroups}
        toggleGroup={toggleGroup}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div style={{ flex: 1, overflow: "auto" }}>
        {active === "dashboard" && <DashboardView user={currentUser} />}
        {active === "todos" && <ToDosView currentUser={currentUser} />}
        {active === "ki_agent" && <KiAgentView />}
        {active === "workflows" && <WorkflowsView />}
        {active === "wissensdatenbank" && <WissensdatenbankView />}
        {active === "mails" && <MailsView />}
        {active === "whatsapp" && <WhatsAppView />}
        {active === "integrationen" && <IntegrationenView />}
        {active === "filialen" && <FilialenView />}
        {active === "benutzer" && <BenutzerView currentUser={currentUser} />}
        {!ROUTED_KEYS.includes(active) && (
          <PlaceholderView label={ALL_LABELS[active] || ""} />
        )}
      </div>
    </div>
  );
}
