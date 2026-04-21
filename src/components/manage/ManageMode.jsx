import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LEVEL_OPTIONS, UNIT_OPTIONS } from '@/constants/options';
import { Check, ChevronDown, ChevronUp, Download, Edit2, Plus, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

/* ─── CSV / TSV / JSON helpers ───────────────────────────────────── */
function parseCSVRow(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  fields.push(current.trim());
  return fields;
}

function parseImportText(text, format, fallbackUnit, fallbackLevel) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (format === 'json') {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed)
      ? parsed.filter((i) => i.front && i.back).map((i) => ({
          front: String(i.front).trim(), back: String(i.back).trim(),
          translation: i.translation ? String(i.translation).trim() : '',
          example: i.example ? String(i.example).trim() : '',
          unit: i.unit || fallbackUnit, level: i.level || fallbackLevel,
        }))
      : [];
  }
  const lines = trimmed.split('\n').filter(Boolean);
  const splitRow = format === 'csv' ? parseCSVRow : (l) => l.split('\t').map((s) => s.trim());
  const rows = lines.map(splitRow);
  const hasHeader = rows[0][0]?.toLowerCase().includes('front');
  return (hasHeader ? rows.slice(1) : rows)
    .filter((r) => r[0] && r[1])
    .map((r) => ({ front: r[0], back: r[1], translation: r[2] || '', example: r[3] || '', unit: fallbackUnit, level: fallbackLevel }));
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportCards(cards, format) {
  const ts = new Date().toISOString().split('T')[0];
  if (format === 'json') { downloadFile(JSON.stringify(cards, null, 2), `cards-${ts}.json`, 'application/json'); return; }
  const esc = (v) => { const s = v == null ? '' : String(v); return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s; };
  const header = 'Front,Back,Translation,Example,Unit,Level';
  const rows = cards.map((c) => [c.front, c.back, c.translation || '', c.example || '', c.unit || 'General', c.level || 'Beginner'].map(esc).join(','));
  downloadFile([header, ...rows].join('\n'), `cards-${ts}.csv`, 'text/csv;charset=utf-8;');
}

/* ─── Quick-add row (Excel-like) ─────────────────────────────────── */
const EMPTY_CARD = { front: '', back: '', translation: '', unit: 'General', level: 'Beginner' };

function QuickAddRow({ onAdd }) {
  const [draft, setDraft] = useState({ ...EMPTY_CARD });

  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  const commit = () => {
    if (!draft.front.trim() || !draft.back.trim()) return;
    onAdd({ ...draft, example: '' });
    setDraft({ ...EMPTY_CARD });
  };

  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
  };

  const cellCls = 'border-r border-slate-100 p-0 last:border-r-0';
  const inputCls = 'w-full px-3 py-2 text-sm bg-transparent focus:outline-none focus:bg-indigo-50 placeholder-slate-300';

  return (
    <tr className="bg-indigo-50/30 border-t border-slate-200">
      <td className="w-8 px-3 border-r border-slate-100 text-slate-300"><Plus className="w-3.5 h-3.5" /></td>
      <td className={cellCls}>
        <input value={draft.front} onChange={(e) => set('front', e.target.value)} onKeyDown={onKey}
          placeholder="Word / phrase…" className={inputCls} />
      </td>
      <td className={cellCls}>
        <input value={draft.back} onChange={(e) => set('back', e.target.value)} onKeyDown={onKey}
          placeholder="Definition…" className={inputCls} />
      </td>
      <td className={cellCls}>
        <input value={draft.translation} onChange={(e) => set('translation', e.target.value)} onKeyDown={onKey}
          placeholder="Translation…" className={inputCls} />
      </td>
      <td className={cellCls}>
        <select value={draft.unit} onChange={(e) => set('unit', e.target.value)}
          className="w-full px-2 py-2 text-sm bg-transparent focus:outline-none focus:bg-indigo-50 border-0">
          {UNIT_OPTIONS.map((u) => <option key={u}>{u}</option>)}
        </select>
      </td>
      <td className="w-20 px-2">
        <button onClick={commit} disabled={!draft.front.trim() || !draft.back.trim()}
          className="w-full py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          Add
        </button>
      </td>
    </tr>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function ManageMode({ cards, onAddCard, onUpdateCard, onDeleteCard, onResetProgress, onBulkAddCards }) {
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [filterUnit, setFilterUnit] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importFormat, setImportFormat] = useState('csv');
  const [importText, setImportText] = useState('');
  const [importUnit, setImportUnit] = useState('General');
  const [importLevel, setImportLevel] = useState('Beginner');

  const filtered = useMemo(
    () => cards
      .filter((c) => !filterUnit || (c.unit || 'General') === filterUnit)
      .filter((c) => !filterLevel || (c.level || 'Beginner') === filterLevel),
    [cards, filterUnit, filterLevel],
  );

  const startEdit = (card) => {
    setEditingId(card.id);
    setEditDraft({ front: card.front || '', back: card.back || '', translation: card.translation || '', example: card.example || '', unit: card.unit || 'General', level: card.level || 'Beginner' });
  };

  const saveEdit = async () => {
    if (!editDraft?.front.trim() || !editDraft?.back.trim()) return;
    await onUpdateCard(editingId, editDraft);
    setEditingId(null); setEditDraft(null);
  };

  const handleImport = async () => {
    try {
      const parsed = parseImportText(importText, importFormat, importUnit, importLevel);
      if (!parsed.length) { alert('No valid cards found.'); return; }
      await onBulkAddCards(parsed);
      setImportText(''); setShowImport(false);
      alert(`Imported ${parsed.length} cards.`);
    } catch (err) { alert(`Import failed: ${err.message}`); }
  };

  const thCls = 'px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0';
  const tdCls = 'border-r border-slate-100 p-0 last:border-r-0';
  const cellIn = 'w-full px-3 py-[9px] text-sm bg-indigo-50 focus:outline-none focus:bg-indigo-100';

  return (
    <div className="space-y-4 slide-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-slate-900">
          Cards <span className="text-slate-400 font-normal text-base mono">({cards.length})</span>
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setShowImport(true)} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-1.5" /> Import
          </Button>
          <div className="relative group">
            <Button variant="outline" size="sm" disabled={!cards.length}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            {cards.length > 0 && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {['json', 'csv'].map((f) => (
                  <button key={f} onClick={() => exportCards(cards, f)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 uppercase font-medium">{f}</button>
                ))}
              </div>
            )}
          </div>
          <Button onClick={onResetProgress} variant="outline" size="sm" disabled={!cards.length}>
            <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
          <option value="">All Units</option>
          {UNIT_OPTIONS.map((u) => <option key={u}>{u}</option>)}
        </select>
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
          <option value="">All Levels</option>
          {LEVEL_OPTIONS.map((l) => <option key={l}>{l}</option>)}
        </select>
        {(filterUnit || filterLevel) && (
          <button onClick={() => { setFilterUnit(''); setFilterLevel(''); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline">clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-8 px-3 py-2 border-r border-slate-200" />
                <th className={thCls}>Word / Phrase</th>
                <th className={thCls}>Definition</th>
                <th className={thCls}>Translation</th>
                <th className={thCls}>Unit</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((card, i) => (
                <tr key={card.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="w-8 px-3 text-xs text-slate-400 mono border-r border-slate-100">{i + 1}</td>
                  {editingId === card.id ? (
                    <>
                      <td className={tdCls}><input value={editDraft.front} onChange={(e) => setEditDraft((p) => ({ ...p, front: e.target.value }))} className={cellIn} autoFocus /></td>
                      <td className={tdCls}><input value={editDraft.back} onChange={(e) => setEditDraft((p) => ({ ...p, back: e.target.value }))} className={cellIn} /></td>
                      <td className={tdCls}><input value={editDraft.translation} onChange={(e) => setEditDraft((p) => ({ ...p, translation: e.target.value }))} className={cellIn} /></td>
                      <td className={tdCls}>
                        <select value={editDraft.unit} onChange={(e) => setEditDraft((p) => ({ ...p, unit: e.target.value }))}
                          className="w-full px-2 py-[9px] text-sm bg-indigo-50 focus:outline-none border-0">
                          {UNIT_OPTIONS.map((u) => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="w-20 px-2">
                        <div className="flex gap-1">
                          <button onClick={saveEdit} className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"><Check className="w-3.5 h-3.5 mx-auto" /></button>
                          <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50"><X className="w-3.5 h-3.5 mx-auto" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border-r border-slate-100 px-3 py-2 text-sm font-medium text-slate-900">{card.front}</td>
                      <td className="border-r border-slate-100 px-3 py-2 text-sm text-slate-600 max-w-[220px] truncate">{card.back}</td>
                      <td className="border-r border-slate-100 px-3 py-2 text-sm text-indigo-600 mono">{card.translation || <span className="text-slate-300">—</span>}</td>
                      <td className="border-r border-slate-100 px-3 py-2 text-xs text-slate-500 mono">{card.unit || 'General'}</td>
                      <td className="w-20 px-2">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(card)} className="flex-1 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><Edit2 className="w-3.5 h-3.5 mx-auto text-slate-500" /></button>
                          <button onClick={() => onDeleteCard(card.id)} className="flex-1 py-1.5 rounded-lg border border-red-100 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 mx-auto text-red-400" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              <QuickAddRow onAdd={onAddCard} />
            </tbody>
          </table>
        </div>

        {cards.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm border-t border-slate-100">
            Type in the row above and press <kbd className="mx-1 px-1.5 py-0.5 text-xs bg-slate-100 border border-slate-300 rounded">Enter</kbd> to add your first card.
          </div>
        )}
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Import Cards</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowImport(false); setImportText(''); }}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                {['csv', 'json'].map((f) => (
                  <button key={f} onClick={() => setImportFormat(f)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium uppercase transition-all ${importFormat === f ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 mono">Unit</label>
                  <select value={importUnit} onChange={(e) => setImportUnit(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    {UNIT_OPTIONS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 mono">Level</label>
                  <select value={importLevel} onChange={(e) => setImportLevel(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    {LEVEL_OPTIONS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <Textarea value={importText} onChange={(e) => setImportText(e.target.value)}
                placeholder={`Paste ${importFormat.toUpperCase()} data…`}
                className="min-h-[200px] font-mono text-sm" />
              <div className="flex gap-3">
                <Button onClick={handleImport} className="flex-1 h-12" disabled={!importText.trim()}>
                  <Upload className="w-4 h-4 mr-2" /> Import
                </Button>
                <Button onClick={() => { setShowImport(false); setImportText(''); }} variant="outline" className="h-12">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ManageMode.defaultProps = {
  cards: [],
  onAddCard: async () => {},
  onUpdateCard: () => {},
  onDeleteCard: () => {},
  onResetProgress: () => {},
  onBulkAddCards: async () => [],
};
