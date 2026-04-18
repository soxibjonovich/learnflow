import { useCallback, useState } from 'react';

/**
 * useTest Hook
 * Manages test logic for cards and paraphrases
 */
export function useTest(cards, paraphrases = []) {
  const [testCards, setTestCards] = useState([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState({});
  const [testComplete, setTestComplete] = useState(false);
  const [testType, setTestType] = useState('written');
  const [testCategory, setTestCategory] = useState('cards');
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [testWholeUnit, setTestWholeUnit] = useState('');
  const [testLimit, setTestLimit] = useState(10);

  const isAnswerCorrect = useCallback((answer, card) => {
    const cleanAnswer = (answer || '').toLowerCase().trim();

    if (card.type === 'paraphrase' && Array.isArray(card.variations)) {
      return card.variations.some((variation) => variation.toLowerCase().trim() === cleanAnswer);
    }

    return cleanAnswer === (card.back || '').toLowerCase().trim();
  }, []);

  const generateMultipleChoiceOptions = useCallback((currentCard, allTestCards) => {
    const correctAnswer = currentCard.back;
    const otherCards = allTestCards.filter((card) => card.id !== currentCard.id);

    const wrongCount = Math.min(3, otherCards.length);
    const wrongAnswers = otherCards
      .sort(() => Math.random() - 0.5)
      .slice(0, wrongCount)
      .map((card) => card.back);

    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setMultipleChoiceOptions(options);
  }, []);

  const startTest = useCallback((type, category = 'cards') => {
    let sourceData = [];

    if (category === 'cards') {
      if (cards.length === 0) {
        alert('No cards available for testing!');
        return;
      }

      sourceData = selectedUnits.length > 0
        ? cards.filter((card) => selectedUnits.includes(card.unit || 'General'))
        : cards;

      if (sourceData.length === 0) {
        alert('No cards found in selected units!');
        return;
      }
    }

    if (category === 'paraphrases') {
      if (paraphrases.length === 0) {
        alert('No paraphrases available for testing!');
        return;
      }

      sourceData = paraphrases.map((item) => ({
        id: item.id,
        front: item.original,
        back: item.variations[0] || '',
        variations: item.variations || [],
        type: 'paraphrase',
      }));
    }

    setTestType(type);
    setTestCategory(category);
    setTestWholeUnit('');

    const shuffled = [...sourceData].sort(() => Math.random() - 0.5);
    const limit = testLimit === 'all' ? shuffled.length : 10;
    const testSet = shuffled.slice(0, Math.min(limit, shuffled.length));

    setTestCards(testSet);
    setCurrentTestIndex(0);
    setTestAnswers({});
    setTestComplete(false);

    if (type === 'multiple-choice' && testSet.length > 0) {
      generateMultipleChoiceOptions(testSet[0], testSet);
    } else {
      setMultipleChoiceOptions([]);
    }
  }, [cards, paraphrases, selectedUnits, testLimit, generateMultipleChoiceOptions]);

  const startUnitTest = useCallback((unitName, type) => {
    const unitCards = cards.filter((card) => (card.unit || 'General') === unitName);

    if (unitCards.length === 0) {
      alert(`No cards found in unit: ${unitName}`);
      return;
    }

    setTestWholeUnit(unitName);
    setTestType(type);
    setTestCategory('cards');

    const shuffled = [...unitCards].sort(() => Math.random() - 0.5);
    const testSet = shuffled.slice(0, Math.min(20, shuffled.length));

    setTestCards(testSet);
    setCurrentTestIndex(0);
    setTestAnswers({});
    setTestComplete(false);

    if (type === 'multiple-choice' && testSet.length > 0) {
      generateMultipleChoiceOptions(testSet[0], testSet);
    } else {
      setMultipleChoiceOptions([]);
    }
  }, [cards, generateMultipleChoiceOptions]);

  const answerQuestion = useCallback((answer) => {
    if (currentTestIndex >= testCards.length) return;

    const currentCard = testCards[currentTestIndex];
    const isCorrect = isAnswerCorrect(answer, currentCard);

    const newAnswers = {
      ...testAnswers,
      [currentCard.id]: {
        given: answer,
        correct: currentCard.back,
        isCorrect,
      },
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
  }, [currentTestIndex, testCards, testAnswers, testType, isAnswerCorrect, generateMultipleChoiceOptions]);

  const startReviewTest = useCallback((type, reviewCards) => {
    if (!reviewCards || reviewCards.length === 0) {
      alert('No cards due for review!');
      return;
    }

    setTestType(type);
    setTestCategory('cards');
    setTestWholeUnit('review');

    const shuffled = [...reviewCards].sort(() => Math.random() - 0.5);
    const limit = testLimit === 'all' ? shuffled.length : 10;
    const testSet = shuffled.slice(0, Math.min(limit, shuffled.length));

    setTestCards(testSet);
    setCurrentTestIndex(0);
    setTestAnswers({});
    setTestComplete(false);

    if (type === 'multiple-choice' && testSet.length > 0) {
      generateMultipleChoiceOptions(testSet[0], testSet);
    } else {
      setMultipleChoiceOptions([]);
    }
  }, [testLimit, generateMultipleChoiceOptions]);

  const resetTest = useCallback(() => {
    setTestCards([]);
    setCurrentTestIndex(0);
    setTestAnswers({});
    setTestComplete(false);
    setMultipleChoiceOptions([]);
    setTestWholeUnit('');
  }, []);

  const toggleUnit = useCallback((unit) => {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((item) => item !== unit) : [...prev, unit],
    );
  }, []);

  const calculateScore = useCallback(() => {
    const correctCount = Object.values(testAnswers).filter((answer) => answer.isCorrect).length;
    const total = testCards.length;

    return {
      correct: correctCount,
      total,
      percentage: total > 0 ? Math.round((correctCount / total) * 100) : 0,
    };
  }, [testAnswers, testCards]);

  return {
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
    startTest,
    startUnitTest,
    startReviewTest,
    answerQuestion,
    resetTest,
    toggleUnit,
    calculateScore,
    setTestLimit,
  };
}
