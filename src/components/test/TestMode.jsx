import React from 'react';
import TestSelection from './TestSelection';
import ActiveTest from './ActiveTest';
import TestResults from './TestResults';

export default function TestMode({
  cards,
  reviewCards,
  testCards,
  currentTestIndex,
  testAnswers,
  testComplete,
  testType,
  testCategory,
  testLimit,
  multipleChoiceOptions,
  selectedUnits,
  testWholeUnit,
  onToggleUnit,
  onStartTest,
  onStartReviewTest,
  onAnswerQuestion,
  onResetTest,
  onModeChange,
  onTestLimitChange,
  onRateCards,
}) {
  const getTestState = () => {
    if (testCards.length === 0) return 'selection';
    if (testComplete) return 'complete';
    return 'active';
  };

  const testState = getTestState();

  if (testState === 'selection') {
    return (
      <div className="slide-in">
        <TestSelection
          cards={cards}
          reviewCards={reviewCards}
          selectedUnits={selectedUnits}
          testLimit={testLimit}
          onToggleUnit={onToggleUnit}
          onStartTest={onStartTest}
          onStartReviewTest={onStartReviewTest}
          onTestLimitChange={onTestLimitChange}
        />
      </div>
    );
  }

  if (testState === 'active') {
    return (
      <ActiveTest
        testCards={testCards}
        currentIndex={currentTestIndex}
        testType={testType}
        testCategory={testCategory}
        multipleChoiceOptions={multipleChoiceOptions}
        onAnswer={onAnswerQuestion}
        unitName={testWholeUnit}
      />
    );
  }

  if (testState === 'complete') {
    return (
      <TestResults
        testCards={testCards}
        testAnswers={testAnswers}
        testCategory={testCategory}
        onRetakeTest={() => onStartTest(testType, testCategory)}
        onBackToStudy={() => onModeChange('study')}
        onBackToSelection={onResetTest}
        onRateCards={onRateCards}
        unitName={testWholeUnit}
      />
    );
  }

  return null;
}

TestMode.defaultProps = {
  cards: [],
  reviewCards: [],
  testCards: [],
  currentTestIndex: 0,
  testAnswers: {},
  testComplete: false,
  testType: 'written',
  testCategory: 'cards',
  testLimit: 10,
  multipleChoiceOptions: [],
  selectedUnits: [],
  testWholeUnit: '',
  onToggleUnit: () => {},
  onStartTest: () => {},
  onStartReviewTest: () => {},
  onAnswerQuestion: () => {},
  onRateCards: () => {},
  onResetTest: () => {},
  onModeChange: () => {},
  onTestLimitChange: () => {},
};
