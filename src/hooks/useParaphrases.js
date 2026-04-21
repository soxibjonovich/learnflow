import { useCallback, useEffect, useState } from 'react';
import {
  addParaphrase as addParaphraseToDb,
  deleteParaphrase as deleteParaphraseFromDb,
  fetchParaphrases as fetchParaphrasesFromDb,
  updateParaphrase as updateParaphraseInDb,
} from '../lib/supabase';

const SOURCES_KEY = 'paraphrase_sources';

function loadSources() {
  try { return JSON.parse(localStorage.getItem(SOURCES_KEY) || '{}'); }
  catch { return {}; }
}

function saveSources(map) {
  localStorage.setItem(SOURCES_KEY, JSON.stringify(map));
}

export function useParaphrases() {
  const [paraphrases, setParaphrases] = useState([]);
  const [sourcesMap, setSourcesMap] = useState(loadSources);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { loadParaphrases(); }, []);

  useEffect(() => {
    localStorage.setItem('paraphrases', JSON.stringify(paraphrases));
  }, [paraphrases]);

  // Keep localStorage in sync whenever sourcesMap changes
  useEffect(() => { saveSources(sourcesMap); }, [sourcesMap]);

  const setSource = useCallback((id, source) => {
    setSourcesMap((prev) => ({ ...prev, [id]: source }));
  }, []);

  const loadParaphrases = async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('paraphrases');
      const localParaphrases = stored ? JSON.parse(stored) : [];
      const dbParaphrases = await fetchParaphrasesFromDb();
      const mapped = (dbParaphrases || []).map((item) => ({
        id: item.id,
        original: item.original || '',
        variations: Array.isArray(item.variations) ? item.variations : [],
        created: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
      }));
      const dbIds = new Set(mapped.map((i) => i.id));
      const localOnly = localParaphrases.filter((i) => !dbIds.has(i.id));
      setParaphrases([...mapped, ...localOnly]);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load paraphrases from database.');
      try {
        const stored = localStorage.getItem('paraphrases');
        setParaphrases(stored ? JSON.parse(stored) : []);
      } catch { setParaphrases([]); }
    } finally { setIsLoading(false); }
  };

  const addParaphrase = useCallback(async (payload) => {
    const original = payload.original?.trim() || '';
    const variations = (payload.variations || []).map((v) => v.trim()).filter(Boolean);
    const source = payload.source?.trim() || '';
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
    } catch {
      setError('Could not save to database. Saved locally.');
      next = { id: Date.now(), original, variations, created: Date.now() };
    }

    if (source) setSource(next.id, source);
    setParaphrases((prev) => [...prev, next]);
    return next;
  }, [setSource]);

  const updateParaphrase = useCallback(async (id, payload) => {
    const original = payload.original?.trim() || '';
    const variations = (payload.variations || []).map((v) => v.trim()).filter(Boolean);
    const source = payload.source?.trim();
    if (!original || variations.length === 0) return false;

    if (source !== undefined) setSource(id, source);

    setParaphrases((prev) =>
      prev.map((item) => item.id === id ? { ...item, original, variations } : item),
    );
    try {
      await updateParaphraseInDb(id, { original, variations });
      setError(null);
    } catch { setError('Could not update in database.'); }
    return true;
  }, [setSource]);

  const deleteParaphrase = useCallback(async (id) => {
    setParaphrases((prev) => prev.filter((item) => item.id !== id));
    setSourcesMap((prev) => { const next = { ...prev }; delete next[id]; return next; });
    try {
      await deleteParaphraseFromDb(id);
      setError(null);
    } catch { setError('Could not delete from database.'); }
  }, []);

  // Merge source into every paraphrase object before returning
  const paraphrasesWithSource = paraphrases.map((p) => ({
    ...p,
    source: sourcesMap[p.id] || '',
  }));

  return {
    paraphrases: paraphrasesWithSource,
    isLoading,
    error,
    addParaphrase,
    updateParaphrase,
    deleteParaphrase,
    reloadParaphrases: loadParaphrases,
  };
}
