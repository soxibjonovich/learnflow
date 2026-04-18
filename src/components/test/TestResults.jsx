import React, { useMemo } from 'react';
import { Award, Check, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TestResults({
  testCards,
  testAnswers,
  testCategory,
  onRetakeTest,
  onBackToStudy,
  onBackToSelection,
  unitName,
}) {
  const score = useMemo(() => {
    const correct = Object.values(testAnswers).filter((answer) => answer.isCorrect).length;
    const total = testCards.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percentage };
  }, [testAnswers, testCards]);

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg slide-in">
      <div className="text-center mb-8">
        <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Test Complete!</h2>
        <div className="text-6xl font-bold text-indigo-600 mb-2">{score.percentage}%</div>
        <div className="text-xl text-slate-600 mono">
          {score.correct} / {score.total} correct
          {unitName && unitName !== 'review' ? ` • ${unitName}` : ''}
          {` • ${unitName === 'review' ? 'Review Words' : testCategory === 'paraphrases' ? 'Paraphrase' : 'Flashcard'} Test`}
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {testCards.map((card, index) => {
          const answer = testAnswers[card.id];
          const isCorrect = answer?.isCorrect;

          return (
            <div
              key={card.id}
              className={`p-4 rounded-lg border-2 ${
                isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                )}

                <div className="flex-1">
                  <div className="font-semibold text-slate-900 mb-1">{index + 1}. {card.front}</div>

                  {isCorrect ? (
                    <div className="text-sm text-green-700 mono">
                      Correct: {testCategory === 'paraphrases' ? answer?.given : answer?.correct}
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-red-700">
                        <span className="mono">Your answer:</span> {answer?.given || '(empty)'}
                      </div>
                      <div className="text-sm text-green-700">
                        <span className="mono">Correct answer:</span> {answer?.correct}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4">
        <Button onClick={onRetakeTest} className="flex-1 h-12">
          <RotateCcw className="w-5 h-5 mr-2" />
          Take Another Test
        </Button>
        <Button onClick={onBackToSelection} variant="outline" className="flex-1 h-12">
          New Selection
        </Button>
        <Button onClick={onBackToStudy} variant="outline" className="flex-1 h-12">
          Back to Study
        </Button>
      </div>
    </div>
  );
}

TestResults.defaultProps = {
  testCards: [],
  testAnswers: {},
  testCategory: 'cards',
  onRetakeTest: () => {},
  onBackToStudy: () => {},
  onBackToSelection: () => {},
  unitName: '',
};
