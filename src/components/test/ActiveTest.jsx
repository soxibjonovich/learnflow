import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export default function ActiveTest({
  testCards,
  currentIndex,
  testType,
  testCategory,
  multipleChoiceOptions,
  onAnswer,
  unitName,
}) {
  const [writtenAnswer, setWrittenAnswer] = useState('');

  const currentCard = testCards[currentIndex];
  const progress = useMemo(() => {
    if (!testCards.length) return 0;
    return (currentIndex / testCards.length) * 100;
  }, [currentIndex, testCards.length]);

  if (!currentCard) return null;

  const submitWritten = () => {
    onAnswer(writtenAnswer);
    setWrittenAnswer('');
  };

  const categoryLabel = testCategory === 'paraphrases' ? 'Paraphrase Test' : unitName === 'review' ? 'Review Words' : 'Flashcard Test';
  const displayUnitName = unitName === 'review' ? '' : unitName;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-500 mono">
            Question {currentIndex + 1} of {testCards.length}
          </div>
          <div className="text-sm font-medium text-indigo-600 mono">
            {displayUnitName ? `${displayUnitName} • ` : ''}
            {categoryLabel} • {testType === 'written' ? 'Written' : 'Multiple Choice'}
          </div>
        </div>

        <Progress value={progress} className="h-2 mb-6" />

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 mb-6">
          <div className="text-sm text-slate-500 uppercase tracking-wider mb-3 mono">Question</div>
          <div className="text-2xl font-bold text-slate-900 mb-4">{currentCard.front}</div>
          {testCategory === 'cards' && currentCard.translation && (
            <div className="text-lg text-indigo-600 font-medium mono">{currentCard.translation}</div>
          )}
        </div>

        {testType === 'written' ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 mono">Your Answer</label>
            <Input
              value={writtenAnswer}
              placeholder="Type your answer..."
              className="text-lg mb-4"
              onChange={(e) => setWrittenAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitWritten();
                }
              }}
            />
            <Button onClick={submitWritten} className="w-full h-12">
              {currentIndex < testCards.length - 1 ? 'Next Question' : 'Finish Test'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {multipleChoiceOptions.map((option, index) => (
              <button
                key={`${option}-${index}`}
                onClick={() => onAnswer(option)}
                className="w-full p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left font-medium"
              >
                <span className="text-indigo-600 font-bold mr-3 mono">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

ActiveTest.defaultProps = {
  testCards: [],
  currentIndex: 0,
  testType: 'written',
  testCategory: 'cards',
  multipleChoiceOptions: [],
  onAnswer: () => {},
  unitName: '',
};
