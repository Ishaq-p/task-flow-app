// lib/hooks/useProjects.js
"use client";
import { useState, useEffect, useCallback } from "react";
import * as storage from "../storage";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loaded,   setLoaded]   = useState(false);

  const refresh = useCallback(() => setProjects(storage.getProjects()), []);

  useEffect(() => {
    refresh();
    setLoaded(true);
    const handler = e => { if (e.key === "taskflow_projects") refresh(); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const wrap = (fn) => (...args) => { fn(...args); refresh(); };

  return {
    projects, loaded, refresh,
    // projects
    addProject:    wrap(storage.createProject),
    editProject:   wrap(storage.updateProject),
    removeProject: wrap(storage.deleteProject),
    // tasks
    addTask:          wrap(storage.createTask),
    editTask:         wrap(storage.updateTask),
    removeTask:       wrap(storage.deleteTask),
    toggleDone:       wrap(storage.toggleTaskDone),
    toggleHighlight:  wrap(storage.toggleTaskHighlight),
    reorderTasks:     wrap(storage.reorderTasks),
    bulkUpdate:       wrap(storage.bulkUpdateTasks),
    bulkDelete:       wrap(storage.bulkDeleteTasks),
    // subtasks
    addSubtask:       wrap(storage.createSubtask),
    toggleSubtask:    wrap(storage.toggleSubtaskDone),
    removeSubtask:    wrap(storage.deleteSubtask),
  };
}

export function useDashboard() {
  const [attentionTasks, setAttentionTasks] = useState([]);
  const [stats, setStats] = useState({ totalProjects: 0, totalTasks: 0, doneTasks: 0, overdueTasks: 0 });

  const refresh = useCallback(() => {
    setAttentionTasks(storage.getAttentionTasks());
    setStats(storage.getDashboardStats());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    const handler = e => { if (e.key === "taskflow_projects") refresh(); };
    window.addEventListener("storage", handler);
    return () => { clearInterval(id); window.removeEventListener("storage", handler); };
  }, [refresh]);

  return { attentionTasks, stats, refresh };
}