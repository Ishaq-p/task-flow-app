// components/SubtaskList.js
"use client";
import { useState, useRef } from "react";

export default function SubtaskList({ task, projectId, onAdd, onToggle, onDelete }) {
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef(null);
  const subtasks = task.subtasks || [];
  const doneCount = subtasks.filter(s => s.done).length;

  function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd(projectId, task.id, newTitle.trim());
    setNewTitle("");
    inputRef.current?.focus();
  }

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
      {/* Progress */}
      {subtasks.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${subtasks.length > 0 ? Math.round(doneCount / subtasks.length * 100) : 0}%`, background: "var(--success)" }} />
          </div>
          <span style={{ fontSize: 10, color: "var(--muted)", whiteSpace: "nowrap" }}>
            {doneCount}/{subtasks.length}
          </span>
        </div>
      )}

      {/* Subtask items */}
      {subtasks.map(s => (
        <div
          key={s.id}
          className="subtask-item"
          style={{ gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border)" }}
          onMouseEnter={e => e.currentTarget.querySelector(".sub-del").style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.querySelector(".sub-del").style.opacity = "0"}
        >
          <button
            className={`subtask-check ${s.done ? "done" : ""}`}
            onClick={() => onToggle(projectId, task.id, s.id)}
          >
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span style={{
            flex: 1, fontSize: 12, lineHeight: 1.5,
            color: s.done ? "var(--muted)" : "var(--text)",
            textDecoration: s.done ? "line-through" : "none",
          }}>
            {s.title}
          </span>
          <button
            className="sub-del btn-icon"
            style={{ opacity: 0, transition: "opacity 0.15s", fontSize: 11, color: "var(--danger)", padding: "2px" }}
            onClick={() => onDelete(projectId, task.id, s.id)}
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add subtask input */}
      <form onSubmit={handleAdd} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>+</span>
        <input
          ref={inputRef}
          className="subtask-add-input"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a subtask…"
          onKeyDown={e => { if (e.key === "Escape") setNewTitle(""); }}
        />
        {newTitle.trim() && (
          <button type="submit" style={{
            background: "var(--accent)", color: "#0d0d0d", border: "none",
            borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer",
            fontFamily: "var(--font-mono)",
          }}>
            Add
          </button>
        )}
      </form>
    </div>
  );
}