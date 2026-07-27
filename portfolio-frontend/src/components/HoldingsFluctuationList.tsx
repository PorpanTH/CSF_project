import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { HoldingFluctuation } from '../types'
import { STATUS, BRAND } from '../theme/colors'

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
    <div className="card">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Equity Holdings — Price Fluctuation</h3>
        <p className="text-sm text-gray-500">Trailing 30 sessions</p>
      </div>
      <div className="divide-y divide-gray-100">
        {holdings.map(holding => {
          const positive = holding.changePercent >= 0
          const color = positive ? STATUS.good : STATUS.critical
          return (
            <div key={holding.ticker} className="flex items-center justify-between py-3 gap-4">
              <div className="w-24 shrink-0">
                <p className="font-semibold text-gray-900">{holding.ticker}</p>
                <p className="text-xs text-gray-500">{holding.quantity} shares</p>
              </div>
              <div className="w-20 shrink-0 text-sm text-gray-700">
                ${holding.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <Sparkline history={holding.priceHistory} color={color} />
              <div className="w-20 text-right shrink-0">
                <span className="font-semibold" style={{ color: positive ? STATUS.goodText : STATUS.critical }}>
                  {positive ? '+' : ''}{holding.changePercent.toFixed(2)}%
                </span>
              </div>
              <button
                onClick={() => onSell(holding.ticker)}
                className="px-3 py-1 text-xs font-medium text-white rounded-md shrink-0"
                style={{ backgroundColor: BRAND[700] }}
              >
                Sell
              </button>
            </div>
          )
        })}
        {holdings.length === 0 && (
          <p className="text-center text-gray-400 py-6">No equity holdings yet — buy some from the market below.</p>
        )}
      </div>
    </div>
  )
}
