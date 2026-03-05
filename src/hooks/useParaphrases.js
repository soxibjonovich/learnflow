import { useCallback, useEffect, useState } from 'react';
import {
  addParaphrase as addParaphraseToDb,
  deleteParaphrase as deleteParaphraseFromDb,
  fetchParaphrases as fetchParaphrasesFromDb,
  updateParaphrase as updateParaphraseInDb,
} from '../lib/supabase';

export function useParaphrases() {
  const [paraphrases, setParaphrases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadParaphrases();
  }, []);

  useEffect(() => {
    localStorage.setItem('paraphrases', JSON.stringify(paraphrases));
  }, [paraphrases]);

  const loadParaphrases = async () => {
    setIsLoading(true);

    try {
      const stored = localStorage.getItem('paraphrases');
      const localParaphrases = stored ? JSON.parse(stored) : [];

      const dbParaphrases = await fetchParaphrasesFromDb();
      const mappedDbParaphrases = (dbParaphrases || []).map((item) => ({
        id: item.id,
        original: item.original || '',
        variations: Array.isArray(item.variations) ? item.variations : [],
        created: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
      }));

      const dbIds = new Set(mappedDbParaphrases.map((item) => item.id));
      const localOnly = localParaphrases.filter((item) => !dbIds.has(item.id));
      setParaphrases([...mappedDbParaphrases, ...localOnly]);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load paraphrases from database.');

      try {
        const stored = localStorage.getItem('paraphrases');
        setParaphrases(stored ? JSON.parse(stored) : []);
      } catch {
        setParaphrases([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addParaphrase = useCallback(async (payload) => {
    const original = payload.original?.trim() || '';
    const variations = (payload.variations || []).map((v) => v.trim()).filter(Boolean);

    if (!original || variations.length === 0) return null;

    let next;
    try {
      const saved = await addParaphraseToDb({ original, variations });
      next = {
        id: saved.id,
        original: saved.original || original,
        variations: Array.isArray(saved.variations) ? saved.variations : variations,
        created: saved.created_at ? new Date(saved.created_at).getTime() : Date.now(),
      };
      setError(null);
    } catch (err) {
      setError('Could not save paraphrase to database. Saved locally instead.');
      next = {
        id: Date.now(),
        original,
        variations,
        created: Date.now(),
      };
    }

    setParaphrases((prev) => [...prev, next]);
    return next;
  }, []);

  const updateParaphrase = useCallback(async (id, payload) => {
    const original = payload.original?.trim() || '';
    const variations = (payload.variations || []).map((v) => v.trim()).filter(Boolean);

    if (!original || variations.length === 0) return false;

    setParaphrases((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              original,
              variations,
            }
          : item,
      ),
    );

    try {
      await updateParaphraseInDb(id, { original, variations });
      setError(null);
    } catch (err) {
      setError('Could not update paraphrase in database.');
    }

    return true;
  }, []);

  const deleteParaphrase = useCallback(async (id) => {
    setParaphrases((prev) => prev.filter((item) => item.id !== id));

    try {
      await deleteParaphraseFromDb(id);
      setError(null);
    } catch (err) {
      setError('Could not delete paraphrase from database.');
    }
  }, []);

  return {
    paraphrases,
    isLoading,
    error,
    addParaphrase,
    updateParaphrase,
    deleteParaphrase,
    reloadParaphrases: loadParaphrases,
  };
}
