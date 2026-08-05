import { HoldingFluctuation } from '../types'
import { STATUS, BRAND } from '../theme/colors'
import { Search, ArrowUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'

interface HoldingsFluctuationListProps {
  holdings: HoldingFluctuation[]
  onSell: (ticker: string) => void
}

type SortKey = 'ticker' | 'quantity' | 'currentPrice' | 'unrealizedPnl' | 'changePercent'

export const HoldingsFluctuationList = ({ holdings, onSell }: HoldingsFluctuationListProps) => {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('ticker')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()

    const grouped = holdings.reduce((acc, holding) => {
      const key = holding.ticker
      if (!acc[key]) {
        acc[key] = {
          ticker: holding.ticker,
          name: holding.name,
          quantity: 0,
          currentPrice: holding.currentPrice,
          changePercent: holding.changePercent,
          unrealizedPnl: 0,
        }
      }
      acc[key].quantity += holding.quantity
      acc[key].unrealizedPnl += holding.unrealizedPnl
      return acc
    }, {} as Record<string, {
      ticker: string
      name: string
      quantity: number
      currentPrice: number
      changePercent: number
      unrealizedPnl: number
    }>)

    const list = Object.values(grouped).filter((holding) => {
      return holding.ticker.toLowerCase().includes(q) || holding.name.toLowerCase().includes(q)
    })

    return [...list].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [holdings, query, sortKey, sortDir])

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
            placeholder="Search by ticker or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 whitespace-nowrap">
          {holdings.length} holdings
        </div>
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
                    % Change
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
                const color = positive ? STATUS.good : STATUS.critical
                return (
                  <tr key={holding.ticker} className="border-b border-gray-100 last:border-0 text-left">
                    <td className="px-2 py-2.5">
                      <p className="font-semibold text-gray-900">{holding.ticker}</p>
                      <p className="text-xs text-gray-500">{holding.name}</p>
                    </td>
                    <td className="px-2 py-2.5 text-gray-700">{holding.quantity}</td>
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
                        onClick={() => onSell(holding.ticker)}
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
                <tr><td colSpan={6} className="text-center text-gray-400 py-6">No holdings match your search.</td></tr>
              )}
              {holdings.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-400 py-6">No holdings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
