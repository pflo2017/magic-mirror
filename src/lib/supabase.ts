import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (safe to use in components)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client-side operations (using anon key)
export const styleOperations = {
  async getAll() {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getByCategory(category: Database['public']['Enums']['style_category']) {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}