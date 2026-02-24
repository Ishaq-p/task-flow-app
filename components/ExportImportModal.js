// components/ExportImportModal.js
"use client";
import { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";

export default function ExportImportModal({ onClose, onImportDone }) {
  const [tab,        setTab]        = useState("export");
  const [importMode, setImportMode] = useState("merge");
  const [jsonInput,  setJsonInput]  = useState("");
  const [exportJson, setExportJson] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [status,     setStatus]     = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // Fetch export data when tab opens
  useEffect(() => {
    if (tab !== "export") return;
    setLoading(true);
    api.data.export().then(({ data, error }) => {
      setLoading(false);
      if (data) setExportJson(JSON.stringify(data, null, 2));
      if (error) setStatus({ ok: false, msg: `Export error: ${error}` });
    });
  }, [tab]);

  function handleDownload() {
    const blob = new Blob([exportJson], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    navigator.clipboard.writeText(exportJson);
    setStatus({ ok: true, msg: "Copied to clipboard!" });
    setTimeout(() => setStatus(null), 2000);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setJsonInput(ev.target.result);
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!jsonInput.trim()) {
      setStatus({ ok: false, msg: "Nothing to import — paste JSON or upload a file." });
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const incoming = Array.isArray(parsed) ? parsed : parsed.projects;
      if (!Array.isArray(incoming)) throw new Error("Expected an array of projects.");

      setLoading(true);
      const { error } = await api.data.import(incoming, importMode);
      setLoading(false);

      if (error) {
        setStatus({ ok: false, msg: `Error: ${error}` });
      } else {
        setStatus({ ok: true, msg: `Imported! ${importMode === "replace" ? "Data replaced." : "Projects merged."}` });
        onImportDone?.();
        setTimeout(() => { setStatus(null); onClose(); }, 1800);
      }
    } catch (e) {
      setLoading(false);
      setStatus({ ok: false, msg: `Parse error: ${e.message}` });
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box modal-box-lg animate-scale-in">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>Export / Import</h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 16 }}>✕</button>
        </div>

        <div className="tab-bar">
          <button className={`tab-item ${tab === "export" ? "active" : ""}`} onClick={() => setTab("export")}>Export</button>
          <button className={`tab-item ${tab === "import" ? "active" : ""}`} onClick={() => setTab("import")}>Import</button>
        </div>

        {/* Export tab */}
        {tab === "export" && (
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
              Download your TaskFlow data as JSON for backup or cross-device restore.
            </p>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Loading…</div>
            ) : (
              <>
                <pre style={{
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  borderRadius: 8, padding: 14, fontSize: 11, overflow: "auto",
                  maxHeight: 200, color: "var(--muted)", fontFamily: "var(--font-mono)",
                }}>
                  {exportJson.slice(0, 600)}{exportJson.length > 600 ? "\n  …" : ""}
                </pre>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button className="btn btn-primary" onClick={handleDownload}>⬇ Download JSON</button>
                  <button className="btn btn-ghost"   onClick={handleCopy}>Copy to clipboard</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Import tab */}
        {tab === "import" && (
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14, lineHeight: 1.6 }}>
              Paste exported JSON or upload a <code>.json</code> backup file.
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed var(--border)", borderRadius: 8,
                padding: 14, textAlign: "center", cursor: "pointer",
                marginBottom: 12, fontSize: 13, color: "var(--muted)", transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              📂 Click to upload .json file
              <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileChange} />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Or paste JSON</label>
              <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} rows={5}
                placeholder='[{"id":"...","name":"...","tasks":[...]}]'
                style={{ fontFamily: "var(--font-mono)", fontSize: 12 }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["merge", "replace"].map(m => (
                <label key={m} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "8px 12px", borderRadius: 8, fontSize: 13, flex: 1,
                  background: importMode === m ? "rgba(232,160,32,.1)" : "var(--surface2)",
                  border: `1px solid ${importMode === m ? "rgba(232,160,32,.4)" : "var(--border)"}`,
                  transition: "all 0.15s",
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
            <button
              className="btn btn-primary" onClick={handleImport}
              disabled={loading}
              style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Importing…" : "⬆ Import data"}
            </button>
          </div>
        )}

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