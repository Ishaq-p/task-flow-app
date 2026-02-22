// lib/storage.js
const KEYS = {
  PROJECTS: "taskflow_projects",
};

function read(key) {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function write(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── Projects ────────────────────────────────────────────────────────────────

export function getProjects() { return read(KEYS.PROJECTS) ?? []; }
export function saveProjects(projects) { write(KEYS.PROJECTS, projects); }

export function createProject({ name, description = "", color = "#f59e0b", icon = "📁" }) {
  const projects = getProjects();
  const project = { id: uid(), name, description, color, icon, createdAt: new Date().toISOString(), tasks: [] };
  projects.push(project);
  saveProjects(projects);
  return project;
}

export function updateProject(id, updates) {
  const projects = getProjects().map(p => p.id === id ? { ...p, ...updates } : p);
  saveProjects(projects);
  return projects.find(p => p.id === id);
}

export function deleteProject(id) { saveProjects(getProjects().filter(p => p.id !== id)); }
export function getProject(id) { return getProjects().find(p => p.id === id) ?? null; }

// ─── Tasks ───────────────────────────────────────────────────────────────────

export function createTask(projectId, { title, notes = "", deadline = null, priority = "normal" }) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;
  const task = {
    id: uid(), title, notes, deadline, priority,
    done: false, highlighted: false, subtasks: [],
    createdAt: new Date().toISOString(), completedAt: null,
  };
  project.tasks.unshift(task); // newest first
  saveProjects(projects);
  return task;
}

export function updateTask(projectId, taskId, updates) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;
  project.tasks = project.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
  saveProjects(projects);
  return project.tasks.find(t => t.id === taskId);
}

export function deleteTask(projectId, taskId) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  project.tasks = project.tasks.filter(t => t.id !== taskId);
  saveProjects(projects);
}

export function toggleTaskDone(projectId, taskId) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  project.tasks = project.tasks.map(t => {
    if (t.id !== taskId) return t;
    const done = !t.done;
    return { ...t, done, completedAt: done ? new Date().toISOString() : null };
  });
  saveProjects(projects);
}

export function toggleTaskHighlight(projectId, taskId) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  project.tasks = project.tasks.map(t => t.id === taskId ? { ...t, highlighted: !t.highlighted } : t);
  saveProjects(projects);
}

export function reorderTasks(projectId, reorderedTasks) {
  const projects = getProjects().map(p =>
    p.id === projectId ? { ...p, tasks: reorderedTasks } : p
  );
  saveProjects(projects);
}

export function bulkUpdateTasks(projectId, taskIds, updates) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  const idSet = new Set(taskIds);
  project.tasks = project.tasks.map(t => {
    if (!idSet.has(t.id)) return t;
    const merged = { ...t, ...updates };
    if (updates.done !== undefined) {
      merged.completedAt = updates.done ? new Date().toISOString() : null;
    }
    return merged;
  });
  saveProjects(projects);
}

export function bulkDeleteTasks(projectId, taskIds) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  const idSet = new Set(taskIds);
  project.tasks = project.tasks.filter(t => !idSet.has(t.id));
  saveProjects(projects);
}

// ─── Subtasks ─────────────────────────────────────────────────────────────────

export function createSubtask(projectId, taskId, title) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return null;
  if (!task.subtasks) task.subtasks = [];
  const subtask = { id: uid(), title, done: false, createdAt: new Date().toISOString() };
  task.subtasks.push(subtask);
  saveProjects(projects);
  return subtask;
}

export function toggleSubtaskDone(projectId, taskId, subtaskId) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.subtasks = (task.subtasks || []).map(s =>
    s.id === subtaskId ? { ...s, done: !s.done } : s
  );
  saveProjects(projects);
}

export function deleteSubtask(projectId, taskId, subtaskId) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.subtasks = (task.subtasks || []).filter(s => s.id !== subtaskId);
  saveProjects(projects);
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export function exportData() {
  return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), projects: getProjects() }, null, 2);
}

export function importData(jsonString, mode = "merge") {
  try {
    const parsed = JSON.parse(jsonString);
    // Support both raw array and wrapped { projects: [...] }
    const incoming = Array.isArray(parsed) ? parsed : parsed.projects;
    if (!Array.isArray(incoming)) throw new Error("Invalid format — expected an array of projects.");
    if (mode === "replace") {
      saveProjects(incoming);
    } else {
      const existing = getProjects();
      const existingIds = new Set(existing.map(p => p.id));
      const merged = [...existing, ...incoming.filter(p => !existingIds.has(p.id))];
      saveProjects(merged);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ─── Deadline utils ───────────────────────────────────────────────────────────

export function deadlineStatus(deadline) {
  if (!deadline) return null;
  const diffDays = (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 2) return "urgent";
  if (diffDays <= 7) return "soon";
  return "ok";
}

export function formatDeadline(deadline) {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Dashboard aggregations ───────────────────────────────────────────────────

export function getAttentionTasks() {
  return getProjects().flatMap(p =>
    p.tasks
      .filter(t => {
        if (t.done) return false;
        if (t.highlighted) return true;
        const s = deadlineStatus(t.deadline);
        return s === "overdue" || s === "urgent";
      })
      .map(t => ({ ...t, projectId: p.id, projectName: p.name, projectColor: p.color }))
  );
}

export function getDashboardStats() {
  const projects = getProjects();
  const allTasks = projects.flatMap(p => p.tasks);
  return {
    totalProjects: projects.length,
    totalTasks: allTasks.length,
    doneTasks: allTasks.filter(t => t.done).length,
    overdueTasks: allTasks.filter(t => !t.done && deadlineStatus(t.deadline) === "overdue").length,
  };
}

// ─── Calendar aggregation ─────────────────────────────────────────────────────

export function getTasksByDeadline() {
  const map = {};
  getProjects().forEach(p => {
    p.tasks.forEach(t => {
      if (!t.deadline || t.done) return;
      const key = t.deadline.slice(0, 10); // YYYY-MM-DD
      if (!map[key]) map[key] = [];
      map[key].push({ ...t, projectId: p.id, projectName: p.name, projectColor: p.color });
    });
  });
  return map;
}