import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { HoldingFluctuation } from '../types'
import { STATUS } from '../theme/colors'

interface HoldingsFluctuationListProps {
  holdings: HoldingFluctuation[]
  onSell: (ticker: string) => void
}

const Sparkline = ({ history, color }: { history: number[]; color: string }) => (
  <div className="w-28 h-10">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={history.map((v, i) => ({ i, v }))}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

export const HoldingsFluctuationList = ({ holdings, onSell }: HoldingsFluctuationListProps) => {
  return (
    <div className="card border border-slate-200 flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Portfolio sell desk</h3>
          <p className="text-sm text-gray-500 mt-1">Professional watchlist for monitoring holdings and preparing exits</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {holdings.length} holdings
        </div>
      </div>
      <div className="space-y-3 overflow-y-auto flex-1 pr-2" style={{ maxHeight: '500px' }}>
        {holdings.map(holding => {
          const positive = holding.changePercent >= 0
          const color = positive ? STATUS.good : STATUS.critical
          return (
            <div key={holding.ticker} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex-shrink-0">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{holding.ticker}</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      {holding.quantity} shares
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Price: ${holding.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-500">Cost basis: ${holding.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkline history={holding.priceHistory} color={color} />

                  <div className="rounded-xl px-3 py-2 text-right min-w-[96px]">
                    <p className={`text-sm font-semibold ${holding.unrealizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {holding.unrealizedPnl >= 0 ? '+' : ''}${holding.unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">P/L</p>
                  </div>
                  <button
                    onClick={() => onSell(holding.ticker)}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {holdings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-gray-500">
            No holdings are currently being monitored for exit planning.
          </div>
        )}
      </div>
    </div>
  )
}
