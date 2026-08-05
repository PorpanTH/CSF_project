import { HoldingFluctuation } from '../types'
import { STATUS, BRAND } from '../theme/colors'
import { Search, ArrowUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'

interface HoldingsFluctuationListProps {
  holdings: HoldingFluctuation[]
  onSell: (holding: HoldingFluctuation) => void
}

type SortKey = 'ticker' | 'quantity' | 'purchasePrice' | 'currentPrice' | 'unrealizedPnl' | 'changePercent'
type ProductCategory = 'stock' | 'bond' | 'etf' | 'other' | 'all'

type HoldingRow = {
  key: string
  ticker: string
  name: string
  itemType: HoldingFluctuation['itemType']
  quantity: number
  purchasePrice: number
  currentPrice: number
  changePercent: number
  unrealizedPnl: number
  priceHistory: number[]
}

type HoldingAccumulator = HoldingRow & {
  totalCost: number
}

const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'All Products' },
  { id: 'stock', label: 'Stocks' },
  { id: 'bond', label: 'Bonds' },
  { id: 'etf', label: 'ETFs & ETPs' },
  { id: 'other', label: 'Alternatives' },
]

export const HoldingsFluctuationList = ({ holdings, onSell }: HoldingsFluctuationListProps) => {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('ticker')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [category, setCategory] = useState<ProductCategory>('all')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()

    const grouped = holdings.reduce((acc, holding) => {
      const key = `${holding.ticker}:${holding.itemType}`
      if (!acc[key]) {
        acc[key] = {
          key,
          ticker: holding.ticker,
          name: holding.name,
          itemType: holding.itemType,
          quantity: 0,
          purchasePrice: 0,
          currentPrice: holding.currentPrice,
          changePercent: 0,
          unrealizedPnl: 0,
          priceHistory: holding.priceHistory,
          totalCost: 0,
        }
      }

      acc[key].quantity += holding.quantity
      acc[key].totalCost += holding.purchasePrice * holding.quantity
      acc[key].currentPrice = holding.currentPrice
      acc[key].unrealizedPnl += holding.unrealizedPnl
      return acc
    }, {} as Record<string, HoldingAccumulator>)

    const normalized = Object.values(grouped).map((holding) => {
      const avgCostBasis = holding.quantity > 0 ? holding.totalCost / holding.quantity : 0
      const changePercent = avgCostBasis > 0
        ? ((holding.currentPrice - avgCostBasis) / avgCostBasis) * 100
        : 0

      return {
        key: holding.key,
        ticker: holding.ticker,
        name: holding.name,
        itemType: holding.itemType,
        quantity: holding.quantity,
        purchasePrice: avgCostBasis,
        currentPrice: holding.currentPrice,
        changePercent,
        unrealizedPnl: holding.unrealizedPnl,
        priceHistory: holding.priceHistory,
      }
    })

    const list = normalized.filter((holding) => {
      const matchesSearch = holding.ticker.toLowerCase().includes(q)
      const matchesCategory = category === 'all' || holding.itemType === category
      return matchesSearch && matchesCategory
    })

    const sorted = [...list].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'string' ? av.localeCompare(String(bv)) : Number(av) - Number(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return sorted
  }, [holdings, query, sortKey, sortDir, category])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div>
      <div className="flex gap-3 items-center mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ticker..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap">
          {holdings.length} holdings
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-xs text-gray-500 self-center">Product type:</span>
        {PRODUCT_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              category === cat.id ? 'border-transparent text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            style={category === cat.id ? { backgroundColor: BRAND[700] } : undefined}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 sticky top-0 bg-white">
                <th
                  onClick={() => toggleSort('ticker')}
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors ${
                    sortKey === 'ticker' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    Ticker
                    {sortKey === 'ticker' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('quantity')}
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors ${
                    sortKey === 'quantity' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    Qty
                    {sortKey === 'quantity' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('purchasePrice')}
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors ${
                    sortKey === 'purchasePrice' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    Cost Basis
                    {sortKey === 'purchasePrice' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('currentPrice')}
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors ${
                    sortKey === 'currentPrice' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    Price
                    {sortKey === 'currentPrice' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('changePercent')}
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors ${
                    sortKey === 'changePercent' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    % Day Change
                    {sortKey === 'changePercent' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('unrealizedPnl')}
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors ${
                    sortKey === 'unrealizedPnl' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    P/L
                    {sortKey === 'unrealizedPnl' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="px-2 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((holding) => {
                const positive = holding.changePercent >= 0
                const pnlPositive = holding.unrealizedPnl >= 0
                const color = positive ? STATUS.goodText : STATUS.critical

                return (
                  <tr key={holding.key} className="border-b border-gray-100 last:border-0 text-left">
                    <td className="px-2 py-2.5">
                      <p className="font-semibold text-gray-900">{holding.ticker}</p>
                      <p className="text-xs text-gray-500 capitalize">{holding.name}</p>
                    </td>
                    <td className="px-2 py-2.5 text-gray-700">{holding.quantity}</td>
                    <td className="px-2 py-2.5 font-medium text-gray-900">
                      ${holding.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-2.5 font-medium text-gray-900">
                      ${holding.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-2.5 font-medium" style={{ color }}>
                      {positive ? '+' : ''}{holding.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-2 py-2.5 font-medium" style={{ color: pnlPositive ? STATUS.goodText : STATUS.critical }}>
                      {pnlPositive ? '+' : ''}${holding.unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-2.5 flex items-center justify-center">
                      <button
                        onClick={() => onSell(holding)}
                        className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors hover:opacity-90"
                        style={{ backgroundColor: BRAND[700] }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && holdings.length > 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-6">No holdings match your search.</td></tr>
              )}
              {holdings.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-6">No holdings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
