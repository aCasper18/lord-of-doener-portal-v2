import React, { useState, useEffect } from "react";
import { Mail, MessageCircle, ListChecks, X, Plus, Loader2, ArrowLeft, Archive, ArchiveRestore, Award, ChevronsRight, Inbox, Bot, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { C } from "../../shared/theme.js";
import { Avatar } from "../../shared/components/Avatar.jsx";
import { EMPLOYEES } from "../../shared/constants/employees.js";
import { apiFetch } from "../../api/client.js";
import { usePolling } from "../../hooks/usePolling.js";

const TASK_COLUMNS = [
  { key: "open", label: "Offen", color: "#9A9A95" },
  { key: "in_progress", label: "In Bearbeitung", color: "#5B9BF0" },
  { key: "done", label: "Erledigt", color: "#5FBF6E" },
];

const SOURCE_ICON = { mail: Mail, whatsapp: MessageCircle, planner: ListChecks };
const SOURCE_LABEL = { mail: "Mail", whatsapp: "WhatsApp", planner: "Planner" };


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

export function ToDosView({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  // Tasks aus der Datenbank laden. Wird per Polling regelmaessig erneut
  // aufgerufen, damit Aenderungen anderer Nutzer sichtbar werden (siehe Plan:
  // einfaches Interval-Polling statt WebSockets/SSE fuer dieses kleine Team).
  function loadTasks() {
    apiFetch("/tasks")
      .then((data) => {
        if (!Array.isArray(data)) return;
        setTasks((prev) => {
          const prevById = new Map(prev.map((t) => [t.id, t]));
          return data.map((t) => {
            const existing = prevById.get(t.id);
            return {
              id: t.id,
              title: t.title,
              note: t.note || "",
              assignee: t.assignee_id,
              assigneeName: t.assignee_name,
              source: t.source || "planner",
              status: t.status || "open",
              createdAt: t.created_at ? t.created_at.slice(0, 10) : "",
              completedAt: t.completed_at ? t.completed_at.slice(0, 10) : null,
              // Nur clientseitige, nicht persistierte KI-Vorschau-States uebernehmen
              agentState: existing?.agentState,
              agentProposal: existing?.agentProposal,
            };
          });
        });
      })
      .catch((err) => console.error("Konnte ToDos nicht laden:", err))
      .finally(() => setLoading(false));
  }

  usePolling(loadTasks, 20000);

  // Hilfsfunktion: Änderung an einen Task in der DB speichern
  async function persistTask(id, changes) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const merged = { ...task, ...changes };
    try {
      await apiFetch(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: merged.title,
          note: merged.note,
          assignee_id: merged.assignee,
          source: merged.source,
          status: merged.status,
          completed_at: merged.completedAt || null,
        }),
      });
    } catch (err) {
      console.error(`ToDo ${id} konnte nicht gespeichert werden:`, err);
    }
  }

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
    const completedAt = new Date().toISOString().slice(0, 10);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, agentState: null, agentProposal: null, status: "done", completedAt }
          : t
      )
    );
    persistTask(id, { status: "done", completedAt });
  }

  function rejectAgent(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, agentState: null, agentProposal: null } : t)));
  }

  function advance(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const idx = TASK_COLUMNS.findIndex((c) => c.key === task.status);
    const next = TASK_COLUMNS[idx + 1];
    if (!next) return;
    const completedAt = next.key === "done" ? new Date().toISOString().slice(0, 10) : task.completedAt;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: next.key, completedAt } : t)));
    persistTask(id, { status: next.key, completedAt });
  }

  function archive(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "archived" } : t)));
    persistTask(id, { status: "archived" });
  }

  function restore(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "done" } : t)));
    persistTask(id, { status: "done" });
  }

  async function createTask({ title, assignee, source, note }) {
    try {
      const created = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title, note, assignee_id: assignee, source, status: "open" }),
      });
      setTasks((prev) => [
        {
          id: created.id,
          title: created.title,
          note: created.note || "",
          assignee: created.assignee_id,
          source: created.source || "planner",
          status: "open",
          createdAt: created.created_at ? created.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
          completedAt: null,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("ToDo konnte nicht angelegt werden:", err);
    }
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

// ─── LOGIN ───────────────────────────────────────────────────────────────────

// Demo-Nutzer für Fallback wenn API nicht erreichbar
