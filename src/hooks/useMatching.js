import { useState, useEffect, useCallback } from 'react';
import {
  fetchMatching,
  addMatchingToDb,
  updateMatchingInDb,
  deleteMatchingFromDb,
} from '../lib/supabase';

function mapRow(item) {
  return {
    id:        item.id,
    statement: item.statement || '',
    match:     item.match     || '',
    notes:     item.notes     || '',
    source:    item.source    || '',
  };
}

export function useMatching() {
  const [items, setItems]       = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const rows = await fetchMatching();
      setItems((rows || []).map(mapRow));
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load matching items.');
    } finally { setIsLoading(false); }
  };

  const addItem = useCallback(async (data) => {
    try {
      const saved = await addMatchingToDb(data);
      const entry = mapRow(saved);
      setItems((prev) => [entry, ...prev]);
      setError(null);
      return entry;
    } catch (err) {
      setError('Could not save item.');
      return null;
    }
  }, []);

  const updateItem = useCallback(async (id, data) => {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, ...data } : s));
    try {
      await updateMatchingInDb(id, data);
      setError(null);
    } catch { setError('Could not update item.'); }
  }, []);

  const deleteItem = useCallback(async (id) => {
    setItems((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteMatchingFromDb(id);
      setError(null);
    } catch { setError('Could not delete item.'); }
  }, []);

  return { items, isLoading, error, addItem, updateItem, deleteItem };
}
