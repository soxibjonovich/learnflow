import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Plus, Trash2, Edit2, Check, X, Brain, TrendingUp, Calendar, Upload, Download, FileText, ClipboardCheck, Award } from 'lucide-react';
import {
  fetchSharedCards,
  addSharedCard,
  updateSharedCard,
  deleteSharedCard,
  addSharedCardsBulk,
  fetchParaphrases as fetchParaphrasesFromDb,
  addParaphrase as addParaphraseToDb,
  deleteParaphrase as deleteParaphraseFromDb,
  updateParaphrase as updateParaphraseInDb,
} from './lib/supabase';

export default function FlashcardApp() {
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [mode, setMode] = useState('study');
  const [newCard, setNewCard] = useState({ front: '', back: '', example: '', translation: '', box: 1, unit: '' });
  const [editingId, setEditingId] = useState(null);
  const [stats, setStats] = useState({ total: 0, mastered: 0, learning: 0, new: 0 });
  const [studyQueue, setStudyQueue] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState('csv');
  const [paraphrases, setParaphrases] = useState([]);
  const [newParaphrase, setNewParaphrase] = useState({ original: '', variations: ['', '', ''] });
  const [editingParaphraseId, setEditingParaphraseId] = useState(null);
  const [editingParaphraseDraft, setEditingParaphraseDraft] = useState({ original: '', variations: [] });
  
  // Test mode state
  const [testCards, setTestCards] = useState([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState({});
  const [testComplete, setTestComplete] = useState(false);
  const [testType, setTestType] = useState('written');
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);
  const [dbError, setDbError] = useState(null);
  
  // NEW: Unit-specific testing
  const [testWholeUnit, setTestWholeUnit] = useState('');
  
  // NEW: Paraphrase testing
  const [paraphraseTestMode, setParaphraseTestMode] = useState(false);
  const [testParaphrases, setTestParaphrases] = useState([]);
  const [currentParaphraseTestIndex, setCurrentParaphraseTestIndex] = useState(0);
  const [paraphraseTestAnswers, setParaphraseTestAnswers] = useState({});
  const [paraphraseTestComplete, setParaphraseTestComplete] = useState(false);
  const [paraphraseTestType, setParaphraseTestType] = useState('recall-variations');

  // Load cards from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('flashcards');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCards(parsed);
        updateStats(parsed);
        buildStudyQueue(parsed);
      } catch (error) {
        console.error('Error loading cards:', error);
      }
    }

    const storedParaphrases = localStorage.getItem('paraphrases');
    if (storedParaphrases) {
      try {
        const parsed = JSON.parse(storedParaphrases);
        setParaphrases(parsed);
      } catch (error) {
        console.error('Error loading paraphrases:', error);
      }
    }
  }, []);

  // Load from database
  useEffect(() => {
    const loadFromDatabase = async () => {
      const stored = localStorage.getItem('flashcards');
      const storedParaphrases = localStorage.getItem('paraphrases');

      try {
        setIsLoadingFromDb(true);
        setDbError(null);

        const sharedCards = await fetchSharedCards();
        if (sharedCards && sharedCards.length > 0) {
          const now = Date.now();
          const dbCards = sharedCards.map((card, index) => ({
            id: card.id ?? now + index,
            front: card.front || '',
            back: card.back || '',
            example: card.example || '',
            translation: card.translation || '',
            unit: card.unit || 'General',
            box: 1,
            reviews: 0,
            lastReview: null,
            nextReview: null,
            created: now + index,
          }));

          let mergedCards = dbCards;
          if (stored) {
            try {
              const localCards = JSON.parse(stored) || [];
              const dbIds = new Set(dbCards.map((c) => c.id));
              const localOnlyCards = localCards.filter((c) => !dbIds.has(c.id));
              mergedCards = [...dbCards, ...localOnlyCards];
            } catch (error) {
              console.error('Error merging local cards:', error);
            }
          }

          setCards(mergedCards);
          buildStudyQueue(mergedCards);
        }

        const dbParaphrases = await fetchParaphrasesFromDb();
        if (dbParaphrases && dbParaphrases.length > 0) {
          const mappedDbParaphrases = dbParaphrases.map((p) => ({
            id: p.id,
            original: p.original || '',
            variations: Array.isArray(p.variations) ? p.variations : [],
            created: p.created_at ? new Date(p.created_at).getTime() : Date.now(),
          }));

          let mergedParaphrases = mappedDbParaphrases;
          if (storedParaphrases) {
            try {
              const localParaphrases = JSON.parse(storedParaphrases) || [];
              const dbParaphraseIds = new Set(mappedDbParaphrases.map((p) => p.id));
              const localOnlyParaphrases = localParaphrases.filter((p) => !dbParaphraseIds.has(p.id));
              mergedParaphrases = [...mappedDbParaphrases, ...localOnlyParaphrases];
            } catch (error) {
              console.error('Error merging local paraphrases:', error);
            }
          }

          setParaphrases(mergedParaphrases);
        }
      } catch (error) {
        console.error('Error loading from database:', error);
        setDbError('Could not load data from database.');
      } finally {
        setIsLoadingFromDb(false);
      }
    };

    loadFromDatabase();
  }, []);

  useEffect(() => {
    if (cards.length >= 0) {
      localStorage.setItem('flashcards', JSON.stringify(cards));
      updateStats(cards);
    }
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('paraphrases', JSON.stringify(paraphrases));
  }, [paraphrases]);

  const updateStats = (cardList) => {
    const total = cardList.length;
    const mastered = cardList.filter(c => c.box >= 5).length;
    const learning = cardList.filter(c => c.box > 1 && c.box < 5).length;
    const newCards = cardList.filter(c => c.box === 1).length;
    setStats({ total, mastered, learning, new: newCards });
  };

  const buildStudyQueue = (cardList) => {
    const now = Date.now();
    const due = cardList
      .map((card, index) => ({ ...card, originalIndex: index }))
      .filter(card => !card.nextReview || card.nextReview <= now)
      .sort((a, b) => a.box - b.box);
    
    const shuffled = [...due];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setStudyQueue(shuffled);
    if (shuffled.length > 0) setCurrentCardIndex(0);
  };

  const addCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;

    const baseCard = {
      front: newCard.front.trim(),
      back: newCard.back.trim(),
      example: newCard.example.trim(),
      translation: newCard.translation.trim(),
      unit: newCard.unit.trim() || 'General',
    };

    let cardToStore;
    try {
      setDbError(null);
      const saved = await addSharedCard(baseCard);
      const now = Date.now();
      cardToStore = {
        id: saved.id,
        front: saved.front || baseCard.front,
        back: saved.back || baseCard.back,
        example: saved.example ?? baseCard.example,
        translation: saved.translation ?? baseCard.translation,
        unit: saved.unit ?? baseCard.unit,
        box: 1,
        reviews: 0,
        lastReview: null,
        nextReview: null,
        created: now,
      };
    } catch (error) {
      console.error('Error saving card:', error);
      setDbError('Could not save card to database. Saved locally instead.');
      const now = Date.now();
      cardToStore = {
        id: now,
        ...baseCard,
        box: 1,
        reviews: 0,
        lastReview: null,
        nextReview: null,
        created: now,
      };
    }

    const updated = [...cards, cardToStore];
    setCards(updated);
    buildStudyQueue(updated);
    setNewCard({ front: '', back: '', example: '', translation: '', box: 1, unit: '' });
  };

  const deleteCard = async (id) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    buildStudyQueue(updated);

    try {
      setDbError(null);
      await deleteSharedCard(id);
    } catch (error) {
      console.error('Error deleting card:', error);
      setDbError('Could not delete card from database.');
    }
  };

  const updateCard = async (id, front, back, example, translation, unit) => {
    const updated = cards.map(c => 
      c.id === id
        ? {
            ...c,
            front: front.trim(),
            back: back.trim(),
            example: example.trim(),
            translation: translation.trim(),
            unit: (unit || '').trim() || 'General',
          }
        : c
    );
    setCards(updated);
    setEditingId(null);

    try {
      setDbError(null);
      await updateSharedCard(id, {
        front: front.trim(),
        back: back.trim(),
        example: example.trim(),
        translation: translation.trim(),
        unit: (unit || '').trim() || 'General',
      });
    } catch (error) {
      console.error('Error updating card:', error);
      setDbError('Could not update card in database.');
    }
  };

  const getNextReviewTime = (box) => {
    const intervals = {
      1: 0,
      2: 1 * 24 * 60 * 60 * 1000,
      3: 3 * 24 * 60 * 60 * 1000,
      4: 7 * 24 * 60 * 60 * 1000,
      5: 14 * 24 * 60 * 60 * 1000
    };
    return Date.now() + (intervals[box] || 0);
  };

  const rateCard = (correct) => {
    if (studyQueue.length === 0) return;

    const currentCard = studyQueue[currentCardIndex];
    const cardIndex = cards.findIndex(c => c.id === currentCard.id);
    
    const updatedCards = [...cards];
    const card = { ...updatedCards[cardIndex] };
    
    if (correct) {
      card.box = Math.min(card.box + 1, 5);
    } else {
      card.box = 1;
    }
    
    card.reviews += 1;
    card.lastReview = Date.now();
    card.nextReview = getNextReviewTime(card.box);
    updatedCards[cardIndex] = card;

    const newQueue = studyQueue.filter((_, i) => i !== currentCardIndex);
    const nextIndex = newQueue.length > 0 ? Math.min(currentCardIndex, newQueue.length - 1) : 0;

    setIsFlipped(false);
    setShowHint(false);

    setTimeout(() => {
      setCards(updatedCards);
      setStudyQueue(newQueue);
      setCurrentCardIndex(nextIndex);
      setShowHint(true);
    }, 150);
  };

  const reshuffleQueue = () => {
    const shuffled = [...studyQueue];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setStudyQueue(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const resetProgress = () => {
    const reset = cards.map(c => ({
      ...c,
      box: 1,
      reviews: 0,
      lastReview: null,
      nextReview: null
    }));
    setCards(reset);
    buildStudyQueue(reset);
  };

  const exportCards = (format) => {
    if (cards.length === 0) {
      alert('No cards to export!');
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'json') {
      content = JSON.stringify(cards, null, 2);
      filename = 'learnflow-cards.json';
      mimeType = 'application/json';
    } else if (format === 'csv') {
      content = 'Front,Back,Translation,Example\n';
      cards.forEach(card => {
        const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;
        content += `${escapeCsv(card.front)},${escapeCsv(card.back)},${escapeCsv(card.translation || '')},${escapeCsv(card.example || '')}\n`;
      });
      filename = 'learnflow-cards.csv';
      mimeType = 'text/csv';
    } else if (format === 'tsv') {
      content = 'Front\tBack\tTranslation\tExample\n';
      cards.forEach(card => {
        content += `${card.front}\t${card.back}\t${card.translation || ''}\t${card.example || ''}\n`;
      });
      filename = 'learnflow-cards.tsv';
      mimeType = 'text/tab-separated-values';
    } else if (format === 'quizlet') {
      cards.forEach(card => {
        content += `${card.front}\t${card.back}\n`;
      });
      filename = 'learnflow-cards-quizlet.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importCards = async () => {
    if (!importText.trim()) {
      alert('Please paste your data first!');
      return;
    }

    const parsedCards = [];

    try {
      if (importFormat === 'json') {
        const parsed = JSON.parse(importText);
        parsed.forEach((card) => {
          parsedCards.push({
            front: card.front || '',
            back: card.back || '',
            translation: card.translation || '',
            example: card.example || '',
            unit: 'General',
          });
        });
      } else if (importFormat === 'csv') {
        const lines = importText.trim().split('\n');
        const hasHeader = lines[0].toLowerCase().includes('front') || lines[0].toLowerCase().includes('term');
        const dataLines = hasHeader ? lines.slice(1) : lines;

        dataLines.forEach((line) => {
          if (!line.trim()) return;
          
          const fields = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              fields.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          fields.push(current.trim());

          if (fields.length >= 2) {
            parsedCards.push({
              front: fields[0] || '',
              back: fields[1] || '',
              translation: fields[2] || '',
              example: fields[3] || '',
              unit: 'General',
            });
          }
        });
      } else if (importFormat === 'tsv' || importFormat === 'quizlet') {
        const lines = importText.trim().split('\n');
        const hasHeader = importFormat === 'tsv' && lines[0].toLowerCase().includes('front');
        const dataLines = hasHeader ? lines.slice(1) : lines;

        dataLines.forEach((line) => {
          if (!line.trim()) return;
          const fields = line.split('\t');
          if (fields.length >= 2) {
            parsedCards.push({
              front: fields[0]?.trim() || '',
              back: fields[1]?.trim() || '',
              translation: fields[2]?.trim() || '',
              example: fields[3]?.trim() || '',
              unit: 'General',
            });
          }
        });
      }

      if (parsedCards.length === 0) {
        alert('No valid cards found!');
        return;
      }

      try {
        setDbError(null);
        const saved = await addSharedCardsBulk(parsedCards);
        const now = Date.now();
        const dbBackedCards = saved.map((card, index) => ({
          id: card.id,
          front: card.front || parsedCards[index].front,
          back: card.back || parsedCards[index].back,
          translation: card.translation ?? parsedCards[index].translation,
          example: card.example ?? parsedCards[index].example,
          unit: card.unit ?? parsedCards[index].unit,
          box: 1,
          reviews: 0,
          lastReview: null,
          nextReview: null,
          created: now + index,
        }));

        const updated = [...cards, ...dbBackedCards];
        setCards(updated);
        buildStudyQueue(updated);
        setImportText('');
        setShowImport(false);
        alert(`Successfully imported ${dbBackedCards.length} cards!`);
      } catch (error) {
        console.error('Error importing:', error);
        setDbError('Could not import to database. Imported locally instead.');

        const now = Date.now();
        const localOnlyCards = parsedCards.map((card, index) => ({
          id: now + index,
          ...card,
          box: 1,
          reviews: 0,
          lastReview: null,
          nextReview: null,
          created: now + index,
        }));

        const updated = [...cards, ...localOnlyCards];
        setCards(updated);
        buildStudyQueue(updated);
        setImportText('');
        setShowImport(false);
        alert(`Successfully imported ${localOnlyCards.length} cards locally.`);
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };

  const addParaphrase = async () => {
    if (!newParaphrase.original.trim()) return;
    
    const validVariations = newParaphrase.variations.filter(v => v.trim());
    if (validVariations.length === 0) return;

    const baseParaphrase = {
      original: newParaphrase.original.trim(),
      variations: validVariations.map(v => v.trim()),
    };

    let paraphraseToStore;
    try {
      setDbError(null);
      const saved = await addParaphraseToDb(baseParaphrase);
      paraphraseToStore = {
        id: saved.id,
        original: saved.original || baseParaphrase.original,
        variations: Array.isArray(saved.variations) ? saved.variations : baseParaphrase.variations,
        created: saved.created_at ? new Date(saved.created_at).getTime() : Date.now(),
      };
    } catch (error) {
      console.error('Error saving paraphrase:', error);
      setDbError('Could not save paraphrase. Saved locally instead.');
      paraphraseToStore = {
        id: Date.now(),
        original: baseParaphrase.original,
        variations: baseParaphrase.variations,
        created: Date.now(),
      };
    }

    setParaphrases([...paraphrases, paraphraseToStore]);
    setNewParaphrase({ original: '', variations: ['', '', ''] });
  };

  const deleteParaphrase = async (id) => {
    setParaphrases(paraphrases.filter(p => p.id !== id));

    try {
      setDbError(null);
      await deleteParaphraseFromDb(id);
    } catch (error) {
      console.error('Error deleting paraphrase:', error);
      setDbError('Could not delete paraphrase from database.');
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

  const updateExistingParaphraseOriginal = (value) => {
    setEditingParaphraseDraft((prev) => ({ ...prev, original: value }));
  };

  const updateExistingParaphraseVariation = (index, value) => {
    setEditingParaphraseDraft((prev) => {
      const next = [...prev.variations];
      next[index] = value;
      return { ...prev, variations: next };
    });
  };

  const addVariationToExistingParaphrase = () => {
    setEditingParaphraseDraft((prev) => ({ ...prev, variations: [...prev.variations, ''] }));
  };

  const saveEditingParaphrase = async () => {
    if (!editingParaphraseId) return;

    const trimmedOriginal = editingParaphraseDraft.original.trim();
    const cleanedVariations = editingParaphraseDraft.variations.map((v) => v.trim()).filter((v) => v);

    if (!trimmedOriginal || cleanedVariations.length === 0) return;

    const updatedList = paraphrases.map((p) =>
      p.id === editingParaphraseId
        ? { ...p, original: trimmedOriginal, variations: cleanedVariations }
        : p
    );

    setParaphrases(updatedList);

    try {
      setDbError(null);
      await updateParaphraseInDb(editingParaphraseId, {
        original: trimmedOriginal,
        variations: cleanedVariations,
      });
    } catch (error) {
      console.error('Error updating paraphrase:', error);
      setDbError('Could not update paraphrase in database.');
    }

    cancelEditingParaphrase();
  };

  const updateParaphraseVariation = (index, value) => {
    const newVariations = [...newParaphrase.variations];
    newVariations[index] = value;
    setNewParaphrase({ ...newParaphrase, variations: newVariations });
  };

  const addMoreVariation = () => {
    setNewParaphrase({ ...newParaphrase, variations: [...newParaphrase.variations, ''] });
  };

  const startTest = (type) => {
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
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    const testSet = shuffled.slice(0, Math.min(10, shuffled.length));
    
    setTestCards(testSet);
    setCurrentTestIndex(0);
    setTestAnswers({});
    setTestComplete(false);
    
    if (type === 'multiple-choice') {
      generateMultipleChoiceOptions(testSet[0], testSet);
    }
  };

  // NEW: Test entire unit
  const startUnitTest = (unitName, type) => {
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
    setMode('test');
    
    if (type === 'multiple-choice' && testSet.length >= 4) {
      generateMultipleChoiceOptions(testSet[0], testSet);
    }
  };

  // NEW: Paraphrase testing
  const startParaphraseTest = (type) => {
    if (paraphrases.length === 0) {
      alert('No paraphrases available for testing!');
      return;
    }
    
    setParaphraseTestMode(true);
    setParaphraseTestType(type);
    
    const shuffled = [...paraphrases].sort(() => Math.random() - 0.5);
    const testSet = shuffled.slice(0, Math.min(10, shuffled.length));
    
    setTestParaphrases(testSet);
    setCurrentParaphraseTestIndex(0);
    setParaphraseTestAnswers({});
    setParaphraseTestComplete(false);
  };

  const answerParaphraseQuestion = (answer) => {
    const currentParaphrase = testParaphrases[currentParaphraseTestIndex];
    
    let isCorrect = false;
    
    if (paraphraseTestType === 'recall-variations') {
      isCorrect = currentParaphrase.variations.some(
        v => v.toLowerCase().trim() === answer.toLowerCase().trim()
      );
    } else {
      isCorrect = currentParaphrase.original.toLowerCase().trim() === answer.toLowerCase().trim();
    }
    
    const newAnswers = {
      ...paraphraseTestAnswers,
      [currentParaphrase.id]: {
        given: answer,
        correct: paraphraseTestType === 'recall-variations' 
          ? currentParaphrase.variations.join(', ')
          : currentParaphrase.original,
        isCorrect: isCorrect
      }
    };
    
    setParaphraseTestAnswers(newAnswers);
    
    if (currentParaphraseTestIndex < testParaphrases.length - 1) {
      setCurrentParaphraseTestIndex(currentParaphraseTestIndex + 1);
    } else {
      setParaphraseTestComplete(true);
    }
  };

  const calculateParaphraseScore = () => {
    const correctCount = Object.values(paraphraseTestAnswers).filter(a => a.isCorrect).length;
    const total = testParaphrases.length;
    return { 
      correct: correctCount, 
      total, 
      percentage: total > 0 ? Math.round((correctCount / total) * 100) : 0 
    };
  };

  const resetParaphraseTest = () => {
    setParaphraseTestMode(false);
    setTestParaphrases([]);
    setCurrentParaphraseTestIndex(0);
    setParaphraseTestAnswers({});
    setParaphraseTestComplete(false);
  };

  const generateMultipleChoiceOptions = (currentCard, allTestCards) => {
    const correctAnswer = currentCard.back;
    const otherCards = allTestCards.filter(c => c.id !== currentCard.id);
    
    const wrongAnswers = otherCards
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.back);
    
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setMultipleChoiceOptions(options);
  };

  const answerTestQuestion = (answer) => {
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
  };

  const calculateTestScore = () => {
    const correctCount = Object.values(testAnswers).filter(a => a.isCorrect).length;
    const total = testCards.length;
    return { correct: correctCount, total, percentage: Math.round((correctCount / total) * 100) };
  };

  const resetTest = () => {
    setTestCards([]);
    setCurrentTestIndex(0);
    setTestAnswers({});
    setTestComplete(false);
    setMultipleChoiceOptions([]);
    setTestWholeUnit('');
  };

  const getUniqueUnits = () => {
    const units = [...new Set(cards.map(card => card.unit || 'General'))];
    return units.sort();
  };

  const toggleUnit = (unit) => {
    if (selectedUnits.includes(unit)) {
      setSelectedUnits(selectedUnits.filter(u => u !== unit));
    } else {
      setSelectedUnits([...selectedUnits, unit]);
    }
  };

  const currentStudyCard = studyQueue[currentCardIndex];
  const progress = stats.total > 0 ? ((stats.mastered / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        body { font-family: 'Lexend', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
        .card-flip { perspective: 1000px; }
        .card-inner { will-change: transform; transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
        .card-flipped { transform: rotateY(180deg); }
        .card-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .card-back { transform: rotateY(180deg); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-in { animation: slideIn 0.4s ease-out; }
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12); }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 slide-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Brain className="w-10 h-10 text-indigo-600" strokeWidth={2.5} />
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">LearnFlow</h1>
          </div>
          <p className="text-slate-600 text-sm mono">Spaced repetition • Leitner system • Efficient learning</p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-200/50 shadow-lg slide-in">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mono">Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.mastered}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mono">Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.learning}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mono">Learning</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{stats.new}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mono">New</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 mono">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {(isLoadingFromDb || dbError) && (
              <div className="mt-2 text-xs mono">
                {isLoadingFromDb && <div className="text-slate-500">Loading cards from database...</div>}
                {dbError && <div className="text-red-600">{dbError}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mb-6 slide-in flex-wrap">
          <Button onClick={() => setMode('study')} variant={mode === 'study' ? 'default' : 'outline'} className="flex-1 font-medium min-w-[120px]">
            <Brain className="w-4 h-4 mr-2" />Study
          </Button>
          <Button onClick={() => setMode('create')} variant={mode === 'create' ? 'default' : 'outline'} className="flex-1 font-medium min-w-[120px]">
            <Plus className="w-4 h-4 mr-2" />Create
          </Button>
          <Button onClick={() => { setMode('test'); resetTest(); }} variant={mode === 'test' ? 'default' : 'outline'} className="flex-1 font-medium min-w-[120px]">
            <ClipboardCheck className="w-4 h-4 mr-2" />Test
          </Button>
          <Button onClick={() => setMode('paraphrases')} variant={mode === 'paraphrases' ? 'default' : 'outline'} className="flex-1 font-medium min-w-[120px]">
            <FileText className="w-4 h-4 mr-2" />Paraphrases
          </Button>
          <Button onClick={() => setMode('manage')} variant={mode === 'manage' ? 'default' : 'outline'} className="flex-1 font-medium min-w-[120px]">
            <TrendingUp className="w-4 h-4 mr-2" />Manage
          </Button>
        </div>
