import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronLeft } from 'lucide-react'
import { PortfolioItem, NavByAssetClass } from '../types'

interface AssetAllocationChartProps {
  navByAssetClass: NavByAssetClass[]
  items: PortfolioItem[]
  totalValue: number
}

const COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']

const aggregateSmallAssets = (data: Array<{ name: string; value: number }>, threshold = 0.05) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const major: Array<{ name: string; value: number }> = []
  let otherValue = 0

  data.forEach(item => {
    if (item.value / total >= threshold) {
      major.push(item)
    } else {
      otherValue += item.value
    }
  })

  if (otherValue > 0) {
    major.push({ name: 'Other', value: otherValue })
  }

  return major.sort((a, b) => b.value - a.value)
}

export const AssetAllocationChart = ({ navByAssetClass, items, totalValue }: AssetAllocationChartProps) => {
  const [selectedAssetClass, setSelectedAssetClass] = useState<string | null>(null)

  const assetClassData = navByAssetClass.map(ac => ({
    name: ac.assetClass,
    value: ac.value
  }))

  const getAssetsInClass = (assetClass: string) => {
    return items
      .filter(item => item.assetClass === assetClass)
      .map(item => {
        const value = item.quantity * item.currentPrice
        return {
          name: item.ticker,
          value,
          itemType: item.itemType
        }
      })
  }

  const drilldownData = selectedAssetClass ? aggregateSmallAssets(getAssetsInClass(selectedAssetClass)) : assetClassData

  const handlePieClick = (data: any) => {
    if (!selectedAssetClass) {
      setSelectedAssetClass(data.name)
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

      <div className="flex flex-row gap-8">
        <div className="flex-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={drilldownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={handlePieClick}
                style={{ cursor: !selectedAssetClass ? 'pointer' : 'default' }}
              >
                {drilldownData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
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

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-500">
                <th className="pb-2 font-medium">
                  {selectedAssetClass ? `Assets in ${selectedAssetClass.toUpperCase()}` : 'Asset Class'}
                </th>
                <th className="pb-2 font-medium text-right">Value</th>
                <th className="pb-2 font-medium text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {drilldownData.map(row => (
                <tr key={row.name} className="border-b border-gray-800 last:border-0">
                  <td className="py-3 font-medium text-white">{row.name.toUpperCase()}</td>
                  <td className="py-3 text-right text-gray-300">${row.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td className="py-3 text-right text-gray-300">{((row.value / totalValue) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
