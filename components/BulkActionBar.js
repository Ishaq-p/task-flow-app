// components/BulkActionBar.js
"use client";

export default function BulkActionBar({
  selectedCount, totalCount,
  onMarkDone, onHighlight, onDelete,
  onSelectAll, onDeselectAll, onCancel,
}) {
  return (
    <div className="bulk-bar">
      {/* Count */}
      <span style={{ fontSize: 13, fontWeight: 500 }}>
        <span style={{ color: "var(--accent)" }}>{selectedCount}</span>
        <span style={{ color: "var(--muted)" }}> / {totalCount} selected</span>
      </span>

      <div className="bulk-bar-divider" />

      {/* Select controls */}
      <button
        className="btn-icon"
        onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
        style={{ fontSize: 12, color: "var(--muted)", padding: "4px 8px" }}
        title={selectedCount === totalCount ? "Deselect all" : "Select all"}
      >
        {selectedCount === totalCount ? "✕ All" : "✓ All"}
      </button>

      <div className="bulk-bar-divider" />

      {/* Actions */}
      <button
        className="btn"
        onClick={onMarkDone}
        disabled={selectedCount === 0}
        style={{ padding: "6px 12px", fontSize: 12, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--success)" }}
        title="Mark selected as done"
      >
        ✓ Done
      </button>

      <button
        className="btn"
        onClick={onHighlight}
        disabled={selectedCount === 0}
        style={{ padding: "6px 12px", fontSize: 12, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--accent)" }}
        title="Toggle highlight on selected"
      >
        ⭐ Highlight
      </button>

      <button
        className="btn"
        onClick={onDelete}
        disabled={selectedCount === 0}
        style={{ padding: "6px 12px", fontSize: 12, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--danger)" }}
        title="Delete selected"
      >
        ✕ Delete
      </button>

      <div className="bulk-bar-divider" />

      <button
        className="btn-ghost btn"
        onClick={onCancel}
        style={{ padding: "6px 12px", fontSize: 12 }}
      >
        Cancel
      </button>
    </div>
  );
}