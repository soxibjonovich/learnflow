import { useState, useEffect, useCallback } from 'react';

const KEY = 'synonyms';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function useSynonyms() {
  const [synonyms, setSynonyms] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(synonyms));
  }, [synonyms]);

  const addSynonym = useCallback((data) => {
    const entry = { id: Date.now(), ...data };
    setSynonyms((prev) => [...prev, entry]);
    return entry;
  }, []);

  const updateSynonym = useCallback((id, data) => {
    setSynonyms((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const deleteSynonym = useCallback((id) => {
    setSynonyms((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { synonyms, addSynonym, updateSynonym, deleteSynonym };
}
