import React, { useState, useEffect } from "react";
import {
  Home, Boxes, Receipt, ShoppingCart, Settings, Calculator, Cog,
  ChevronDown, ChevronRight, LogOut, TrendingUp, Clock, ShoppingBag,
  RefreshCw, Plug, Mail, MessageCircle, ListChecks, Check, X, Users,
  BarChart3, Trophy, Tag, Package, FileText, Wallet, Bell, Percent,
  FileSpreadsheet, AlertTriangle, Store, Building2, Truck, CreditCard,
  Folder, BarChart2, Plus, MapPin, Phone, ArrowUpRight,
  Server, Link2, Lock, ShieldCheck, Loader2, Unplug, ArrowLeft, CornerDownRight,
  Archive, ArchiveRestore, ListTodo, Award, ChevronUp, ChevronsRight, Inbox,
  Bot, Sparkles, ThumbsUp, ThumbsDown, BookOpen, Send, Trash2, Edit2, FolderOpen,
  Paperclip, FileUp, CheckCircle2, AlertCircle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ---- Tokens (matched to existing dashboard) ----
const C = {
  bg: "#0A0A0B",
  panel: "#161616",
  panelBorder: "#262626",
  text: "#F2F2F0",
  textDim: "#9A9A95",
  orange: "#E8731A",
  green: "#5FBF6E",
  blue: "#5B9BF0",
};

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: Home, kind: "single" },
  {
    key: "leistung", label: "Leistung", icon: TrendingUp, kind: "group",
    children: [
      { key: "filialleistung", label: "Filialleistung", icon: BarChart3 },
      { key: "auszeichnungsdefinitionen", label: "Auszeichnungsdefinitionen", icon: Trophy },
    ],
  },
  {
    key: "lager", label: "Lagerverwaltung", icon: Boxes, kind: "group",
    children: [
      { key: "kategorien", label: "Kategorien", icon: Tag },
      { key: "artikel", label: "Artikel", icon: Package },
    ],
  },
  {
    key: "rechnung", label: "Rechnung & Zahlung", icon: Receipt, kind: "group",
    children: [
      { key: "rechnungen", label: "Rechnungen", icon: FileText },
      { key: "zahlungen", label: "Zahlungen", icon: Wallet },
      { key: "zahlungserinnerungen", label: "Zahlungserinnerungen", icon: Bell },
      { key: "provisionsrechnungen", label: "Provisionsrechnungen", icon: Percent },
      { key: "filial-mitgliedsbeitraege", label: "Filial-Mitgliedsbeiträge", icon: FileSpreadsheet },
    ],
  },
  {
    key: "bestellung", label: "Bestellungsverwaltung", icon: ShoppingCart, kind: "group",
    children: [
      { key: "bestellungen", label: "Bestellungen", icon: ShoppingCart },
      { key: "beschwerden", label: "Beschwerden", icon: AlertTriangle },
    ],
  },
  { key: "todos", label: "To Dos", icon: ListTodo, kind: "single" },
  { key: "ki_agent", label: "KI-Agent", icon: Bot, kind: "single" },
  { key: "wissensdatenbank", label: "Wissensdatenbank", icon: Folder, kind: "single" },
  { key: "mails", label: "Mails", icon: Mail, kind: "single" },
  { key: "integrationen", label: "Integrationen", icon: Plug, kind: "single", isNew: true },
  {
    key: "verwaltung", label: "Verwaltung", icon: Settings, kind: "group",
    children: [
      { key: "benutzer", label: "Benutzer", icon: Users },
      { key: "filialen", label: "Filialen", icon: Store },
      { key: "lieferanten", label: "Lieferanten", icon: Building2 },
      { key: "verteiler", label: "Verteiler", icon: Truck },
      { key: "kreditlimits", label: "Kreditlimits", icon: CreditCard },
      { key: "dokumente", label: "Dokumente", icon: Folder },
    ],
  },
  {
    key: "buchhaltung", label: "Buchhaltung", icon: Calculator, kind: "group",
    children: [
      { key: "finanzberichte", label: "Finanzberichte", icon: FileText },
      { key: "provisionsbericht", label: "Provisionsbericht", icon: BarChart2 },
    ],
  },
  { key: "system", label: "System", icon: Cog, kind: "group", children: [] },
];

const ALL_LABELS = NAV.reduce((acc, item) => {
  acc[item.key] = item.label;
  (item.children || []).forEach((c) => (acc[c.key] = c.label));
  return acc;
}, {});

const EMPLOYEES = [
  { id: "u1", name: "Ayse Kaya", role: "Filialleitung Köln-Mitte", initials: "AK" },
  { id: "u2", name: "Murat Özkan", role: "Filialleitung Ehrenfeld", initials: "MÖ" },
  { id: "u3", name: "Lena Brandt", role: "Franchise-Support", initials: "LB" },
  { id: "u4", name: "Serdal Cevik", role: "Operations", initials: "SC" },
];

const ALL_USERS = [
  { id: "admin", name: "Super Admin", role: "Super Admin", initials: "SA", isAdmin: true },
  ...EMPLOYEES.map((e) => ({ ...e, isAdmin: false })),
];


const IMAP_PRESETS = [
  { label: "Eigener / anderer Server", host: "", port: 993 },
  { label: "Microsoft 365 / Outlook", host: "outlook.office365.com", port: 993 },
  { label: "Google Workspace / Gmail", host: "imap.gmail.com", port: 993 },
  { label: "IONOS", host: "imap.ionos.de", port: 993 },
  { label: "Strato", host: "imap.strato.de", port: 993 },
];

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

const TASK_COLUMNS = [
  { key: "open", label: "Offen", color: "#9A9A95" },
  { key: "in_progress", label: "In Bearbeitung", color: "#5B9BF0" },
  { key: "done", label: "Erledigt", color: "#5FBF6E" },
];

const SOURCE_ICON = { mail: Mail, whatsapp: MessageCircle, planner: ListChecks };
const SOURCE_LABEL = { mail: "Mail", whatsapp: "WhatsApp", planner: "Planner" };

const TASKS_INITIAL = [
  { id: "t1", title: "Lieferando-Abrechnung Köln-Ehrenfeld prüfen", assignee: "u3", source: "mail", status: "open", createdAt: "2026-06-28", completedAt: null, note: "Differenz von 84,20 € klären." },
  { id: "t2", title: "Kühlhaus-Ausfall Wiesbaden-Biebrich klären", assignee: "u4", source: "mail", status: "in_progress", createdAt: "2026-06-27", completedAt: null, note: "Techniker beauftragt, wartet auf Termin." },
  { id: "t3", title: "Anlage 5 gegenzeichnen lassen", assignee: "u3", source: "planner", status: "in_progress", createdAt: "2026-06-25", completedAt: null, note: "Unterschrift von Bünyamin Arslan steht aus." },
  { id: "t4", title: "Neue Speisekarte an Essen ausliefern", assignee: "u1", source: "whatsapp", status: "open", createdAt: "2026-06-29", completedAt: null, note: "Schilder müssen noch gedruckt werden." },
  { id: "t5", title: "Provisionsrechnung Q2 Mönchengladbach klären", assignee: "u3", source: "mail", status: "open", createdAt: "2026-06-29", completedAt: null, note: "Rückfrage vom Steuerberater offen." },
  { id: "t6", title: "DATEV-Export Juni übernehmen", assignee: "u4", source: "mail", status: "done", createdAt: "2026-06-20", completedAt: "2026-06-22", note: "" },
  { id: "t7", title: "Franchisevertrag-Entwurf Düsseldorf prüfen", assignee: "u3", source: "planner", status: "done", createdAt: "2026-06-18", completedAt: "2026-06-21", note: "" },
  { id: "t8", title: "WhatsApp-Anfrage Standort Münster beantworten", assignee: "u2", source: "whatsapp", status: "done", createdAt: "2026-06-19", completedAt: "2026-06-19", note: "" },
  { id: "t9", title: "Kreditlimit Lieferant Fruqo anpassen", assignee: "u4", source: "planner", status: "done", createdAt: "2026-06-15", completedAt: "2026-06-17", note: "" },
  { id: "t10", title: "Zahlungserinnerung Filiale Mainz versenden", assignee: "u1", source: "mail", status: "done", createdAt: "2026-06-12", completedAt: "2026-06-12", note: "" },
];

const KNOWLEDGE_CATEGORIES = ["Franchiseregeln", "Prozesse", "Produkte", "Verträge", "Kontakte", "Allgemein"];

const KNOWLEDGE_INITIAL = [
  { id: "k1", title: "Franchisegebühr", category: "Franchiseregeln", content: "Die monatliche Franchisegebühr beträgt 5% des Nettoumsatzes, fällig am 10. des Folgemonats. Zusätzlich wird eine Marketing-Umlage von 1% erhoben." },
  { id: "k2", title: "Döner-Rezeptur Kernprodukt", category: "Produkte", content: "Das Kernprodukt ist ein gegrilltes Döner-Sandwich mit selbst gebackenem Fladenbrot. Fleisch ist ausschließlich Halal-zertifiziert. Saucen: Knoblauch, Kräuter, scharf. Keine Abweichungen ohne Freigabe der Zentrale." },
  { id: "k3", title: "Lieferando-Auszahlung", category: "Prozesse", content: "Lieferando rechnet wöchentlich ab (Dienstag). Auszahlung erfolgt ca. 7 Werktage nach Abrechnungsende. Bei Differenzen zuerst Abrechnungsübersicht im Lieferando-Portal prüfen, dann Zentrale informieren." },
  { id: "k4", title: "Neueröffnung Checkliste", category: "Prozesse", content: "Vor Eröffnung: Gewerbeanmeldung, HACCP-Konzept, Hygieneschulung aller Mitarbeiter, Kasseneinrichtung durch IT, Erstbestellung über Zentrallager, Marketing-Material von Zentrale anfordern." },
  { id: "k5", title: "Beschwerdemanagement", category: "Prozesse", content: "Kundenbeschwerden innerhalb von 24h beantworten. Eskalation an Zentrale bei negativen Google-Bewertungen unter 3 Sternen. Erstattungen max. €15 ohne Rückfrage möglich, darüber Freigabe Zentrale." },
  { id: "k6", title: "Hauptlieferant Fruqo", category: "Kontakte", content: "Fruqo GmbH, Ansprechpartner: Hr. Schäfer, +49 211 4456789. Bestellschluss: Do 12:00 für Lieferung Mo. Mindestbestellwert: €300 netto. Bei Engpässen Ausweichlieferant: Prokop GmbH." },
];

const BRANCHES = [
  { id: "b1", name: "Leverkusen", address: "Friedrich-Ebert-Straße 5d, 51373 Leverkusen", manager: "Mehdi Burhan Baysan", phone: "+49 173 2781868", altContact: "Mehmet Kahraman, +49 173 9364636", status: "active" },
  { id: "b2", name: "Mainz", address: "Parcusstraße 8, 55116 Mainz", manager: "Adil Nader", phone: "+49 1521 4518486", altContact: null, status: "active" },
  { id: "b3", name: "Mönchengladbach (Franz-Gielen-Str.)", address: "Franz-Gielen-Straße 2, 41061 Mönchengladbach", manager: "Murat Ordu", phone: "+49 172 8686238", altContact: null, status: "active" },
  { id: "b4", name: "Mönchengladbach (Friedrich-Ebert-Str.)", address: "Friedrich-Ebert-Straße 7, 41236 Mönchengladbach", manager: "Nureddin Gonca", phone: "+90 532 294 99 06", altContact: null, status: "active" },
  { id: "b5", name: "Solingen", address: "Kölner Str. 111, 42651 Solingen", manager: "Muhammed Hamakaro", phone: "+49 176 60377976", altContact: null, status: "active" },
  { id: "b6", name: "Köln-Ehrenfeld", address: "Venloerstr. 346, 50823 Köln", manager: "Nureddin Gonca", phone: "+90 532 294 99 06", altContact: "Festnetz: 0221-6903988", status: "active" },
  { id: "b7", name: "Meckenheim", address: "Hauptstraße 62, 53340 Meckenheim", manager: "Nedim Tosun", phone: "+49 176 23593431", altContact: null, status: "active" },
  { id: "b8", name: "Wiesbaden-Biebrich", address: "Rathausstraße 19-21, 65203 Wiesbaden", manager: "Mehmet Tosun", phone: "+49 176 10172113", altContact: "Ramazan (Partner), +49 160 1891959", status: "active" },
  { id: "b9", name: "Wiesbaden", address: "Bahnhofspl. 3, 65189 Wiesbaden", manager: "Mehmet Tosun", phone: "+49 176 10172113", altContact: "Ramazan (Partner), +49 160 1891959", status: "active" },
  { id: "b10", name: "Erfurt", address: "Anger 12, 99084 Erfurt", manager: "Selam", phone: "+49 176 61766200", altContact: "Ziyad, 0174 9038887", status: "active" },
  { id: "b11", name: "Neuwied", address: "Marktstraße 43, 56564 Neuwied", manager: "Yunus Basibüyük", phone: "+49 171 3419192", altContact: null, status: "active" },
  { id: "b12", name: "Essen", address: "Limbecker Platz 1A, 45127 Essen", manager: "Ruhan Alica", phone: "+49 178 4083096", altContact: null, status: "active" },
  { id: "b13", name: "Neunkirchen", address: "Kölner Str. 227, 57290 Neunkirchen", manager: "Nedim Özbay", phone: "+49 1575 4405027", altContact: null, status: "active" },
  { id: "b14", name: "Rommerskirchen", address: "Venloer Str. 72, 41569 Rommerskirchen", manager: "Fatih Ceylan", phone: "+49 1522 1683874", altContact: null, status: "active" },
  { id: "b15", name: "Münster", address: "Bahnhofstraße 70, 48143 Münster", manager: "Latif Ay", phone: "—", altContact: null, status: "active" },
];

const BRANCH_STATUS = {
  active: { label: "Aktiv", color: C.green },
  in_eroeffnung: { label: "In Eröffnung", color: C.blue },
  pausiert: { label: "Pausiert", color: "#C97A4B" },
};


const REVENUE_DATA = [
  { month: "Jul 2025", umsatz: 0 },
  { month: "Aug 2025", umsatz: 0 },
  { month: "Sep 2025", umsatz: 0 },
  { month: "Okt 2025", umsatz: 0 },
  { month: "Nov 2025", umsatz: 0 },
  { month: "Dez 2025", umsatz: 0 },
  { month: "Jan 2026", umsatz: 0 },
  { month: "Feb 2026", umsatz: 0 },
  { month: "Mär 2026", umsatz: 0 },
  { month: "Apr 2026", umsatz: 0 },
  { month: "Mai 2026", umsatz: 0 },
  { month: "Jun 2026", umsatz: 0 },
];

function Avatar({ initials, size = 36 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "#1f1f1f", border: `1px solid ${C.panelBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: C.text, fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Sidebar({ active, onSelect, openGroups, toggleGroup, currentUser, onSwitchUser }) {
  return (
    <div
      style={{
        width: 256, flexShrink: 0, background: C.bg,
        borderRight: `1px solid ${C.panelBorder}`, padding: "20px 12px",
        display: "flex", flexDirection: "column", gap: 2,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "0 6px 16px 6px", marginBottom: 8, borderBottom: `1px solid ${C.panelBorder}` }}>
        <div style={{ color: C.textDim, fontSize: 10.5, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
          Demo: Eingeloggt als
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => onSwitchUser(e.target.value)}
          style={{ width: "100%", background: "#141414", border: `1px solid ${C.panelBorder}`, borderRadius: 7, padding: "7px 8px", color: C.text, fontSize: 12.5 }}
        >
          {ALL_USERS.map((u) => (
            <option key={u.id} value={u.id}>{u.name}{u.isAdmin ? "" : ` (${u.role})`}</option>
          ))}
        </select>
      </div>

      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        const isOpen = openGroups.includes(item.key);
        const hasChildren = item.kind === "group";
        return (
          <div key={item.key}>
            <button
              onClick={() => (hasChildren ? toggleGroup(item.key) : onSelect(item.key))}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: 8, border: "none",
                background: isActive ? "#1e1a14" : "transparent",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <Icon size={17} color={isActive ? C.orange : C.textDim} />
              <span style={{ flex: 1, color: isActive ? C.orange : C.text, fontSize: 14, fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
              {item.isNew && !isActive && (
                <span style={{ fontSize: 9, fontWeight: 700, color: C.orange, border: `1px solid ${C.orange}55`, borderRadius: 5, padding: "2px 5px" }}>
                  NEU
                </span>
              )}
              {hasChildren && (isOpen ? <ChevronDown size={14} color={C.textDim} /> : <ChevronRight size={14} color={C.textDim} />)}
            </button>

            {hasChildren && isOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "2px 0 6px 14px", borderLeft: `1px solid ${C.panelBorder}`, marginLeft: 20 }}>
                {item.children.length === 0 && (
                  <div style={{ color: C.textDim, fontSize: 12, padding: "8px 14px" }}>Keine Einträge</div>
                )}
                {item.children.map((child) => {
                  const ChildIcon = child.icon;
                  const childActive = active === child.key;
                  return (
                    <button
                      key={child.key}
                      onClick={() => onSelect(child.key)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                        borderRadius: 7, border: "none",
                        background: childActive ? "#1e1a14" : "transparent",
                        cursor: "pointer", textAlign: "left",
                      }}
                    >
                      <ChildIcon size={15} color={childActive ? C.orange : C.textDim} />
                      <span style={{ color: childActive ? C.orange : C.textDim, fontSize: 13, fontWeight: childActive ? 700 : 500 }}>
                        {child.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, sub, subColor, children }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: "20px 22px", flex: 1, minWidth: 200 }}>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 10 }}>{label}</div>
      <div style={{ color: C.text, fontSize: 30, fontWeight: 700, marginBottom: 10 }}>{value}</div>
      {sub && <div style={{ color: subColor || C.textDim, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{sub}</div>}
      {children}
    </div>
  );
}

function DashboardView({ user }) {
  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, margin: "0 0 24px 0" }}>Dashboard</h1>

      <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar initials={user.initials} size={40} />
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>Willkommen</div>
            <div style={{ color: C.textDim, fontSize: 13 }}>{user.role}</div>
          </div>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, background: "#1d1d1d", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "9px 16px", color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <LogOut size={14} /> Abmelden
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Umsatz Dieser Monat" value="0.00 €" sub={<>Gegenüber Vormonat +0% <TrendingUp size={13} /></>} subColor={C.green} />
        <StatCard label="Ausstehende Bestellungen" value="0" sub={<>Nicht dem Lieferanten zugewiesen <Clock size={13} style={{ marginLeft: "auto" }} /></>} />
        <StatCard label="Heutige Bestellungen" value="0" sub={<span style={{ color: C.blue }}>Heute erstellt</span>} >
          <ShoppingBag size={14} color={C.blue} style={{ position: "relative", top: -22, float: "right" }} />
        </StatCard>
        <StatCard label="Aktive Bestellungen" value="0" sub={<span style={{ color: C.orange, display: "flex", alignItems: "center", gap: 6 }}>Bestellungen in Bearbeitung <RefreshCw size={12} /></span>} />
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ color: C.text, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Monatlicher Umsatz</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={REVENUE_DATA} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
            <XAxis dataKey="month" stroke={C.textDim} fontSize={11} tickMargin={8} />
            <YAxis stroke={C.textDim} fontSize={11} domain={[-1, 1]} />
            <Tooltip contentStyle={{ background: "#1d1d1d", border: `1px solid ${C.panelBorder}`, borderRadius: 8 }} labelStyle={{ color: C.text }} />
            <Line type="monotone" dataKey="umsatz" name="Umsatz (€)" stroke={C.orange} strokeWidth={2} dot={{ r: 3, fill: C.orange }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AccessModal({ integration, onClose, onSave }) {
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

function IntegrationenView() {
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

function MailsView() {
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

function NewTaskModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(EMPLOYEES[0].id);
  const [source, setSource] = useState("planner");
  const [note, setNote] = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>Neue Aufgabe</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textDim }}><X size={18} /></button>
        </div>

        <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>Was ist zu tun?</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. Rückruf Lieferant Fruqo"
          style={{ width: "100%", boxSizing: "border-box", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14, marginBottom: 14 }}
        />

        <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>Notiz (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          style={{ width: "100%", boxSizing: "border-box", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, marginBottom: 14, resize: "vertical", fontFamily: "inherit" }}
        />

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>Zuweisen an</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              style={{ width: "100%", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14 }}
            >
              {EMPLOYEES.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 6 }}>Quelle</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{ width: "100%", background: "#0F0F0F", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14 }}
            >
              <option value="planner">Planner</option>
              <option value="mail">Mail</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>

        <button
          disabled={!title.trim()}
          onClick={() => title.trim() && onCreate({ title, assignee, source, note })}
          style={{ width: "100%", background: title.trim() ? C.orange : "#2a2a2a", border: "none", borderRadius: 8, padding: "11px", color: title.trim() ? "#0A0A0B" : C.textDim, fontWeight: 700, fontSize: 14, cursor: title.trim() ? "pointer" : "not-allowed" }}
        >
          Aufgabe erstellen
        </button>
      </div>
    </div>
  );
}

function TaskCard({ task, employee, onAdvance, onArchive, onSendToAgent, onApproveAgent, onRejectAgent }) {
  const Icon = SOURCE_ICON[task.source];
  const colIdx = TASK_COLUMNS.findIndex((c) => c.key === task.status);
  const nextCol = TASK_COLUMNS[colIdx + 1];

  return (
    <div
      style={{
        background: "#101010", border: `1px solid ${task.agentState === "review" ? C.orange + "77" : C.panelBorder}`,
        borderRadius: 10, padding: "13px 14px", marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Icon size={12} color={C.textDim} />
        <span style={{ color: C.textDim, fontSize: 10.5, letterSpacing: "0.04em", textTransform: "uppercase" }}>{SOURCE_LABEL[task.source]}</span>
        {task.agentState && (
          <span style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: "auto", color: C.orange, fontSize: 10.5, fontWeight: 700 }}>
            <Bot size={11} /> {task.agentState === "working" ? "Agent bearbeitet…" : "Vorschlag bereit"}
          </span>
        )}
      </div>
      <div style={{ color: C.text, fontWeight: 600, fontSize: 13, lineHeight: 1.4, marginBottom: task.note ? 6 : 10 }}>{task.title}</div>
      {task.note && <div style={{ color: C.textDim, fontSize: 12, lineHeight: 1.4, marginBottom: 10 }}>{task.note}</div>}

      {task.agentState === "working" && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", background: "#1a1611", border: `1px solid ${C.panelBorder}`, borderRadius: 7, marginBottom: 10 }}>
          <Loader2 size={13} color={C.orange} style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ color: C.textDim, fontSize: 11.5 }}>Agent prüft die Aufgabe und bereitet einen Vorschlag vor…</span>
        </div>
      )}

      {task.agentState === "review" && (
        <div style={{ padding: "9px 10px", background: "#1a1611", border: `1px solid ${C.orange}55`, borderRadius: 7, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <Sparkles size={11} color={C.orange} />
            <span style={{ color: C.orange, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.03em" }}>AGENT-VORSCHLAG</span>
          </div>
          <div style={{ color: C.text, fontSize: 12, lineHeight: 1.45, marginBottom: 10 }}>{task.agentProposal}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onApproveAgent(task.id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: C.orange, border: "none", borderRadius: 6, padding: "6px 8px", color: "#0A0A0B", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >
              <ThumbsUp size={11} /> Freigeben
            </button>
            <button
              onClick={() => onRejectAgent(task.id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 6, padding: "6px 8px", color: C.textDim, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >
              <ThumbsDown size={11} /> Verwerfen
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {employee ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Avatar initials={employee.initials} size={20} />
            <span style={{ color: C.textDim, fontSize: 11.5 }}>{employee.name}</span>
          </div>
        ) : <span />}

        {!task.agentState && (
          <div style={{ display: "flex", gap: 6 }}>
            {task.status !== "done" && (
              <button
                onClick={() => onSendToAgent(task.id)}
                title="An Agent übergeben"
                style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 6, padding: "4px 7px", color: C.orange, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
              >
                <Bot size={11} />
              </button>
            )}
            {task.status === "done" ? (
              <button
                onClick={() => onArchive(task.id)}
                style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 6, padding: "4px 8px", color: C.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
              >
                <Archive size={11} /> Archivieren
              </button>
            ) : (
              <button
                onClick={() => onAdvance(task.id)}
                style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 6, padding: "4px 8px", color: C.text, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
              >
                {nextCol?.label} <ChevronsRight size={11} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PerformancePanel({ tasks }) {
  const stats = EMPLOYEES.map((u) => {
    const mine = tasks.filter((t) => t.assignee === u.id);
    const completed = mine.filter((t) => t.status === "done" || t.status === "archived").length;
    const open = mine.filter((t) => t.status === "open").length;
    const inProgress = mine.filter((t) => t.status === "in_progress").length;
    const rate = mine.length ? Math.round((completed / mine.length) * 100) : 0;
    return { ...u, total: mine.length, completed, open, inProgress, rate };
  }).sort((a, b) => b.completed - a.completed);

  const maxCompleted = Math.max(1, ...stats.map((s) => s.completed));

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: "20px 22px", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Award size={16} color={C.orange} />
        <span style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>Performance</span>
        <span style={{ color: C.textDim, fontSize: 12 }}>· Erledigte Aufgaben pro Mitarbeiter</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {stats.map((s, idx) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: idx === 0 && s.completed > 0 ? C.orange : C.textDim, fontSize: 12, fontWeight: 700, width: 14 }}>{idx + 1}</span>
            <Avatar initials={s.initials} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                <span style={{ color: C.textDim, fontSize: 11.5 }}>
                  {s.completed} erledigt · {s.rate}% Quote
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "#0F0F0F", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(s.completed / maxCompleted) * 100}%`, background: C.orange, borderRadius: 999, transition: "width 0.2s" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <span style={{ color: C.textDim, fontSize: 11 }}>{s.open} offen</span>
              <span style={{ color: C.blue, fontSize: 11 }}>{s.inProgress} in Arbeit</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchiveView({ tasks, onBack, onRestore }) {
  return (
    <div>
      <button
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.textDim, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 18 }}
      >
        <ArrowLeft size={14} /> Zurück zum Board
      </button>
      <h2 style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: "0 0 16px 0" }}>Archiv</h2>

      {tasks.length === 0 ? (
        <div style={{ background: C.panel, border: `1px dashed ${C.panelBorder}`, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
          Noch keine archivierten Aufgaben.
        </div>
      ) : (
        <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, overflow: "hidden" }}>
          {tasks.map((t, idx) => {
            const employee = EMPLOYEES.find((e) => e.id === t.assignee);
            const Icon = SOURCE_ICON[t.source];
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: idx < tasks.length - 1 ? `1px solid ${C.panelBorder}` : "none" }}>
                <Icon size={14} color={C.textDim} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: C.text, fontSize: 13.5, fontWeight: 600 }}>{t.title}</div>
                  <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 2 }}>
                    {employee?.name || "—"} · erledigt am {t.completedAt}
                  </div>
                </div>
                <button
                  onClick={() => onRestore(t.id)}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 7, padding: "6px 10px", color: C.text, fontSize: 11.5, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                >
                  <ArchiveRestore size={12} /> Wiederherstellen
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToDosView({ currentUser }) {
  const [tasks, setTasks] = useState(TASKS_INITIAL);
  const [showNew, setShowNew] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    const working = tasks.filter((t) => t.agentState === "working");
    if (working.length === 0) return;
    const timers = working.map((t) =>
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === t.id
              ? { ...task, agentState: "review", agentProposal: buildAgentProposal(task) }
              : task
          )
        );
      }, 1800)
    );
    return () => timers.forEach(clearTimeout);
  }, [tasks]);

  function buildAgentProposal(task) {
    const byType = {
      mail: `Antwortentwurf vorbereitet: „Vielen Dank für Ihre Nachricht zu „${task.title}“. Wir prüfen den Vorgang und melden uns kurzfristig zurück.“ Bereit zum Versand nach Freigabe.`,
      whatsapp: `Antwortvorschlag für die Filiale formuliert. Nach Freigabe wird die Nachricht im selben Chat verschickt.`,
      planner: `Nächste Schritte zusammengefasst und Checkliste vorbereitet. Aufgabe kann nach Freigabe als erledigt markiert werden.`,
    };
    return byType[task.source] || "Vorschlag liegt zur Prüfung bereit.";
  }

  function sendToAgent(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, agentState: "working", status: t.status === "open" ? "in_progress" : t.status } : t))
    );
  }

  function approveAgent(id) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, agentState: null, agentProposal: null, status: "done", completedAt: new Date().toISOString().slice(0, 10) }
          : t
      )
    );
  }

  function rejectAgent(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, agentState: null, agentProposal: null } : t)));
  }

  function advance(id) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = TASK_COLUMNS.findIndex((c) => c.key === t.status);
        const next = TASK_COLUMNS[idx + 1];
        if (!next) return t;
        return { ...t, status: next.key, completedAt: next.key === "done" ? new Date().toISOString().slice(0, 10) : t.completedAt };
      })
    );
  }

  function archive(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "archived" } : t)));
  }

  function restore(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "done" } : t)));
  }

  function createTask({ title, assignee, source, note }) {
    setTasks((prev) => [
      { id: "t" + (prev.length + 1), title, assignee, source, note, status: "open", createdAt: new Date().toISOString().slice(0, 10), completedAt: null },
      ...prev,
    ]);
    setShowNew(false);
  }

  const visibleTasks = currentUser.isAdmin ? tasks : tasks.filter((t) => t.assignee === currentUser.id);
  const boardTasks = visibleTasks.filter((t) => t.status !== "archived");
  const archivedTasks = visibleTasks.filter((t) => t.status === "archived");

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      {showArchive ? (
        <ArchiveView tasks={archivedTasks} onBack={() => setShowArchive(false)} onRestore={restore} />
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, margin: "0 0 6px 0" }}>To Dos</h1>
              <p style={{ color: C.textDim, fontSize: 14, margin: 0 }}>
                {currentUser.isAdmin ? "Euer eigener Planner — wer macht was, und wie weit ist es." : "Deine zugewiesenen Aufgaben."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowArchive(true)}
                style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: `1px solid ${C.panelBorder}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                <Inbox size={14} /> Archiv ({archivedTasks.length})
              </button>
              {currentUser.isAdmin && (
                <button
                  onClick={() => setShowNew(true)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: C.orange, border: "none", borderRadius: 8, padding: "10px 16px", color: "#0A0A0B", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >
                  <Plus size={15} /> Aufgabe erstellen
                </button>
              )}
            </div>
          </div>

          {currentUser.isAdmin && <PerformancePanel tasks={tasks} />}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {TASK_COLUMNS.map((col) => {
              const colTasks = boardTasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: col.color }} />
                    <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{col.label}</span>
                    <span style={{ color: C.textDim, fontSize: 12 }}>({colTasks.length})</span>
                  </div>
                  <div style={{ background: "#0D0D0D", border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: 12, minHeight: 120 }}>
                    {colTasks.length === 0 && (
                      <div style={{ color: C.textDim, fontSize: 12, textAlign: "center", padding: "20px 0" }}>Keine Aufgaben</div>
                    )}
                    {colTasks.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        employee={EMPLOYEES.find((e) => e.id === t.assignee)}
                        onAdvance={advance}
                        onArchive={archive}
                        onSendToAgent={sendToAgent}
                        onApproveAgent={approveAgent}
                        onRejectAgent={rejectAgent}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showNew && <NewTaskModal onClose={() => setShowNew(false)} onCreate={createTask} />}
    </div>
  );
}

// ─── WISSENSDATENBANK ────────────────────────────────────────────────────────

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

function WissensdatenbankView({ entries, setEntries }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("Alle");
  const categories = ["Alle", ...KNOWLEDGE_CATEGORIES];

  function save(data) {
    if (data.id) {
      setEntries((p) => p.map((e) => (e.id === data.id ? { ...e, ...data } : e)));
    } else {
      setEntries((p) => [...p, { ...data, id: "k" + (p.length + 1) }]);
    }
    setModal(null);
  }

  function del(id) {
    setEntries((p) => p.filter((e) => e.id !== id));
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

function KiAgentView({ knowledge, tasks, branches, setKnowledge }) {
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

function FilialenView() {
  const [branches, setBranches] = useState(BRANCHES);
  const [modalState, setModalState] = useState(null); // null | "new" | branch object

  const activeCount = branches.filter((b) => b.status === "active").length;
  const inOpeningCount = branches.filter((b) => b.status === "in_eroeffnung").length;
  const pausedCount = branches.filter((b) => b.status === "pausiert").length;

  function saveBranch(data) {
    if (data.id) {
      setBranches((prev) => prev.map((b) => (b.id === data.id ? { ...b, ...data } : b)));
    } else {
      setBranches((prev) => [
        ...prev,
        { ...data, id: "b" + (prev.length + 1), revenue: "—", openedAt: "geplant" },
      ]);
    }
    setModalState(null);
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
function PlaceholderView({ label }) {
  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, margin: "0 0 10px 0" }}>{label}</h1>
      <p style={{ color: C.textDim, fontSize: 14 }}>Dieser Bereich ist im Prototyp noch nicht ausgebaut.</p>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [openGroups, setOpenGroups] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("admin");
  const [knowledge, setKnowledge] = useState(KNOWLEDGE_INITIAL);
  const [sharedTasks] = useState(TASKS_INITIAL);
  const currentUser = ALL_USERS.find((u) => u.id === currentUserId);

  function toggleGroup(key) {
    setOpenGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
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
        onSwitchUser={setCurrentUserId}
      />
      <div style={{ flex: 1, overflow: "auto" }}>
        {active === "dashboard" && <DashboardView user={currentUser} />}
        {active === "todos" && <ToDosView currentUser={currentUser} />}
        {active === "ki_agent" && <KiAgentView knowledge={knowledge} tasks={sharedTasks} branches={BRANCHES} setKnowledge={setKnowledge} />}
        {active === "wissensdatenbank" && <WissensdatenbankView entries={knowledge} setEntries={setKnowledge} />}
        {active === "mails" && <MailsView />}
        {active === "integrationen" && <IntegrationenView />}
        {active === "filialen" && <FilialenView />}
        {!["dashboard", "todos", "ki_agent", "wissensdatenbank", "mails", "integrationen", "filialen"].includes(active) && (
          <PlaceholderView label={ALL_LABELS[active] || ""} />
        )}
      </div>
    </div>
  );
}
