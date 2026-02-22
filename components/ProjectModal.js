"use client";
import { useState, useEffect } from "react";
// Import icons to use in the picker
import { 
  Folder, Plane, Home, GraduationCap, Briefcase, 
  Activity, CreditCard, Key, Book, Target, 
  Leaf, Rocket, Lightbulb, ShieldCheck, ClipboardList, Landmark 
} from "lucide-react";

// 1. Create a mapping of string keys to Components
const ICON_MAP = {
  folder: Folder,
  plane: Plane,
  home: Home,
  grad: GraduationCap,
  work: Briefcase,
  health: Activity,
  money: CreditCard,
  key: Key,
  book: Book,
  target: Target,
  leaf: Leaf,
  rocket: Rocket,
  idea: Lightbulb,
  security: ShieldCheck,
  list: ClipboardList,
  bank: Landmark
};

const COLORS = ["#e8a020","#e05555","#5bbf7a","#5b9bbf","#9b5bbf","#bf5b9b","#bfaa5b","#5bbfb7"];

export default function ProjectModal({ initial = null, onSave, onClose }) {
  const editing = !!initial;

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  // Store the key string instead of the emoji
  const [iconKey, setIconKey] = useState(initial?.icon ?? "folder");
  const [color, setColor] = useState(initial?.color ?? "#e8a020");
  const [error, setError] = useState("");

  // Helper to render the current icon
  const SelectedIcon = ICON_MAP[iconKey] || Folder;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Project name is required."); return; }
    // Save the iconKey string
    onSave({ name: name.trim(), description: description.trim(), icon: iconKey, color });
    onClose();
  }

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box animate-scale-in">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
          {editing ? "Edit Project" : "New Project"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Preview */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px", borderRadius: 10,
            background: `linear-gradient(135deg, ${color}18, ${color}08)`,
            border: `1px solid ${color}40`,
          }}>
            <div style={{ color: color }}>
               <SelectedIcon size={32} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>
                {name || "Project name"}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {description || "No description"}
              </div>
            </div>
          </div>

          <div className="field">
            <label>Project name *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="e.g. Visa Application"
            />
            {error && <span style={{ color: "var(--danger)", fontSize: 12 }}>{error}</span>}
          </div>

          {/* Icon picker */}
          <div className="field">
            <label>Icon</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 }}>
              {Object.keys(ICON_MAP).map((key) => {
                const IconComponent = ICON_MAP[key];
                return (
                  <button
                    key={key} type="button"
                    onClick={() => setIconKey(key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: "8px", border: "none",
                      borderRadius: 8, cursor: "pointer",
                      background: iconKey === key ? `${color}30` : "var(--surface2)",
                      border: iconKey === key ? `1.5px solid ${color}80` : "1.5px solid transparent",
                      color: iconKey === key ? color : "var(--muted)",
                      transition: "all 0.15s",
                    }}
                  >
                    <IconComponent size={20} strokeWidth={iconKey === key ? 2 : 1.5} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color picker */}
          <div className="field">
            <label>Color</label>
            <div style={{ display: "flex", gap: 8 }}>
              {COLORS.map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: c, border: "none", cursor: "pointer",
                    outline: color === c ? `2px solid ${c}` : "none",
                    outlineOffset: 2, transition: "outline 0.15s",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editing ? "Save changes" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}