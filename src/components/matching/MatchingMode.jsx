import React, { useState, useMemo } from 'react';
import { Trash2, Plus, Filter } from 'lucide-react';

const COLS = [
  { field: 'statement', label: 'Statement / Heading',  ph: 'Statement or heading…' },
  { field: 'match',     label: 'Match (A / B / True…)', ph: 'Answer / label…'       },
  { field: 'notes',     label: 'Notes',                 ph: 'Why / explanation…'    },
  { field: 'source',    label: 'Source',                ph: 'Passage / reading…'    },
];

const EMPTY = Object.fromEntries(COLS.map((c) => [c.field, '']));

function isValid(row) {
  return row.statement.trim().length > 0 && row.match.trim().length > 0;
}

export default function MatchingMode({ items, onAdd, onUpdate, onDelete }) {
  const [patches, setPatches]       = useState({});
  const [newRow, setNewRow]         = useState({ ...EMPTY });
  const [sourceFilter, setFilter]   = useState('');

  const getRow = (item) => ({ ...item, ...(patches[item.id] || {}) });

  const allSources = useMemo(
    () => [...new Set(items.map((i) => i.source || '').filter(Boolean))].sort(),
    [items],
  );

  const visible = useMemo(
    () => sourceFilter ? items.filter((i) => (i.source || '') === sourceFilter) : items,
    [items, sourceFilter],
  );

  // ── existing row ─────────────────────────────────────────────────
  const patchCell = (id, field, value) =>
    setPatches((p) => ({ ...p, [id]: { ...(p[id] || {}), [field]: value } }));

  const saveRow = (item) => {
    const r = getRow(item);
    if (isValid(r)) onUpdate(item.id, r);
  };

  const handleBlur = (item, e) => {
    const next  = e.relatedTarget;
    const rowEl = e.currentTarget.closest('[data-row-id]');
    if (rowEl && next && rowEl.contains(next)) return;
    saveRow(item);
  };

  const handleKey = (item, e) => {
    if (e.key === 'Enter') { e.preventDefault(); saveRow(item); e.currentTarget.blur(); }
  };

  // ── new row ──────────────────────────────────────────────────────
  const commitNew = () => {
    if (isValid(newRow)) { onAdd(newRow); setNewRow({ ...EMPTY }); }
  };

  const handleNewBlur = (e) => {
    const next  = e.relatedTarget;
    const rowEl = e.currentTarget.closest('[data-new-row]');
    if (rowEl && next && rowEl.contains(next)) return;
    commitNew();
  };

  const handleNewKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commitNew(); }
  };

  const tdBase    = 'border-r border-slate-100 p-0 last:border-r-0';
  const inputBase = 'w-full px-3 py-[9px] text-sm bg-transparent focus:outline-none focus:bg-indigo-50 placeholder-slate-300';

  return (
    <div className="slide-in space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Matching Information</h2>
            <p className="text-slate-400 text-sm mono">
              {sourceFilter ? `${visible.length} of ${items.length} entries` : `${items.length} entries`}
            </p>
          </div>

          {allSources.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <button
                onClick={() => setFilter('')}
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
                  onClick={() => setFilter(sourceFilter === src ? '' : src)}
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-10 px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-slate-200">#</th>
                {COLS.map((c) => (
                  <th key={c.field} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
                    {c.label}
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {/* Add-new row — TOP */}
              <tr data-new-row="true" className="bg-indigo-50/30 border-b-2 border-indigo-100">
                <td className="w-10 px-3 border-r border-slate-100 text-indigo-300">
                  <Plus className="w-3.5 h-3.5" />
                </td>
                {COLS.map((c, ci) => (
                  <td key={c.field} className={tdBase}>
                    <input
                      value={newRow[c.field]}
                      placeholder={ci === 0 ? 'Add statement…' : c.ph}
                      onChange={(e) => setNewRow((p) => ({ ...p, [c.field]: e.target.value }))}
                      onBlur={handleNewBlur}
                      onKeyDown={handleNewKey}
                      className={`${inputBase} focus:bg-indigo-100`}
                    />
                  </td>
                ))}
                <td className="w-10" />
              </tr>

              {/* Existing rows */}
              {visible.map((item, i) => {
                const row = getRow(item);
                return (
                  <tr key={item.id} data-row-id={item.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="w-10 px-3 text-xs text-slate-400 mono border-r border-slate-100">{i + 1}</td>
                    {COLS.map((c) => (
                      <td key={c.field} className={tdBase}>
                        <input
                          value={row[c.field] || ''}
                          placeholder={c.ph}
                          onChange={(e) => patchCell(item.id, c.field, e.target.value)}
                          onBlur={(e) => handleBlur(item, e)}
                          onKeyDown={(e) => handleKey(item, e)}
                          className={inputBase}
                        />
                      </td>
                    ))}
                    <td className="w-10 px-2 text-center">
                      <button
                        onClick={() => onDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm border-t border-slate-100">
            Type statement + match above, press{' '}
            <kbd className="mx-1 px-1.5 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">Enter</kbd>
            to save.
          </div>
        )}

        {visible.length === 0 && items.length > 0 && sourceFilter && (
          <div className="text-center py-8 text-slate-400 text-sm border-t border-slate-100">
            No entries for <strong>{sourceFilter}</strong>.{' '}
            <button onClick={() => setFilter('')} className="text-indigo-500 underline">Clear filter</button>
          </div>
        )}
      </div>
    </div>
  );
}

MatchingMode.defaultProps = {
  items:    [],
  onAdd:    () => {},
  onUpdate: () => {},
  onDelete: () => {},
};
