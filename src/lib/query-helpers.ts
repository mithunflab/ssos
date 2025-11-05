import { SupabaseClient, PostgrestResponse } from '@supabase/supabase-js'
import { Client, ReminderWithMeeting } from '@/types/database'

interface RevenueData {
  total_amount: number
  advance_paid: number
}

interface DashboardData {
  recentClients: Client[]
  upcomingReminders: ReminderWithMeeting[]
  stats: {
    clients: number
    meetings: number
    totalRevenue: number
    totalPaid: number
    totalDue: number
  }
}

export async function withRetry<T>(
  operation: () => Promise<PostgrestResponse<T>>,
  retries = 2,
  delay = 1000
): Promise<PostgrestResponse<T>> {
  let lastError
  for (let i = 0; i < retries; i++) {
    try {
      return await operation()
    } catch (err) {
      lastError = err
      if (i === retries - 1) break
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
    }
  }
  throw lastError
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ])
}

export async function fetchDashboardData(supabase: SupabaseClient, userId: string) {
  const [recentClientsResponse, remindersResponse] = await Promise.all([
    // Fetch recent clients
    withTimeout(
      withRetry(() =>
        supabase
          .from('clients')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5) as unknown as Promise<PostgrestResponse<any>>
      ),
      5000,
      'Recent clients fetch'
    ),
    // Fetch upcoming reminders
    withTimeout(
      withRetry(() =>
        supabase
          .from('reminders')
          .select('*, meeting:meetings (*, client:clients (*))')
          .eq('user_id', userId)
          .eq('is_dismissed', false)
          .gte('remind_at', new Date().toISOString())
          .order('remind_at', { ascending: true })
          .limit(5) as unknown as Promise<PostgrestResponse<any>>
      ),
      5000,
      'Reminders fetch'
    ),
  ])

  // If either main query fails, throw error
  if (recentClientsResponse.error) throw recentClientsResponse.error
  if (remindersResponse.error) throw remindersResponse.error

  // Background fetch stats
  const statsPromise = withTimeout(
    Promise.all([
      // Client count
      withRetry(() =>
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId) as unknown as Promise<PostgrestResponse<any>>
      ),
      // Revenue data
      withRetry(() =>
        supabase
          .from('clients')
          .select('total_amount, advance_paid')
          .eq('user_id', userId)
          .in('status', ['ongoing', 'potential']) as unknown as Promise<PostgrestResponse<any>>
      ),
      // Meeting count
      withRetry(() =>
        supabase.from('meetings').select('*', { count: 'exact', head: true }).eq('user_id', userId) as unknown as Promise<PostgrestResponse<any>>
      ),
    ]),
    8000,
    'Stats fetch'
  ).catch((err) => {
    console.error('[Dashboard] Stats fetch error:', err)
    return [{ count: 0 }, { data: [] }, { count: 0 }]
  })

  const [clientsCountResponse, revenueResponse, meetingsCountResponse] = await statsPromise

  // Calculate totals
  const totalRevenue = (revenueResponse.data || []).reduce(
    (sum: number, c: any) => sum + (c.total_amount || 0),
    0
  )
  const totalPaid = (revenueResponse.data || []).reduce((sum: number, c: any) => sum + (c.advance_paid || 0), 0)

  return {
    recentClients: recentClientsResponse.data || [],
    upcomingReminders: remindersResponse.data || [],
    stats: {
      clients: clientsCountResponse.count || 0,
      meetings: meetingsCountResponse.count || 0,
      totalRevenue,
      totalPaid,
      totalDue: totalRevenue - totalPaid,
    },
  }
}