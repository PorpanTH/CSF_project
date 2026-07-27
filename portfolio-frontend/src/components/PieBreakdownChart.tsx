import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { BreakdownSlice } from '../types'
import { CATEGORICAL_ORDER, INK } from '../theme/colors'

interface PieBreakdownChartProps {
  title: string
  data: BreakdownSlice[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const slice: BreakdownSlice = payload[0].payload
    return (
      <div className="bg-white p-2 rounded border border-gray-300 shadow-lg">
        <p className="text-sm font-medium text-gray-900">{slice.name}</p>
        <p className="text-sm text-gray-600">
          ${slice.value.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({slice.percentage.toFixed(1)}%)
        </p>
      </div>
    )
  }
  return null
}

export const PieBreakdownChart = ({ title, data }: PieBreakdownChartProps) => {
  return (
    <div className="card">
      <h3 className="text-base font-bold text-gray-900 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={CATEGORICAL_ORDER[i]} stroke={INK.surface} strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 space-y-1.5">
        {data.map((slice, i) => (
          <li key={slice.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: CATEGORICAL_ORDER[i] }} />
              {slice.name}
            </span>
            <span className="font-medium text-gray-900">{slice.percentage.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
