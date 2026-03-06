import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Clock3, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function isTextQuestion(type) {
  return [
    'sentence_completion',
    'summary_completion',
    'short_answer',
    'note_completion',
  ].includes(type);
}

function isOptionQuestion(type) {
  return [
    'multiple_choice_single',
    'multiple_choice_multiple',
    'true_false_not_given',
    'yes_no_not_given',
    'matching_headings',
    'matching_information',
  ].includes(type);
}

function isAnswerCorrect(question, answer) {
  const expected = (question.correctAnswers || []).map(normalizeValue);

  if (question.type === 'multiple_choice_multiple') {
    const selected = Array.isArray(answer) ? answer.map(normalizeValue).sort() : [];
    const correct = [...expected].sort();
    return selected.length === correct.length && selected.every((item, index) => item === correct[index]);
  }

  if (isOptionQuestion(question.type) || isTextQuestion(question.type)) {
    const input = normalizeValue(answer);
    return expected.includes(input);
  }

  return false;
}

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function calculateBandScore(correct, total) {
  if (!total) return 0;
  const percentage = (correct / total) * 100;
  if (percentage >= 95) return 9.0;
  if (percentage >= 88) return 8.5;
  if (percentage >= 81) return 8.0;
  if (percentage >= 73) return 7.5;
  if (percentage >= 65) return 7.0;
  if (percentage >= 58) return 6.5;
  if (percentage >= 50) return 6.0;
  if (percentage >= 40) return 5.5;
  if (percentage >= 30) return 5.0;
  if (percentage >= 23) return 4.5;
  if (percentage >= 15) return 4.0;
  return 3.5;
}

function isAttempted(answer) {
  if (Array.isArray(answer)) return answer.length > 0;
  return String(answer || '').trim().length > 0;
}

export default function ReadingPracticeMode({ passages }) {
  const [selectedPassageId, setSelectedPassageId] = useState('');
  const [answers, setAnswers] = useState({});
  const [examStarted, setExamStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const questionRefs = useRef({});

  const selectedPassage = useMemo(
    () => passages.find((passage) => passage.id === selectedPassageId) || null,
    [passages, selectedPassageId],
  );

  useEffect(() => {
    if (!selectedPassageId && passages.length > 0) {
      setSelectedPassageId(passages[0].id);
    }
  }, [passages, selectedPassageId]);

  useEffect(() => {
    if (!examStarted || submitted) return undefined;
    if (timeLeftSeconds <= 0) {
      setSubmitted(true);
      setExamStarted(false);
      return undefined;
    }

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, submitted, timeLeftSeconds]);

  const score = useMemo(() => {
    if (!selectedPassage || !submitted) return null;
    const total = selectedPassage.questions.length;
    const correct = selectedPassage.questions.filter((question) =>
      isAnswerCorrect(question, answers[question.id]),
    ).length;
    const percentage = total ? Math.round((correct / total) * 100) : 0;
    return {
      correct,
      total,
      percentage,
      band: calculateBandScore(correct, total),
    };
  }, [answers, selectedPassage, submitted]);

  const selectPassage = (passageId) => {
    setSelectedPassageId(passageId);
    setAnswers({});
    setSubmitted(false);
    setExamStarted(false);
    setTimeLeftSeconds(0);
    setCurrentQuestionNumber(1);
  };

  const startExam = () => {
    if (!selectedPassage) return;
    setAnswers({});
    setSubmitted(false);
    setExamStarted(true);
    setCurrentQuestionNumber(1);
    setTimeLeftSeconds((selectedPassage.timeLimitMinutes || 20) * 60);
  };

  const submitAnswers = () => {
    if (!selectedPassage) return;
    setSubmitted(true);
    setExamStarted(false);
  };

  const updateSingleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const updateMultiAnswer = (questionId, option) => {
    setAnswers((prev) => {
      const existing = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const next = existing.includes(option)
        ? existing.filter((item) => item !== option)
        : [...existing, option];
      return { ...prev, [questionId]: next };
    });
  };

  const jumpToQuestion = (question) => {
    setCurrentQuestionNumber(question.number);
    const node = questionRefs.current[question.id];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-4 slide-in">
      <Card>
        <CardHeader>
          <CardTitle>IELTS Reading Exam Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedPassageId}
              onChange={(event) => selectPassage(event.target.value)}
              disabled={examStarted && !submitted}
            >
              <option value="">Select a passage</option>
              {passages.map((passage) => (
                <option key={passage.id} value={passage.id}>
                  {passage.title} ({passage.questions.length} questions)
                </option>
              ))}
            </select>

            <div className="h-10 px-3 rounded-md border flex items-center gap-2 text-sm font-medium">
              <Clock3 className="h-4 w-4" />
              {examStarted ? formatSeconds(timeLeftSeconds) : '--:--'}
            </div>

            <Button
              onClick={examStarted ? submitAnswers : startExam}
              disabled={!selectedPassage}
              className="h-10"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {examStarted ? 'Submit Test' : 'Start Test'}
            </Button>
          </div>

          {selectedPassage && (
            <p className="text-sm text-slate-600">
              {selectedPassage.instructions || 'Read the passage and answer all questions.'}
            </p>
          )}
        </CardContent>
      </Card>

      {!selectedPassage && (
        <Card>
          <CardContent className="pt-6 text-sm text-slate-600">
            No passage selected.
          </CardContent>
        </Card>
      )}

      {selectedPassage && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{selectedPassage.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-slate-50 p-4 whitespace-pre-wrap leading-7 text-sm max-h-[68vh] overflow-y-auto">
                  {selectedPassage.text}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5 max-h-[68vh] overflow-y-auto pr-1">
                  {selectedPassage.questions.map((question) => {
                    const answer = answers[question.id];
                    const correct = submitted ? isAnswerCorrect(question, answer) : null;

                    return (
                      <div
                        key={question.id}
                        ref={(node) => {
                          questionRefs.current[question.id] = node;
                        }}
                        className={`border rounded-md p-3 space-y-3 ${
                          currentQuestionNumber === question.number ? 'ring-2 ring-blue-500/40' : ''
                        }`}
                      >
                        {question.number === 1 && (
                          <div className="text-xs text-slate-600 rounded bg-slate-100 p-2">
                            Questions 1-8: Write TRUE, FALSE or NOT GIVEN.
                          </div>
                        )}
                        {question.number === 9 && (
                          <div className="text-xs text-slate-600 rounded bg-slate-100 p-2">
                            Questions 9-16: NO MORE THAN ONE WORD AND/OR A NUMBER.
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">
                            {question.number}. {question.prompt}
                          </p>
                          {submitted && (
                            <span className={`text-[11px] font-semibold ${correct ? 'text-green-600' : 'text-red-600'}`}>
                              {correct ? 'Correct' : 'Incorrect'}
                            </span>
                          )}
                        </div>

                        {question.type === 'multiple_choice_single' &&
                          (question.options || []).map((option) => (
                            <label key={option} className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name={question.id}
                                checked={answer === option}
                                onChange={() => updateSingleAnswer(question.id, option)}
                                disabled={submitted}
                              />
                              {option}
                            </label>
                          ))}

                        {question.type === 'multiple_choice_multiple' &&
                          (question.options || []).map((option) => (
                            <label key={option} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={Array.isArray(answer) && answer.includes(option)}
                                onChange={() => updateMultiAnswer(question.id, option)}
                                disabled={submitted}
                              />
                              {option}
                            </label>
                          ))}

                        {['true_false_not_given', 'yes_no_not_given', 'matching_headings', 'matching_information']
                          .includes(question.type) &&
                          (question.options || []).map((option) => (
                            <label key={option} className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name={question.id}
                                checked={answer === option}
                                onChange={() => updateSingleAnswer(question.id, option)}
                                disabled={submitted}
                              />
                              {option}
                            </label>
                          ))}

                        {isTextQuestion(question.type) && (
                          <Input
                            value={answer || ''}
                            onChange={(event) => updateSingleAnswer(question.id, event.target.value)}
                            placeholder="Type your answer"
                            disabled={submitted}
                          />
                        )}

                        {submitted && !correct && question.correctAnswers?.length > 0 && (
                          <p className="text-xs text-slate-600">
                            Correct answer: {question.correctAnswers.join(' / ')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedPassage.questions.map((question) => {
                  const attempted = isAttempted(answers[question.id]);
                  const isCurrent = currentQuestionNumber === question.number;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => jumpToQuestion(question)}
                      className={`h-8 min-w-8 px-2 rounded text-xs font-semibold border ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600'
                          : attempted
                            ? 'bg-green-50 text-green-700 border-green-300'
                            : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {question.number}
                    </button>
                  );
                })}
              </div>

              {!submitted && (
                <Button onClick={submitAnswers} className="w-full">
                  <Flag className="h-4 w-4 mr-2" />
                  Submit Answers
                </Button>
              )}

              {score && (
                <div className="rounded-md border bg-green-50 p-4">
                  <p className="font-semibold text-green-900">
                    Score: {score.correct}/{score.total} ({score.percentage}%)
                  </p>
                  <p className="text-sm text-green-800 mt-1">Estimated IELTS Band: {score.band.toFixed(1)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

ReadingPracticeMode.defaultProps = {
  passages: [],
};
