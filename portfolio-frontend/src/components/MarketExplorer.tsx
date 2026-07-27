import { useMemo, useState } from 'react'
import { Search, ArrowUpDown } from 'lucide-react'
import { MarketEquity } from '../types'
import { STATUS, BRAND } from '../theme/colors'

interface MarketExplorerProps {
  equities: MarketEquity[]
  onBuy: (equity: MarketEquity) => void
}

type SortKey = 'name' | 'price' | 'changePercent' | 'sector'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price' },
  { key: 'changePercent', label: '% Change' },
  { key: 'sector', label: 'Sector' },
]

export const MarketExplorer = ({ equities, onBuy }: MarketExplorerProps) => {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = equities.filter(eq =>
      !q || eq.ticker.toLowerCase().includes(q) || eq.name.toLowerCase().includes(q)
    )
    const sorted = [...list].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [equities, query, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-gray-900">Search Equities</h3>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ticker or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-9 w-full sm:w-72"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <span className="text-xs text-gray-500 self-center mr-1">Sort by:</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => toggleSort(opt.key)}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              sortKey === opt.key ? 'border-transparent text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            style={sortKey === opt.key ? { backgroundColor: BRAND[700] } : undefined}
          >
            {opt.label}
            {sortKey === opt.key && <ArrowUpDown size={11} />}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-2 pb-2 font-medium">Ticker</th>
              <th className="px-2 pb-2 font-medium">Sector</th>
              <th className="px-2 pb-2 font-medium">Region</th>
              <th className="px-2 pb-2 font-medium text-right">Price</th>
              <th className="px-2 pb-2 font-medium text-right">% Change</th>
              <th className="px-2 pb-2 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(eq => {
              const positive = eq.changePercent >= 0
              return (
                <tr key={eq.ticker} className="border-b border-gray-100 last:border-0">
                  <td className="px-2 py-2.5">
                    <p className="font-semibold text-gray-900">{eq.ticker}</p>
                    <p className="text-xs text-gray-500">{eq.name}</p>
                  </td>
                  <td className="px-2 py-2.5 text-gray-700">{eq.sector}</td>
                  <td className="px-2 py-2.5 text-gray-700">{eq.region}</td>
                  <td className="px-2 py-2.5 text-right font-medium text-gray-900">
                    ${eq.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-2.5 text-right font-medium" style={{ color: positive ? STATUS.goodText : STATUS.critical }}>
                    {positive ? '+' : ''}{eq.changePercent.toFixed(2)}%
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <button
                      onClick={() => onBuy(eq)}
                      className="px-3 py-1 text-xs font-medium text-white rounded-md"
                      style={{ backgroundColor: BRAND[700] }}
                    >
                      Buy
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-6">No equities match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
