import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';

const FIELDS = ['original', 'v1', 'v2', 'v3'];
const PLACEHOLDERS = ['Original phrase…', 'Variation 1…', 'Variation 2…', 'Variation 3…'];
const COL_HEADERS = ['Original Phrase', 'Variation 1', 'Variation 2', 'Variation 3'];

function toRow(p) {
  return {
    id: p.id,
    original: p.original || '',
    v1: p.variations?.[0] || '',
    v2: p.variations?.[1] || '',
    v3: p.variations?.[2] || '',
  };
}

function rowToPayload(row) {
  return {
    original: row.original.trim(),
    variations: [row.v1, row.v2, row.v3].map((v) => v.trim()).filter(Boolean),
  };
}

function isRowValid(row) {
  const p = rowToPayload(row);
  return p.original.length > 0 && p.variations.length > 0;
}

const EMPTY_NEW = { original: '', v1: '', v2: '', v3: '' };

export default function ParaphrasesMode({
  paraphrases,
  isLoading,
  error,
  onAddParaphrase,
  onUpdateParaphrase,
  onDeleteParaphrase,
}) {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({ ...EMPTY_NEW });

  // Sync from props
  useEffect(() => {
    setRows(paraphrases.map(toRow));
  }, [paraphrases]);

  // ── existing row helpers ──────────────────────────────────────────
  const updateCell = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const saveRow = (row) => {
    if (isRowValid(row)) {
      onUpdateParaphrase(row.id, rowToPayload(row));
    }
  };

  const handleCellBlur = (row, e) => {
    // Only save when focus leaves this row entirely
    const next = e.relatedTarget;
    const rowEl = e.currentTarget.closest('[data-row-id]');
    if (rowEl && next && rowEl.contains(next)) return;
    saveRow(row);
  };

  const handleCellKeyDown = (row, field, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveRow(row);
      e.currentTarget.blur();
    }
  };

  // ── new row helpers ───────────────────────────────────────────────
  const commitNew = () => {
    if (isRowValid(newRow)) {
      onAddParaphrase(rowToPayload(newRow));
      setNewRow({ ...EMPTY_NEW });
    }
  };

  const handleNewBlur = (e) => {
    const next = e.relatedTarget;
    const rowEl = e.currentTarget.closest('[data-new-row]');
    if (rowEl && next && rowEl.contains(next)) return;
    commitNew();
  };

  const handleNewKeyDown = (field, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitNew();
    }
  };

  // ─────────────────────────────────────────────────────────────────
  const tdBase =
    'border-r border-slate-100 p-0 last:border-r-0';

  const inputBase =
    'w-full px-3 py-[9px] text-sm bg-transparent focus:outline-none focus:bg-indigo-50 placeholder-slate-300';

  return (
    <div className="slide-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Paraphrases</h2>
            <p className="text-slate-400 text-sm mt-0.5 mono">{paraphrases.length} entries</p>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-10 px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-slate-200">
                  #
                </th>
                {COL_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0"
                  >
                    {h}
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* Existing rows */}
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  data-row-id={row.id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="w-10 px-3 text-xs text-slate-400 mono border-r border-slate-100">
                    {i + 1}
                  </td>
                  {FIELDS.map((field, fi) => (
                    <td key={field} className={tdBase}>
                      <input
                        value={row[field]}
                        placeholder={PLACEHOLDERS[fi]}
                        onChange={(e) => updateCell(row.id, field, e.target.value)}
                        onBlur={(e) => handleCellBlur(row, e)}
                        onKeyDown={(e) => handleCellKeyDown(row, field, e)}
                        className={inputBase}
                      />
                    </td>
                  ))}
                  <td className="w-10 px-2 text-center">
                    <button
                      onClick={() => onDeleteParaphrase(row.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* New row */}
              <tr data-new-row="true" className="bg-indigo-50/40">
                <td className="w-10 px-3 border-r border-slate-100 text-slate-300">
                  <Plus className="w-3.5 h-3.5" />
                </td>
                {FIELDS.map((field, fi) => (
                  <td key={field} className={tdBase}>
                    <input
                      value={newRow[field]}
                      placeholder={fi === 0 ? 'Add new phrase…' : PLACEHOLDERS[fi]}
                      onChange={(e) => setNewRow((p) => ({ ...p, [field]: e.target.value }))}
                      onBlur={handleNewBlur}
                      onKeyDown={(e) => handleNewKeyDown(field, e)}
                      className={`${inputBase} focus:bg-indigo-100`}
                    />
                  </td>
                ))}
                <td className="w-10" />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paraphrases.length === 0 && !isLoading && (
          <div className="text-center py-10 text-slate-400 text-sm border-t border-slate-100">
            Type in the row above and press <kbd className="mx-1 px-1.5 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">Enter</kbd> to add your first entry.
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8 text-slate-400 text-sm">Loading…</div>
        )}
      </div>
    </div>
  );
}

ParaphrasesMode.defaultProps = {
  paraphrases: [],
  isLoading: false,
  error: null,
  onAddParaphrase: () => {},
  onUpdateParaphrase: () => false,
  onDeleteParaphrase: () => {},
};
