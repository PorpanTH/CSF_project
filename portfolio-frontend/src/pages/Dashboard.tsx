import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, TrendingUp, Wallet, PieChart } from 'lucide-react'
import { Portfolio } from '../types'
import { MetricCard, PerformanceChart, AllocationChart, Toast } from '../components'
import { portfolioAPI } from '../services/api'
import { calculateMetrics, getAllocationData, getHistoricalData } from '../services/mockData'

export const Dashboard = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    loadPortfolios()
  }, [])

  const loadPortfolios = async () => {
    try {
      setIsLoading(true)
      const data = await portfolioAPI.getAll()
      setPortfolios(data)
      setError(null)
    } catch (err) {
      setError('Failed to load portfolios')
      setToast({ message: 'Failed to load portfolios', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Zap className="text-blue-600" size={48} />
        </div>
      </div>
    )
  }

  const allItems = portfolios.flatMap(p => p.items)
  const totalPortfolioValue = allItems.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0)
  const totalInvested = allItems.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0)
  const totalGainLoss = totalPortfolioValue - totalInvested
  const gainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  const allAllocation = [
    {
      type: 'stock' as const,
      value: allItems.filter(i => i.itemType === 'stock').reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0),
      percentage: 0,
      count: allItems.filter(i => i.itemType === 'stock').length,
    },
    {
      type: 'bond' as const,
      value: allItems.filter(i => i.itemType === 'bond').reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0),
      percentage: 0,
      count: allItems.filter(i => i.itemType === 'bond').length,
    },
    {
      type: 'cash' as const,
      value: allItems.filter(i => i.itemType === 'cash').reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0),
      percentage: 0,
      count: allItems.filter(i => i.itemType === 'cash').length,
    },
  ]

  const totalValue = allAllocation.reduce((sum, a) => sum + a.value, 0)
  const allocationWithPercent = allAllocation.map(a => ({
    ...a,
    percentage: totalValue > 0 ? (a.value / totalValue) * 100 : 0,
  }))

  const historicalData = getHistoricalData(30)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and monitor your investment portfolios</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            label="Total Portfolio Value"
            value={`$${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtext={`${portfolios.length} portfolio${portfolios.length !== 1 ? 's' : ''}`}
            trend={totalGainLoss >= 0 ? 'up' : 'down'}
            icon={<Wallet className="text-blue-600" size={24} />}
          />
          <MetricCard
            label="Total Invested"
            value={`$${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtext={`${allItems.length} holdings`}
            icon={<TrendingUp className="text-blue-600" size={24} />}
          />
          <MetricCard
            label="Total Gain/Loss"
            value={`$${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtext={`${gainLossPercent.toFixed(2)}% return`}
            trend={totalGainLoss >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            label="Active Holdings"
            value={allItems.length}
            subtext={`${allAllocation.filter(a => a.count > 0).length} asset types`}
            icon={<PieChart className="text-purple-600" size={24} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <PerformanceChart data={historicalData} />
          </div>
          <div>
            <AllocationChart data={allocationWithPercent} />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Portfolios</h2>
            <Link to="/add-portfolio" className="btn-primary">
              + New Portfolio
            </Link>
          </div>

          {portfolios.length === 0 ? (
            <div className="text-center py-12">
              <PieChart className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">No portfolios yet. Create your first portfolio to get started.</p>
              <Link to="/add-portfolio" className="btn-primary inline-block">
                Create Portfolio
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolios.map(portfolio => {
                const metrics = calculateMetrics(portfolio)
                return (
                  <Link
                    key={portfolio.id}
                    to={`/portfolio/${portfolio.id}`}
                    className="p-6 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
                  >
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {portfolio.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{portfolio.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Value</p>
                        <p className="text-xl font-bold text-gray-900">
                          ${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Gain/Loss</p>
                        <p className={`text-xl font-bold ${metrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.totalGainLoss >= 0 ? '+' : ''}{metrics.percentageReturn.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      {portfolio.items.length} holdings • Created {new Date(portfolio.createdAt).toLocaleDateString()}
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
