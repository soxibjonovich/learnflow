import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LEVEL_OPTIONS, UNIT_OPTIONS } from '@/constants/options';

export default function CardForm({ card, onChange, onSubmit, submitLabel = 'Add Card' }) {
  const updateField = (key, value) => {
    onChange({ ...card, [key]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!card.front?.trim() || !card.back?.trim()) return;
    onSubmit(card);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 mono">Front (Question)</label>
        <Textarea
          value={card.front}
          onChange={(e) => updateField('front', e.target.value)}
          placeholder="Enter the term or question..."
          className="min-h-[100px] text-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 mono">Translation (Optional)</label>
        <Input
          value={card.translation}
          onChange={(e) => updateField('translation', e.target.value)}
          placeholder="Перевод, traduccion, traduction..."
          className="text-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 mono">Unit/Category</label>
        <select
          value={card.unit}
          onChange={(e) => updateField('unit', e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {UNIT_OPTIONS.map((unit) => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 mono">Level</label>
        <select
          value={card.level}
          onChange={(e) => updateField('level', e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {LEVEL_OPTIONS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 mono">Back (Answer)</label>
        <Textarea
          value={card.back}
          onChange={(e) => updateField('back', e.target.value)}
          placeholder="Enter the definition or answer..."
          className="min-h-[100px] text-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 mono">Example (Optional)</label>
        <Textarea
          value={card.example}
          onChange={(e) => updateField('example', e.target.value)}
          placeholder="Example sentence using this word..."
          className="min-h-[80px] text-base"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-lg font-medium"
        disabled={!card.front?.trim() || !card.back?.trim()}
      >
        <Plus className="w-5 h-5 mr-2" />
        {submitLabel}
      </Button>
    </form>
  );
}

CardForm.defaultProps = {
  card: {
    front: '',
    back: '',
    translation: '',
    example: '',
    unit: 'General',
    level: 'Beginner',
  },
  onChange: () => {},
  onSubmit: () => {},
  submitLabel: 'Add Card',
};
