import React, { useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FIXED_OPTIONS_BY_TYPE, OPTION_BASED_TYPES, QUESTION_TYPES } from './readingQuestionTypes';

const EMPTY_PASSAGE = {
  title: '',
  text: '',
  instructions: '',
};

const EMPTY_QUESTION = {
  type: 'multiple_choice_single',
  prompt: '',
  optionsText: '',
  correctAnswersText: '',
  explanation: '',
};

function normalizeLines(multilineText) {
  return multilineText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function PassageBuilderMode({ passages, onAddPassage, onDeletePassage }) {
  const [passageDraft, setPassageDraft] = useState(EMPTY_PASSAGE);
  const [questionDraft, setQuestionDraft] = useState(EMPTY_QUESTION);
  const [questions, setQuestions] = useState([]);

  const typeOptions = useMemo(() => QUESTION_TYPES, []);
  const selectedType = questionDraft.type;
  const fixedOptions = FIXED_OPTIONS_BY_TYPE[selectedType] || null;
  const usesOptions = OPTION_BASED_TYPES.has(selectedType);

  const addQuestion = () => {
    const prompt = questionDraft.prompt.trim();
    if (!prompt) {
      alert('Question prompt is required.');
      return;
    }

    const options = fixedOptions || normalizeLines(questionDraft.optionsText);
    const correctAnswers = normalizeLines(questionDraft.correctAnswersText);

    if (usesOptions && options.length < 2) {
      alert('Please provide at least 2 options.');
      return;
    }
    if (correctAnswers.length === 0) {
      alert('Please provide at least 1 correct answer.');
      return;
    }

    const nextQuestion = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      number: questions.length + 1,
      type: selectedType,
      prompt,
      options,
      correctAnswers,
      explanation: questionDraft.explanation.trim(),
    };

    setQuestions((prev) => [...prev, nextQuestion]);
    setQuestionDraft({
      ...EMPTY_QUESTION,
      type: selectedType,
    });
  };

  const removeQuestion = (id) => {
    setQuestions((prev) =>
      prev
        .filter((item) => item.id !== id)
        .map((item, index) => ({ ...item, number: index + 1 })),
    );
  };

  const savePassage = () => {
    const title = passageDraft.title.trim();
    const text = passageDraft.text.trim();

    if (!title || !text) {
      alert('Passage title and text are required.');
      return;
    }
    if (questions.length === 0) {
      alert('Add at least one question.');
      return;
    }

    onAddPassage({
      title,
      text,
      instructions: passageDraft.instructions.trim(),
      questions,
    });

    setPassageDraft(EMPTY_PASSAGE);
    setQuestionDraft(EMPTY_QUESTION);
    setQuestions([]);
  };

  return (
    <div className="space-y-6 slide-in">
      <Card>
        <CardHeader>
          <CardTitle>Passage Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={passageDraft.title}
            onChange={(event) => setPassageDraft((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Passage title"
          />
          <Textarea
            value={passageDraft.instructions}
            onChange={(event) => setPassageDraft((prev) => ({ ...prev, instructions: event.target.value }))}
            placeholder="Instructions (optional)"
            className="min-h-[90px]"
          />
          <Textarea
            value={passageDraft.text}
            onChange={(event) => setPassageDraft((prev) => ({ ...prev, text: event.target.value }))}
            placeholder="Paste full passage text"
            className="min-h-[220px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={questionDraft.type}
            onChange={(event) => setQuestionDraft((prev) => ({ ...prev, type: event.target.value }))}
          >
            {typeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <Textarea
            value={questionDraft.prompt}
            onChange={(event) => setQuestionDraft((prev) => ({ ...prev, prompt: event.target.value }))}
            placeholder="Question prompt"
            className="min-h-[90px]"
          />

          {usesOptions && !fixedOptions && (
            <Textarea
              value={questionDraft.optionsText}
              onChange={(event) => setQuestionDraft((prev) => ({ ...prev, optionsText: event.target.value }))}
              placeholder="Options (one per line)"
              className="min-h-[110px]"
            />
          )}

          {fixedOptions && (
            <div className="text-sm text-slate-600">
              Options: {fixedOptions.join(', ')}
            </div>
          )}

          <Textarea
            value={questionDraft.correctAnswersText}
            onChange={(event) =>
              setQuestionDraft((prev) => ({ ...prev, correctAnswersText: event.target.value }))
            }
            placeholder="Correct answer(s), one per line"
            className="min-h-[90px]"
          />

          <Textarea
            value={questionDraft.explanation}
            onChange={(event) => setQuestionDraft((prev) => ({ ...prev, explanation: event.target.value }))}
            placeholder="Explanation (optional)"
            className="min-h-[70px]"
          />

          <Button onClick={addQuestion} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question List ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.length === 0 && (
            <p className="text-sm text-slate-600">No questions yet.</p>
          )}
          {questions.map((question) => (
            <div key={question.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">Q{question.number} - {question.type}</p>
                  <p className="text-sm text-slate-700 mt-1">{question.prompt}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeQuestion(question.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={savePassage} disabled={questions.length === 0} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Passage
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Passages ({passages.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {passages.length === 0 && (
            <p className="text-sm text-slate-600">No saved passages yet.</p>
          )}
          {passages.map((passage) => (
            <div key={passage.id} className="rounded-md border p-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{passage.title}</p>
                <p className="text-sm text-slate-600">{passage.questions.length} questions</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onDeletePassage(passage.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

PassageBuilderMode.defaultProps = {
  passages: [],
  onAddPassage: () => {},
  onDeletePassage: () => {},
};
