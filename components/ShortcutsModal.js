// components/ShortcutsModal.js
"use client";
import { useEffect } from "react";

const SHORTCUTS = [
  { section: "Global" },
  { key: "?",      desc: "Show this shortcuts panel"    },
  { key: "P",      desc: "Create a new project"        },
  { key: "C",      desc: "Go to Calendar view"         },
  { key: "Esc",    desc: "Close modal / exit mode"     },
  { section: "Project Page" },
  { key: "N",      desc: "Add a new task"              },
  { key: "/",      desc: "Focus search bar"            },
  { key: "B",      desc: "Toggle bulk-select mode"     },
  { key: "D",      desc: "Go to Dashboard"             },
  { section: "Task Card" },
  { key: "Click ✎",  desc: "Edit task"                },
  { key: "Click ⭐",  desc: "Toggle highlight"         },
  { key: "Click ↳",  desc: "Expand / add subtasks"    },
  { key: "Drag ⠿",   desc: "Reorder task (todo only)" },
];

export default function ShortcutsModal({ onClose }) {
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box animate-scale-in" style={{ maxWidth: 440 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>
            Keyboard Shortcuts
          </h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 16 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {SHORTCUTS.map((item, i) =>
            item.section ? (
              <div key={i} style={{
                fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em",
                color: "var(--muted)", marginTop: i > 0 ? 12 : 0, marginBottom: 4,
              }}>
                {item.section}
              </div>
            ) : (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 10px", borderRadius: 7, background: "var(--surface2)",
                gap: 12,
              }}>
                <kbd>{item.key}</kbd>
                <span style={{ fontSize: 13, color: "var(--muted)", flex: 1 }}>{item.desc}</span>
              </div>
            )
          )}
        </div>

        <div style={{ marginTop: 18, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
          Shortcuts work when no input is focused
        </div>
      </div>
    </div>
  );
}