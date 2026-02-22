// components/ExportImportModal.js
"use client";
import { useState, useRef, useEffect } from "react";
import { exportData, importData } from "../lib/storage";

export default function ExportImportModal({ onClose, onImportDone }) {
  const [tab,       setTab]       = useState("export");
  const [importMode, setImportMode] = useState("merge");
  const [jsonInput,  setJsonInput]  = useState("");
  const [status,     setStatus]     = useState(null); // { ok: bool, msg: string }
  const fileRef = useRef(null);

  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // ── Export ───────────────────────────────────────────────────────────────
  function handleDownload() {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `taskflow-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopyJSON() {
    navigator.clipboard.writeText(exportData());
    setStatus({ ok: true, msg: "Copied to clipboard!" });
    setTimeout(() => setStatus(null), 2000);
  }

  // ── Import ───────────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setJsonInput(ev.target.result);
    reader.readAsText(file);
  }

  function handleImport() {
    if (!jsonInput.trim()) { setStatus({ ok: false, msg: "Nothing to import — paste JSON or pick a file." }); return; }
    const result = importData(jsonInput, importMode);
    if (result.success) {
      setStatus({ ok: true, msg: `Imported successfully! ${importMode === "replace" ? "Data replaced." : "Projects merged."}` });
      onImportDone?.();
      setTimeout(() => { setStatus(null); onClose(); }, 1800);
    } else {
      setStatus({ ok: false, msg: `Error: ${result.error}` });
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box modal-box-lg animate-scale-in">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>
            Export / Import
          </h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 16 }}>✕</button>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-item ${tab === "export" ? "active" : ""}`} onClick={() => setTab("export")}>Export</button>
          <button className={`tab-item ${tab === "import" ? "active" : ""}`} onClick={() => setTab("import")}>Import</button>
        </div>

        {/* ── Export Tab ── */}
        {tab === "export" && (
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
              Download your entire TaskFlow data as a JSON file. Use it as a backup or to restore on another device.
            </p>
            <pre style={{
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 8, padding: 14, fontSize: 11, overflow: "auto",
              maxHeight: 200, color: "var(--muted)", fontFamily: "var(--font-mono)",
            }}>
              {exportData().slice(0, 600)}{exportData().length > 600 ? "\n  … (truncated)" : ""}
            </pre>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={handleDownload}>⬇ Download JSON</button>
              <button className="btn btn-ghost"   onClick={handleCopyJSON}>Copy to clipboard</button>
            </div>
          </div>
        )}

        {/* ── Import Tab ── */}
        {tab === "import" && (
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
              Paste exported JSON below or upload a <code>.json</code> file.
            </p>

            {/* File upload */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed var(--border)", borderRadius: 8,
                padding: "14px", textAlign: "center", cursor: "pointer",
                marginBottom: 12, fontSize: 13, color: "var(--muted)",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              📂 Click to upload .json file
              <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileChange} />
            </div>

            <div className="field" style={{ marginBottom: 12 }}>
              <label>Or paste JSON</label>
              <textarea
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                placeholder='[{"id":"...","name":"...","tasks":[...]}]'
                rows={6}
                style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
              />
            </div>

            {/* Mode */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["merge", "replace"].map(m => (
                <label key={m} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "8px 12px", borderRadius: 8, fontSize: 13,
                  background: importMode === m ? "rgba(232,160,32,.1)" : "var(--surface2)",
                  border: `1px solid ${importMode === m ? "rgba(232,160,32,.4)" : "var(--border)"}`,
                  flex: 1, transition: "all 0.15s",
                }}>
                  <input type="radio" name="importMode" value={m} checked={importMode === m}
                    onChange={() => setImportMode(m)} style={{ accentColor: "var(--accent)" }} />
                  <div>
                    <div style={{ fontWeight: 500, textTransform: "capitalize" }}>{m}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {m === "merge" ? "Add new projects, keep existing" : "⚠ Replace all current data"}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button className="btn btn-primary" onClick={handleImport} style={{ width: "100%" }}>
              ⬆ Import data
            </button>
          </div>
        )}

        {/* Status message */}
        {status && (
          <div style={{
            marginTop: 12, padding: "10px 14px", borderRadius: 8, fontSize: 13,
            background: status.ok ? "rgba(91,191,122,.1)" : "rgba(224,85,85,.1)",
            border: `1px solid ${status.ok ? "rgba(91,191,122,.3)" : "rgba(224,85,85,.3)"}`,
            color: status.ok ? "var(--success)" : "var(--danger)",
          }}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}