import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowUpDown, Loader } from 'lucide-react'
import { MarketEquity } from '../types'
import { STATUS, BRAND } from '../theme/colors'
import { marketAPI } from '../services/api'

interface MarketExplorerProps {
  onBuy: (equity: MarketEquity) => void
}

type SortKey = 'name' | 'price' | 'changePercent'
type ProductCategory = 'stock' | 'bond' | 'etf' | 'other' | 'all'

const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'All Products' },
  { id: 'stock', label: 'Stocks' },
  { id: 'bond', label: 'Bonds' },
  { id: 'etf', label: 'ETFs & ETPs' },
  { id: 'other', label: 'Alternatives' },
]

export const MarketExplorer = ({ onBuy }: MarketExplorerProps) => {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [results, setResults] = useState<MarketEquity[]>([])
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [category, setCategory] = useState<ProductCategory>('all')

  const fetchAndEnrich = async (searchQuery: string, searchCategory: ProductCategory) => {
    try {
      setLoading(true)
      const symbols = await marketAPI.searchSymbols(searchQuery, searchCategory, 25)
      if (symbols.length === 0) {
        setResults([])
        return
      }

      const tickers = symbols.map(s => s.ticker)
      // An explicit search gets a live-queried quote rather than the shared
      // cache used for the default listing (which is refreshed frequently
      // enough on its own and needs to stay cache-backed to avoid rate limits).
      const quotes = await marketAPI.getQuotes(tickers, searchQuery.trim() !== '')

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

  // Re-fetch only on an explicit search submit or a category change. Typing
  // alone no longer triggers anything — a keystroke-debounced search was
  // firing a live (cache-bypassing) quote fetch for ~25 fuzzy-matched
  // tickers on every character typed, which is what tripped yfinance's rate
  // limit while typing out a single ticker.
  useEffect(() => {
    fetchAndEnrich(submittedQuery, category)
  }, [submittedQuery, category])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (value.trim() === '') {
      // Clearing the box returns to the default listing, which is already
      // cached, so that can happen immediately without a Search click.
      setSubmittedQuery('')
    }
  }

  const submitSearch = () => {
    setSubmittedQuery(query.trim())
  }

  const sorted = useMemo(() => {
    return [...results].sort((a, b) => {
      const av = sortKey === 'name' ? a.ticker : a[sortKey]
      const bv = sortKey === 'name' ? b.ticker : b[sortKey]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [results, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="w-full">
      <div className="flex gap-3 items-center mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Type a full ticker or name, then press Search..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitSearch() }}
            className="input-field pl-9 w-full"
          />
        </div>
        <button
          onClick={submitSearch}
          disabled={loading}
          className="btn text-white disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          style={{ backgroundColor: BRAND[700] }}
        >
          Search
        </button>
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
                  onClick={() => toggleSort('name')}
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors text-left ${
                    sortKey === 'name' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    Ticker
                    {sortKey === 'name' && (
                      <ArrowUpDown size={14} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('price')}
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors text-left ${
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
                  className={`px-2 py-2 font-medium cursor-pointer select-none transition-colors text-left ${
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
                <th className="px-2 py-2 font-medium"></th>
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
                  <tr key={eq.ticker} className="border-b border-gray-100 last:border-0 text-left">
                    <td className="px-2 py-2.5">
                      <p className="font-semibold text-gray-900">{eq.ticker}</p>
                      <p className="text-xs text-gray-500">{eq.name}</p>
                    </td>
                    <td className="px-2 py-2.5 font-medium text-gray-900">
                      ${eq.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-2.5 font-medium" style={{ color: positive ? STATUS.goodText : STATUS.critical }}>
                      {positive ? '+' : ''}{eq.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-2 py-2.5 flex items-center justify-center">
                      <button
                        onClick={() => onBuy(eq)}
                        className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors hover:opacity-90"
                        style={{ backgroundColor: BRAND[700] }}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : submittedQuery.trim() ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-6">No results found.</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-6">Type a ticker or company name and press Search</td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
