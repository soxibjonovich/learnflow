import { useState, useEffect, useCallback } from 'react';

const KEY = 'matching_items';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

export function useMatching() {
  const [items, setItems] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((data) => {
    const entry = { id: Date.now(), ...data };
    setItems((prev) => [...prev, entry]);
    return entry;
  }, []);

  const updateItem = useCallback((id, data) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const deleteItem = useCallback((id) => {
    setItems((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { items, addItem, updateItem, deleteItem };
}
