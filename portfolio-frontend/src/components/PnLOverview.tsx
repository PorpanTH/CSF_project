import { TrendingDown, TrendingUp } from 'lucide-react'
import { PnLByAssetClass } from '../types'
import { STATUS } from '../theme/colors'

interface PnLOverviewProps {
  total: number
  breakdown: PnLByAssetClass[]
}

const fmt = (n: number) => `${n >= 0 ? '+' : '-'}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const SignedValue = ({ value }: { value: number }) => (
  <span style={{ color: value >= 0 ? STATUS.goodText : STATUS.critical }} className="font-semibold">
    {fmt(value)}
  </span>
)

export const PnLOverview = ({ total, breakdown }: PnLOverviewProps) => {
  const totalPositive = total >= 0

  return (
    <div className="card border border-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Performance summary</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">Profit &amp; Loss overview</h2>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Total P/L</p>
            <p className="text-4xl font-semibold mt-2">{fmt(total)}</p>
          </div>
          <div className="rounded-full bg-white/10 p-3">
            {totalPositive ? <TrendingUp size={20} className="text-emerald-400" /> : <TrendingDown size={20} className="text-rose-400" />}
          </div>
        </div>
        <p className="mt-5 text-sm text-slate-400">Combined P/L across all positions in the portfolio.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Breakdown by asset class</h3>
        <table className="w-full text-sm min-w-[300px]">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-2 font-medium">Asset Class</th>
              <th className="pb-2 font-medium text-right">P/L</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map(row => (
              <tr key={row.assetClass} className="border-b border-gray-100 last:border-0">
                <td className="py-3 font-medium text-gray-900">{row.assetClass.toUpperCase()}</td>
                <td className="py-3 text-right"><SignedValue value={row.pnl} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
