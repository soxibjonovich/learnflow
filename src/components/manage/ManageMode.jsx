import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LEVEL_OPTIONS, UNIT_OPTIONS } from '@/constants/options';
import { Check, Download, Edit2, FileText, Plus, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

function parseCSVRow(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
}

function parseImportText(text, format, fallbackUnit, fallbackLevel) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (format === 'json') {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item.front && item.back)
      .map((item) => ({
        front: String(item.front).trim(),
        back: String(item.back).trim(),
        translation: item.translation ? String(item.translation).trim() : '',
        example: item.example ? String(item.example).trim() : '',
        unit: item.unit || fallbackUnit,
        level: item.level || fallbackLevel,
      }));
  }

  const lines = trimmed.split('\n').filter(Boolean);
  if (lines.length === 0) return [];

  if (format === 'csv') {
    const rows = lines.map(parseCSVRow);
    const hasHeader = rows[0][0]?.toLowerCase().includes('front');
    const dataRows = hasHeader ? rows.slice(1) : rows;

    return dataRows
      .filter((row) => row[0] && row[1])
      .map((row) => ({
        front: row[0],
        back: row[1],
        translation: row[2] || '',
        example: row[3] || '',
        unit: fallbackUnit,
        level: fallbackLevel,
      }));
  }

  if (format === 'tsv') {
    const rows = lines.map((line) => line.split('\t').map((item) => item.trim()));
    const hasHeader = rows[0][0]?.toLowerCase().includes('front');
    const dataRows = hasHeader ? rows.slice(1) : rows;

    return dataRows
      .filter((row) => row[0] && row[1])
      .map((row) => ({
        front: row[0],
        back: row[1],
        translation: row[2] || '',
        example: row[3] || '',
        unit: fallbackUnit,
        level: fallbackLevel,
      }));
  }

  if (format === 'quizlet') {
    return lines
      .map((line) => line.split('\t').map((item) => item.trim()))
      .filter((row) => row[0] && row[1])
      .map((row) => ({
        front: row[0],
        back: row[1],
        translation: '',
        example: '',
        unit: fallbackUnit,
        level: fallbackLevel,
      }));
  }

  return [];
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const element = document.createElement('a');
  element.href = url;
  element.download = filename;
  element.click();
  URL.revokeObjectURL(url);
}

function exportCards(cards, format) {
  const timestamp = new Date().toISOString().split('T')[0];

  if (format === 'json') {
    downloadFile(JSON.stringify(cards, null, 2), `learnflow-cards-${timestamp}.json`, 'application/json');
    return;
  }

  if (format === 'quizlet') {
    const content = cards.map((card) => `${card.front}\t${card.back}`).join('\n');
    downloadFile(content, `learnflow-cards-${timestamp}.txt`, 'text/plain;charset=utf-8;');
    return;
  }

  const escapeCsv = (value) => {
    const stringValue = value === null || value === undefined ? '' : String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  if (format === 'csv') {
    const header = 'Front,Back,Translation,Example,Unit,Level';
    const rows = cards.map((card) => (
      [card.front, card.back, card.translation || '', card.example || '', card.unit || 'General', card.level || 'Beginner']
        .map(escapeCsv)
        .join(',')
    ));

    downloadFile([header, ...rows].join('\n'), `learnflow-cards-${timestamp}.csv`, 'text/csv;charset=utf-8;');
    return;
  }

  if (format === 'tsv') {
    const header = 'Front\tBack\tTranslation\tExample\tUnit\tLevel';
    const rows = cards.map((card) => [
      card.front,
      card.back,
      card.translation || '',
      card.example || '',
      card.unit || 'General',
      card.level || 'Beginner',
    ].join('\t'));

    downloadFile([header, ...rows].join('\n'), `learnflow-cards-${timestamp}.tsv`, 'text/tab-separated-values;charset=utf-8;');
  }
}

export default function ManageMode({
  cards,
  onUpdateCard,
  onDeleteCard,
  onResetProgress,
  onBulkAddCards,
  onSwitchToCreate,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [filterUnit, setFilterUnit] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importFormat, setImportFormat] = useState('csv');
  const [importText, setImportText] = useState('');
  const [importUnit, setImportUnit] = useState('General');
  const [importLevel, setImportLevel] = useState('Beginner');

  const filteredCards = useMemo(
    () => cards
      .filter((card) => !filterUnit || (card.unit || 'General') === filterUnit)
      .filter((card) => !filterLevel || (card.level || 'Beginner') === filterLevel),
    [cards, filterUnit, filterLevel],
  );

  const startEdit = (card) => {
    setEditingId(card.id);
    setEditingDraft({
      front: card.front || '',
      back: card.back || '',
      translation: card.translation || '',
      example: card.example || '',
      unit: card.unit || 'General',
      level: card.level || 'Beginner',
    });
  };

  const saveEdit = async () => {
    if (!editingId || !editingDraft?.front.trim() || !editingDraft?.back.trim()) return;
    await onUpdateCard(editingId, editingDraft);
    setEditingId(null);
    setEditingDraft(null);
  };

  const handleImport = async () => {
    try {
      const parsedCards = parseImportText(importText, importFormat, importUnit, importLevel);
      if (parsedCards.length === 0) {
        alert('No valid cards found in import data.');
        return;
      }

      await onBulkAddCards(parsedCards);
      setImportText('');
      setImportUnit('General');
      setImportLevel('Beginner');
      setShowImport(false);
      alert(`Successfully imported ${parsedCards.length} cards.`);
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4 slide-in">
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <h2 className="text-2xl font-bold text-slate-900">All Cards</h2>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setShowImport(true)} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

          <div className="relative group">
            <Button variant="outline" size="sm" disabled={cards.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {cards.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="py-1">
                  <button onClick={() => exportCards(cards, 'json')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100">JSON</button>
                  <button onClick={() => exportCards(cards, 'csv')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100">CSV</button>
                  <button onClick={() => exportCards(cards, 'tsv')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100">TSV</button>
                  <button onClick={() => exportCards(cards, 'quizlet')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100">Quizlet</button>
                </div>
              </div>
            )}
          </div>

          <Button onClick={onResetProgress} variant="outline" size="sm" disabled={cards.length === 0}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Progress
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-medium text-slate-700 mb-3 mono">Filter Cards</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1 mono">Unit</label>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Units</option>
              {UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1 mono">Level</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Levels</option>
              {LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterUnit('');
                setFilterLevel('');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-200/50">
          <p className="text-slate-600 mb-4">No cards yet. Create your first card to start learning.</p>
          <Button onClick={onSwitchToCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Card
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              {editingId === card.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 mono mb-1 block">Front</label>
                    <Input
                      value={editingDraft.front}
                      onChange={(e) => setEditingDraft((prev) => ({ ...prev, front: e.target.value }))}
                      className="font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mono mb-1 block">Translation</label>
                    <Input
                      value={editingDraft.translation}
                      onChange={(e) => setEditingDraft((prev) => ({ ...prev, translation: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mono mb-1 block">Back</label>
                    <Input
                      value={editingDraft.back}
                      onChange={(e) => setEditingDraft((prev) => ({ ...prev, back: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mono mb-1 block">Unit</label>
                    <select
                      value={editingDraft.unit}
                      onChange={(e) => setEditingDraft((prev) => ({ ...prev, unit: e.target.value }))}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      {UNIT_OPTIONS.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mono mb-1 block">Level</label>
                    <select
                      value={editingDraft.level}
                      onChange={(e) => setEditingDraft((prev) => ({ ...prev, level: e.target.value }))}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      {LEVEL_OPTIONS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mono mb-1 block">Example</label>
                    <Textarea
                      value={editingDraft.example}
                      onChange={(e) => setEditingDraft((prev) => ({ ...prev, example: e.target.value }))}
                      className="min-h-[60px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} className="flex-1">
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 mb-1">{card.front}</div>
                    {card.translation && <div className="text-indigo-600 text-sm font-medium mb-1 mono">{card.translation}</div>}
                    <div className="text-slate-600 text-sm mb-1">{card.back}</div>
                    {card.example && (
                      <div className="text-slate-500 text-xs italic mt-2 border-l-2 border-slate-200 pl-2">"{card.example}"</div>
                    )}
                    <div className="flex gap-2 mt-2 text-xs mono flex-wrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">Box {card.box}</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">{card.reviews} reviews</span>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{card.unit || 'General'}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{card.level || 'Beginner'}</span>
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(card)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteCard(card.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 slide-in">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Import Cards</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowImport(false);
                  setImportText('');
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 mono">Select Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['csv', 'tsv', 'quizlet', 'json'].map((format) => (
                    <button
                      key={format}
                      onClick={() => setImportFormat(format)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        importFormat === format ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-sm uppercase">{format}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 mono">Unit for All Cards</label>
                  <select
                    value={importUnit}
                    onChange={(e) => setImportUnit(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 mono">Level for All Cards</label>
                  <select
                    value={importLevel}
                    onChange={(e) => setImportLevel(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    {LEVEL_OPTIONS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 mono">Paste Your Data</label>
                <Textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`Paste your ${importFormat.toUpperCase()} data here...`}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleImport} className="flex-1 h-12 text-lg font-medium" disabled={!importText.trim()}>
                  <Upload className="w-5 h-5 mr-2" />
                  Import Cards
                </Button>
                <Button
                  onClick={() => {
                    setShowImport(false);
                    setImportText('');
                  }}
                  variant="outline"
                  className="h-12"
                >
                  Cancel
                </Button>
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
  onUpdateCard: () => {},
  onDeleteCard: () => {},
  onResetProgress: () => {},
  onBulkAddCards: async () => [],
  onSwitchToCreate: () => {},
};
