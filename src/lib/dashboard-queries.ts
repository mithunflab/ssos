import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { Client, ReminderWithMeeting } from '@/types/database'

interface DashboardStats {
  clients: number
  meetings: number
  totalRevenue: number
  totalPaid: number
  totalDue: number
}

interface DashboardData {
  recentClients: Client[]
  upcomingReminders: ReminderWithMeeting[]
  stats: DashboardStats
}

interface RevenueData {
  total_amount: number | null
  advance_paid: number | null
}

async function fetchRecentClients(supabase: SupabaseClient, userId: string) {
  const response = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  return response
}

async function fetchUpcomingReminders(supabase: SupabaseClient, userId: string) {
  const response = await supabase
    .from('reminders')
    .select('*, meeting:meetings (*, client:clients (*))')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .gte('remind_at', new Date().toISOString())
    .order('remind_at', { ascending: true })
    .limit(5)

  return response
}

async function fetchStats(supabase: SupabaseClient, userId: string) {
  const [clientsCount, revenue, meetingsCount] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('clients')
      .select('total_amount, advance_paid')
      .eq('user_id', userId)
      .in('status', ['ongoing', 'potential']),
    supabase.from('meetings').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  const revenueData = (revenue.data || []) as RevenueData[]
  const totalRevenue = revenueData.reduce((sum, c) => sum + (c.total_amount || 0), 0)
  const totalPaid = revenueData.reduce((sum, c) => sum + (c.advance_paid || 0), 0)

  return {
    clients: clientsCount.count || 0,
    meetings: meetingsCount.count || 0,
    totalRevenue,
    totalPaid,
    totalDue: totalRevenue - totalPaid,
  }
}

export async function fetchDashboardData(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardData> {
  try {
    // First fetch the essential data
    const [clients, reminders] = await Promise.all([
      fetchRecentClients(supabase, userId),
      fetchUpcomingReminders(supabase, userId),
    ])

    if (clients.error) throw clients.error
    if (reminders.error) throw reminders.error

    // Then fetch stats in background
    const stats = await fetchStats(supabase, userId).catch((err) => {
      console.error('Error fetching stats:', err)
      return {
        clients: 0,
        meetings: 0,
        totalRevenue: 0,
        totalPaid: 0,
        totalDue: 0,
      }
    })

    return {
      recentClients: clients.data || [],
      upcomingReminders: reminders.data || [],
      stats,
    }
  } catch (error) {
    if (error instanceof PostgrestError) {
      throw new Error(`Database error: ${error.message}`)
    }
    throw error
  }
}