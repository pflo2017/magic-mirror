import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': supabaseServiceKey
    }
  }
})

// Server-side Supabase client with cookies (for authenticated requests)
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Server-side database operations
export const salonOperations = {
  async create(salon: Database['public']['Tables']['salons']['Insert']) {
    const { data, error } = await supabaseAdmin
      .from('salons')
      .insert(salon)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
    return data
  },

  async update(id: string, updates: Database['public']['Tables']['salons']['Update']) {
    const { data, error } = await supabaseAdmin
      .from('salons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByAuthUserId(authUserId: string) {
    const { data, error } = await supabaseAdmin
      .from('salons')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}

export const sessionOperations = {
  async create(session: Database['public']['Tables']['sessions']['Insert']) {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert(session)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select(`
        *,
        salons (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUsage(id: string, aiUses: number) {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .update({ ai_uses: aiUses })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getActiveSessions(salonId: string) {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('salon_id', salonId)
      .gt('expires_at', new Date().toISOString())
    
    if (error) throw error
    return data
  }
}

export const analyticsOperations = {
  async create(analytics: Database['public']['Tables']['analytics']['Insert']) {
    const { data, error } = await supabaseAdmin
      .from('analytics')
      .insert(analytics)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getSalonAnalytics(salonId: string, startDate?: string, endDate?: string) {
    let query = supabaseAdmin
      .from('analytics')
      .select('*')
      .eq('salon_id', salonId)
    
    if (startDate) {
      query = query.gte('used_at', startDate)
    }
    
    if (endDate) {
      query = query.lte('used_at', endDate)
    }
    
    const { data, error } = await query.order('used_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}