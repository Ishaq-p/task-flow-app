"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../lib/hooks/useTheme";
import { ICON_MAP } from "../lib/icons"; // Import our central map

// 1. Import Lucide icons for static navigation
import { 
  Home, 
  Calendar, 
  Plus, 
  Sun, 
  Moon, 
  DownloadCloud 
} from "lucide-react";

export default function Sidebar({ projects, onAddProject, onExportImport }) {
  const path = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "22px 20px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, letterSpacing: "-.02em" }}>
          Task<span style={{ color: "var(--accent)" }}>Flow</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>personal task tracker</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "10px 12px 0" }}>
        <NavItem 
          href="/" 
          active={path === "/"} 
          icon={<Home size={16} />} 
          label="Dashboard" 
        />
        <NavItem 
          href="/calendar" 
          active={path === "/calendar"} 
          icon={<Calendar size={16} />} 
          label="Calendar" 
        />
      </nav>

      {/* Projects header */}
      <div style={{ padding: "14px 12px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)" }}>
          Projects
        </span>
        <button className="btn-icon" onClick={onAddProject} title="New project (P)">
          <Plus size={14} />
        </button>
      </div>

      {/* Project list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
        {projects.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--muted)", padding: "8px", fontStyle: "italic" }}>No projects yet</div>
        )}
        {projects.map(p => {
          const total = p.tasks.length;
          const done  = p.tasks.filter(t => t.done).length;
          const active = path === `/projects/${p.id}`;
          
          // 2. Look up the Lucide component for each project
          const ProjectIcon = ICON_MAP[p.icon] || ICON_MAP.folder;

          return (
            <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "7px 10px", borderRadius: 8, marginBottom: 2,
                  background: active ? "var(--surface2)" : "transparent",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                  color: active ? "var(--text)" : "var(--muted)",
                  transition: "all 0.15s", cursor: "pointer",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--surface2)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ color: active ? p.color : "inherit", display: 'flex' }}>
                   <ProjectIcon size={14} strokeWidth={active ? 2 : 1.5} />
                </span>
                <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 10, color: done === total && total > 0 ? "var(--success)" : "var(--muted)" }}>
                  {done}/{total}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: "1px solid var(--border)",
            borderRadius: 8, padding: "7px 10px", cursor: "pointer",
            color: "var(--muted)", fontSize: 12, fontFamily: "var(--font-mono)",
            transition: "all 0.15s", width: "100%",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--muted)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>

        {/* Export / Import */}
        <button
          onClick={onExportImport}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "transparent", border: "none",
            borderRadius: 8, padding: "4px 10px", cursor: "pointer",
            color: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
        >
          <DownloadCloud size={14} /> Export / Import data
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, active, icon, label }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "7px 10px", borderRadius: 8, marginBottom: 2,
        background: active ? "var(--surface2)" : "transparent",
        border: active ? "1px solid var(--border)" : "1px solid transparent",
        color: active ? "var(--text)" : "var(--muted)",
        fontSize: 13, transition: "all 0.15s",
      }}>
        <span style={{ display: 'flex', color: active ? 'var(--accent)' : 'inherit' }}>
          {icon}
        </span>
        {label}
      </div>
    </Link>
  );
}