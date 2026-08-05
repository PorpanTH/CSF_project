import { useMemo, useState } from 'react'
import { Search, ArrowUpDown } from 'lucide-react'
import { MarketEquity } from '../types'
import { STATUS } from '../theme/colors'

interface MarketExplorerProps {
  equities: MarketEquity[]
  onBuy: (equity: MarketEquity) => void
}

type SortKey = 'ticker' | 'price' | 'changePercent' | 'sector'
type ProductCategory = 'stock' | 'bond' | 'etf' | 'other' | 'all'

const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'All Products' },
  { id: 'stock', label: 'Stocks' },
  { id: 'bond', label: 'Bonds' },
  { id: 'etf', label: 'ETFs & ETPs' },
  { id: 'other', label: 'Alternatives' },
]

const getCategoryFromName = (name: string): ProductCategory => {
  const lower = name.toLowerCase()
  if (lower.includes('etf') || lower.includes('etp')) return 'etf'
  if (lower.includes('bond')) return 'bond'
  if (lower.includes('fund')) return 'other'
  if (lower.includes('credit')) return 'other'
  return 'stock'
}

export const MarketExplorer = ({ equities, onBuy }: MarketExplorerProps) => {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('ticker')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [category, setCategory] = useState<ProductCategory>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = equities.filter(eq => {
      const matchesSearch = !q || eq.ticker.toLowerCase().includes(q) || eq.name.toLowerCase().includes(q)
      const eqCategory = getCategoryFromName(eq.name)
      const matchesCategory = category === 'all' || eqCategory === category
      return matchesSearch && matchesCategory
    })
    const sorted = [...list].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [equities, query, sortKey, sortDir, category])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by ticker or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field pl-9 w-full"
        />
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
            style={category === cat.id ? { backgroundColor: STATUS['good'] } : undefined}
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
                  onClick={() => toggleSort('sector')}
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors ${
                    sortKey === 'sector' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    Sector
                    {sortKey === 'sector' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('price')}
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors ${
                    sortKey === 'price' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    Price
                    {sortKey === 'price' && (
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
                    % Change
                    {sortKey === 'changePercent' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="px-2 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(eq => {
                const positive = eq.changePercent >= 0
                return (
                  <tr key={eq.ticker} className="border-b border-gray-100 last:border-0 text-left">
                    <td className="px-2 py-2.5">
                      <p className="font-semibold text-gray-900">{eq.ticker}</p>
                      <p className="text-xs text-gray-500">{eq.name}</p>
                    </td>
                    <td className="px-2 py-2.5 text-gray-700">{eq.sector}</td>
                    <td className="px-2 py-2.5 font-medium text-gray-900">
                      ${eq.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-2.5 font-medium" style={{ color: positive ? STATUS.goodText : STATUS.critical }}>
                      {positive ? '+' : ''}{eq.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-2 py-2.5 flex items-center justify-center">
                      <button
                        onClick={() => onBuy(eq)}
                        className="px-3 py-1.5 text-xs font-medium text-white rounded-md items-center justify-center"
                        style={{ backgroundColor: STATUS['good'] }}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-6">No equities match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
