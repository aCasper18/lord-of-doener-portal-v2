import React, { useState, useEffect } from "react";
import { C } from "../theme.js";

export function StatCard({ label, value, sub, subColor, children }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 12, padding: "20px 22px", flex: 1, minWidth: 200 }}>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 10 }}>{label}</div>
      <div style={{ color: C.text, fontSize: 30, fontWeight: 700, marginBottom: 10 }}>{value}</div>
      {sub && <div style={{ color: subColor || C.textDim, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{sub}</div>}
      {children}
    </div>
  );
}
