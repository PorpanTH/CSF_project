import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { PnLRange } from '../types'
import { STATUS, INK, BRAND } from '../theme/colors'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface AccumulatedPnLChartProps {
  portfolioId: string
  endValue: number
}

interface PnLDataPoint {
  date: string
  accumulated: number
}

const RANGE_OPTIONS: { key: PnLRange; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'ytd', label: 'YTD' }
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value as number
    const isPositive = value >= 0
    return (
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xl">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold mt-1" style={{ color: isPositive ? STATUS.goodText : STATUS.critical }}>
          {isPositive ? '+' : '-'}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </p>
      </div>
    )
  }
  return null
}

export const AccumulatedPnLChart = ({ portfolioId }: AccumulatedPnLChartProps) => {
  const [range, setRange] = useState<PnLRange>('ytd')
  const [data, setData] = useState<PnLDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAccumulatedPnL = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/portfolios/${portfolioId}/accumulated-pnl?range=${range}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch accumulated PnL data')
        }
        const pnlData = await response.json()
        setData(pnlData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    if (portfolioId) {
      fetchAccumulatedPnL()
    }
  }, [range, portfolioId])

  const isPositive = data.length > 0 && data[data.length - 1].accumulated >= 0
  const lineColor = isPositive ? STATUS.good : STATUS.critical

  return (
    <div className="card border border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            {isPositive ? (
              <TrendingUp size={20} className="text-emerald-600" />
            ) : (
              <TrendingDown size={20} className="text-rose-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Performance Trend</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">Accumulated P/L</h2>
          </div>
        </div>
      </div>

      {/* Range Selector */}
      <div className="flex gap-2 flex-wrap mb-4">
        {RANGE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setRange(opt.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              range === opt.key
                ? 'text-white shadow-md'
                : 'text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200'
            }`}
            style={range === opt.key ? { backgroundColor: BRAND[700] } : undefined}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart Container - Grows to fill space */}
      <div className="flex-1 flex flex-col min-h-0">
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3">
            <div className="w-8 h-8 border-3 border-gray-300 border-t-[#b91c1c] rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading chart data…</p>
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-red-50 rounded-[24px] border border-red-200">
            <div className="rounded-full bg-red-100 p-2 text-[#b91c1c]">
              <AlertTriangle size={18} />
            </div>
            <p className="text-[#b91c1c] font-medium">Unable to load chart</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#fff7f7] rounded-[24px] border border-[#f5c3c3]">
            <div className="rounded-full bg-red-100 p-2 text-[#b91c1c]">
              {/* <ChartNoAxesCombined size={18} /> */}
            </div>
            <p className="text-[#991b1b] font-medium">No historical data yet</p>
            <p className="text-sm text-[#9a5d5d]">Start recording daily snapshots to build your P/L chart</p>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={INK.gridline} vertical={false} opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke={INK.muted}
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={INK.muted}
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <ReferenceLine
                y={0}
                stroke={INK.baseline}
                strokeDasharray="5 5"
                strokeOpacity={0.7}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Area
                type="monotone"
                dataKey="accumulated"
                stroke={lineColor}
                strokeWidth={3}
                fill="url(#pnlFill)"
                dot={false}
                name="Accumulated P/L"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
