import { useEffect, useRef, useState } from 'react'
import { Search, ArrowUpDown, Loader } from 'lucide-react'
import { MarketEquity } from '../types'
import { STATUS, BRAND } from '../theme/colors'
import { marketAPI } from '../services/api'

interface MarketExplorerProps {
  onBuy: (equity: MarketEquity) => void
}

type SortKey = 'relevance' | 'name' | 'price' | 'changePercent'
type ProductCategory = 'stock' | 'bond' | 'etf' | 'other' | 'all'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price' },
  { key: 'changePercent', label: '% Day Change' },
]

const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'All Products' },
  { id: 'stock', label: 'Stocks' },
  { id: 'bond', label: 'Bonds' },
  { id: 'etf', label: 'ETFs & ETPs' },
  { id: 'other', label: 'Alternatives' },
]

export const MarketExplorer = ({ onBuy }: MarketExplorerProps) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MarketEquity[]>([])
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('relevance')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [category, setCategory] = useState<ProductCategory>('all')
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchAndEnrich = async (searchQuery: string, searchCategory: ProductCategory) => {
    try {
      setLoading(true)
      const symbols = await marketAPI.searchSymbols(searchQuery, searchCategory, 25)
      if (symbols.length === 0) {
        setResults([])
        return
      }

      const tickers = symbols.map(s => s.ticker)
      const quotes = await marketAPI.getQuotes(tickers)

      const enriched: MarketEquity[] = symbols.map(symbol => ({
        ticker: symbol.ticker,
        name: symbol.name,
        type: symbol.type as 'stock' | 'etf' | 'bond' | 'other',
        price: quotes[symbol.ticker]?.price ?? 0,
        changePercent: quotes[symbol.ticker]?.dayChangePercent ?? 0,
        priceHistory: [],
      }))

      setResults(enriched)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch default or filtered products whenever query or category changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    setLoading(true)

    debounceTimerRef.current = setTimeout(async () => {
      await fetchAndEnrich(query.trim(), category)
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, category])

  const sorted = sortKey === 'relevance'
    ? [...results]
    : [...results].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })

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
              <th className="px-2 pb-2 font-medium text-right">Price</th>
              <th className="px-2 pb-2 font-medium text-right">% Day Change</th>
              <th className="px-2 pb-2 font-medium text-right"></th>
            </tr>
            </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-6">
                  <Loader size={16} className="inline animate-spin mr-2" />
                  Searching...
                </td>
              </tr>
            ) : sorted.length > 0 ? (
              sorted.map(eq => {
                const positive = eq.changePercent >= 0
                return (
                  <tr key={eq.ticker} className="border-b border-gray-100 last:border-0">
                    <td className="px-2 py-2.5">
                      <p className="font-semibold text-gray-900">{eq.ticker}</p>
                      <p className="text-xs text-gray-500">{eq.name}</p>
                    </td>
                    <td className="px-2 py-2.5 text-right font-medium text-gray-900">
                      ${eq.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-2.5 text-right font-medium" style={{ color: positive ? STATUS.goodText : STATUS.critical }}>
                      {positive ? '+' : ''}{eq.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <button
                        onClick={() => onBuy(eq)}
                        className="px-3 py-1.5 text-xs font-medium text-white rounded-md"
                        style={{ backgroundColor: STATUS['good'] }}
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : query.trim() ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-6">No results found.</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-6">Type a ticker or company name to search NYSE-listed securities</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
