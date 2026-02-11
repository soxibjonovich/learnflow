// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// These will be your Supabase project credentials
// You'll get these when you create a project at supabase.com
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Shared cards functions
export const fetchSharedCards = async () => {
  const { data, error } = await supabase
    .from('shared_cards')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const addSharedCard = async (card) => {
  const { data, error } = await supabase
    .from('shared_cards')
    .insert([{
      front: card.front,
      back: card.back,
      translation: card.translation,
      example: card.example,
      unit: card.unit || 'General'
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateSharedCard = async (id, updates) => {
  const { data, error } = await supabase
    .from('shared_cards')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteSharedCard = async (id) => {
  const { error } = await supabase
    .from('shared_cards')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Subscribe to real-time changes
export const subscribeToSharedCards = (callback) => {
  return supabase
    .channel('shared_cards_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'shared_cards' },
      callback
    )
    .subscribe()
}

// Bulk insert shared cards (used for imports)
export const addSharedCardsBulk = async (cards) => {
  if (!cards.length) return []

  const payload = cards.map((card) => ({
    front: card.front,
    back: card.back,
    translation: card.translation,
    example: card.example,
    unit: card.unit || 'General',
  }))

  const { data, error } = await supabase
    .from('shared_cards')
    .insert(payload)
    .select()

  if (error) throw error
  return data
}

// Paraphrases functions
export const fetchParaphrases = async () => {
  const { data, error } = await supabase
    .from('paraphrases')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const addParaphrase = async (paraphrase) => {
  const { data, error } = await supabase
    .from('paraphrases')
    .insert([{
      original: paraphrase.original,
      variations: paraphrase.variations,
    }])
    .select()

  if (error) throw error
  return data[0]
}

export const deleteParaphrase = async (id) => {
  const { error } = await supabase
    .from('paraphrases')
    .delete()
    .eq('id', id)

  if (error) throw error
}
