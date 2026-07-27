import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { Portfolio } from '../types'
import { MetricCard, Toast } from '../components'
import { portfolioAPI } from '../services/api'
import { calculateMetrics } from '../services/mockData'

export const PortfolioList = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    loadPortfolios()
  }, [])

  const loadPortfolios = async () => {
    try {
      setIsLoading(false)
      const data = await portfolioAPI.getAll()
      setPortfolios(data)
    } catch (error) {
      setToast({ message: 'Failed to load portfolios', type: 'error' })
    }
  }

  const totalValue = portfolios.reduce((sum, p) => {
    const metrics = calculateMetrics(p)
    return sum + metrics.totalValue
  }, 0)

  const totalGainLoss = portfolios.reduce((sum, p) => {
    const metrics = calculateMetrics(p)
    return sum + metrics.totalGainLoss
  }, 0)

  const totalInvested = portfolios.reduce((sum, p) => {
    const metrics = calculateMetrics(p)
    return sum + metrics.totalInvested
  }, 0)

  const gainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Portfolios</h1>
            <p className="text-gray-600 mt-2">View and manage all your investment portfolios</p>
          </div>
          <Link to="/add-portfolio" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Portfolio
          </Link>
        </div>

        {portfolios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              label="Total Value"
              value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
              trend={totalGainLoss >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              label="Total Invested"
              value={`$${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            />
            <MetricCard
              label="Total Gain/Loss"
              value={`$${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
              subtext={`${gainLossPercent.toFixed(2)}%`}
              trend={totalGainLoss >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              label="Active Portfolios"
              value={portfolios.length}
            />
          </div>
        )}

        <div className="card">
          {portfolios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't created any portfolios yet.</p>
              <Link to="/add-portfolio" className="btn-primary inline-block">
                Create Your First Portfolio
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {portfolios.map(portfolio => {
                const metrics = calculateMetrics(portfolio)
                return (
                  <Link
                    key={portfolio.id}
                    to={`/portfolio/${portfolio.id}`}
                    className="p-6 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-200 group block"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {portfolio.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{portfolio.description}</p>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {portfolio.items.length} items
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Value</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Invested</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${metrics.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Gain/Loss</p>
                        <p className={`text-lg font-bold ${metrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(metrics.totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Return</p>
                        <p className={`text-lg font-bold ${metrics.percentageReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.percentageReturn >= 0 ? '+' : ''}{metrics.percentageReturn.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                      Created {new Date(portfolio.createdAt).toLocaleDateString()} • Updated {new Date(portfolio.updatedAt).toLocaleDateString()}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
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
