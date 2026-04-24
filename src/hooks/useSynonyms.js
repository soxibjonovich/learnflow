import { useState, useEffect, useCallback } from 'react';
import {
  fetchSynonyms,
  addSynonymToDb,
  updateSynonymInDb,
  deleteSynonymFromDb,
} from '../lib/supabase';

function mapRow(item) {
  return {
    id:     item.id,
    a:      item.a      || '',
    b1:     item.b1     || '',
    b2:     item.b2     || '',
    c1:     item.c1     || '',
    c2:     item.c2     || '',
    c3:     item.c3     || '',
    source: item.source || '',
  };
}

export function useSynonyms() {
  const [synonyms, setSynonyms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const rows = await fetchSynonyms();
      setSynonyms((rows || []).map(mapRow));
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load synonyms.');
    } finally { setIsLoading(false); }
  };

  const addSynonym = useCallback(async (data) => {
    try {
      const saved = await addSynonymToDb(data);
      const entry = mapRow(saved);
      setSynonyms((prev) => [entry, ...prev]);
      setError(null);
      return entry;
    } catch (err) {
      setError('Could not save synonym.');
      return null;
    }
  }, []);

  const updateSynonym = useCallback(async (id, data) => {
    setSynonyms((prev) => prev.map((s) => s.id === id ? { ...s, ...data } : s));
    try {
      await updateSynonymInDb(id, data);
      setError(null);
    } catch { setError('Could not update synonym.'); }
  }, []);

  const deleteSynonym = useCallback(async (id) => {
    setSynonyms((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSynonymFromDb(id);
      setError(null);
    } catch { setError('Could not delete synonym.'); }
  }, []);

  return { synonyms, isLoading, error, addSynonym, updateSynonym, deleteSynonym };
}
