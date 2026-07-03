import React, { useState, useEffect } from "react";
import { Clock, Mail, X, Bell, Plus, Loader2, ArrowLeft, ListTodo, Bot, Send, Trash2, Workflow, Play } from "lucide-react";
import { C } from "../../shared/theme.js";
import { apiFetch } from "../../api/client.js";
import { usePolling } from "../../hooks/usePolling.js";

const WF_TRIGGERS = [
  { key: "manual", label: "Manuell gestartet", icon: Play, desc: "Du startest den Workflow per Klick" },
  { key: "new_mail", label: "Neue Mail", icon: Mail, desc: "Läuft, wenn eine neue Mail eingeht" },
  { key: "new_task", label: "Neue Aufgabe", icon: ListTodo, desc: "Läuft, wenn eine Aufgabe erstellt wird" },
  { key: "schedule", label: "Zeitplan", icon: Clock, desc: "Läuft z. B. jeden Montag" },
];

const WF_ACTIONS = [
  { key: "ai", label: "KI-Schritt", icon: Bot, desc: "Claude analysieren / schreiben lassen", color: "#D91B1B" },
  { key: "create_task", label: "Aufgabe erstellen", icon: ListTodo, desc: "Legt eine neue Aufgabe an", color: "#4A7FC1" },
  { key: "send_mail", label: "Mail senden", icon: Send, desc: "Verschickt eine E-Mail", color: "#3D9E5C" },
  { key: "notify", label: "Benachrichtigung", icon: Bell, desc: "Interne Benachrichtigung", color: "#C9A24B" },
];


function StepConfigModal({ step, onClose, onSave }) {
  const [config, setConfig] = useState(step.config || {});
  const up = (k, v) => setConfig((p) => ({ ...p, [k]: v }));
  const meta = [...WF_TRIGGERS, ...WF_ACTIONS].find((x) => x.key === step.type);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {meta && <meta.icon size={18} color="#D91B1B" />}
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 800, margin: 0 }}>{meta?.label}</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#444" }}><X size={18} /></button>
        </div>

        {step.type === "ai" && (
          <>
            <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Anweisung an die KI</label>
            <textarea value={config.prompt || ""} onChange={(e) => up("prompt", e.target.value)} rows={5} placeholder="z. B. Fasse die eingegangene Mail zusammen und schlage eine freundliche Antwort vor."
              style={{ width: "100%", boxSizing: "border-box", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 13, lineHeight: 1.5, resize: "vertical", fontFamily: "inherit" }} />
          </>
        )}
        {step.type === "create_task" && (
          <>
            <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Aufgaben-Titel</label>
            <input value={config.title || ""} onChange={(e) => up("title", e.target.value)} placeholder="z. B. Beschwerde prüfen"
              style={{ width: "100%", boxSizing: "border-box", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 13 }} />
          </>
        )}
        {step.type === "send_mail" && (
          <>
            <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Empfänger</label>
            <input value={config.to || ""} onChange={(e) => up("to", e.target.value)} placeholder="name@example.com"
              style={{ width: "100%", boxSizing: "border-box", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 13, marginBottom: 12 }} />
            <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Betreff</label>
            <input value={config.subject || ""} onChange={(e) => up("subject", e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 13 }} />
          </>
        )}
        {step.type === "notify" && (
          <>
            <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nachricht</label>
            <input value={config.message || ""} onChange={(e) => up("message", e.target.value)} placeholder="z. B. Neue Beschwerde eingegangen"
              style={{ width: "100%", boxSizing: "border-box", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 13 }} />
          </>
        )}
        {step.type === "schedule" && (
          <>
            <label style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Wann?</label>
            <select value={config.when || "monday"} onChange={(e) => up("when", e.target.value)}
              style={{ width: "100%", background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 6, padding: "11px 12px", color: "#fff", fontSize: 13 }}>
              <option value="daily">Täglich</option>
              <option value="monday">Jeden Montag</option>
              <option value="month_start">Monatsanfang</option>
            </select>
          </>
        )}
        {(step.type === "manual" || step.type === "new_mail" || step.type === "new_task") && (
          <p style={{ color: "#666", fontSize: 13, margin: 0 }}>{meta?.desc} — keine weitere Einstellung nötig.</p>
        )}

        <button onClick={() => onSave(config)}
          style={{ width: "100%", marginTop: 22, background: "#D91B1B", border: "none", borderRadius: 6, padding: "12px", color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer" }}>
          Übernehmen
        </button>
      </div>
    </div>
  );
}

function WorkflowEditor({ workflow, onBack, onSave }) {
  const [name, setName] = useState(workflow?.name || "");
  const [trigger, setTrigger] = useState(workflow?.trigger_type || null);
  const [steps, setSteps] = useState(workflow?.steps || []);
  const [addingAfter, setAddingAfter] = useState(null); // index or null
  const [configStep, setConfigStep] = useState(null); // { step, index }
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function addStep(type, atIndex) {
    const newStep = { id: Date.now(), type, config: {} };
    setSteps((prev) => {
      const copy = [...prev];
      copy.splice(atIndex ?? copy.length, 0, newStep);
      return copy;
    });
    setAddingAfter(null);
    setConfigStep({ step: newStep, index: atIndex ?? steps.length });
  }

  function removeStep(id) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function saveStepConfig(config) {
    setSteps((prev) => prev.map((s) => (s.id === configStep.step.id ? { ...s, config } : s)));
    setConfigStep(null);
  }

  async function handleSave() {
    if (!name.trim() || !trigger) return;
    setSaving(true);
    setSaveError("");
    const payload = { name, description: "", trigger_type: trigger, steps, active: true };
    try {
      const method = workflow?.id ? "PUT" : "POST";
      const path = workflow?.id ? `/workflows/${workflow.id}` : "/workflows";
      const saved = await apiFetch(path, { method, body: JSON.stringify(payload) });
      onSave(saved);
    } catch (err) {
      setSaveError(err.message || "Workflow konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  const triggerMeta = WF_TRIGGERS.find((t) => t.key === trigger);
  const canSave = name.trim() && trigger;

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif", maxWidth: 720 }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>
        <ArrowLeft size={15} /> Zurück zur Übersicht
      </button>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow benennen…"
        style={{ width: "100%", boxSizing: "border-box", background: "none", border: "none", borderBottom: "2px solid #1E1E1E", padding: "6px 0", color: "#fff", fontSize: 26, fontWeight: 800, marginBottom: 32, outline: "none" }} />

      {/* Trigger */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Auslöser</div>
        {!trigger ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {WF_TRIGGERS.map((t) => (
              <button key={t.key} onClick={() => setTrigger(t.key)}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 8, border: "1px solid #1E1E1E", background: "#111", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#D91B1B"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1E1E1E"}>
                <t.icon size={18} color="#D91B1B" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13.5 }}>{t.label}</div>
                  <div style={{ color: "#555", fontSize: 11.5, marginTop: 2 }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 8, border: "1px solid #D91B1B44", background: "#1a0808" }}>
            {triggerMeta && <triggerMeta.icon size={18} color="#D91B1B" />}
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13.5 }}>{triggerMeta?.label}</div>
              <div style={{ color: "#666", fontSize: 11.5 }}>{triggerMeta?.desc}</div>
            </div>
            <button onClick={() => setTrigger(null)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 12 }}>Ändern</button>
          </div>
        )}
      </div>

      {/* Steps */}
      {trigger && (
        <div style={{ marginTop: 8 }}>
          {steps.map((step, i) => {
            const meta = WF_ACTIONS.find((a) => a.key === step.type);
            return (
              <div key={step.id}>
                <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
                  <div style={{ width: 2, height: 18, background: "#1E1E1E" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 8, border: "1px solid #1E1E1E", background: "#111" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: (meta?.color || "#555") + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {meta && <meta.icon size={15} color={meta.color} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 13.5 }}>{meta?.label}</div>
                    <div style={{ color: "#555", fontSize: 11.5 }}>
                      {step.config && Object.keys(step.config).length > 0
                        ? Object.values(step.config)[0]?.toString().slice(0, 50) || meta?.desc
                        : meta?.desc}
                    </div>
                  </div>
                  <button onClick={() => setConfigStep({ step, index: i })} style={{ background: "none", border: "1px solid #1E1E1E", borderRadius: 5, padding: "5px 10px", color: "#888", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Bearbeiten</button>
                  <button onClick={() => removeStep(step.id)} style={{ background: "none", border: "none", color: "#D91B1B", cursor: "pointer", display: "flex" }}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}

          {/* Add step */}
          <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
            <div style={{ width: 2, height: 18, background: "#1E1E1E" }} />
          </div>
          {addingAfter === "open" ? (
            <div style={{ border: "1px solid #1E1E1E", borderRadius: 8, background: "#0D0D0D", padding: 12 }}>
              <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>Schritt hinzufügen</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {WF_ACTIONS.map((a) => (
                  <button key={a.key} onClick={() => addStep(a.key)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 7, border: "1px solid #1E1E1E", background: "#111", cursor: "pointer", textAlign: "left" }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = a.color}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1E1E1E"}>
                    <a.icon size={16} color={a.color} />
                    <div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: 12.5 }}>{a.label}</div>
                      <div style={{ color: "#555", fontSize: 10.5 }}>{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setAddingAfter(null)} style={{ width: "100%", marginTop: 8, background: "none", border: "none", color: "#555", fontSize: 12, cursor: "pointer", padding: 6 }}>Abbrechen</button>
            </div>
          ) : (
            <button onClick={() => setAddingAfter("open")}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 8, border: "1px dashed #2A2A2A", background: "none", color: "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={15} /> Schritt hinzufügen
            </button>
          )}
        </div>
      )}

      {/* Save */}
      {saveError && (
        <div style={{ color: "#D91B1B", fontSize: 12.5, marginTop: 16 }}>{saveError}</div>
      )}
      <button onClick={handleSave} disabled={!canSave || saving}
        style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 8, background: canSave && !saving ? "#D91B1B" : "#1A1A1A", border: "none", borderRadius: 6, padding: "13px 24px", color: canSave && !saving ? "#fff" : "#444", fontWeight: 800, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", cursor: canSave && !saving ? "pointer" : "not-allowed" }}>
        {saving && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
        Workflow speichern
      </button>

      {configStep && <StepConfigModal step={configStep.step} onClose={() => setConfigStep(null)} onSave={saveStepConfig} />}
    </div>
  );
}

export function WorkflowsView() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | workflow

  function loadWorkflows() {
    apiFetch("/workflows")
      .then((data) => { if (Array.isArray(data)) setWorkflows(data); })
      .catch((err) => console.error("Konnte Workflows nicht laden:", err))
      .finally(() => setLoading(false));
  }

  usePolling(loadWorkflows, 20000);

  function handleSaved(saved) {
    setWorkflows((prev) => {
      const exists = prev.find((w) => w.id === saved.id);
      return exists ? prev.map((w) => (w.id === saved.id ? saved : w)) : [...prev, saved];
    });
    setEditing(null);
  }

  async function toggleActive(wf) {
    const updated = { ...wf, active: !wf.active };
    setWorkflows((prev) => prev.map((w) => (w.id === wf.id ? updated : w)));
    try {
      await apiFetch(`/workflows/${wf.id}`, { method: "PUT", body: JSON.stringify(updated) });
    } catch (err) {
      console.error(`Workflow ${wf.id} konnte nicht aktualisiert werden:`, err);
      setWorkflows((prev) => prev.map((w) => (w.id === wf.id ? wf : w)));
    }
  }

  async function deleteWf(id) {
    const previous = workflows;
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    try {
      await apiFetch(`/workflows/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(`Workflow ${id} konnte nicht geloescht werden:`, err);
      setWorkflows(previous);
    }
  }

  if (editing) {
    return <WorkflowEditor workflow={editing === "new" ? null : editing} onBack={() => setEditing(null)} onSave={handleSaved} />;
  }

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ width: 28, height: 3, background: "#D91B1B", marginBottom: 10 }} />
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 4px 0", letterSpacing: "-0.01em" }}>Workflows</h1>
          <p style={{ color: "#555", fontSize: 13, margin: 0 }}>Automatisierungen per Baukasten — Auslöser wählen, Schritte verketten, fertig.</p>
        </div>
        <button onClick={() => setEditing("new")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#D91B1B", border: "none", borderRadius: 6, padding: "11px 18px", color: "#fff", fontWeight: 800, fontSize: 12.5, letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer" }}>
          <Plus size={14} /> Neuer Workflow
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#444", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Wird geladen…
        </div>
      ) : workflows.length === 0 ? (
        <div style={{ padding: "60px 20px", textAlign: "center", border: "1px dashed #1E1E1E", borderRadius: 10 }}>
          <Workflow size={32} color="#333" style={{ marginBottom: 14 }} />
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Noch keine Workflows</div>
          <div style={{ color: "#555", fontSize: 13, marginBottom: 20 }}>Erstelle deine erste Automatisierung — z. B. Beschwerde-Mail → KI-Antwort → Aufgabe.</div>
          <button onClick={() => setEditing("new")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D91B1B", border: "none", borderRadius: 6, padding: "11px 18px", color: "#fff", fontWeight: 800, fontSize: 12.5, letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer" }}>
            <Plus size={14} /> Workflow erstellen
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {workflows.map((wf) => {
            const t = WF_TRIGGERS.find((x) => x.key === wf.trigger_type);
            const stepCount = Array.isArray(wf.steps) ? wf.steps.length : 0;
            return (
              <div key={wf.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 10, border: "1px solid #1E1E1E", background: "#111" }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "#1a0808", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {t ? <t.icon size={18} color="#D91B1B" /> : <Workflow size={18} color="#D91B1B" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{wf.name}</div>
                  <div style={{ color: "#555", fontSize: 12 }}>
                    {t?.label || "Auslöser"} · {stepCount} {stepCount === 1 ? "Schritt" : "Schritte"}
                  </div>
                </div>
                <button onClick={() => toggleActive(wf)}
                  style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: wf.active ? "#3D9E5C" : "#555", border: `1px solid ${wf.active ? "#3D9E5C44" : "#1E1E1E"}`, borderRadius: 4, padding: "4px 10px", background: "none", cursor: "pointer" }}>
                  {wf.active ? "Aktiv" : "Pausiert"}
                </button>
                <button onClick={() => setEditing(wf)} style={{ background: "none", border: "1px solid #1E1E1E", borderRadius: 5, padding: "6px 12px", color: "#888", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Bearbeiten</button>
                <button onClick={() => deleteWf(wf.id)} style={{ background: "none", border: "none", color: "#D91B1B", cursor: "pointer", display: "flex" }}><Trash2 size={15} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
