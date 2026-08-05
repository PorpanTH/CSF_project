import { MarketEquity } from '../types'
import { MarketExplorer } from "./MarketExplorer";

interface AddFlowProps {
  marketCatalog: MarketEquity[]
  handleExplorerBuy: (equity: MarketEquity) => void
}

export const AddFlow = ({ marketCatalog, handleExplorerBuy }: AddFlowProps) => {
  return (
    <div className="card border border-slate-200 flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Add Flow</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">Search and Add Financial Products</h2>
      </div>
      <div>
        <MarketExplorer equities={marketCatalog} onBuy={handleExplorerBuy} />
      </div>
    </div>
  )
}