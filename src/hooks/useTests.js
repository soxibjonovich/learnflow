import { useState, useCallback } from 'react';

/**
 * useTest Hook
 * Manages test logic and state
 */
export function useTest(cards) {
  const [testCards, setTestCards] = useState([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState({});
  const [testComplete, setTestComplete] = useState(false);
  const [testType, setTestType] = useState('written');
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [testWholeUnit, setTestWholeUnit] = useState('');

  const generateMultipleChoiceOptions = useCallback((currentCard, allTestCards) => {
    const correctAnswer = currentCard.back;
    const otherCards = allTestCards.filter(c => c.id !== currentCard.id);
    
    const wrongAnswers = otherCards
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.back);
    
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setMultipleChoiceOptions(options);
  }, []);

  const startTest = useCallback((type) => {
    if (cards.length === 0) {
      alert('No cards available for testing!');
      return;
    }

    let filteredCards = cards;
    if (selectedUnits.length > 0) {
      filteredCards = cards.filter(card => selectedUnits.includes(card.unit || 'General'));
    }

    if (filteredCards.length === 0) {
      alert('No cards found in selected units!');
      return;
    }

    setTestType(type);
    setTestWholeUnit('');
    
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    const testSet = shuffled.slice(0, Math.min(10, shuffled.length));
    
    setTestCards(testSet);
    setCurrentTestIndex(0);
    setTestAnswers({});
    setTestComplete(false);
    
    if (type === 'multiple-choice' && testSet.length >= 4) {
      generateMultipleChoiceOptions(testSet[0], testSet);
    }
  }, [cards, selectedUnits, generateMultipleChoiceOptions]);

  const startUnitTest = useCallback((unitName, type) => {
    const unitCards = cards.filter(card => (card.unit || 'General') === unitName);
    
    if (unitCards.length === 0) {
      alert(`No cards found in unit: ${unitName}`);
      return;
    }
    
    setTestWholeUnit(unitName);
    setTestType(type);
    
    const shuffled = [...unitCards].sort(() => Math.random() - 0.5);
    const testSet = shuffled.slice(0, Math.min(20, shuffled.length));
    
    setTestCards(testSet);
    setCurrentTestIndex(0);
    setTestAnswers({});
    setTestComplete(false);
    
    if (type === 'multiple-choice' && testSet.length >= 4) {
      generateMultipleChoiceOptions(testSet[0], testSet);
    }
  }, [cards, generateMultipleChoiceOptions]);

  const answerQuestion = useCallback((answer) => {
    const currentCard = testCards[currentTestIndex];
    
    const newAnswers = {
      ...testAnswers,
      [currentCard.id]: {
        given: answer,
        correct: currentCard.back,
        isCorrect: answer.toLowerCase().trim() === currentCard.back.toLowerCase().trim()
      }
    };
    
    setTestAnswers(newAnswers);

    if (currentTestIndex < testCards.length - 1) {
      const nextIndex = currentTestIndex + 1;
      setCurrentTestIndex(nextIndex);
      
      if (testType === 'multiple-choice') {
        generateMultipleChoiceOptions(testCards[nextIndex], testCards);
      }
    } else {
      setTestComplete(true);
    }
  }, [testCards, currentTestIndex, testAnswers, testType, generateMultipleChoiceOptions]);

  const resetTest = useCallback(() => {
    setTestCards([]);
    setCurrentTestIndex(0);
    setTestAnswers({});
    setTestComplete(false);
    setMultipleChoiceOptions([]);
    setTestWholeUnit('');
  }, []);

  const toggleUnit = useCallback((unit) => {
    setSelectedUnits(prev => 
      prev.includes(unit) 
        ? prev.filter(u => u !== unit)
        : [...prev, unit]
    );
  }, []);

  const calculateScore = useCallback(() => {
    const correctCount = Object.values(testAnswers).filter(a => a.isCorrect).length;
    const total = testCards.length;
    return { 
      correct: correctCount, 
      total, 
      percentage: total > 0 ? Math.round((correctCount / total) * 100) : 0 
    };
  }, [testAnswers, testCards]);

  return {
    testCards,
    currentTestIndex,
    testAnswers,
    testComplete,
    testType,
    multipleChoiceOptions,
    selectedUnits,
    testWholeUnit,
    startTest,
    startUnitTest,
    answerQuestion,
    resetTest,
    toggleUnit,
    calculateScore
  };
}