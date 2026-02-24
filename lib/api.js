// lib/api.js
// Client-side fetch wrappers for all API routes.
// Every function returns { data, error }.

async function call(method, path, body) {
  try {
    const res = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: json.error || `HTTP ${res.status}` };
    return { data: json, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

const get    = (path)        => call("GET",    path);
const post   = (path, body)  => call("POST",   path, body);
const patch  = (path, body)  => call("PATCH",  path, body);
const del    = (path, body)  => call("DELETE", path, body);
const put    = (path, body)  => call("PUT",    path, body);

// ─── Projects ─────────────────────────────────────────────────────────────────
export const api = {
  projects: {
    list:   ()              => get("/api/projects"),
    create: (data)          => post("/api/projects", data),
    update: (id, data)      => patch(`/api/projects/${id}`, data),
    delete: (id)            => del(`/api/projects/${id}`),
  },

  tasks: {
    create:    (pid, data)         => post(`/api/projects/${pid}/tasks`, data),
    update:    (pid, tid, data)    => patch(`/api/projects/${pid}/tasks/${tid}`, data),
    delete:    (pid, tid)          => del(`/api/projects/${pid}/tasks/${tid}`),
    toggleDone:(pid, tid)          => post(`/api/projects/${pid}/tasks/${tid}/done`),
    toggleHighlight:(pid, tid)     => post(`/api/projects/${pid}/tasks/${tid}/highlight`),
    reorder:   (pid, orderedIds)   => put(`/api/projects/${pid}/reorder`, { orderedIds }),
    bulk:      (pid, taskIds, ops) => post(`/api/projects/${pid}/bulk`, { taskIds, ...ops }),
    bulkDelete:(pid, taskIds)      => del(`/api/projects/${pid}/bulk`, { taskIds }),
  },

  subtasks: {
    create: (pid, tid, title)        => post(`/api/projects/${pid}/tasks/${tid}/subtasks`, { title }),
    toggle: (pid, tid, sid)          => post(`/api/projects/${pid}/tasks/${tid}/subtasks/${sid}`),
    delete: (pid, tid, sid)          => del(`/api/projects/${pid}/tasks/${tid}/subtasks/${sid}`),
  },

  data: {
    export: ()        => get("/api/data/export"),
    import: (b, mode) => post("/api/data/import", { projects: b, mode }),
  },
};