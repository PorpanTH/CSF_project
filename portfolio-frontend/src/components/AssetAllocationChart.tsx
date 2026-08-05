import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronLeft } from 'lucide-react'
import { PortfolioItem, NavByAssetClass } from '../types'

interface AssetAllocationChartProps {
  navByAssetClass: NavByAssetClass[]
  items: PortfolioItem[]
  totalValue: number
}

const ASSET_CLASS_META: Record<string, { label: string; color: string }> = {
  stock: { label: 'Stocks', color: '#111111' },
  bond: { label: 'Bonds', color: '#7f1d1d' },
  cash: { label: 'Cash', color: '#b91c1c' },
  etf: { label: 'ETFs', color: '#dc2626' },
  other: { label: 'Other', color: '#fecaca' },
}

const COLORS = ['#111111', '#7f1d1d', '#b91c1c', '#dc2626', '#ef4444', '#fecaca', '#f8fafc', '#991b1b']

const aggregateSmallAssets = (data: Array<{ name: string; value: number; color?: string }>, threshold = 0.05) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const major: Array<{ name: string; value: number; color?: string }> = []
  let otherValue = 0

  data.forEach(item => {
    if (item.value / total >= threshold) {
      major.push(item)
    } else {
      otherValue += item.value
    }
  })

  if (otherValue > 0) {
    major.push({ name: 'Other', value: otherValue, color: '#fecaca' })
  }

  return major.sort((a, b) => b.value - a.value)
}

const toAssetKey = (value?: string) => (value ?? 'other').toLowerCase()

export const AssetAllocationChart = ({ navByAssetClass, items, totalValue }: AssetAllocationChartProps) => {
  const [selectedAssetClass, setSelectedAssetClass] = useState<string | null>(null)

  const assetClassData = useMemo(() => navByAssetClass.map(ac => {
    const key = toAssetKey(ac.assetClass)
    const meta = ASSET_CLASS_META[key] ?? { label: ac.assetClass, color: '#b91c1c' }

    return {
      key,
      name: meta.label,
      value: ac.value,
      color: meta.color,
    }
  }), [navByAssetClass])

  const getAssetsInClass = (assetClass: string) => {
    return items
      .filter(item => toAssetKey(item.assetClass ?? item.itemType) === assetClass)
      .map(item => {
        const value = item.quantity * item.currentPrice
        return {
          name: item.ticker,
          value,
          itemType: item.itemType,
        }
      })
  }

  const drilldownData = selectedAssetClass ? aggregateSmallAssets(getAssetsInClass(selectedAssetClass)) : assetClassData
  const selectedAssetClassLabel = selectedAssetClass ? ASSET_CLASS_META[selectedAssetClass]?.label ?? selectedAssetClass : null

  const handlePieClick = (data: any) => {
    if (!selectedAssetClass) {
      setSelectedAssetClass(data.key)
    }
  }

  const handleBack = () => {
    setSelectedAssetClass(null)
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-black p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Portfolio Composition</p>
          <h2 className="text-2xl font-bold text-white mt-2">Asset Allocation</h2>
        </div>
        {selectedAssetClass && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-medium text-sm transition-all"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
      </div>

      <div className="rounded-[28px] border border-black/10 bg-gradient-to-br from-[#fff7f7] to-white p-6 lg:flex lg:gap-8">
        <div className="flex-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={drilldownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={108}
                innerRadius={54}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={3}
                dataKey="value"
                onClick={handlePieClick}
                style={{ cursor: !selectedAssetClass ? 'pointer' : 'default' }}
              >
                {drilldownData.map((row, index) => (
                  <Cell key={`cell-${index}`} fill={row.color ?? COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                contentStyle={{ background: '#000', border: '1px solid #4b5563', borderRadius: 6 }}
                itemStyle={{ color: '#e5e7eb' }}
                labelStyle={{ color: '#9ca3af' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex-1 overflow-x-auto lg:mt-0">
          <div className="rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="pb-2 font-medium">
                    {selectedAssetClassLabel ? `Assets in ${selectedAssetClassLabel}` : 'Asset Class'}
                  </th>
                  <th className="pb-2 font-medium text-right">Value</th>
                  <th className="pb-2 font-medium text-right">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {drilldownData.map(row => (
                  <tr key={row.name} className="border-b border-zinc-100 last:border-0">
                    <td className="py-3 font-semibold text-zinc-900">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color ?? '#b91c1c' }} />
                        {String(row.name).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right text-zinc-700">${row.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="py-3 text-right text-zinc-700">{((row.value / totalValue) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
