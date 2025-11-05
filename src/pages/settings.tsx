import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getUserTimezone } from '@/lib/date-utils'
import { User, Globe, Clock, Save, Bell, LogOut, ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, refreshProfile, loading, signOut, supabase } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    timezone: 'UTC',
    default_reminder_minutes: 15,
    currency: 'INR',
  })

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        timezone: profile.timezone || getUserTimezone(),
        default_reminder_minutes: profile.default_reminder_minutes || 15,
        currency: profile.currency || 'INR',
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        timezone: formData.timezone,
        default_reminder_minutes: formData.default_reminder_minutes,
        currency: formData.currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      await refreshProfile()
      setMessage('Settings saved successfully!')
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) return <div className="min-h-screen p-8">Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/dashboard" className="btn-secondary mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Settings</h1>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-8 space-y-6">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="input"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div>
            <label className="label">Default Reminder (minutes before meeting)</label>
            <input
              type="number"
              min="5"
              step="5"
              value={formData.default_reminder_minutes}
              onChange={(e) => setFormData({ ...formData, default_reminder_minutes: parseInt(e.target.value) })}
              className="input"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        <div className="card p-8 mt-6">
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <button onClick={handleSignOut} className="btn-secondary text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
