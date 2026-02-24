// lib/kv.js
// Server-side only — never import this in client components.
import { kv } from "@vercel/kv";

const KEY = "taskflow:projects";

// ─── Raw read / write ─────────────────────────────────────────────────────────

export async function getProjects() {
  const data = await kv.get(KEY);
  return Array.isArray(data) ? data : [];
}

export async function saveProjects(projects) {
  await kv.set(KEY, projects);
  return projects;
}

// ─── Shared uid helper ────────────────────────────────────────────────────────

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── Project helpers ──────────────────────────────────────────────────────────

export async function kvCreateProject({ name, description = "", color = "#e8a020", icon = "📁" }) {
  const projects = await getProjects();
  const project  = { id: uid(), name, description, color, icon, createdAt: new Date().toISOString(), tasks: [] };
  projects.unshift(project);
  await saveProjects(projects);
  return project;
}

export async function kvUpdateProject(id, updates) {
  const projects = await getProjects();
  const idx      = projects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const ALLOWED  = ["name", "description", "color", "icon"];
  ALLOWED.forEach(k => { if (updates[k] !== undefined) projects[idx][k] = updates[k]; });
  await saveProjects(projects);
  return projects[idx];
}

export async function kvDeleteProject(id) {
  const projects = await getProjects();
  await saveProjects(projects.filter(p => p.id !== id));
}

// ─── Task helpers ─────────────────────────────────────────────────────────────

export async function kvCreateTask(projectId, { title, notes = "", deadline = null, priority = "normal" }) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return null;
  const task = {
    id: uid(), title, notes, deadline, priority,
    done: false, highlighted: false, subtasks: [],
    createdAt: new Date().toISOString(), completedAt: null,
  };
  project.tasks.unshift(task);
  await saveProjects(projects);
  return task;
}

export async function kvUpdateTask(projectId, taskId, updates) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return null;
  const idx = project.tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return null;
  const ALLOWED = ["title", "notes", "deadline", "priority", "highlighted", "done", "completedAt"];
  ALLOWED.forEach(k => { if (updates[k] !== undefined) project.tasks[idx][k] = updates[k]; });
  await saveProjects(projects);
  return project.tasks[idx];
}

export async function kvDeleteTask(projectId, taskId) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return;
  project.tasks = project.tasks.filter(t => t.id !== taskId);
  await saveProjects(projects);
}

export async function kvToggleTaskDone(projectId, taskId) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return null;
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return null;
  task.done        = !task.done;
  task.completedAt = task.done ? new Date().toISOString() : null;
  await saveProjects(projects);
  return task;
}

export async function kvToggleTaskHighlight(projectId, taskId) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return null;
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return null;
  task.highlighted = !task.highlighted;
  await saveProjects(projects);
  return task;
}

export async function kvReorderTasks(projectId, orderedTaskIds) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return null;
  const map = Object.fromEntries(project.tasks.map(t => [t.id, t]));
  // Reorder according to the supplied id list; append any tasks not in list at end
  const reordered = [
    ...orderedTaskIds.map(id => map[id]).filter(Boolean),
    ...project.tasks.filter(t => !orderedTaskIds.includes(t.id)),
  ];
  project.tasks = reordered;
  await saveProjects(projects);
  return project;
}

export async function kvBulkUpdateTasks(projectId, taskIds, updates) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return null;
  const idSet    = new Set(taskIds);
  const ALLOWED  = ["done", "highlighted"];
  project.tasks  = project.tasks.map(t => {
    if (!idSet.has(t.id)) return t;
    const merged = { ...t };
    ALLOWED.forEach(k => { if (updates[k] !== undefined) merged[k] = updates[k]; });
    if (updates.done !== undefined) merged.completedAt = updates.done ? new Date().toISOString() : null;
    return merged;
  });
  await saveProjects(projects);
  return project;
}

export async function kvBulkDeleteTasks(projectId, taskIds) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return;
  const idSet   = new Set(taskIds);
  project.tasks = project.tasks.filter(t => !idSet.has(t.id));
  await saveProjects(projects);
}

// ─── Subtask helpers ──────────────────────────────────────────────────────────

export async function kvCreateSubtask(projectId, taskId, title) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return null;
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return null;
  if (!task.subtasks) task.subtasks = [];
  const subtask = { id: uid(), title, done: false, createdAt: new Date().toISOString() };
  task.subtasks.push(subtask);
  await saveProjects(projects);
  return subtask;
}

export async function kvToggleSubtask(projectId, taskId, subtaskId) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return null;
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return null;
  const sub = (task.subtasks || []).find(s => s.id === subtaskId);
  if (!sub) return null;
  sub.done = !sub.done;
  await saveProjects(projects);
  return sub;
}

export async function kvDeleteSubtask(projectId, taskId, subtaskId) {
  const projects = await getProjects();
  const project  = projects.find(p => p.id === projectId);
  if (!project) return;
  const task = project.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.subtasks = (task.subtasks || []).filter(s => s.id !== subtaskId);
  await saveProjects(projects);
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export async function kvExport() {
  const projects = await getProjects();
  return { version: 2, exportedAt: new Date().toISOString(), projects };
}

export async function kvImport(incoming, mode = "merge") {
  if (!Array.isArray(incoming)) throw new Error("Expected an array of projects.");
  if (mode === "replace") {
    await saveProjects(incoming);
  } else {
    const existing    = await getProjects();
    const existingIds = new Set(existing.map(p => p.id));
    await saveProjects([...existing, ...incoming.filter(p => !existingIds.has(p.id))]);
  }
}