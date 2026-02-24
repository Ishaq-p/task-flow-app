// lib/storage.js
// Pure utility functions — no localStorage, no KV.
// Used client-side for deadline calculations and dashboard aggregations
// operating on project arrays already loaded into React state.

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

// ─── Aggregations over a projects array ──────────────────────────────────────

export function getAttentionTasksFromProjects(projects) {
  return projects.flatMap(p =>
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

export function getDashboardStatsFromProjects(projects) {
  const all = projects.flatMap(p => p.tasks);
  return {
    totalProjects: projects.length,
    totalTasks:    all.length,
    doneTasks:     all.filter(t => t.done).length,
    overdueTasks:  all.filter(t => !t.done && deadlineStatus(t.deadline) === "overdue").length,
  };
}

export function getTasksByDeadlineFromProjects(projects) {
  const map = {};
  projects.forEach(p => {
    p.tasks.forEach(t => {
      if (!t.deadline || t.done) return;
      const key = t.deadline.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push({ ...t, projectId: p.id, projectName: p.name, projectColor: p.color });
    });
  });
  return map;
}