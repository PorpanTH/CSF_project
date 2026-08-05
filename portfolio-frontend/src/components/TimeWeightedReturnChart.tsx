import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts'

interface NavDataPoint {
  date: string
  nav: number
}

interface ChartDataPoint extends NavDataPoint {
  returnPct: number
}

const TIMEFRAMES = [
  { key: '1M', label: '1M', days: 30 },
  { key: '3M', label: '3M', days: 90 },
  { key: '6M', label: '6M', days: 180 },
  { key: 'YTD', label: 'YTD', days: 0, isYtd: true },
  { key: '1Y', label: '1Y', days: 365 },
  { key: 'ALL', label: 'ALL', days: Infinity },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint
    return (
      <div className="bg-black border border-gray-600 p-3 rounded shadow-lg">
        <p className="text-xs text-gray-400">{data.date}</p>
        <p className="text-sm font-semibold text-white mt-1">${data.nav.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
        <p className={`text-sm font-bold mt-1 ${data.returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {data.returnPct >= 0 ? '+' : ''}{data.returnPct.toFixed(2)}%
        </p>
      </div>
    )
  }
  return null
}

export const TimeWeightedReturnChart = ({ portfolioId }: { portfolioId: string }) => {
  const [timeframe, setTimeframe] = useState('ALL')
  const [allData, setAllData] = useState<NavDataPoint[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch NAV history on load
  useEffect(() => {
    const fetchNavHistory = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = `/api/portfolios/${portfolioId}/nav-history`
        console.log('[TWR] Fetching NAV history from:', url)
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch NAV history`)
        // const data = await response.json()
        // console.log('[TWR] Fetched', data.length, 'records')
        // if (data.length > 0) {
        //   console.log('[TWR] Date range:', data[0].date, 'to', data[data.length - 1].date)
        // }
        // setAllData(data)
        const jsonResponse = await response.json()
        
        // Defensively extract the array whether it's wrapped in { data: [...] } or is already [...]
        const data = Array.isArray(jsonResponse) 
          ? jsonResponse 
          : (jsonResponse?.data && Array.isArray(jsonResponse.data) ? jsonResponse.data : [])

        console.log('[TWR] Fetched', data.length, 'records')
        if (data.length > 0) {
          console.log('[TWR] Date range:', data[0].date, 'to', data[data.length - 1].date)
        }
        setAllData(data)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[TWR] Fetch error:', msg)
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    if (portfolioId) {
      fetchNavHistory()
    }
  }, [portfolioId])

  // Filter and calculate returns when timeframe or data changes
  useEffect(() => {
    console.log('[TWR] Processing data: timeframe=', timeframe, 'allData.length=', allData.length)
    if (allData.length === 0) return

    let filtered = [...allData]

    // Apply timeframe filter only if not ALL
    if (timeframe !== 'ALL') {
      const tf = TIMEFRAMES.find(t => t.key === timeframe)
      if (tf) {
        const now = new Date()
        let cutoffDate = new Date(now)

        if (tf.isYtd) {
          cutoffDate = new Date(now.getFullYear(), 0, 1)
        } else if (tf.days !== Infinity) {
          cutoffDate.setDate(cutoffDate.getDate() - tf.days)
        }

        console.log('[TWR] Filtering from', cutoffDate.toISOString())
        filtered = allData.filter(d => new Date(d.date) >= cutoffDate)
        console.log('[TWR] Filtered to', filtered.length, 'records')
      }
    } else {
      console.log('[TWR] ALL timeframe selected - using all', allData.length, 'records')
    }

    // Calculate returns (re-baseline to 0%)
    if (filtered.length > 0) {
      const startNav = filtered[0].nav
      const transformed = filtered.map(d => ({
        ...d,
        returnPct: ((d.nav / startNav) - 1) * 100,
      }))
      console.log('[TWR] Calculated returns for', transformed.length, 'records, range', transformed[0].date, 'to', transformed[transformed.length - 1].date)
      setChartData(transformed)
    }
  }, [timeframe, allData])

  const isPositive = chartData.length > 0 && chartData[chartData.length - 1].returnPct >= 0
  const lineColor = isPositive ? '#10b981' : '#ef4444'

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-700 bg-black p-6">
        <div className="flex items-center justify-center h-80 text-gray-400">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading performance data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-700 bg-black p-6">
        <div className="flex items-center justify-center h-80 text-rose-400">
          <p className="text-sm">Unable to load performance data</p>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-black p-6">
        <div className="flex items-center justify-center h-80 text-gray-400">
          <p className="text-sm">No historical NAV data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-black p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Time-Weighted Return</p>
            <h2 className="text-2xl font-bold text-white mt-2">Performance</h2>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {chartData[chartData.length - 1].returnPct >= 0 ? '+' : ''}{chartData[chartData.length - 1].returnPct.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {chartData[chartData.length - 1].date}
            </p>
          </div>
        </div>

        {/* Timeframe Toggles */}
        <div className="flex gap-2 flex-wrap">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                timeframe === tf.key
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
            <defs>
              <linearGradient id="twrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v.toFixed(0)}%`}
              domain={[
                Math.floor((Math.min(...chartData.map(d => d.returnPct)) / 5)) * 5,
                Math.ceil((Math.max(...chartData.map(d => d.returnPct)) / 5)) * 5,
              ]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4b5563', strokeWidth: 2 }} />
            <Line
              type="monotone"
              dataKey="returnPct"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={true}
            />
            <Brush
              dataKey="date"
              height={30}
              stroke="#4b5563"
              fill="#111827"
              travellerWidth={8}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
