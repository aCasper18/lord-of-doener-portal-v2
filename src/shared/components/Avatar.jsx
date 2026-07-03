import React, { useState, useEffect } from "react";
import { C } from "../theme.js";

export function Avatar({ initials, size = 36, tone = "ash" }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: tone === "ember" ? C.orange + "33" : "#1f1f1f",
        border: `1px solid ${tone === "ember" ? C.orange + "66" : C.panelBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: tone === "ember" ? C.orange : C.text,
        fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
