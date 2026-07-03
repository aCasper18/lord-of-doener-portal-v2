import React, { useState, useEffect } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { C } from "../theme.js";
import { LOGO_SRC } from "../logo.js";
import { NAV } from "../nav.config.js";

export function Sidebar({ active, onSelect, openGroups, toggleGroup, currentUser, onLogout }) {
  return (
    <div style={{
      width: 240, flexShrink: 0,
      background: "#000",
      borderRight: "1px solid #151515",
      display: "flex", flexDirection: "column",
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #151515" }}>
        <img src={LOGO_SRC} alt="Lord of Döner" style={{ width: "100%", maxWidth: 160, display: "block" }} />
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
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
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 5, border: "none",
                  background: isActive ? "#D91B1B" : "transparent",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <Icon size={15} color={isActive ? "#fff" : "#444"} strokeWidth={isActive ? 2.5 : 1.8} />
                <span style={{
                  flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 400,
                  color: isActive ? "#fff" : "#888",
                  letterSpacing: isActive ? "0.01em" : 0,
                }}>
                  {item.label}
                </span>
                {hasChildren && (
                  <ChevronDown size={12} color="#333"
                    style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }}
                  />
                )}
              </button>

              {hasChildren && isOpen && (
                <div style={{ paddingLeft: 22, marginTop: 1, marginBottom: 4, borderLeft: "1px solid #1A1A1A", marginLeft: 21 }}>
                  {(item.children || []).map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = active === child.key;
                    return (
                      <button
                        key={child.key}
                        onClick={() => onSelect(child.key)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 9,
                          padding: "8px 10px", borderRadius: 5, border: "none",
                          background: childActive ? "#1A0000" : "transparent",
                          cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <ChildIcon size={13} color={childActive ? "#D91B1B" : "#383838"} />
                        <span style={{ fontSize: 12.5, color: childActive ? "#D91B1B" : "#555", fontWeight: childActive ? 600 : 400 }}>
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

      {/* Nutzer-Block */}
      <div style={{ padding: "14px 14px", borderTop: "1px solid #151515" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 4,
            background: currentUser.isAdmin ? "#D91B1B" : "#1A1A1A",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 11, flexShrink: 0,
          }}>
            {currentUser.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentUser.name}
            </div>
            <div style={{ color: "#444", fontSize: 10.5 }}>{currentUser.role}</div>
          </div>
          <button
            onClick={onLogout}
            title="Abmelden"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#333", padding: 4, display: "flex", alignItems: "center" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#D91B1B"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#333"}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
