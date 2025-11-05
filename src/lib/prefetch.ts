import { SupabaseClient } from '@supabase/supabase-js'
import { globalCache } from './cache'

export async function prefetchUserData(supabase: SupabaseClient, userId: string) {
  try {
    // Fetch data in parallel
    const [profileResponse, clientsResponse, remindersResponse] = await Promise.all([
      // Fetch profile
      supabase.from('profiles').select('*').eq('id', userId).single(),
      
      // Fetch recent clients
      supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Fetch upcoming reminders
      supabase
        .from('reminders')
        .select('*, meeting:meetings (*, client:clients (*))')
        .eq('user_id', userId)
        .eq('is_dismissed', false)
        .gte('remind_at', new Date().toISOString())
        .order('remind_at', { ascending: true })
        .limit(5)
    ])

    // Cache the results
    if (profileResponse.data) {
      globalCache.set(`profile:${userId}`, profileResponse.data)
    }
    if (clientsResponse.data) {
      globalCache.set(`clients:${userId}:recent`, clientsResponse.data)
    }
    if (remindersResponse.data) {
      globalCache.set(`reminders:${userId}:upcoming`, remindersResponse.data)
    }

    return {
      profile: profileResponse.data,
      clients: clientsResponse.data || [],
      reminders: remindersResponse.data || []
    }
  } catch (error) {
    console.error('[Prefetch] Error prefetching user data:', error)
    return null
  }
}