import { Wallet } from 'lucide-react'
import { BRAND } from '../theme/colors'

interface BalanceCardProps {
  balance: number
  onWithdraw: () => void
}

export const BalanceCard = ({ balance, onWithdraw }: BalanceCardProps) => {
  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: BRAND[50] }}>
          <Wallet size={22} style={{ color: BRAND[700] }} />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">Available Balance to Trade</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <button
        onClick={onWithdraw}
        className="btn text-white"
        style={{ backgroundColor: BRAND[700] }}
      >
        Withdraw
      </button>
    </div>
  )
}
