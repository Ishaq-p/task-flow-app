// lib/hooks/useProjects.js
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api";
import { getAttentionTasksFromProjects, getDashboardStatsFromProjects } from "../storage";

// ─── useProjects ──────────────────────────────────────────────────────────────

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loaded,   setLoaded]   = useState(false);
  const [syncing,  setSyncing]  = useState(false);

  // Fetch all projects from KV via API
  const refresh = useCallback(async () => {
    const { data, error } = await api.projects.list();
    if (!error && data?.projects) {
      setProjects(data.projects);
    }
    setLoaded(true);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Optimistic helper ──────────────────────────────────────────────────────
  // Applies fn(draft) to local state immediately, then calls apiFn().
  // On error, rolls back to previous state.
  function optimistic(localUpdater, apiFn) {
    return async (...args) => {
      const prev = projects;
      setProjects(localUpdater(projects, ...args));
      setSyncing(true);
      const { data, error } = await apiFn(...args);
      setSyncing(false);
      if (error) {
        console.error("Sync error, rolling back:", error);
        setProjects(prev);
      } else if (data?.projects) {
        // Authoritative state from server
        setProjects(data.projects);
      }
    };
  }

  // ── Projects ───────────────────────────────────────────────────────────────

  const addProject = useCallback(
    optimistic(
      (draft, data) => {
        const tmp = { id: "tmp_" + Date.now(), tasks: [], ...data, createdAt: new Date().toISOString() };
        return [tmp, ...draft];
      },
      (data) => api.projects.create(data),
    ),
  [projects]);

  const editProject = useCallback(
    optimistic(
      (draft, id, updates) => draft.map(p => p.id === id ? { ...p, ...updates } : p),
      (id, updates) => api.projects.update(id, updates),
    ),
  [projects]);

  const removeProject = useCallback(
    optimistic(
      (draft, id) => draft.filter(p => p.id !== id),
      (id) => api.projects.delete(id),
    ),
  [projects]);

  // ── Tasks ──────────────────────────────────────────────────────────────────

  const addTask = useCallback(
    optimistic(
      (draft, pid, data) => draft.map(p => p.id !== pid ? p : {
        ...p,
        tasks: [{ id: "tmp_" + Date.now(), done: false, highlighted: false, subtasks: [], priority: "normal", ...data, createdAt: new Date().toISOString() }, ...p.tasks],
      }),
      (pid, data) => api.tasks.create(pid, data),
    ),
  [projects]);

  const editTask = useCallback(
    optimistic(
      (draft, pid, tid, updates) => draft.map(p => p.id !== pid ? p : {
        ...p, tasks: p.tasks.map(t => t.id !== tid ? t : { ...t, ...updates }),
      }),
      (pid, tid, updates) => api.tasks.update(pid, tid, updates),
    ),
  [projects]);

  const removeTask = useCallback(
    optimistic(
      (draft, pid, tid) => draft.map(p => p.id !== pid ? p : { ...p, tasks: p.tasks.filter(t => t.id !== tid) }),
      (pid, tid) => api.tasks.delete(pid, tid),
    ),
  [projects]);

  const toggleDone = useCallback(
    optimistic(
      (draft, pid, tid) => draft.map(p => p.id !== pid ? p : {
        ...p, tasks: p.tasks.map(t => t.id !== tid ? t : { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : null }),
      }),
      (pid, tid) => api.tasks.toggleDone(pid, tid),
    ),
  [projects]);

  const toggleHighlight = useCallback(
    optimistic(
      (draft, pid, tid) => draft.map(p => p.id !== pid ? p : {
        ...p, tasks: p.tasks.map(t => t.id !== tid ? t : { ...t, highlighted: !t.highlighted }),
      }),
      (pid, tid) => api.tasks.toggleHighlight(pid, tid),
    ),
  [projects]);

  const reorderTasks = useCallback(
    optimistic(
      (draft, pid, orderedIds) => draft.map(p => {
        if (p.id !== pid) return p;
        const map  = Object.fromEntries(p.tasks.map(t => [t.id, t]));
        const reordered = [...orderedIds.map(id => map[id]).filter(Boolean), ...p.tasks.filter(t => !orderedIds.includes(t.id))];
        return { ...p, tasks: reordered };
      }),
      (pid, orderedIds) => api.tasks.reorder(pid, orderedIds),
    ),
  [projects]);

  const bulkUpdate = useCallback(
    optimistic(
      (draft, pid, taskIds, updates) => draft.map(p => p.id !== pid ? p : {
        ...p, tasks: p.tasks.map(t => taskIds.includes(t.id) ? { ...t, ...updates, completedAt: updates.done ? new Date().toISOString() : t.completedAt } : t),
      }),
      (pid, taskIds, ops) => api.tasks.bulk(pid, taskIds, ops),
    ),
  [projects]);

  const bulkDelete = useCallback(
    optimistic(
      (draft, pid, taskIds) => draft.map(p => p.id !== pid ? p : { ...p, tasks: p.tasks.filter(t => !taskIds.includes(t.id)) }),
      (pid, taskIds) => api.tasks.bulkDelete(pid, taskIds),
    ),
  [projects]);

  // ── Subtasks ───────────────────────────────────────────────────────────────

  const addSubtask = useCallback(
    optimistic(
      (draft, pid, tid, title) => draft.map(p => p.id !== pid ? p : {
        ...p, tasks: p.tasks.map(t => t.id !== tid ? t : {
          ...t, subtasks: [...(t.subtasks || []), { id: "tmp_" + Date.now(), title, done: false }],
        }),
      }),
      (pid, tid, title) => api.subtasks.create(pid, tid, title),
    ),
  [projects]);

  const toggleSubtask = useCallback(
    optimistic(
      (draft, pid, tid, sid) => draft.map(p => p.id !== pid ? p : {
        ...p, tasks: p.tasks.map(t => t.id !== tid ? t : {
          ...t, subtasks: (t.subtasks || []).map(s => s.id !== sid ? s : { ...s, done: !s.done }),
        }),
      }),
      (pid, tid, sid) => api.subtasks.toggle(pid, tid, sid),
    ),
  [projects]);

  const removeSubtask = useCallback(
    optimistic(
      (draft, pid, tid, sid) => draft.map(p => p.id !== pid ? p : {
        ...p, tasks: p.tasks.map(t => t.id !== tid ? t : {
          ...t, subtasks: (t.subtasks || []).filter(s => s.id !== sid),
        }),
      }),
      (pid, tid, sid) => api.subtasks.delete(pid, tid, sid),
    ),
  [projects]);

  return {
    projects, loaded, syncing, refresh,
    addProject, editProject, removeProject,
    addTask, editTask, removeTask,
    toggleDone, toggleHighlight,
    reorderTasks, bulkUpdate, bulkDelete,
    addSubtask, toggleSubtask, removeSubtask,
  };
}

// ─── useDashboard ─────────────────────────────────────────────────────────────

export function useDashboard() {
  const { projects, loaded } = useProjects();

  const attentionTasks = getAttentionTasksFromProjects(projects);
  const stats          = getDashboardStatsFromProjects(projects);

  return { attentionTasks, stats, loaded };
}