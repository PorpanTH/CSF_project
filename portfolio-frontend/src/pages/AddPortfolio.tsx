import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { portfolioAPI } from '../services/api'
import { Toast } from '../components'

export const AddPortfolio = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Portfolio name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Portfolio name must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Portfolio description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setIsSubmitting(true)
      await portfolioAPI.create(formData.name, formData.description)
      setToast({ message: 'Portfolio created successfully', type: 'success' })
      setTimeout(() => navigate('/'), 1500)
    } catch (error) {
      setToast({ message: 'Failed to create portfolio', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Portfolio</h1>
          <p className="text-gray-600 mb-8">Set up a new investment portfolio to organize your assets</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Retirement Fund, Growth Portfolio"
                className="input-field"
              />
              {errors.name && <p className="text-red-600 text-sm mt-2">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the purpose and strategy of this portfolio..."
                rows={4}
                className="input-field resize-vertical"
              />
              {errors.description && <p className="text-red-600 text-sm mt-2">{errors.description}</p>}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> After creating your portfolio, you'll be able to add investments (stocks, bonds, cash) to track your holdings and monitor performance.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Portfolio'}
              </button>
              <Link to="/" className="btn-secondary flex-1 text-center">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
            <h3 className="font-bold text-gray-900 mb-1">Create Portfolio</h3>
            <p className="text-sm text-gray-600">Start by giving your portfolio a name and description</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
            <h3 className="font-bold text-gray-900 mb-1">Add Holdings</h3>
            <p className="text-sm text-gray-600">Add your stocks, bonds, and cash investments</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
            <h3 className="font-bold text-gray-900 mb-1">Monitor Performance</h3>
            <p className="text-sm text-gray-600">Track your gains, losses, and asset allocation</p>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
