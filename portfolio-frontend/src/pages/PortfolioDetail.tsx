import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, MoreVertical, Trash2 } from 'lucide-react'
import { Portfolio, PortfolioItem } from '../types'
import { MetricCard, PortfolioItemRow, AddItemForm, ConfirmDialog, AllocationChart, Toast } from '../components'
import { portfolioAPI } from '../services/api'
import { calculateMetrics, getAllocationData } from '../services/mockData'

export const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDeletePortfolio, setShowDeletePortfolio] = useState(false)
  const [showDeleteItem, setShowDeleteItem] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    loadPortfolio()
  }, [id])

  const loadPortfolio = async () => {
    try {
      setIsLoading(true)
      if (!id) throw new Error('No portfolio ID provided')
      const data = await portfolioAPI.getById(id)
      setPortfolio(data)
    } catch (error) {
      setToast({ message: 'Failed to load portfolio', type: 'error' })
      setTimeout(() => navigate('/'), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (item: Omit<PortfolioItem, 'id' | 'portfolioId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!portfolio) return
      const newItem = await portfolioAPI.addItem(portfolio.id, item)
      setPortfolio({
        ...portfolio,
        items: [...portfolio.items, newItem]
      })
      setShowAddForm(false)
      setEditingItem(null)
      setToast({ message: 'Item added successfully', type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to add item', type: 'error' })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      if (!portfolio) return
      await portfolioAPI.deleteItem(portfolio.id, itemId)
      setPortfolio({
        ...portfolio,
        items: portfolio.items.filter(item => item.id !== itemId)
      })
      setShowDeleteItem(null)
      setToast({ message: 'Item removed successfully', type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to delete item', type: 'error' })
    }
  }

  const handleDeletePortfolio = async () => {
    try {
      if (!portfolio) return
      await portfolioAPI.delete(portfolio.id)
      setShowDeletePortfolio(false)
      setToast({ message: 'Portfolio deleted successfully', type: 'success' })
      setTimeout(() => navigate('/'), 1500)
    } catch (error) {
      setToast({ message: 'Failed to delete portfolio', type: 'error' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-blue-600">Loading...</div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Portfolio not found</h1>
          <Link to="/" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const metrics = calculateMetrics(portfolio)
  const allocation = getAllocationData(portfolio)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{portfolio.name}</h1>
              <p className="text-gray-600 mt-2">{portfolio.description}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MoreVertical size={24} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowDeletePortfolio(true)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={18} />
                    Delete Portfolio
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            label="Total Value"
            value={`$${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            trend={metrics.totalGainLoss >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            label="Invested"
            value={`$${metrics.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          />
          <MetricCard
            label="Gain/Loss"
            value={`$${metrics.totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            subtext={`${metrics.percentageReturn.toFixed(2)}%`}
            trend={metrics.totalGainLoss >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            label="Daily Change"
            value={`$${metrics.dayChange.toFixed(2)}`}
            subtext={`${metrics.dayChangePercent.toFixed(2)}%`}
            trend="neutral"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Holdings</h2>
                <button
                  onClick={() => {
                    setEditingItem(null)
                    setShowAddForm(true)
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Item
                </button>
              </div>

              {portfolio.items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No items in this portfolio yet.</p>
                  <button
                    onClick={() => {
                      setEditingItem(null)
                      setShowAddForm(true)
                    }}
                    className="btn-primary"
                  >
                    Add First Item
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Asset</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Quantity</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Invested</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Current Value</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Gain/Loss</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.items.map(item => (
                        <PortfolioItemRow
                          key={item.id}
                          item={item}
                          onEdit={item => {
                            setEditingItem(item)
                            setShowAddForm(true)
                          }}
                          onDelete={() => setShowDeleteItem(item.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div>
            <AllocationChart data={allocation} />
          </div>
        </div>
      </div>

      {showAddForm && (
        <AddItemForm
          onSubmit={handleAddItem}
          onCancel={() => {
            setShowAddForm(false)
            setEditingItem(null)
          }}
          initialData={editingItem || undefined}
        />
      )}

      {showDeleteItem && (
        <ConfirmDialog
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          isDangerous
          onConfirm={() => handleDeleteItem(showDeleteItem)}
          onCancel={() => setShowDeleteItem(null)}
        />
      )}

      {showDeletePortfolio && (
        <ConfirmDialog
          title="Delete Portfolio"
          message="Are you sure you want to delete this entire portfolio? This action cannot be undone."
          confirmText="Delete Portfolio"
          isDangerous
          onConfirm={handleDeletePortfolio}
          onCancel={() => setShowDeletePortfolio(false)}
        />
      )}

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
