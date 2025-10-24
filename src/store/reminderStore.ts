import { create } from 'zustand'
import { ReminderWithMeeting } from '@/types/database'

interface ReminderState {
  reminders: ReminderWithMeeting[]
  activeReminders: ReminderWithMeeting[]
  setReminders: (reminders: ReminderWithMeeting[]) => void
  addReminder: (reminder: ReminderWithMeeting) => void
  dismissReminder: (reminderId: string) => void
  checkReminders: () => void
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  activeReminders: [],

  setReminders: (reminders) => set({ reminders }),

  addReminder: (reminder) =>
    set((state) => ({
      reminders: [...state.reminders, reminder],
    })),

  dismissReminder: (reminderId) =>
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== reminderId),
      activeReminders: state.activeReminders.filter((r) => r.id !== reminderId),
    })),

  checkReminders: () => {
    const now = new Date()
    const state = get()

    const active = state.reminders.filter((reminder) => {
      if (reminder.is_dismissed) return false

      const remindAt = new Date(reminder.remind_at)
      const diffMinutes = (now.getTime() - remindAt.getTime()) / (1000 * 60)

      // Show reminders that are due now or up to 5 minutes overdue
      return diffMinutes >= 0 && diffMinutes <= 5
    })

    set({ activeReminders: active })
  },
}))
