import { TrendingDown, TrendingUp } from 'lucide-react'
import { PnLByAssetClass } from '../types'
import { STATUS } from '../theme/colors'

interface PnLOverviewProps {
  breakdown: PnLByAssetClass[]
  totals: { realized: number; floating: number; total: number }
}

const fmt = (n: number) => `${n >= 0 ? '+' : '-'}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const SignedValue = ({ value }: { value: number }) => (
  <span style={{ color: value >= 0 ? STATUS.goodText : STATUS.critical }} className="font-semibold">
    {fmt(value)}
  </span>
)

const HeroTile = ({ label, value }: { label: string; value: number }) => {
  const positive = value >= 0
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-semibold mt-2" style={{ color: positive ? STATUS.goodText : STATUS.critical }}>
            {fmt(value)}
          </p>
        </div>
        <div className="rounded-xl p-2.5" style={{ backgroundColor: positive ? '#eafbea' : '#fdecec' }}>
          {positive ? <TrendingUp size={18} style={{ color: STATUS.good }} /> : <TrendingDown size={18} style={{ color: STATUS.critical }} />}
        </div>
      </div>
    </div>
  )
}

export const PnLOverview = ({ breakdown, totals }: PnLOverviewProps) => {
  const totalPositive = totals.total >= 0

  return (
    <div className="card border border-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Performance summary</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">Profit &amp; Loss overview</h2>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Realized vs floating
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr,0.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total P/L</p>
              <p className="text-4xl font-semibold mt-2">{fmt(totals.total)}</p>
            </div>
            <div className="rounded-full bg-white/10 p-3">
              {totalPositive ? <TrendingUp size={20} className="text-emerald-400" /> : <TrendingDown size={20} className="text-rose-400" />}
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-400">Combined performance across all open and closed positions in the portfolio.</p>
        </div>
        <div className="grid gap-4">
          <HeroTile label="Realized P/L" value={totals.realized} />
          <HeroTile label="Floating P/L" value={totals.floating} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Breakdown by asset class</h3>
        <table className="w-full text-sm min-w-[420px]">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-2 font-medium">Asset Class</th>
              <th className="pb-2 font-medium text-right">Realized</th>
              <th className="pb-2 font-medium text-right">Floating</th>
              <th className="pb-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map(row => (
              <tr key={row.assetClass} className="border-b border-gray-100 last:border-0">
                <td className="py-3 font-medium text-gray-900">{row.assetClass}</td>
                <td className="py-3 text-right"><SignedValue value={row.realized} /></td>
                <td className="py-3 text-right"><SignedValue value={row.floating} /></td>
                <td className="py-3 text-right"><SignedValue value={row.realized + row.floating} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
