import { useCallback, useEffect, useState } from 'react';
import {
  addParaphrase as addParaphraseToDb,
  deleteParaphrase as deleteParaphraseFromDb,
  fetchParaphrases as fetchParaphrasesFromDb,
  updateParaphrase as updateParaphraseInDb,
} from '../lib/supabase';

function mapRow(item) {
  return {
    id:         item.id,
    original:   item.original || '',
    variations: Array.isArray(item.variations) ? item.variations : [],
    source:     item.source || '',
    created:    item.created_at ? new Date(item.created_at).getTime() : Date.now(),
  };
}

export function useParaphrases() {
  const [paraphrases, setParaphrases] = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);

  useEffect(() => { loadParaphrases(); }, []);

  const loadParaphrases = async () => {
    setIsLoading(true);
    try {
      const dbRows = await fetchParaphrasesFromDb();
      setParaphrases((dbRows || []).map(mapRow));
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load paraphrases from database.');
      // fallback: keep whatever is in state
    } finally { setIsLoading(false); }
  };

  const addParaphrase = useCallback(async (payload) => {
    const original   = payload.original?.trim() || '';
    const variations = (payload.variations || []).map((v) => v.trim()).filter(Boolean);
    const source     = payload.source?.trim() || '';
    if (!original || variations.length === 0) return null;

    try {
      const saved = await addParaphraseToDb({ original, variations, source });
      const next  = mapRow(saved);
      setParaphrases((prev) => [next, ...prev]);
      setError(null);
      return next;
    } catch (err) {
      setError('Could not save to database.');
      return null;
    }
  }, []);

  const updateParaphrase = useCallback(async (id, payload) => {
    const original   = payload.original?.trim() || '';
    const variations = (payload.variations || []).map((v) => v.trim()).filter(Boolean);
    const source     = payload.source?.trim() ?? '';
    if (!original || variations.length === 0) return false;

    // Optimistic update
    setParaphrases((prev) =>
      prev.map((item) => item.id === id ? { ...item, original, variations, source } : item),
    );
    try {
      await updateParaphraseInDb(id, { original, variations, source });
      setError(null);
    } catch { setError('Could not update in database.'); }
    return true;
  }, []);

  const deleteParaphrase = useCallback(async (id) => {
    setParaphrases((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteParaphraseFromDb(id);
      setError(null);
    } catch { setError('Could not delete from database.'); }
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
