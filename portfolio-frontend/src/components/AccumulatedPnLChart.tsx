import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { PnLRange } from '../types'
import { getAccumulatedPnLSeries } from '../services/mockData'
import { STATUS, INK, BRAND } from '../theme/colors'

const RANGE_OPTIONS: { key: PnLRange; label: string }[] = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'ytd', label: 'YTD' },
  { key: '1y', label: '1Y' },
  { key: '2y', label: '2Y' },
  { key: '3y', label: '3Y' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value as number
    return (
      <div className="bg-white p-3 rounded border border-gray-300 shadow-lg">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-sm font-bold" style={{ color: value >= 0 ? STATUS.goodText : STATUS.critical }}>
          {value >= 0 ? '+' : '-'}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </p>
      </div>
    )
  }
  return null
}

export const AccumulatedPnLChart = () => {
  const [range, setRange] = useState<PnLRange>('ytd')
  const data = useMemo(() => getAccumulatedPnLSeries(range), [range])
  const isPositive = data.length > 0 && data[data.length - 1].accumulated >= 0
  const lineColor = isPositive ? STATUS.good : STATUS.critical

  return (
    <div className="card mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-gray-900">Accumulated P/L</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 self-start">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === opt.key ? 'text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
              style={range === opt.key ? { backgroundColor: BRAND[700] } : undefined}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={INK.gridline} vertical={false} />
          <XAxis dataKey="date" stroke={INK.muted} style={{ fontSize: '12px' }} tickLine={false} />
          <YAxis
            stroke={INK.muted}
            style={{ fontSize: '12px' }}
            tickLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
          />
          <ReferenceLine y={0} stroke={INK.baseline} strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="accumulated"
            stroke={lineColor}
            strokeWidth={2}
            fill="url(#pnlFill)"
            dot={false}
            name="Accumulated P/L"
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
