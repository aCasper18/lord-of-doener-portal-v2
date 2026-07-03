import React, { useState, useEffect } from "react";
import { C } from "../theme.js";

export function PlaceholderView({ label }) {
  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, margin: "0 0 10px 0" }}>{label}</h1>
      <p style={{ color: C.textDim, fontSize: 14 }}>Dieser Bereich ist im Prototyp noch nicht ausgebaut.</p>
    </div>
  );
}
