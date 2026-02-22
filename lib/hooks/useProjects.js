"use client";
import { useState, useEffect, useCallback } from "react";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from Cloud on startup
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setProjects(data || []);
      setLoaded(true);
    } catch (err) {
      console.error("Sync Error:", err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Central function to push updates to the cloud
  const syncWithCloud = async (updatedData) => {
    setIsSyncing(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    setIsSyncing(false);
  };

  const addProject = async (name) => {
    const newProject = { id: Date.now(), name, tasks: [] };
    const updated = [...projects, newProject];
    setProjects(updated);
    await syncWithCloud(updated);
  };

  const deleteTask = async (projectId, taskId) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
      }
      return p;
    });
    setProjects(updated);
    await syncWithCloud(updated);
  };

  return { projects, addProject, deleteTask, isSyncing, loaded, refresh };
}

// RESTORED: useDashboard hook
export function useDashboard() {
  const { projects, loaded, refresh } = useProjects();
  
  // Calculate stats from the projects array
  const stats = {
    totalProjects: projects.length,
    totalTasks: projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0),
    doneTasks: projects.reduce((acc, p) => acc + (p.tasks?.filter(t => t.done).length || 0), 0),
    overdueTasks: 0, // You can add logic here for dates later
  };

  // Get tasks that need attention (e.g., highlighted or high priority)
  const attentionTasks = projects
    .flatMap(p => p.tasks.map(t => ({ ...t, projectName: p.name, projectId: p.id })))
    .filter(t => t.highlighted || !t.done)
    .slice(0, 5); // Just show top 5

  return { attentionTasks, stats, refresh, loaded };
}