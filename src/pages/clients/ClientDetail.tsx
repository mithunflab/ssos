import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Client, Meeting } from '@/types/database'
import {
  formatCurrency,
  getClientStatusColor,
  getClientStatusLabel,
} from '@/lib/utils'
import { formatRelativeTime, formatTimeAgo } from '@/lib/date-utils'
import { ArrowLeft, Edit, Trash2, Plus, Phone, Calendar, DollarSign } from 'lucide-react'

export default function ClientDetailPage() {
  const { user, profile, supabase } = useAuth()
  const navigate = useNavigate()
  const params = useParams()
  const clientId = params?.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    project_description: '',
    total_amount: '',
    advance_paid: '',
    status: 'uncertain' as 'uncertain' | 'potential' | 'ongoing' | 'completed',
  })

  useEffect(() => {
    if (!user || !clientId) return

    const fetchData = async () => {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('user_id', user.id)
        .single()

      if (clientError) {
        console.error('Error fetching client:', clientError)
        navigate('/clients')
        return
      }

      if (clientData) {
        setClient(clientData)
        setEditData({
          name: clientData.name,
          phone: clientData.phone || '',
          project_description: clientData.project_description || '',
          total_amount: clientData.total_amount ? clientData.total_amount.toString() : '',
          advance_paid: clientData.advance_paid ? clientData.advance_paid.toString() : '',
          status: clientData.status,
        })
      } else {
        navigate('/clients')
        return
      }

      const { data: meetingsData } = await supabase
        .from('meetings')
        .select('*')
        .eq('client_id', clientId)
        .order('meeting_time', { ascending: false })

      if (meetingsData) {
        setMeetings(meetingsData)
      }
    }

    fetchData()
  }, [user, clientId, navigate, supabase])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return

    const { error } = await supabase
      .from('clients')
      .update({
        name: editData.name,
        phone: editData.phone || null,
        project_description: editData.project_description || null,
        total_amount: editData.total_amount ? parseFloat(editData.total_amount) : null,
        advance_paid: editData.advance_paid ? parseFloat(editData.advance_paid) : 0,
        status: editData.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id)

    if (error) {
      console.error('Update error:', error)
      alert('Failed to update client')
    } else {
      const { data: updatedClient } = await supabase
        .from('clients')
        .select('*')
        .eq('id', client.id)
        .single()
      if (updatedClient) {
        setClient(updatedClient)
      }
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!client) return
    if (!confirm('Are you sure you want to delete this client?')) return

    const { error } = await supabase.from('clients').delete().eq('id', client.id)

    if (error) {
      console.error('Delete error:', error)
      alert('Failed to delete client')
    } else {
      navigate('/clients')
    }
  }

  if (!client) {
    return <div className="min-h-screen p-8">Loading...</div>
  }

  const balance = (client.total_amount || 0) - (client.advance_paid || 0)

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/clients" className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Link>
          <div className="space-x-3">
            {!isEditing && (
              <>
                <button onClick={() => setIsEditing(true)} className="btn-secondary">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button onClick={handleDelete} className="btn-secondary text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-6">Edit Client</h2>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="label">Client Name</label>
                <input
                  type="text"
                  required
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Project Description</label>
                <textarea
                  rows={4}
                  value={editData.project_description}
                  onChange={(e) => setEditData({ ...editData, project_description: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Total Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editData.total_amount}
                    onChange={(e) => setEditData({ ...editData, total_amount: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Advance Paid</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editData.advance_paid}
                    onChange={(e) => setEditData({ ...editData, advance_paid: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                  className="input"
                >
                  <option value="uncertain">Uncertain</option>
                  <option value="potential">Potential</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="card p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{client.name}</h1>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${getClientStatusColor(
                      client.status
                    )}`}
                  >
                    {getClientStatusLabel(client.status)}
                  </span>
                </div>
              </div>

              {client.phone && (
                <div className="mb-4 flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-2" />
                  {client.phone}
                </div>
              )}

              {client.project_description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Project Description</h2>
                  <p className="text-gray-600">{client.project_description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(client.total_amount || 0, profile?.currency || 'INR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Advance Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(client.advance_paid || 0, profile?.currency || 'INR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Balance</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(balance, profile?.currency || 'INR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Meetings</h2>
                <Link to="/meetings" className="btn-primary text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Link>
              </div>

              {meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No meetings scheduled</p>
                  <Link to="/meetings" className="btn-primary text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule First Meeting
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatRelativeTime(meeting.meeting_time)}
                      </p>
                      {meeting.description && (
                        <p className="text-sm text-gray-500 mt-2">{meeting.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
