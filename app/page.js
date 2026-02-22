"use client";
import { useState } from "react";
import Link from "next/link";
import AppShell from "../components/AppShell";
import { useProjects, useDashboard } from "../lib/hooks/useProjects";
import ProjectModal from "../components/ProjectModal";
import { deadlineStatus, formatDeadline } from "../lib/storage";
import { ICON_MAP } from "../lib/icons";

// 1. Import Lucide Icons
import { 
  LayoutGrid, 
  AlertTriangle, 
  Plus, 
  ChevronRight, 
  Star, 
  FolderPlus,
  Briefcase,
  ListTodo,
  CheckCircle2,
  AlertCircle 
} from "lucide-react";

export default function DashboardPage() {
  const { projects, addProject } = useProjects();
  const { attentionTasks, stats } = useDashboard();
  const [showNewProject, setShowNewProject] = useState(false);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <AppShell>
      <div style={{ padding: "40px 40px 60px", maxWidth: 900 }}>
        {/* Header */}
        <div className="animate-fade-up" style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 36,
            fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.1,
          }}>
            Good{greeting()},{" "}
            <span style={{ fontWeight: 600 }}>let's get things done.</span>
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 13 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats strip - Added icons for visual clarity */}
        <div
          className="animate-fade-up stagger"
          style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 36,
            animationDelay: "0.05s",
          }}
        >
          <StatCard label="Projects" value={stats.totalProjects} icon={<Briefcase size={16} />} />
          <StatCard label="Tasks" value={stats.totalTasks} icon={<ListTodo size={16} />} />
          <StatCard label="Completed" value={stats.doneTasks} accent="var(--success)" icon={<CheckCircle2 size={16} />} />
          <StatCard label="Overdue" value={stats.overdueTasks} accent={stats.overdueTasks > 0 ? "var(--danger)" : undefined} icon={<AlertCircle size={16} />} />
        </div>

        {/* Attention tasks */}
        {attentionTasks.length > 0 && (
          <section className="animate-fade-up" style={{ marginBottom: 36, animationDelay: "0.1s" }}>
            <SectionHeader
              icon={<AlertTriangle size={18} />}
              title="Needs Attention"
              color="var(--warn)"
              count={attentionTasks.length}
            />
            <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {attentionTasks.map((t) => (
                <AttentionTaskRow key={t.id} task={t} />
              ))}
            </div>
          </section>
        )}

        {/* Projects grid */}
        <section className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <SectionHeader icon={<LayoutGrid size={18} />} title="Projects" count={projects.length} />
            <button
              className="btn btn-primary"
              onClick={() => setShowNewProject(true)}
              style={{ padding: "7px 14px", fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <EmptyState onAdd={() => setShowNewProject(true)} />
          ) : (
            <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {recentProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </section>
      </div>

      {showNewProject && (
        <ProjectModal
          onSave={(data) => addProject(data)}
          onClose={() => setShowNewProject(false)}
        />
      )}
    </AppShell>
  );
}

// ─── Refined Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "16px 18px",
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600,
          color: accent ?? "var(--text)", lineHeight: 1,
        }}>
          {value}
        </div>
        <div style={{ color: accent ?? "var(--muted)", opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, count, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: color ?? "var(--accent)", display: 'flex' }}>{icon}</span>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>{title}</h2>
      {count != null && (
        <span style={{
          fontSize: 11, background: "var(--surface2)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "2px 8px", color: "var(--muted)",
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

function AttentionTaskRow({ task }) {
  const dlStatus = deadlineStatus(task.deadline);
  return (
    <Link href={`/projects/${task.projectId}`} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "var(--surface)", border: "1px solid",
        borderColor: dlStatus === "overdue" ? "rgba(224,85,85,0.3)" : "rgba(232,160,32,0.25)",
        borderLeft: `3px solid ${dlStatus === "overdue" ? "var(--danger)" : "var(--warn)"}`,
        borderRadius: 8, padding: "10px 14px",
        transition: "background 0.15s",
      }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface2)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface)"}
      >
        {task.highlighted && <Star size={14} fill="var(--accent)" color="var(--accent)" />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{task.title}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
            {task.projectName}
            {task.deadline && ` · Due ${formatDeadline(task.deadline)}`}
          </div>
        </div>
        {dlStatus === "overdue" && <span className="badge badge-danger">Overdue</span>}
        {dlStatus === "urgent"  && <span className="badge badge-warn">Due soon</span>}
        <ChevronRight size={16} style={{ color: "var(--muted)", opacity: 0.5 }} />
      </div>
    </Link>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div style={{
      border: "2px dashed var(--border)", borderRadius: 12,
      padding: "50px 24px", textAlign: "center",
    }}>
      <div style={{ color: "var(--muted)", marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <FolderPlus size={48} strokeWidth={1} />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
        No projects yet
      </div>
      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>
        Create your first project to start tracking tasks
      </div>
      <button className="btn btn-primary" onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Plus size={16} /> Create project
      </button>
    </div>
  );
}

function ProjectCard({ project }) {
  const total = project.tasks.length;
  const done  = project.tasks.filter((t) => t.done).length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  const overdue = project.tasks.filter(
    (t) => !t.done && deadlineStatus(t.deadline) === "overdue"
  ).length;
  
  // Look up the component based on the key string
  // Fallback to 'Folder' if the key isn't found
  const IconComponent = ICON_MAP[project.icon] || ICON_MAP.folder;

  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
      <div
        className="project-card-container" // Use classes for cleaner hover logic if possible
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "18px", cursor: "pointer",
          borderTop: `3px solid ${project.color}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
          {/* Render the component here */}
          <div style={{ color: project.color }}>
            <IconComponent size={24} strokeWidth={2} />
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
              {project.name}
            </div>
            {project.description && (
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {project.description}
              </div>
            )}
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 8 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: project.color }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {done}/{total} tasks · {pct}%
          </span>
          {overdue > 0 && (
            <span className="badge badge-danger">{overdue} overdue</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return " morning";
  if (h < 17) return " afternoon";
  return " evening";
}
