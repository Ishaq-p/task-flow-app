// app/projects/[id]/page.js
"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext, closestCenter,
  PointerSensor, KeyboardSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";

import AppShell        from "../../../components/AppShell";
import SortableTaskCard from "../../../components/SortableTaskCard";
import TaskCard        from "../../../components/TaskCard";
import TaskModal       from "../../../components/TaskModal";
import ProjectModal    from "../../../components/ProjectModal";
import BulkActionBar   from "../../../components/BulkActionBar";
import ShortcutsModal  from "../../../components/ShortcutsModal";
import { useProjects } from "../../../lib/hooks/useProjects";
import { ICON_MAP } from "../../../lib/icons";


const FILTERS = ["all", "todo", "done"];
const SORTS   = [
  { value: "created",  label: "Date added" },
  { value: "deadline", label: "Deadline"   },
  { value: "priority", label: "Priority"   },
];
const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 };

export default function ProjectPage() {
  const params  = useParams();
  const router  = useRouter();
  const searchRef = useRef(null);

  const {
    projects,
    addTask, editTask, removeTask,
    toggleDone, toggleHighlight, reorderTasks,
    bulkUpdate, bulkDelete,
    editProject, removeProject,
    addSubtask, toggleSubtask, removeSubtask,
  } = useProjects();

  const project = projects.find(p => p.id === params.id);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [filter,        setFilter]        = useState("all");
  const [sort,          setSort]          = useState("created");
  const [search,        setSearch]        = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask,   setEditingTask]   = useState(null);
  const [showEditProj,  setShowEditProj]  = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  // Bulk
  const [bulkMode,      setBulkMode]      = useState(false);
  const [selectedIds,   setSelectedIds]   = useState(new Set());

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const handleKey = useCallback(e => {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.key) {
      case "n": case "N":
        e.preventDefault(); setShowTaskModal(true); break;
      case "/":
        e.preventDefault(); searchRef.current?.focus(); break;
      case "b": case "B":
        e.preventDefault(); toggleBulkMode(); break;
      case "Escape":
        setBulkMode(false); setSelectedIds(new Set());
        setShowTaskModal(false); setEditingTask(null);
        setShowEditProj(false); setConfirmDelete(false);
        setShowShortcuts(false);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // ── DnD sensors ───────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Derived data ──────────────────────────────────────────────────────────
  const { filteredTasks, todo, done } = useMemo(() => {
    if (!project) return { filteredTasks: [], todo: [], done: [] };
    let list = [...project.tasks];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q));
    }
    if (filter === "todo") list = list.filter(t => !t.done);
    if (filter === "done") list = list.filter(t =>  t.done);

    if (sort === "deadline") {
      list.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1; if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    } else if (sort === "priority") {
      list.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1));
    }

    return {
      filteredTasks: list,
      todo: list.filter(t => !t.done),
      done: list.filter(t =>  t.done),
    };
  }, [project, filter, sort, search]);

  const totalTasks = project?.tasks.length ?? 0;
  const doneTasks  = project?.tasks.filter(t => t.done).length ?? 0;
  const pct        = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;

  // Can only DnD when showing all tasks with no active search
  const dndEnabled = filter === "all" && !search.trim() && sort === "created";

  // ── DnD handler ───────────────────────────────────────────────────────────
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const todoIds = todo.map(t => t.id);
    const oldIdx  = todoIds.indexOf(active.id);
    const newIdx  = todoIds.indexOf(over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reorderedTodo = arrayMove(todo, oldIdx, newIdx);
    const doneItems     = project.tasks.filter(t => t.done);
    reorderTasks(project.id, [...reorderedTodo, ...doneItems]);
  }

  // ── Bulk helpers ──────────────────────────────────────────────────────────
  function toggleBulkMode() {
    setBulkMode(v => !v);
    setSelectedIds(new Set());
  }
  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function handleSelectAll() {
    setSelectedIds(new Set(filteredTasks.filter(t => !t.done).map(t => t.id)));
  }
  function handleDeselectAll() { setSelectedIds(new Set()); }

  function handleBulkDone() {
    bulkUpdate(project.id, [...selectedIds], { done: true });
    setSelectedIds(new Set());
  }
  function handleBulkHighlight() {
    // Toggle: if all selected are highlighted → unhighlight, else highlight all
    const sel = filteredTasks.filter(t => selectedIds.has(t.id));
    const allHighlighted = sel.every(t => t.highlighted);
    bulkUpdate(project.id, [...selectedIds], { highlighted: !allHighlighted });
  }
  function handleBulkDelete() {
    if (!confirm(`Delete ${selectedIds.size} task(s)?`)) return;
    bulkDelete(project.id, [...selectedIds]);
    setSelectedIds(new Set()); setBulkMode(false);
  }

  // ── Project actions ───────────────────────────────────────────────────────
  function handleDeleteProject() {
    removeProject(project.id);
    router.push("/");
  }

  // ── Shared task card props ────────────────────────────────────────────────
  function taskCardProps(t) {
    return {
      task: t,
      projectId: project.id,
      projectColor: project.color,
      onToggleDone:      () => toggleDone(project.id, t.id),
      onToggleHighlight: () => toggleHighlight(project.id, t.id),
      onEdit:            () => setEditingTask(t),
      onDelete:          () => removeTask(project.id, t.id),
      onSubtaskAdd:    addSubtask,
      onSubtaskToggle: toggleSubtask,
      onSubtaskDelete: removeSubtask,
      bulkMode,
      selected:       selectedIds.has(t.id),
      onSelectToggle: () => toggleSelect(t.id),
    };
  }

  if (!project) {
    return (
      <AppShell>
        <div style={{ padding: 40 }}>
          <p style={{ color: "var(--muted)" }}>Project not found.</p>
        </div>
      </AppShell>
    );
  }

  const IconComponent = ICON_MAP[project.icon] || ICON_MAP.folder;

  return (
    <AppShell>
      <div style={{ padding: "36px 40px 100px", maxWidth: 820 }}>

        {/* Project header */}
        <div className="animate-fade-up" style={{
          background: `linear-gradient(135deg, ${project.color}18, ${project.color}05)`,
          border: `1px solid ${project.color}30`,
          borderRadius: 14, padding: "22px 26px", marginBottom: 26,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ color: project.color }}>
              <IconComponent size={24} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "-.02em", lineHeight: 1.1 }}>
                {project.name}
              </h1>
              {project.description && (
                <p style={{ color: "var(--muted)", marginTop: 5, fontSize: 13 }}>{project.description}</p>
              )}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 5 }}>
                  <span>{doneTasks} of {totalTasks} complete</span><span>{pct}%</span>
                </div>
                <div className="progress-bar" style={{ height: 4 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: project.color }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="btn btn-ghost" onClick={() => setShowShortcuts(true)} style={{ padding: "5px 10px", fontSize: 11 }} title="Keyboard shortcuts">?</button>
              <button className="btn btn-ghost" onClick={() => setShowEditProj(true)}  style={{ padding: "5px 10px", fontSize: 11 }}>Edit</button>
              <button className="btn btn-danger"onClick={() => setConfirmDelete(true)} style={{ padding: "5px 10px", fontSize: 11 }}>Delete</button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="animate-fade-up" style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", animationDelay: ".05s" }}>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks… (/)"
            style={{
              flex: 1, minWidth: 150,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, color: "var(--text)", padding: "7px 12px",
              fontFamily: "var(--font-mono)", fontSize: 13, outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e  => e.target.style.borderColor = "var(--border)"}
          />

          {/* Filter tabs */}
          <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "7px 13px", fontSize: 12,
                background: filter === f ? "var(--accent)" : "transparent",
                color: filter === f ? "#0d0d0d" : "var(--muted)",
                border: "none", cursor: "pointer", textTransform: "capitalize",
                fontFamily: "var(--font-mono)", transition: "all 0.15s",
              }}>
                {f}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, color: "var(--text)", padding: "7px 10px",
            fontFamily: "var(--font-mono)", fontSize: 12, outline: "none", cursor: "pointer",
          }}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Bulk toggle */}
          <button
            onClick={toggleBulkMode}
            className="btn"
            style={{
              padding: "7px 12px", fontSize: 12,
              background: bulkMode ? "rgba(232,160,32,.15)" : "var(--surface)",
              border: `1px solid ${bulkMode ? "var(--accent)" : "var(--border)"}`,
              color: bulkMode ? "var(--accent)" : "var(--muted)",
            }}
            title="Bulk select (B)"
          >
            ☐ Select
          </button>

          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)} style={{ padding: "7px 14px", fontSize: 13 }}>
            + Add task
          </button>
        </div>

        {/* DnD hint */}
        {!dndEnabled && !search && filter === "all" && sort !== "created" && (
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, fontStyle: "italic" }}>
            Switch to "Date added" sort to enable drag & drop reordering
          </div>
        )}
        {dndEnabled && todo.length > 1 && (
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
            ⠿ Drag tasks to reorder
          </div>
        )}

        {/* Empty */}
        {filteredTasks.length === 0 && (
          <div style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: "50px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              {search ? "No tasks match your search" : "No tasks yet"}
            </div>
            {!search && (
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)} style={{ marginTop: 8 }}>
                + Add first task
              </button>
            )}
          </div>
        )}

        {/* ── Todo section with DnD ── */}
        {todo.length > 0 && (
          <section className="animate-slide-in" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 10 }}>
              To do · {todo.length}
            </div>

            {dndEnabled ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={todo.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {todo.map(t => (
                      <SortableTaskCard key={t.id} {...taskCardProps(t)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {todo.map(t => (
                  <TaskCard key={t.id} {...taskCardProps(t)} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Done section (no DnD) ── */}
        {done.length > 0 && (
          <section>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 10 }}>
              Completed · {done.length}
            </div>
            <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {done.map(t => (
                <TaskCard key={t.id} {...taskCardProps(t)} dragHandleProps={undefined} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Bulk action bar ── */}
      {bulkMode && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={filteredTasks.filter(t => !t.done).length}
          onMarkDone={handleBulkDone}
          onHighlight={handleBulkHighlight}
          onDelete={handleBulkDelete}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onCancel={() => { setBulkMode(false); setSelectedIds(new Set()); }}
        />
      )}

      {/* Modals */}
      {showTaskModal && (
        <TaskModal onSave={data => addTask(project.id, data)} onClose={() => setShowTaskModal(false)} />
      )}
      {editingTask && (
        <TaskModal initial={editingTask} onSave={data => editTask(project.id, editingTask.id, data)} onClose={() => setEditingTask(null)} />
      )}
      {showEditProj && (
        <ProjectModal initial={project} onSave={data => editProject(project.id, data)} onClose={() => setShowEditProj(false)} />
      )}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {confirmDelete && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(false); }}>
          <div className="modal-box animate-scale-in" style={{ maxWidth: 380 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
              Delete project?
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>
              This will permanently delete <strong style={{ color: "var(--text)" }}>{project.name}</strong> and all {project.tasks.length} tasks. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost"  onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteProject}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}