import React from 'react';
import TestSelection from './TestSelection';
import ActiveTest from './ActiveTest';
import TestResults from './TestResults';

/**
 * TestMode Component
 * Main container for test mode with different states
 * 
 * @param {Object} props
 * @param {Array} props.cards - All available cards
 * @param {Array} props.testCards - Cards currently being tested
 * @param {number} props.currentTestIndex - Current question index
 * @param {Object} props.testAnswers - Answers given so far
 * @param {boolean} props.testComplete - Whether test is finished
 * @param {string} props.testType - Type of test ('written' or 'multiple-choice')
 * @param {Array} props.multipleChoiceOptions - Options for current question (if MC)
 * @param {Array} props.selectedUnits - Selected units for multi-unit test
 * @param {string} props.testWholeUnit - Unit name if testing specific unit
 * @param {Function} props.onToggleUnit - Toggle unit selection
 * @param {Function} props.onStartTest - Start regular test
 * @param {Function} props.onStartUnitTest - Start unit-specific test (NEW!)
 * @param {Function} props.onAnswerQuestion - Answer current question
 * @param {Function} props.onResetTest - Reset test state
 * @param {Function} props.onModeChange - Change to different mode
 */
export default function TestMode({
  cards,
  testCards,
  currentTestIndex,
  testAnswers,
  testComplete,
  testType,
  multipleChoiceOptions,
  selectedUnits,
  testWholeUnit,
  onToggleUnit,
  onStartTest,
  onStartUnitTest,
  onAnswerQuestion,
  onResetTest,
  onModeChange
}) {
  // Test state: 'selection', 'active', 'complete'
  const getTestState = () => {
    if (testCards.length === 0) return 'selection';
    if (testComplete) return 'complete';
    return 'active';
  };

  const testState = getTestState();

  // Selection screen
  if (testState === 'selection') {
    return (
      <div className="slide-in">
        <TestSelection
          cards={cards}
          selectedUnits={selectedUnits}
          onToggleUnit={onToggleUnit}
          onStartTest={onStartTest}
          onStartUnitTest={onStartUnitTest}
        />
      </div>
    );
  }

  // Active test
  if (testState === 'active') {
    return (
      <ActiveTest
        testCards={testCards}
        currentIndex={currentTestIndex}
        testType={testType}
        multipleChoiceOptions={multipleChoiceOptions}
        onAnswer={onAnswerQuestion}
        unitName={testWholeUnit}
      />
    );
  }

  // Results
  if (testState === 'complete') {
    return (
      <TestResults
        testCards={testCards}
        testAnswers={testAnswers}
        testType={testType}
        onRetakeTest={() => onStartTest(testType)}
        onBackToStudy={() => onModeChange('study')}
        onBackToSelection={onResetTest}
        unitName={testWholeUnit}
      />
    );
  }

  return null;
}

// Default props
TestMode.defaultProps = {
  cards: [],
  testCards: [],
  currentTestIndex: 0,
  testAnswers: {},
  testComplete: false,
  testType: 'written',
  multipleChoiceOptions: [],
  selectedUnits: [],
  testWholeUnit: '',
  onToggleUnit: () => {},
  onStartTest: () => {},
  onStartUnitTest: () => {},
  onAnswerQuestion: () => {},
  onResetTest: () => {},
  onModeChange: () => {}
};