import { HoldingFluctuation } from '../types'
import { HoldingsFluctuationList } from './HoldingsFluctuationList'

interface RemoveFlowProps {
  holdings: HoldingFluctuation[]
  handleSell: (ticker: string) => void
}

export const RemoveFlow = ({ holdings, handleSell }: RemoveFlowProps) => {
  return (
    <div className="card border border-slate-200 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Remove Flow</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">Select Holdings to Remove</h2>
      </div>
      <div>
        <HoldingsFluctuationList holdings={holdings} onSell={handleSell} />
      </div>
    </div>
  )
}