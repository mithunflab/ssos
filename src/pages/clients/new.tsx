import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { TopBar } from '@/components/TopBar'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function NewClientPage() {
  const { user, supabase } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    project_description: '',
    total_amount: '',
    advance_paid: '',
    status: 'uncertain' as 'uncertain' | 'potential' | 'ongoing' | 'completed',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a client')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { data: maxOrderData } = await supabase
        .from('clients')
        .select('order')
        .eq('user_id', user.id)
        .eq('status', formData.status)
        .order('order', { ascending: false })
        .limit(1)

      const nextOrder =
        maxOrderData && maxOrderData.length > 0 ? (maxOrderData[0].order || 0) + 1 : 0

      const clientData = {
        user_id: user.id,
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        project_description: formData.project_description.trim() || null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
        advance_paid: formData.advance_paid ? parseFloat(formData.advance_paid) : 0,
        status: formData.status,
        order: nextOrder,
      }

      const { data, error: insertError } = await supabase
        .from('clients')
        .insert([clientData])
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        setError(insertError.message || 'Failed to create client')
        setLoading(false)
      } else if (data && data.length > 0) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/clients')
        }, 1000)
      } else {
        setError('Failed to create client - no data returned')
        setLoading(false)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen">
      <TopBar
        title="Add New Client"
        description="Create a new client profile"
        actions={
          <Link to="/clients" className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Link>
        }
      />

      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="card p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-sm text-green-700">Client created successfully! Redirecting...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="label">
                Client Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="+1 (555) 123-4567"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="project_description" className="label">
                Project Description
              </label>
              <textarea
                id="project_description"
                name="project_description"
                rows={4}
                value={formData.project_description}
                onChange={handleChange}
                className="input"
                placeholder="Describe the project..."
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="total_amount" className="label">
                  Total Amount
                </label>
                <input
                  type="number"
                  id="total_amount"
                  name="total_amount"
                  min="0"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={handleChange}
                  className="input"
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="advance_paid" className="label">
                  Advance Paid
                </label>
                <input
                  type="number"
                  id="advance_paid"
                  name="advance_paid"
                  min="0"
                  step="0.01"
                  value={formData.advance_paid}
                  onChange={handleChange}
                  className="input"
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="label">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="input"
                disabled={loading}
              >
                <option value="uncertain">Uncertain</option>
                <option value="potential">Potential</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link to="/clients" className="btn-secondary">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Client
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
