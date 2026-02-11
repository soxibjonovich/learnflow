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
  const [mode, setMode] = useState('study'); // 'study', 'create', 'manage', 'paraphrases', 'test'
  const [newCard, setNewCard] = useState({ front: '', back: '', example: '', translation: '', box: 1, unit: '' });
  const [editingId, setEditingId] = useState(null);
  const [stats, setStats] = useState({ total: 0, mastered: 0, learning: 0, new: 0 });
  const [studyQueue, setStudyQueue] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState('csv'); // 'csv', 'tsv', 'json', 'quizlet'
  const [paraphrases, setParaphrases] = useState([]);
  const [newParaphrase, setNewParaphrase] = useState({ original: '', variations: ['', '', ''] });
  const [editingParaphraseId, setEditingParaphraseId] = useState(null);
  const [editingParaphraseDraft, setEditingParaphraseDraft] = useState({ original: '', variations: [] });
  
  // Test mode state
  const [testCards, setTestCards] = useState([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState({});
  const [testComplete, setTestComplete] = useState(false);
  const [testType, setTestType] = useState('written'); // 'written', 'multiple-choice'
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);
  const [dbError, setDbError] = useState(null);

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

  // Always try to load/merge latest data from the database
  useEffect(() => {
    const loadFromDatabase = async () => {
      const stored = localStorage.getItem('flashcards');
      const storedParaphrases = localStorage.getItem('paraphrases');

      try {
        setIsLoadingFromDb(true);
        setDbError(null);

        // Always load cards from DB and merge with any locally stored cards
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
              console.error('Error merging local cards with database cards:', error);
            }
          }

          setCards(mergedCards);
          buildStudyQueue(mergedCards);
        }

        // Always load paraphrases from DB and merge with any locally stored paraphrases
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
              const localOnlyParaphrases = localParaphrases.filter(
                (p) => !dbParaphraseIds.has(p.id)
              );
              mergedParaphrases = [...mappedDbParaphrases, ...localOnlyParaphrases];
            } catch (error) {
              console.error('Error merging local paraphrases with database paraphrases:', error);
            }
          }

          setParaphrases(mergedParaphrases);
        }
      } catch (error) {
        console.error('Error loading data from database:', error);
        setDbError('Could not load data from database.');
      } finally {
        setIsLoadingFromDb(false);
      }
    };

    loadFromDatabase();
  }, []);

  // Save cards to localStorage whenever cards change
  useEffect(() => {
    if (cards.length >= 0) {
      localStorage.setItem('flashcards', JSON.stringify(cards));
      updateStats(cards);
    }
  }, [cards]);

  // Save paraphrases to localStorage
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
    
    // Extreme randomization - shuffle using Fisher-Yates
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
      console.error('Error saving card to database, falling back to local only:', error);
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
      console.error('Error deleting card from database:', error);
      setDbError('Could not delete card from database.');
    }
  };

  const updateCard = async (id, front, back, example, translation) => {
    const updated = cards.map(c => 
      c.id === id ? { ...c, front: front.trim(), back: back.trim(), example: example.trim(), translation: translation.trim() } : c
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
      });
    } catch (error) {
      console.error('Error updating card in database:', error);
      setDbError('Could not update card in database.');
    }
  };

  // Leitner System: boxes 1-5, intervals increase with each box
  const getNextReviewTime = (box) => {
    const intervals = {
      1: 0,           // Review immediately
      2: 1 * 24 * 60 * 60 * 1000,    // 1 day
      3: 3 * 24 * 60 * 60 * 1000,    // 3 days
      4: 7 * 24 * 60 * 60 * 1000,    // 1 week
      5: 14 * 24 * 60 * 60 * 1000    // 2 weeks (mastered)
    };
    return Date.now() + (intervals[box] || 0);
  };

  const rateCard = (correct) => {
    if (studyQueue.length === 0) return;

    // Immediately flip back to the question side so the next card
    // never briefly shows its answer before the flip animation.
    setIsFlipped(false);

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
    setCards(updatedCards);
    
    // Remove from queue and move to next
    const newQueue = studyQueue.filter((_, i) => i !== currentCardIndex);
    setStudyQueue(newQueue);
    
    if (newQueue.length > 0) {
      setCurrentCardIndex(Math.min(currentCardIndex, newQueue.length - 1));
    } else {
      setCurrentCardIndex(0);
    }
    
    setIsFlipped(false);
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
      // CSV format: front,back,translation,example
      content = 'Front,Back,Translation,Example\n';
      cards.forEach(card => {
        const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;
        content += `${escapeCsv(card.front)},${escapeCsv(card.back)},${escapeCsv(card.translation || '')},${escapeCsv(card.example || '')}\n`;
      });
      filename = 'learnflow-cards.csv';
      mimeType = 'text/csv';
    } else if (format === 'tsv') {
      // TSV format: front\tback\ttranslation\texample
      content = 'Front\tBack\tTranslation\tExample\n';
      cards.forEach(card => {
        content += `${card.front}\t${card.back}\t${card.translation || ''}\t${card.example || ''}\n`;
      });
      filename = 'learnflow-cards.tsv';
      mimeType = 'text/tab-separated-values';
    } else if (format === 'quizlet') {
      // Quizlet format: front\tback (one per line)
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

        dataLines.forEach((line, index) => {
          if (!line.trim()) return;
          
          // Parse CSV properly handling quoted fields
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

        dataLines.forEach((line, index) => {
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
        alert('No valid cards found in the input!');
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
        alert(`Successfully imported ${dbBackedCards.length} cards (saved to database)!`);
      } catch (error) {
        console.error('Error importing cards to database, falling back to local only:', error);
        setDbError('Could not import cards to database. Imported locally instead.');

        const now = Date.now();
        const localOnlyCards = parsedCards.map((card, index) => ({
          id: now + index,
          front: card.front,
          back: card.back,
          translation: card.translation,
          example: card.example,
          unit: card.unit,
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
        alert(`Successfully imported ${localOnlyCards.length} cards locally (database unavailable).`);
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
      console.error('Error saving paraphrase to database, falling back to local only:', error);
      setDbError('Could not save paraphrase to database. Saved locally instead.');
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
      console.error('Error deleting paraphrase from database:', error);
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
    setEditingParaphraseDraft((prev) => ({
      ...prev,
      original: value,
    }));
  };

  const updateExistingParaphraseVariation = (index, value) => {
    setEditingParaphraseDraft((prev) => {
      const next = [...prev.variations];
      next[index] = value;
      return {
        ...prev,
        variations: next,
      };
    });
  };

  const addVariationToExistingParaphrase = () => {
    setEditingParaphraseDraft((prev) => ({
      ...prev,
      variations: [...prev.variations, ''],
    }));
  };

  const saveEditingParaphrase = async () => {
    if (!editingParaphraseId) return;

    const trimmedOriginal = editingParaphraseDraft.original.trim();
    const cleanedVariations = editingParaphraseDraft.variations
      .map((v) => v.trim())
      .filter((v) => v);

    if (!trimmedOriginal || cleanedVariations.length === 0) return;

    const updatedList = paraphrases.map((p) =>
      p.id === editingParaphraseId
        ? {
            ...p,
            original: trimmedOriginal,
            variations: cleanedVariations,
          }
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
      console.error('Error updating paraphrase in database:', error);
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
    setNewParaphrase({
      ...newParaphrase,
      variations: [...newParaphrase.variations, '']
    });
  };

  // Test mode functions
  const startTest = (type) => {
    if (cards.length === 0) {
      alert('No cards available for testing!');
      return;
    }

    // Filter cards by selected units
    let filteredCards = cards;
    if (selectedUnits.length > 0) {
      filteredCards = cards.filter(card => selectedUnits.includes(card.unit || 'General'));
    }

    if (filteredCards.length === 0) {
      alert('No cards found in selected units!');
      return;
    }

    setTestType(type);
    
    // Shuffle cards for test
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    const testSet = shuffled.slice(0, Math.min(10, shuffled.length)); // Max 10 questions
    
    setTestCards(testSet);
    setCurrentTestIndex(0);
    setTestAnswers({});
    setTestComplete(false);
    
    if (type === 'multiple-choice') {
      generateMultipleChoiceOptions(testSet[0], testSet);
    }
  };

  const generateMultipleChoiceOptions = (currentCard, allTestCards) => {
    const correctAnswer = currentCard.back;
    const otherCards = allTestCards.filter(c => c.id !== currentCard.id);
    
    // Get 3 wrong answers
    const wrongAnswers = otherCards
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.back);
    
    // Combine and shuffle
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
        
        body {
          font-family: 'Lexend', sans-serif;
        }
        
        .mono {
          font-family: 'Space Mono', monospace;
        }
        
        .card-flip {
          perspective: 1000px;
        }
        
        .card-inner {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        
        .card-flipped {
          transform: rotateY(180deg);
        }
        
        .card-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .card-back {
          transform: rotateY(180deg);
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .slide-in {
          animation: slideIn 0.4s ease-out;
        }
        
        .hover-lift {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }
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
                {isLoadingFromDb && (
                  <div className="text-slate-500">Loading cards from database...</div>
                )}
                {dbError && (
                  <div className="text-red-600">{dbError}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mb-6 slide-in flex-wrap">
          <Button
            onClick={() => setMode('study')}
            variant={mode === 'study' ? 'default' : 'outline'}
            className="flex-1 font-medium min-w-[120px]"
          >
            <Brain className="w-4 h-4 mr-2" />
            Study
          </Button>
          <Button
            onClick={() => setMode('create')}
            variant={mode === 'create' ? 'default' : 'outline'}
            className="flex-1 font-medium min-w-[120px]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
          <Button
            onClick={() => {
              setMode('test');
              resetTest();
            }}
            variant={mode === 'test' ? 'default' : 'outline'}
            className="flex-1 font-medium min-w-[120px]"
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Button
            onClick={() => setMode('paraphrases')}
            variant={mode === 'paraphrases' ? 'default' : 'outline'}
            className="flex-1 font-medium min-w-[120px]"
          >
            <FileText className="w-4 h-4 mr-2" />
            Paraphrases
          </Button>
          <Button
            onClick={() => setMode('manage')}
            variant={mode === 'manage' ? 'default' : 'outline'}
            className="flex-1 font-medium min-w-[120px]"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>

        {/* Study Mode */}
        {mode === 'study' && (
          <div className="slide-in">
            {studyQueue.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mono">
                    {currentCardIndex + 1} / {studyQueue.length} due for review
                  </div>
                  <Button
                    onClick={reshuffleQueue}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Shuffle
                  </Button>
                </div>

                <div className="card-flip mb-6">
                  <div className={`card-inner ${isFlipped ? 'card-flipped' : ''}`}>
                    <div 
                      className="card-face cursor-pointer"
                      onClick={() => {
                        setIsFlipped(true);
                      }}
                    >
                      <div className="bg-white rounded-3xl p-12 min-h-[300px] flex items-center justify-center border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="text-center max-w-2xl">
                          <div className="text-sm text-slate-400 uppercase tracking-wider mb-4 mono">Question</div>
                          <div className="text-3xl font-semibold text-slate-900 leading-relaxed mb-6">
                            {currentStudyCard.front}
                          </div>
                          {currentStudyCard.translation && (
                            <div className="text-lg text-indigo-600 font-medium mb-4 mono">
                              {currentStudyCard.translation}
                            </div>
                          )}
                          {!isFlipped && (
                            <div className="mt-6 text-sm text-slate-400 mono">Tap to reveal answer</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div 
                      className="card-face card-back absolute inset-0 cursor-pointer"
                      onClick={() => {
                        setIsFlipped(false);
                      }}
                    >
                      <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-12 min-h-[300px] flex items-center justify-center border-2 border-indigo-700 shadow-xl">
                        <div className="text-center max-w-2xl">
                          <div className="text-sm text-indigo-200 uppercase tracking-wider mb-4 mono">Answer</div>
                          <div className="text-3xl font-semibold text-white leading-relaxed mb-6">
                            {currentStudyCard.back}
                          </div>
                          {currentStudyCard.example && (
                            <div className="text-base text-indigo-100 italic border-t border-indigo-400/30 pt-4 mt-4">
                              "{currentStudyCard.example}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isFlipped && (
                  <div className="flex gap-4 slide-in">
                    <Button
                      onClick={() => rateCard(false)}
                      variant="outline"
                      className="flex-1 h-14 text-lg font-medium border-2 border-red-300 text-red-600 hover:bg-red-50 hover-lift"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Again
                    </Button>
                    <Button
                      onClick={() => rateCard(true)}
                      className="flex-1 h-14 text-lg font-medium bg-green-600 hover:bg-green-700 hover-lift"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Got it
                    </Button>
                  </div>
                )}

                <div className="mt-4 text-center text-sm text-slate-500 mono">
                  Box {currentStudyCard.box} • Reviews: {currentStudyCard.reviews}
                </div>
              </>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-200/50 shadow-lg">
                <Calendar className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">All caught up!</h3>
                <p className="text-slate-600 mb-6">No cards due for review right now. Great work!</p>
                <Button onClick={() => setMode('create')} className="hover-lift">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Cards
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Create Mode */}
        {mode === 'create' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg slide-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Card</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 mono">Front (Question)</label>
                <Textarea
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  placeholder="Enter the term or question..."
                  className="min-h-[100px] text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 mono">Translation (Russian/Other Language)</label>
                <Input
                  value={newCard.translation}
                  onChange={(e) => setNewCard({ ...newCard, translation: e.target.value })}
                  placeholder="Перевод, traducción, traduction..."
                  className="text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 mono">Unit/Category</label>
                <Input
                  value={newCard.unit}
                  onChange={(e) => setNewCard({ ...newCard, unit: e.target.value })}
                  placeholder="e.g., Unit 1, Chapter 5, Basics..."
                  className="text-lg"
                />
                <p className="text-xs text-slate-500 mt-1">Group cards by unit for targeted testing</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 mono">Back (Answer)</label>
                <Textarea
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  placeholder="Enter the definition or answer..."
                  className="min-h-[100px] text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 mono">Example (Optional)</label>
                <Textarea
                  value={newCard.example}
                  onChange={(e) => setNewCard({ ...newCard, example: e.target.value })}
                  placeholder="Example sentence using this word..."
                  className="min-h-[80px] text-base"
                />
              </div>
              <Button 
                onClick={addCard} 
                className="w-full h-12 text-lg font-medium hover-lift"
                disabled={!newCard.front.trim() || !newCard.back.trim()}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Card
              </Button>
            </div>
          </div>
        )}

        {/* Test Mode */}
        {mode === 'test' && (
          <div className="slide-in">
            {testCards.length === 0 ? (
              // Test Selection Screen
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                <div className="text-center mb-8">
                  <ClipboardCheck className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Test Your Knowledge</h2>
                  <p className="text-slate-600">
                    Challenge yourself with a quick test! Choose your preferred format below.
                  </p>
                </div>

                {/* Unit Selection */}
                {getUniqueUnits().length > 1 && (
                  <div className="mb-6 pb-6 border-b border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-3 mono">
                      Select Units to Test (optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getUniqueUnits().map(unit => (
                        <button
                          key={unit}
                          onClick={() => toggleUnit(unit)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedUnits.includes(unit)
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {unit}
                          {selectedUnits.includes(unit) && (
                            <Check className="w-4 h-4 inline ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {selectedUnits.length === 0 
                        ? 'No units selected - will test all cards' 
                        : `Testing ${cards.filter(c => selectedUnits.includes(c.unit || 'General')).length} cards from ${selectedUnits.length} unit(s)`
                      }
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => startTest('written')}
                    disabled={cards.length === 0}
                    className="p-6 rounded-xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-4">
                      <Edit2 className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600">
                          Written Test
                        </h3>
                        <p className="text-sm text-slate-600">
                          Type your answers. Tests spelling and exact recall.
                        </p>
                        <div className="mt-3 text-xs text-slate-500 mono">
                          • More challenging
                          <br />• Requires exact answers
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => startTest('multiple-choice')}
                    disabled={cards.length < 4}
                    className="p-6 rounded-xl border-2 border-slate-200 hover:border-green-600 hover:bg-green-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-4">
                      <Check className="w-8 h-8 text-green-600 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-green-600">
                          Multiple Choice
                        </h3>
                        <p className="text-sm text-slate-600">
                          Select from 4 options. Easier recognition-based test.
                        </p>
                        <div className="mt-3 text-xs text-slate-500 mono">
                          • Easier format
                          <br />• Recognition over recall
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-sm text-slate-700 mono">
                    <strong>Test Details:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• Up to 10 random questions</li>
                      <li>• Drawn from all your cards</li>
                      <li>• Instant feedback on completion</li>
                      <li>• Results show correct/incorrect answers</li>
                    </ul>
                  </div>
                </div>

                {cards.length === 0 && (
                  <div className="mt-4 text-center text-slate-500 text-sm">
                    You need to create some cards before taking a test!
                  </div>
                )}

                {cards.length > 0 && cards.length < 4 && (
                  <div className="mt-4 text-center text-amber-600 text-sm">
                    Multiple choice requires at least 4 cards. Create more or try written test!
                  </div>
                )}
              </div>
            ) : !testComplete ? (
              // Active Test
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-slate-500 mono">
                      Question {currentTestIndex + 1} of {testCards.length}
                    </div>
                    <div className="text-sm font-medium text-indigo-600 mono">
                      {testType === 'written' ? 'Written Test' : 'Multiple Choice'}
                    </div>
                  </div>
                  <Progress value={((currentTestIndex) / testCards.length) * 100} className="h-2 mb-6" />

                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 mb-6">
                    <div className="text-sm text-slate-500 uppercase tracking-wider mb-3 mono">Question</div>
                    <div className="text-2xl font-bold text-slate-900 mb-4">
                      {testCards[currentTestIndex].front}
                    </div>
                    {testCards[currentTestIndex].translation && (
                      <div className="text-lg text-indigo-600 font-medium mono">
                        {testCards[currentTestIndex].translation}
                      </div>
                    )}
                  </div>

                  {testType === 'written' ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 mono">Your Answer</label>
                      <Input
                        id={`answer-${currentTestIndex}`}
                        placeholder="Type your answer..."
                        className="text-lg mb-4"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const answer = e.target.value;
                            answerTestQuestion(answer);
                            setTimeout(() => {
                              const nextInput = document.getElementById(`answer-${currentTestIndex + 1}`);
                              if (nextInput) nextInput.value = '';
                            }, 0);
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          const answer = document.getElementById(`answer-${currentTestIndex}`).value;
                          answerTestQuestion(answer);
                          setTimeout(() => {
                            const nextInput = document.getElementById(`answer-${currentTestIndex + 1}`);
                            if (nextInput) nextInput.value = '';
                          }, 0);
                        }}
                        className="w-full h-12 hover-lift"
                      >
                        {currentTestIndex < testCards.length - 1 ? 'Next Question' : 'Finish Test'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {multipleChoiceOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => answerTestQuestion(option)}
                          className="w-full p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left font-medium hover-lift"
                        >
                          <span className="text-indigo-600 font-bold mr-3 mono">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Test Results
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg slide-in">
                <div className="text-center mb-8">
                  <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Test Complete!</h2>
                  <div className="text-6xl font-bold text-indigo-600 mb-2">
                    {calculateTestScore().percentage}%
                  </div>
                  <div className="text-xl text-slate-600 mono">
                    {calculateTestScore().correct} / {calculateTestScore().total} correct
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {testCards.map((card, index) => {
                    const answer = testAnswers[card.id];
                    return (
                      <div
                        key={card.id}
                        className={`p-4 rounded-lg border-2 ${
                          answer.isCorrect
                            ? 'border-green-300 bg-green-50'
                            : 'border-red-300 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {answer.isCorrect ? (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          ) : (
                            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 mb-1">
                              {index + 1}. {card.front}
                            </div>
                            {!answer.isCorrect && (
                              <>
                                <div className="text-sm text-red-700">
                                  <span className="mono">Your answer:</span> {answer.given}
                                </div>
                                <div className="text-sm text-green-700">
                                  <span className="mono">Correct answer:</span> {answer.correct}
                                </div>
                              </>
                            )}
                            {answer.isCorrect && (
                              <div className="text-sm text-green-700 mono">
                                ✓ Correct: {answer.correct}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      resetTest();
                      startTest(testType);
                    }}
                    className="flex-1 h-12 hover-lift"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Take Another Test
                  </Button>
                  <Button
                    onClick={() => {
                      resetTest();
                      setMode('study');
                    }}
                    variant="outline"
                    className="flex-1 h-12 hover-lift"
                  >
                    Back to Study
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paraphrases Mode */}
        {mode === 'paraphrases' && (
          <div className="space-y-6 slide-in">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Paraphrase Practice</h2>
              <p className="text-slate-600 mb-6 text-sm">
                Learn to express the same idea in different ways. Add an original phrase and multiple variations.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 mono">Original Phrase</label>
                  <Textarea
                    value={newParaphrase.original}
                    onChange={(e) => setNewParaphrase({ ...newParaphrase, original: e.target.value })}
                    placeholder="Enter the original phrase or sentence..."
                    className="min-h-[80px] text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 mono">Paraphrase Variations</label>
                  <div className="space-y-3">
                    {newParaphrase.variations.map((variation, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <span className="text-slate-400 font-bold text-sm pt-3 mono">{index + 1}.</span>
                        <Textarea
                          value={variation}
                          onChange={(e) => updateParaphraseVariation(index, e.target.value)}
                          placeholder={`Variation ${index + 1}...`}
                          className="min-h-[70px] flex-1"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addMoreVariation}
                    variant="outline"
                    size="sm"
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Variation
                  </Button>
                </div>

                <Button 
                  onClick={addParaphrase} 
                  className="w-full h-12 text-lg font-medium hover-lift"
                  disabled={!newParaphrase.original.trim() || !newParaphrase.variations.some(v => v.trim())}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Save Paraphrase Set
                </Button>
              </div>
            </div>

            {/* Paraphrases List */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Your Paraphrases ({paraphrases.length})</h3>
              
              {paraphrases.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No paraphrases yet. Create your first one above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paraphrases.map((paraphrase) => (
                    <div
                      key={paraphrase.id}
                      className="border border-slate-200 rounded-xl p-5 hover-lift bg-gradient-to-br from-white to-slate-50"
                    >
                      {editingParaphraseId === paraphrase.id ? (
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 mono">
                              Original
                            </div>
                            <Textarea
                              value={editingParaphraseDraft.original}
                              onChange={(e) => updateExistingParaphraseOriginal(e.target.value)}
                              className="min-h-[80px] text-lg"
                            />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 mono">
                              Variations ({editingParaphraseDraft.variations.length})
                            </div>
                            <div className="space-y-3">
                              {editingParaphraseDraft.variations.map((variation, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                  <span className="text-indigo-600 font-bold mono text-sm pt-3">
                                    {index + 1}.
                                  </span>
                                  <Textarea
                                    value={variation}
                                    onChange={(e) =>
                                      updateExistingParaphraseVariation(index, e.target.value)
                                    }
                                    className="min-h-[70px] flex-1"
                                  />
                                </div>
                              ))}
                            </div>
                            <Button
                              onClick={addVariationToExistingParaphrase}
                              variant="outline"
                              size="sm"
                              className="mt-3"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Variation
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={saveEditingParaphrase}
                              className="flex-1"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditingParaphrase}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 mono">
                              Original
                            </div>
                            <div className="font-semibold text-slate-900 text-lg mb-3">
                              {paraphrase.original}
                            </div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 mono">
                              Variations ({paraphrase.variations.length})
                            </div>
                            <div className="space-y-2">
                              {paraphrase.variations.map((variation, index) => (
                                <div key={index} className="flex gap-2 text-slate-700">
                                  <span className="text-indigo-600 font-bold mono text-sm">
                                    {index + 1}.
                                  </span>
                                  <span className="flex-1">{variation}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditingParaphrase(paraphrase)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteParaphrase(paraphrase.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Mode */}
        {mode === 'manage' && (
          <div className="space-y-4 slide-in">
            <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-900">All Cards</h2>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setShowImport(true)}
                  variant="outline"
                  size="sm"
                  className="hover-lift"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                    disabled={cards.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  {cards.length > 0 && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <div className="py-1">
                        <button
                          onClick={() => exportCards('json')}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          JSON (with progress)
                        </button>
                        <button
                          onClick={() => exportCards('csv')}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          CSV (Excel compatible)
                        </button>
                        <button
                          onClick={() => exportCards('tsv')}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          TSV (Tab-separated)
                        </button>
                        <button
                          onClick={() => exportCards('quizlet')}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Quizlet Format
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={resetProgress}
                  variant="outline"
                  size="sm"
                  className="hover-lift"
                  disabled={cards.length === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Progress
                </Button>
              </div>
            </div>

            {cards.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-200/50">
                <p className="text-slate-600 mb-4">No cards yet. Create your first card to start learning!</p>
                <Button onClick={() => setMode('create')} className="hover-lift">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Card
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover-lift"
                  >
                    {editingId === card.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-slate-500 mono mb-1 block">Front</label>
                          <Input
                            defaultValue={card.front}
                            id={`front-${card.id}`}
                            className="font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mono mb-1 block">Translation</label>
                          <Input
                            defaultValue={card.translation || ''}
                            id={`translation-${card.id}`}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mono mb-1 block">Back</label>
                          <Input
                            defaultValue={card.back}
                            id={`back-${card.id}`}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mono mb-1 block">Example</label>
                          <Textarea
                            defaultValue={card.example || ''}
                            id={`example-${card.id}`}
                            className="min-h-[60px]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const front = document.getElementById(`front-${card.id}`).value;
                              const back = document.getElementById(`back-${card.id}`).value;
                              const example = document.getElementById(`example-${card.id}`).value;
                              const translation = document.getElementById(`translation-${card.id}`).value;
                              updateCard(card.id, front, back, example, translation);
                            }}
                            className="flex-1"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 mb-1">{card.front}</div>
                          {card.translation && (
                            <div className="text-indigo-600 text-sm font-medium mb-1 mono">{card.translation}</div>
                          )}
                          <div className="text-slate-600 text-sm mb-1">{card.back}</div>
                          {card.example && (
                            <div className="text-slate-500 text-xs italic mt-2 border-l-2 border-slate-200 pl-2">
                              "{card.example}"
                            </div>
                          )}
                          <div className="flex gap-3 mt-2 text-xs text-slate-500 mono">
                            <span className="bg-slate-100 px-2 py-1 rounded">Box {card.box}</span>
                            <span className="bg-slate-100 px-2 py-1 rounded">{card.reviews} reviews</span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(card.id)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCard(card.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Import Modal */}
        {showImport && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 slide-in">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Import Cards</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowImport(false);
                    setImportText('');
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 mono">Select Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setImportFormat('csv')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        importFormat === 'csv'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">CSV</div>
                      <div className="text-xs text-slate-500">Excel, Google Sheets</div>
                    </button>
                    <button
                      onClick={() => setImportFormat('tsv')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        importFormat === 'tsv'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">TSV</div>
                      <div className="text-xs text-slate-500">Tab-separated values</div>
                    </button>
                    <button
                      onClick={() => setImportFormat('quizlet')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        importFormat === 'quizlet'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">Quizlet</div>
                      <div className="text-xs text-slate-500">Front [Tab] Back format</div>
                    </button>
                    <button
                      onClick={() => setImportFormat('json')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        importFormat === 'json'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">JSON</div>
                      <div className="text-xs text-slate-500">LearnFlow format</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 mono">
                    Format Instructions
                  </label>
                  <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2 mono">
                    {importFormat === 'csv' && (
                      <>
                        <p className="text-slate-700">
                          <strong>CSV Format:</strong>
                        </p>
                        <code className="block bg-white p-2 rounded text-xs">
                          Front,Back,Translation,Example<br />
                          "Hello","Привет","Russian greeting","Hello, how are you?"<br />
                          "Goodbye","До свидания","","See you tomorrow!"
                        </code>
                        <p className="text-xs text-slate-500">
                          • First row can be header (optional)<br />
                          • Translation and Example are optional<br />
                          • Use quotes for text with commas
                        </p>
                      </>
                    )}
                    {importFormat === 'tsv' && (
                      <>
                        <p className="text-slate-700">
                          <strong>TSV Format:</strong>
                        </p>
                        <code className="block bg-white p-2 rounded text-xs">
                          Front[Tab]Back[Tab]Translation[Tab]Example<br />
                          Hello[Tab]Привет[Tab]Russian greeting[Tab]Hello, how are you?<br />
                          Goodbye[Tab]До свидания[Tab][Tab]See you tomorrow!
                        </code>
                        <p className="text-xs text-slate-500">
                          • [Tab] means press the Tab key<br />
                          • Translation and Example are optional
                        </p>
                      </>
                    )}
                    {importFormat === 'quizlet' && (
                      <>
                        <p className="text-slate-700">
                          <strong>Quizlet Format:</strong>
                        </p>
                        <code className="block bg-white p-2 rounded text-xs">
                          Hello[Tab]Привет<br />
                          Goodbye[Tab]До свидания<br />
                          Thank you[Tab]Спасибо
                        </code>
                        <p className="text-xs text-slate-500">
                          • Copy/paste directly from Quizlet<br />
                          • [Tab] separates front and back<br />
                          • No translation or example fields
                        </p>
                      </>
                    )}
                    {importFormat === 'json' && (
                      <>
                        <p className="text-slate-700">
                          <strong>JSON Format:</strong>
                        </p>
                        <code className="block bg-white p-2 rounded text-xs overflow-x-auto">
                          {`[
  {
    "front": "Hello",
    "back": "Привет",
    "translation": "Russian greeting",
    "example": "Hello, how are you?"
  }
]`}
                        </code>
                        <p className="text-xs text-slate-500">
                          • Full LearnFlow format with all fields<br />
                          • Preserves progress if exported from LearnFlow
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 mono">
                    Paste Your Data
                  </label>
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={`Paste your ${importFormat.toUpperCase()} data here...`}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={importCards}
                    className="flex-1 h-12 text-lg font-medium hover-lift"
                    disabled={!importText.trim()}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Import Cards
                  </Button>
                  <Button
                    onClick={() => {
                      setShowImport(false);
                      setImportText('');
                    }}
                    variant="outline"
                    className="h-12"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
