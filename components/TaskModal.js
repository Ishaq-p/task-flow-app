
// components/TaskModal.js
"use client";
import { useState, useEffect } from "react";

// const EMOJIS = ["📋", "✍️", "📄", "🔑", "📞", "💳", "🏠", "✈️", "💡", "🔧", "📦", "🎯"];

export default function TaskModal({ initial = null, onSave, onClose }) {
  const editing = !!initial;

  const [title,    setTitle]    = useState(initial?.title    ?? "");
  const [notes,    setNotes]    = useState(initial?.notes    ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ? initial.deadline.slice(0, 10) : "");
  const [priority, setPriority] = useState(initial?.priority ?? "normal");
  const [highlighted, setHighlighted] = useState(initial?.highlighted ?? false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError("Task title is required."); return; }
    onSave({
      title: title.trim(),
      notes: notes.trim(),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      priority,
      highlighted,
    });
    onClose();
  }

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box animate-scale-in">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
          {editing ? "Edit Task" : "New Task"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label>Task title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="e.g. Write Statement of Purpose"
            />
            {error && <span style={{ color: "var(--danger)", fontSize: 12 }}>{error}</span>}
          </div>

          <div className="field">
            <label>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={3}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Deadline (optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="field">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Highlight toggle */}
          <label style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            padding: "10px 12px", borderRadius: 8,
            background: highlighted ? "rgba(232,160,32,0.08)" : "var(--surface2)",
            border: `1px solid ${highlighted ? "rgba(232,160,32,0.3)" : "var(--border)"}`,
            transition: "all 0.2s",
          }}>
            <input
              type="checkbox"
              checked={highlighted}
              onChange={(e) => setHighlighted(e.target.checked)}
              style={{ accentColor: "var(--accent)", width: 15, height: 15 }}
            />
            <span style={{ fontSize: 13 }}>⭐ Mark as highlighted — will show on Dashboard</span>
          </label>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editing ? "Save changes" : "Add task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}