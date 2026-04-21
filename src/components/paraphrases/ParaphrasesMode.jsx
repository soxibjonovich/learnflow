import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Plus, Filter } from 'lucide-react';

// Columns: original + 3 variations + source
const FIELDS       = ['original', 'v1', 'v2', 'v3', 'source'];
const PLACEHOLDERS = ['Original phrase…', 'Variation 1…', 'Variation 2…', 'Variation 3…', 'Source / Reading…'];
const COL_HEADERS  = ['Original Phrase', 'Variation 1', 'Variation 2', 'Variation 3', 'Source'];

function toRow(p) {
  return {
    id:       p.id,
    original: p.original       || '',
    v1:       p.variations?.[0] || '',
    v2:       p.variations?.[1] || '',
    v3:       p.variations?.[2] || '',
    source:   p.source          || '',
  };
}

function rowToPayload(row) {
  return {
    original:   row.original.trim(),
    variations: [row.v1, row.v2, row.v3].map((v) => v.trim()).filter(Boolean),
    source:     row.source.trim(),
  };
}

function isRowValid(row) {
  const p = rowToPayload(row);
  return p.original.length > 0 && p.variations.length > 0;
}

const EMPTY_NEW = { original: '', v1: '', v2: '', v3: '', source: '' };

export default function ParaphrasesMode({
  paraphrases,
  isLoading,
  error,
  onAddParaphrase,
  onUpdateParaphrase,
  onDeleteParaphrase,
}) {
  const [rows, setRows]       = useState([]);
  const [newRow, setNewRow]   = useState({ ...EMPTY_NEW });
  const [sourceFilter, setSourceFilter] = useState('');

  // Sync local rows from props
  useEffect(() => {
    setRows(paraphrases.map(toRow));
  }, [paraphrases]);

  // All unique sources for filter pills
  const allSources = useMemo(() => {
    const set = new Set(paraphrases.map((p) => p.source).filter(Boolean));
    return [...set].sort();
  }, [paraphrases]);

  // Filtered rows
  const visibleRows = useMemo(() => {
    if (!sourceFilter) return rows;
    return rows.filter((r) => r.source === sourceFilter);
  }, [rows, sourceFilter]);

  // ── existing row helpers ──────────────────────────────────────────
  const updateCell = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const saveRow = (row) => {
    if (isRowValid(row)) onUpdateParaphrase(row.id, rowToPayload(row));
  };

  const handleCellBlur = (row, e) => {
    const next  = e.relatedTarget;
    const rowEl = e.currentTarget.closest('[data-row-id]');
    if (rowEl && next && rowEl.contains(next)) return;
    saveRow(row);
  };

  const handleCellKeyDown = (row, e) => {
    if (e.key === 'Enter') { e.preventDefault(); saveRow(row); e.currentTarget.blur(); }
  };

  // ── new row helpers ───────────────────────────────────────────────
  const commitNew = () => {
    if (isRowValid(newRow)) {
      onAddParaphrase(rowToPayload(newRow));
      setNewRow({ ...EMPTY_NEW });
    }
  };

  const handleNewBlur = (e) => {
    const next  = e.relatedTarget;
    const rowEl = e.currentTarget.closest('[data-new-row]');
    if (rowEl && next && rowEl.contains(next)) return;
    commitNew();
  };

  const handleNewKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitNew(); }
  };

  // ─────────────────────────────────────────────────────────────────
  const tdBase   = 'border-r border-slate-100 p-0 last:border-r-0';
  const inputBase = 'w-full px-3 py-[9px] text-sm bg-transparent focus:outline-none focus:bg-indigo-50 placeholder-slate-300';

  return (
    <div className="slide-in space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Paraphrases</h2>
            <p className="text-slate-400 text-sm mono">
              {sourceFilter
                ? `${visibleRows.length} of ${paraphrases.length} entries`
                : `${paraphrases.length} entries`}
            </p>
          </div>

          {/* Source filter pills */}
          {allSources.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <button
                onClick={() => setSourceFilter('')}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  !sourceFilter
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                All
              </button>
              {allSources.map((src) => (
                <button
                  key={src}
                  onClick={() => setSourceFilter(sourceFilter === src ? '' : src)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    sourceFilter === src
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-10 px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-slate-200">#</th>
                {COL_HEADERS.map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
                    {h}
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {/* ── Add-new row at the TOP ── */}
              <tr data-new-row="true" className="bg-indigo-50/40 border-b border-indigo-100">
                <td className="w-10 px-3 border-r border-slate-100 text-indigo-300">
                  <Plus className="w-3.5 h-3.5" />
                </td>
                {FIELDS.map((field, fi) => (
                  <td key={field} className={tdBase}>
                    <input
                      value={newRow[field]}
                      placeholder={fi === 0 ? 'Add new phrase…' : PLACEHOLDERS[fi]}
                      onChange={(e) => setNewRow((p) => ({ ...p, [field]: e.target.value }))}
                      onBlur={handleNewBlur}
                      onKeyDown={handleNewKeyDown}
                      className={`${inputBase} focus:bg-indigo-100`}
                    />
                  </td>
                ))}
                <td className="w-10" />
              </tr>

              {/* ── Existing rows ── */}
              {visibleRows.map((row, i) => (
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
                        onKeyDown={(e) => handleCellKeyDown(row, e)}
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
            </tbody>
          </table>
        </div>

        {paraphrases.length === 0 && !isLoading && (
          <div className="text-center py-10 text-slate-400 text-sm border-t border-slate-100">
            Type in the row above and press{' '}
            <kbd className="mx-1 px-1.5 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">Enter</kbd>
            to add your first entry.
          </div>
        )}

        {visibleRows.length === 0 && paraphrases.length > 0 && sourceFilter && (
          <div className="text-center py-8 text-slate-400 text-sm border-t border-slate-100">
            No entries for <strong>{sourceFilter}</strong>.{' '}
            <button onClick={() => setSourceFilter('')} className="text-indigo-500 underline">Clear filter</button>
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
