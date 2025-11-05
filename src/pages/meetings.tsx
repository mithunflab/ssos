import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { MeetingsListSkeleton } from '@/components/SkeletonLoaders'
import { MeetingWithDetails, Client } from '@/types/database'
import { formatRelativeTime, formatDateForInput } from '@/lib/date-utils'
import { Plus, Calendar, ExternalLink, Video, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MeetingsPage() {
  const { user, profile, loading: authLoading, supabase } = useAuth()
  const [meetings, setMeetings] = useState<MeetingWithDetails[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    meeting_time: '',
    duration_minutes: 60,
    meeting_link: '',
    reminder_minutes: 15,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user || authLoading || !supabase) return

    const fetchData = async () => {
      setIsLoading(true)

      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Fetch meetings timed out')), 10000)
        )

        const fetchPromise = Promise.all([
          supabase
            .from('meetings')
            .select(`*, client:clients (*)`)
            .eq('user_id', user.id)
            .order('meeting_time', { ascending: true }),

          supabase.from('clients').select('*').eq('user_id', user.id).order('name'),
        ])

        const [meetingsResult, clientsResult] = await Promise.race([fetchPromise, timeoutPromise])

        if (meetingsResult.data) {
          setMeetings(meetingsResult.data as MeetingWithDetails[])
        } else if (meetingsResult.error) {
          console.error('[Meetings] Error fetching meetings:', meetingsResult.error)
        }

        if (clientsResult.data) {
          setClients(clientsResult.data)
        } else if (clientsResult.error) {
          console.error('[Meetings] Error fetching clients:', clientsResult.error)
        }
      } catch (err: any) {
        console.error('[Meetings] Fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, supabase])

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        reminder_minutes: profile.default_reminder_minutes,
      }))
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)

    const meetingTime = new Date(formData.meeting_time).toISOString()
    const reminderMinutes = formData.reminder_minutes
    const remindAt = new Date(
      new Date(meetingTime).getTime() - reminderMinutes * 60000
    ).toISOString()

    const { data: meetingData, error: meetingError } = await supabase
      .from('meetings')
      .insert([
        {
          user_id: user.id,
          client_id: formData.client_id || null,
          title: formData.title,
          description: formData.description || null,
          meeting_time: meetingTime,
          duration_minutes: formData.duration_minutes,
          meeting_link: formData.meeting_link || null,
        },
      ])
      .select()

    if (meetingError) {
      console.error('Meeting creation error:', meetingError)
      alert('Failed to create meeting')
      setSaving(false)
      return
    }

    if (meetingData && meetingData.length > 0) {
      const newMeeting = meetingData[0]

      const { error: reminderError } = await supabase.from('reminders').insert([
        {
          user_id: user.id,
          meeting_id: newMeeting.id,
          remind_at: remindAt,
          is_dismissed: false,
        },
      ])

      if (reminderError) {
        console.error('Reminder creation error:', reminderError)
      }

      const { data: updatedMeetings } = await supabase
        .from('meetings')
        .select(`*, client:clients (*)`)
        .eq('user_id', user.id)
        .order('meeting_time', { ascending: true })

      if (updatedMeetings) {
        setMeetings(updatedMeetings as MeetingWithDetails[])
      }

      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        client_id: '',
        meeting_time: '',
        duration_minutes: 60,
        meeting_link: '',
        reminder_minutes: profile?.default_reminder_minutes || 15,
      })
    }

    setSaving(false)
  }

  if (authLoading || isLoading) {
    return <MeetingsListSkeleton />
  }

  if (!user) return null

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
            <p className="text-gray-600 mt-2">Schedule and manage your client meetings</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Meeting
          </button>
        </div>

        {meetings.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No meetings scheduled</h3>
            <p className="text-gray-600 mb-6">Get started by scheduling your first meeting</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Schedule First Meeting
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{meeting.title}</h3>
                    {meeting.client && (
                      <p className="text-sm text-gray-600 mb-2">
                        Client: {meeting.client.name}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-2">
                      {formatRelativeTime(meeting.meeting_time)}
                    </p>
                    {meeting.description && (
                      <p className="text-sm text-gray-500 mt-2">{meeting.description}</p>
                    )}
                    {meeting.meeting_link && (
                      <a
                        href={meeting.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mt-2"
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Join Meeting
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Schedule Meeting</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="label">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="Project kickoff meeting"
                  />
                </div>

                <div>
                  <label className="label">Client</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Select a client (optional)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.meeting_time}
                    onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Duration (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Meeting Link</label>
                  <input
                    type="url"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    className="input"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    placeholder="Meeting agenda..."
                  />
                </div>

                <div>
                  <label className="label">Reminder (minutes before)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={formData.reminder_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) })
                    }
                    className="input"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? 'Scheduling...' : 'Schedule Meeting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
