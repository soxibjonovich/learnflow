import React, { useState, useMemo } from 'react';
import { Trash2, Plus, Filter } from 'lucide-react';

// ── Column definitions ────────────────────────────────────────────
// group: visual colour group  label: header label  ph: placeholder
const COLS = [
  { field: 'a',      group: 'A', label: 'A',  ph: 'Simple word…'   },
  { field: 'b1',     group: 'B', label: 'B1', ph: 'Synonym B1…'    },
  { field: 'b2',     group: 'B', label: 'B2', ph: 'Synonym B2…'    },
  { field: 'c1',     group: 'C', label: 'C1', ph: 'Advanced C1…'   },
  { field: 'c2',     group: 'C', label: 'C2', ph: 'Advanced C2…'   },
  { field: 'c3',     group: 'C', label: 'C3', ph: 'Advanced C3…'   },
  { field: 'source', group: 'S', label: 'Source', ph: 'Source / Reading…' },
];

const GROUP_CLS = {
  A: 'bg-indigo-50 text-indigo-700',
  B: 'bg-teal-50   text-teal-700',
  C: 'bg-violet-50 text-violet-700',
  S: 'bg-slate-50  text-slate-500',
};

const EMPTY = Object.fromEntries(COLS.map((c) => [c.field, '']));

function isValid(row) {
  return row.a.trim().length > 0 && (row.b1.trim() || row.b2.trim() || row.c1.trim());
}

export default function SynonymsMode({ synonyms, onAdd, onUpdate, onDelete }) {
  const [rows, setRows]     = useState({});       // local edits keyed by id
  const [newRow, setNewRow] = useState({ ...EMPTY });
  const [sourceFilter, setSourceFilter] = useState('');

  // Merge prop data with local edits
  const getRow = (s) => ({ ...s, ...(rows[s.id] || {}) });

  const allSources = useMemo(
    () => [...new Set(synonyms.map((s) => s.source || '').filter(Boolean))].sort(),
    [synonyms],
  );

  const visible = useMemo(() => {
    if (!sourceFilter) return synonyms;
    return synonyms.filter((s) => (s.source || '') === sourceFilter);
  }, [synonyms, sourceFilter]);

  // ── existing row helpers ─────────────────────────────────────────
  const patchCell = (id, field, value) => {
    setRows((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const saveRow = (s) => {
    const current = getRow(s);
    if (isValid(current)) onUpdate(s.id, current);
  };

  const handleBlur = (s, e) => {
    const next  = e.relatedTarget;
    const rowEl = e.currentTarget.closest('[data-row-id]');
    if (rowEl && next && rowEl.contains(next)) return;
    saveRow(s);
  };

  const handleKeyDown = (s, e) => {
    if (e.key === 'Enter') { e.preventDefault(); saveRow(s); e.currentTarget.blur(); }
  };

  // ── new row helpers ──────────────────────────────────────────────
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

  // ── styles ───────────────────────────────────────────────────────
  const inputBase = 'w-full px-2 py-[8px] text-sm bg-transparent focus:outline-none focus:bg-white placeholder-slate-300';
  const tdBase    = 'border-r border-slate-100 p-0 last:border-r-0';

  return (
    <div className="slide-in space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

        {/* ── Header bar ── */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Synonyms</h2>
            <p className="text-slate-400 text-sm mono">
              {sourceFilter
                ? `${visible.length} of ${synonyms.length} entries`
                : `${synonyms.length} entries`}
            </p>
          </div>

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
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {/* Group row */}
              <tr className="border-b border-slate-100">
                <th className="w-10 border-r border-slate-200" />
                <th className={`px-3 py-1 text-center text-xs font-bold border-r border-slate-200 ${GROUP_CLS.A}`}>A</th>
                <th colSpan={2} className={`px-3 py-1 text-center text-xs font-bold border-r border-slate-200 ${GROUP_CLS.B}`}>B</th>
                <th colSpan={3} className={`px-3 py-1 text-center text-xs font-bold border-r border-slate-200 ${GROUP_CLS.C}`}>C</th>
                <th className={`px-3 py-1 text-center text-xs font-bold border-r border-slate-200 ${GROUP_CLS.S}`} />
                <th className="w-10" />
              </tr>
              {/* Column row */}
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-10 px-3 py-2 text-xs font-semibold text-slate-400 border-r border-slate-200">#</th>
                {COLS.map((c) => (
                  <th key={c.field} className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-200 last:border-r-0 ${GROUP_CLS[c.group]}`}>
                    {c.label}
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {/* ── Add-new row pinned at TOP ── */}
              <tr data-new-row="true" className="bg-indigo-50/30 border-b-2 border-indigo-100">
                <td className="w-10 px-3 border-r border-slate-100 text-indigo-300">
                  <Plus className="w-3.5 h-3.5" />
                </td>
                {COLS.map((c, ci) => (
                  <td key={c.field} className={tdBase}>
                    <input
                      value={newRow[c.field]}
                      placeholder={ci === 0 ? 'Add new word…' : c.ph}
                      onChange={(e) => setNewRow((p) => ({ ...p, [c.field]: e.target.value }))}
                      onBlur={handleNewBlur}
                      onKeyDown={handleNewKey}
                      className={`${inputBase} focus:bg-indigo-50`}
                    />
                  </td>
                ))}
                <td className="w-10" />
              </tr>

              {/* ── Existing rows ── */}
              {visible.map((s, i) => {
                const row = getRow(s);
                return (
                  <tr
                    key={s.id}
                    data-row-id={s.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="w-10 px-3 text-xs text-slate-400 mono border-r border-slate-100">
                      {i + 1}
                    </td>
                    {COLS.map((c) => (
                      <td key={c.field} className={tdBase}>
                        <input
                          value={row[c.field] || ''}
                          placeholder={c.ph}
                          onChange={(e) => patchCell(s.id, c.field, e.target.value)}
                          onBlur={(e) => handleBlur(s, e)}
                          onKeyDown={(e) => handleKeyDown(s, e)}
                          className={inputBase}
                        />
                      </td>
                    ))}
                    <td className="w-10 px-2 text-center">
                      <button
                        onClick={() => onDelete(s.id)}
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

        {synonyms.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm border-t border-slate-100">
            Type a word in the row above and press{' '}
            <kbd className="mx-1 px-1.5 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">Enter</kbd>
            to save.
          </div>
        )}

        {visible.length === 0 && synonyms.length > 0 && sourceFilter && (
          <div className="text-center py-8 text-slate-400 text-sm border-t border-slate-100">
            No entries for <strong>{sourceFilter}</strong>.{' '}
            <button onClick={() => setSourceFilter('')} className="text-indigo-500 underline">Clear filter</button>
          </div>
        )}
      </div>
    </div>
  );
}

SynonymsMode.defaultProps = {
  synonyms: [],
  onAdd:    () => {},
  onUpdate: () => {},
  onDelete: () => {},
};
