// components/TaskCard.js
"use client";
import { useState } from "react";
import { deadlineStatus, formatDeadline } from "../lib/storage";
import SubtaskList from "./SubtaskList";

const STATUS_LABELS = {
  overdue: { label: "Overdue",   cls: "badge-danger" },
  urgent:  { label: "Due soon",  cls: "badge-warn"   },
  soon:    { label: "This week", cls: "badge-muted"  },
  ok:      { label: null,        cls: ""             },
};

const PRIORITY_BORDER = { high: "var(--danger)", normal: "var(--border)", low: "var(--surface2)" };

export default function TaskCard({
  task, projectId, projectColor,
  onToggleDone, onToggleHighlight, onEdit, onDelete,
  onSubtaskAdd, onSubtaskToggle, onSubtaskDelete,
  dragHandleProps,
  bulkMode, selected, onSelectToggle,
}) {
  const [hovering,          setHovering]          = useState(false);
  const [showSubtasks,      setShowSubtasks]       = useState(false);

  const dlStatus = deadlineStatus(task.deadline);
  const dlInfo   = dlStatus ? STATUS_LABELS[dlStatus] : null;
  const needsAttention = !task.done && (task.highlighted || dlStatus === "overdue" || dlStatus === "urgent");

  const subtasks  = task.subtasks || [];
  const subDone   = subtasks.filter(s => s.done).length;
  const hasSubtasks = subtasks.length > 0;

  const borderLeftColor =
    task.done      ? "var(--success)" :
    dlStatus === "overdue" ? "var(--danger)" :
    needsAttention ? "var(--accent)" :
    PRIORITY_BORDER[task.priority] || "var(--border)";

  const borderColor =
    needsAttention && !task.done
      ? dlStatus === "overdue" ? "rgba(224,85,85,.4)" : "rgba(232,160,32,.35)"
      : "var(--border)";

  return (
    <div
      className={needsAttention ? "attention-pulse" : ""}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        background: selected ? "rgba(232,160,32,.06)" : "var(--surface)",
        border: `1px solid ${selected ? "rgba(232,160,32,.4)" : borderColor}`,
        borderLeft: `3px solid ${borderLeftColor}`,
        borderRadius: 8, padding: "12px 14px",
        opacity: task.done ? 0.55 : 1, transition: "all 0.2s",
        outline: selected ? "1px solid rgba(232,160,32,.3)" : "none",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {/* Drag handle */}
        {dragHandleProps && (
          <span
            {...dragHandleProps}
            className="drag-handle"
            style={{
              opacity: hovering ? 1 : 0, transition: "opacity 0.15s",
              cursor: "grab", color: "var(--muted)", fontSize: 14,
              marginTop: 2, userSelect: "none", display: "flex", alignItems: "center",
            }}
            title="Drag to reorder"
          >
            ⠿
          </span>
        )}

        {/* Bulk checkbox */}
        {bulkMode && (
          <button
            className={`bulk-check ${selected ? "checked" : ""}`}
            onClick={onSelectToggle}
            style={{ marginTop: 2 }}
          >
            {selected && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}

        {/* Main checkbox */}
        <button className={`task-check ${task.done ? "done" : ""}`} onClick={onToggleDone} style={{ marginTop: 2 }}>
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500,
              color: task.done ? "var(--muted)" : "var(--text)",
              textDecoration: task.done ? "line-through" : "none", flex: 1,
            }}>
              {task.title}
            </span>
            {task.highlighted && !task.done && <span style={{ fontSize: 12 }}>⭐</span>}
          </div>

          {task.notes && (
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
              {task.notes}
            </div>
          )}

          {/* Meta */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, alignItems: "center" }}>
            {task.deadline && (
              <span style={{ fontSize: 11, color: "var(--muted)" }}>📅 {formatDeadline(task.deadline)}</span>
            )}
            {dlInfo?.label && !task.done && <span className={`badge ${dlInfo.cls}`}>{dlInfo.label}</span>}
            {task.priority !== "normal" && (
              <span className={`badge ${task.priority === "high" ? "badge-danger" : "badge-muted"}`}>{task.priority}</span>
            )}
            {task.done && task.completedAt && (
              <span style={{ fontSize: 11, color: "var(--success)" }}>
                ✓ {new Date(task.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
            {/* Subtask count toggle */}
            {(hasSubtasks || !task.done) && (
              <button
                onClick={() => setShowSubtasks(v => !v)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 11, color: hasSubtasks ? "var(--accent)" : "var(--muted)",
                  fontFamily: "var(--font-mono)", padding: "1px 4px", borderRadius: 4,
                  transition: "color 0.15s",
                }}
              >
                {hasSubtasks
                  ? `↳ ${subDone}/${subtasks.length} subtasks ${showSubtasks ? "▲" : "▼"}`
                  : `+ subtasks`
                }
              </button>
            )}
          </div>
        </div>

        {/* Hover actions */}
        <div style={{ display: "flex", gap: 2, opacity: hovering && !bulkMode ? 1 : 0, transition: "opacity 0.15s" }}>
          <button className="btn-icon" onClick={onToggleHighlight} title="Highlight" style={{ fontSize: 13, color: task.highlighted ? "var(--accent)" : "var(--muted)" }}>⭐</button>
          <button className="btn-icon" onClick={onEdit}   title="Edit"   style={{ fontSize: 13 }}>✎</button>
          <button className="btn-icon" onClick={onDelete} title="Delete" style={{ fontSize: 13, color: "var(--danger)" }}>✕</button>
        </div>
      </div>

      {/* Subtasks (expanded) */}
      {showSubtasks && (
        <SubtaskList
          task={task} projectId={projectId}
          onAdd={onSubtaskAdd} onToggle={onSubtaskToggle} onDelete={onSubtaskDelete}
        />
      )}
    </div>
  );
}