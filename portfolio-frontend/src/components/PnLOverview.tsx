import { TrendingUp, TrendingDown } from 'lucide-react'
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
    <div className="card border-l-4" style={{ borderColor: positive ? STATUS.good : STATUS.critical }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2" style={{ color: positive ? STATUS.goodText : STATUS.critical }}>
            {fmt(value)}
          </p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: positive ? '#eafbea' : '#fdecec' }}>
          {positive
            ? <TrendingUp size={22} style={{ color: STATUS.good }} />
            : <TrendingDown size={22} style={{ color: STATUS.critical }} />}
        </div>
      </div>
    </div>
  )
}

export const PnLOverview = ({ breakdown, totals }: PnLOverviewProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Profit &amp; Loss Overview</h2>
        <p className="text-sm text-gray-500">Realized (closed) vs. floating (mark-to-market) P/L</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <HeroTile label="Total P/L" value={totals.total} />
        <HeroTile label="Realized P/L" value={totals.realized} />
        <HeroTile label="Floating P/L" value={totals.floating} />
      </div>

      <div className="card overflow-x-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Breakdown by Asset Class</h3>
        <table className="w-full text-sm">
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
