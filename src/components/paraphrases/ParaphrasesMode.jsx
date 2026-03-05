import React, { useState } from 'react';
import { Check, Edit2, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const EMPTY_PARAPHRASE = { original: '', variations: ['', '', ''] };

export default function ParaphrasesMode({
  paraphrases,
  isLoading,
  error,
  onAddParaphrase,
  onUpdateParaphrase,
  onDeleteParaphrase,
}) {
  const [newParaphrase, setNewParaphrase] = useState(EMPTY_PARAPHRASE);
  const [editingParaphraseId, setEditingParaphraseId] = useState(null);
  const [editingParaphraseDraft, setEditingParaphraseDraft] = useState({ original: '', variations: [] });

  const updateParaphraseVariation = (index, value) => {
    const next = [...newParaphrase.variations];
    next[index] = value;
    setNewParaphrase({ ...newParaphrase, variations: next });
  };

  const addMoreVariation = () => {
    setNewParaphrase((prev) => ({
      ...prev,
      variations: [...prev.variations, ''],
    }));
  };

  const handleAddParaphrase = async () => {
    const created = await onAddParaphrase(newParaphrase);
    if (created) {
      setNewParaphrase(EMPTY_PARAPHRASE);
    }
  };

  const startEditingParaphrase = (paraphrase) => {
    setEditingParaphraseId(paraphrase.id);
    setEditingParaphraseDraft({
      original: paraphrase.original || '',
      variations: Array.isArray(paraphrase.variations) ? [...paraphrase.variations] : [],
    });
  };

  const cancelEditingParaphrase = () => {
    setEditingParaphraseId(null);
    setEditingParaphraseDraft({ original: '', variations: [] });
  };

  const updateExistingParaphraseVariation = (index, value) => {
    setEditingParaphraseDraft((prev) => {
      const next = [...prev.variations];
      next[index] = value;
      return { ...prev, variations: next };
    });
  };

  const addVariationToExistingParaphrase = () => {
    setEditingParaphraseDraft((prev) => ({
      ...prev,
      variations: [...prev.variations, ''],
    }));
  };

  const saveEditingParaphrase = async () => {
    if (!editingParaphraseId) return;

    const ok = await onUpdateParaphrase(editingParaphraseId, {
      original: editingParaphraseDraft.original,
      variations: editingParaphraseDraft.variations,
    });

    if (ok) {
      cancelEditingParaphrase();
    }
  };

  return (
    <div className="space-y-6 slide-in">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Paraphrase Practice</h2>
        <p className="text-slate-600 mb-6 text-sm">
          Learn to express the same idea in different ways. Add an original phrase and multiple variations.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 mono">Original Phrase</label>
            <Textarea
              value={newParaphrase.original}
              onChange={(e) => setNewParaphrase({ ...newParaphrase, original: e.target.value })}
              placeholder="Enter the original phrase or sentence..."
              className="min-h-[80px] text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 mono">Paraphrase Variations</label>
            <div className="space-y-3">
              {newParaphrase.variations.map((variation, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-slate-400 font-bold text-sm pt-3 mono">{index + 1}.</span>
                  <Textarea
                    value={variation}
                    onChange={(e) => updateParaphraseVariation(index, e.target.value)}
                    placeholder={`Variation ${index + 1}...`}
                    className="min-h-[70px] flex-1"
                  />
                </div>
              ))}
            </div>

            <Button onClick={addMoreVariation} variant="outline" size="sm" className="mt-3">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Variation
            </Button>
          </div>

          <Button
            onClick={handleAddParaphrase}
            className="w-full h-12 text-lg font-medium"
            disabled={!newParaphrase.original.trim() || !newParaphrase.variations.some((item) => item.trim())}
          >
            <Plus className="w-5 h-5 mr-2" />
            Save Paraphrase Set
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Your Paraphrases ({paraphrases.length})</h3>

        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading paraphrases...</div>
        ) : paraphrases.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No paraphrases yet. Create your first one above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paraphrases.map((paraphrase) => (
              <div
                key={paraphrase.id}
                className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-slate-50"
              >
                {editingParaphraseId === paraphrase.id ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 mono">Original</div>
                      <Textarea
                        value={editingParaphraseDraft.original}
                        onChange={(e) =>
                          setEditingParaphraseDraft((prev) => ({ ...prev, original: e.target.value }))
                        }
                        className="min-h-[80px] text-lg"
                      />
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 mono">
                        Variations ({editingParaphraseDraft.variations.length})
                      </div>
                      <div className="space-y-3">
                        {editingParaphraseDraft.variations.map((variation, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <span className="text-indigo-600 font-bold mono text-sm pt-3">{index + 1}.</span>
                            <Textarea
                              value={variation}
                              onChange={(e) => updateExistingParaphraseVariation(index, e.target.value)}
                              className="min-h-[70px] flex-1"
                            />
                          </div>
                        ))}
                      </div>

                      <Button onClick={addVariationToExistingParaphrase} variant="outline" size="sm" className="mt-3">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Variation
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEditingParaphrase} className="flex-1">
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditingParaphrase} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 mono">Original</div>
                      <div className="font-semibold text-slate-900 text-lg mb-3">{paraphrase.original}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 mono">
                        Variations ({paraphrase.variations.length})
                      </div>
                      <div className="space-y-2">
                        {paraphrase.variations.map((variation, index) => (
                          <div key={index} className="flex gap-2 text-slate-700">
                            <span className="text-indigo-600 font-bold mono text-sm">{index + 1}.</span>
                            <span className="flex-1">{variation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 ml-4">
                      <Button size="sm" variant="ghost" onClick={() => startEditingParaphrase(paraphrase)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteParaphrase(paraphrase.id)}
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
