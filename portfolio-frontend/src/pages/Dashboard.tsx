import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Briefcase, PieChart, Sparkles, Wallet } from 'lucide-react'
import { Portfolio, PortfolioItem } from '../types'
import { PerformanceChart, Toast } from '../components'
import { HoldingsFluctuationList } from '../components/HoldingsFluctuationList'
import { PnLOverview } from '../components/PnLOverview'
// import { PieBreakdownChart } from '../components/PieBreakdownChart'
import { portfolioAPI } from '../services/api'
import {
  // getAssetClassSlices,
  getHistoricalData,
  getHoldingsFluctuations,
  getPnLByAssetClass,
  // getRegionSlices,
  getTotalPnL,
} from '../services/mockData'

// type BreakdownMode = 'allocation' | 'region' | 'country'
type ProductCategory = 'stock' | 'bond' | 'etf' | 'other'

interface ProductOption {
  id: string
  category: ProductCategory
  ticker: string
  name: string
  price: number
  sector: string
  region: string
  description: string
}

const PRODUCT_OPTIONS: ProductOption[] = [
  { id: 'aapl', category: 'stock', ticker: 'AAPL', name: 'Apple', price: 228.45, sector: 'Technology', region: 'North America', description: 'Mega-cap technology leader' },
  { id: 'msft', category: 'stock', ticker: 'MSFT', name: 'Microsoft', price: 417.89, sector: 'Technology', region: 'North America', description: 'Cloud and enterprise software' },
  { id: 'voo', category: 'etf', ticker: 'VOO', name: 'Vanguard S&P 500 ETF', price: 412.18, sector: 'Diversified Equity', region: 'North America', description: 'Broad-market equity exposure' },
  { id: 'agg', category: 'bond', ticker: 'AGG', name: 'iShares Core US Aggregate Bond', price: 95.75, sector: 'Fixed Income', region: 'North America', description: 'High-quality bond sleeve' },
  { id: 'other', category: 'other', ticker: 'ALT', name: 'Private Credit Fund', price: 102.60, sector: 'Alternative Credit', region: 'Europe', description: 'Alternative income strategy' },
]

const buildPriceHistory = (currentPrice: number, volatility = 0.02) => {
  const history: number[] = []
  let price = currentPrice * (1 - volatility * 10)
  for (let i = 0; i < 30; i++) {
    price = price * (1 + (Math.random() - 0.48) * volatility)
    history.push(Number(price.toFixed(2)))
  }
  history[history.length - 1] = Number(currentPrice.toFixed(2))
  return history
}

export const Dashboard = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  // const [selectedBreakdown, setSelectedBreakdown] = useState<BreakdownMode>('allocation')
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('stock')

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

  const allItems = useMemo(() => portfolios.flatMap(p => p.items), [portfolios])

  const totalPortfolioValue = useMemo(() => allItems.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0), [allItems])
  const totalInvested = useMemo(() => allItems.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0), [allItems])
  const totalGainLoss = totalPortfolioValue - totalInvested

  // const allocationRows = useMemo(() => {
  //   const summary = [
  //     { type: 'stock' as const, value: allItems.filter(i => i.itemType === 'stock').reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0), percentage: 0, count: allItems.filter(i => i.itemType === 'stock').length },
  //     { type: 'bond' as const, value: allItems.filter(i => i.itemType === 'bond').reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0), percentage: 0, count: allItems.filter(i => i.itemType === 'bond').length },
  //     { type: 'cash' as const, value: allItems.filter(i => i.itemType === 'cash').reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0), percentage: 0, count: allItems.filter(i => i.itemType === 'cash').length },
  //     { type: 'etf' as const, value: allItems.filter(i => i.itemType === 'etf').reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0), percentage: 0, count: allItems.filter(i => i.itemType === 'etf').length },
  //     { type: 'other' as const, value: allItems.filter(i => i.itemType === 'other').reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0), percentage: 0, count: allItems.filter(i => i.itemType === 'other').length },
  //   ]
  //   const totalValue = summary.reduce((sum, item) => sum + item.value, 0)
  //   return summary.filter(item => item.value > 0).map(item => ({ ...item, percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0 }))
  // }, [allItems])

  const breakdownRows = useMemo(() => getPnLByAssetClass(allItems), [allItems])
  const totals = useMemo(() => getTotalPnL(allItems), [allItems])
  const historicalData = useMemo(() => getHistoricalData(30), [])
  const holdings = useMemo(() => getHoldingsFluctuations(allItems), [allItems])

  // const breakdownData = useMemo(() => {
  //   switch (selectedBreakdown) {
  //     case 'region':
  //       return getRegionSlices(allItems)
  //     case 'country':
  //       return getRegionSlices(allItems)
  //     default:
  //       return getAssetClassSlices(allItems)
  //   }
  // }, [allItems, selectedBreakdown])

  // const breakdownTitle = selectedBreakdown === 'allocation'
  //   ? 'Asset class breakdown'
  //   : selectedBreakdown === 'region'
  //     ? 'Regional allocation'
  //     : 'Country exposure'

  const primaryPortfolio = portfolios[0]

  const handleBuyProduct = (product: ProductOption) => {
    if (!primaryPortfolio) {
      setToast({ message: 'Create a portfolio first to buy into it.', type: 'info' })
      return
    }

    const normalizedType: PortfolioItem['itemType'] = product.category === 'bond'
      ? 'bond'
      : product.category === 'etf'
        ? 'etf'
        : product.category === 'other'
          ? 'other'
          : 'stock'

    const quantity = 10
    const purchasePrice = product.price
    const currentPrice = Number((product.price * (1 + (Math.random() - 0.5) * 0.06)).toFixed(2))
    const timestamp = new Date().toISOString()

    setPortfolios(prev => prev.map(portfolio => {
      if (portfolio.id !== primaryPortfolio.id) {
        return portfolio
      }

      const existing = portfolio.items.find(item => item.ticker === product.ticker && item.itemType === normalizedType)

      if (existing) {
        return {
          ...portfolio,
          items: portfolio.items.map(item => item.id === existing.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                purchasePrice: Number((((item.purchasePrice * item.quantity) + (purchasePrice * quantity)) / (item.quantity + quantity)).toFixed(2)),
                currentPrice,
                updatedAt: timestamp,
                priceHistory: [...item.priceHistory.slice(-29), currentPrice],
              }
            : item),
        }
      }

      return {
        ...portfolio,
        items: [
          ...portfolio.items,
          {
            id: `mock-${Date.now()}`,
            portfolioId: portfolio.id,
            itemType: normalizedType,
            ticker: product.ticker,
            quantity,
            purchasePrice,
            purchaseDate: new Date().toISOString().split('T')[0],
            currentPrice,
            createdAt: timestamp,
            updatedAt: timestamp,
            sector: product.sector,
            region: product.region,
            realizedPnL: 0,
            priceHistory: buildPriceHistory(currentPrice),
          },
        ],
      }
    }))

    setToast({ message: `Added ${product.ticker} to ${primaryPortfolio.name}`, type: 'success' })
  }

  const handleSellHolding = (ticker: string) => {
    setToast({ message: `Sell order prepared for ${ticker}`, type: 'info' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <Sparkles className="text-blue-600" size={48} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Portfolio command center</p>
            <h1 className="text-4xl font-bold text-gray-900 mt-2">Institutional-style portfolio overview</h1>
            <p className="text-gray-600 mt-2">Monitor P&L, distribution, and execution-ready trading ideas from one place.</p>
          </div>
          <Link to="/add-portfolio" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            <Briefcase size={16} />
            New portfolio
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Net asset value test</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Wallet size={20} /></div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Cash invested</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><ArrowUpRight size={20} /></div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Gain / loss</p>
                <p className={`text-2xl font-semibold mt-2 ${totalGainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
              </div>
              <div className={`rounded-2xl p-3 ${totalGainLoss >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><ArrowUpRight size={20} /></div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Holdings tracked</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{allItems.length}</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600"><PieChart size={20} /></div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr] mb-8">
          <PnLOverview breakdown={breakdownRows} totals={totals} />
          {/* <div className="card border border-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Allocation view</p>
                <h2 className="text-xl font-bold text-gray-900 mt-2">Asset distribution</h2>
              </div>
              <div className="inline-flex rounded-full bg-slate-100 p-1">
                {(['allocation', 'region', 'country'] as BreakdownMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSelectedBreakdown(mode)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${selectedBreakdown === mode ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {allocationRows.slice(0, 3).map(item => (
                <div key={item.type} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.type}</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">${item.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                  <p className="text-sm text-slate-500">{item.percentage.toFixed(1)}%</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <PieBreakdownChart title={breakdownTitle} data={breakdownData} />
            </div>
          </div> */}
          <p>does it go here</p>
          <PerformanceChart data={historicalData} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr] mb-8">
          {/* <PerformanceChart data={historicalData} /> */}
          <HoldingsFluctuationList holdings={holdings} onSell={handleSellHolding} />
        </div>

        <div className="card border border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Buy flow</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Add positions to your portfolio</h2>
              <p className="text-gray-600 mt-2">Switch between product types and mock in a new trade in seconds while live market data is wired in later.</p>
            </div>
            <div className="inline-flex rounded-full bg-slate-100 p-1">
              {(['stock', 'bond', 'etf', 'other'] as ProductCategory[]).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${selectedCategory === category ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PRODUCT_OPTIONS.filter(product => product.category === selectedCategory).map(product => (
              <div key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{product.ticker}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {product.category}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">{product.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>Reference price</span>
                  <span className="font-semibold text-gray-900">${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <button
                  onClick={() => handleBuyProduct(product)}
                  className="mt-4 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Buy 10 units
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            Mock trades are currently staged for demo purposes. Connect a live pricing feed and this panel will become your execution interface.
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
