import React, { useState, useEffect } from "react";
import { LogOut, TrendingUp, Clock, ShoppingBag, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { C } from "../../shared/theme.js";
import { Avatar } from "../../shared/components/Avatar.jsx";
import { StatCard } from "../../shared/components/StatCard.jsx";

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

export function DashboardView({ user }) {
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
