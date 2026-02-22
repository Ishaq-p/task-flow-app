// components/AppShell.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import ProjectModal from "./ProjectModal";
import ShortcutsModal from "./ShortcutsModal";
import ExportImportModal from "./ExportImportModal";
import { useProjects } from "../lib/hooks/useProjects";

export default function AppShell({ children }) {
  const router = useRouter();
  const { projects, addProject, refresh } = useProjects();

  const [showNewProject,  setShowNewProject]  = useState(false);
  const [showShortcuts,   setShowShortcuts]   = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);

  // ── Global keyboard shortcuts ──────────────────────────────────────────
  const handleKey = useCallback(e => {
    // Skip when typing in inputs/textareas
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    // Skip when modifier keys held
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.key) {
      case "?":
        e.preventDefault();
        setShowShortcuts(v => !v);
        break;
      case "p":
      case "P":
        e.preventDefault();
        setShowNewProject(true);
        break;
      case "c":
      case "C":
        e.preventDefault();
        router.push("/calendar");
        break;
      case "d":
      case "D":
        e.preventDefault();
        router.push("/");
        break;
      case "Escape":
        setShowShortcuts(false);
        setShowNewProject(false);
        setShowExportImport(false);
        break;
    }
  }, [router]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div className="app-shell">
      <Sidebar
        projects={projects}
        onAddProject={() => setShowNewProject(true)}
        onExportImport={() => setShowExportImport(true)}
      />

      <main className="main-area">{children}</main>

      {showNewProject && (
        <ProjectModal
          onSave={data => addProject(data)}
          onClose={() => setShowNewProject(false)}
        />
      )}

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {showExportImport && (
        <ExportImportModal
          onClose={() => setShowExportImport(false)}
          onImportDone={refresh}
        />
      )}
    </div>
  );
}