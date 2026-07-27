import { useState } from 'react'
import { STATUS, BRAND } from '../theme/colors'

interface WithdrawModalProps {
  balance: number
  onConfirm: (amount: number) => void
  onClose: () => void
}

export const WithdrawModal = ({ balance, onConfirm, onClose }: WithdrawModalProps) => {
  const [amount, setAmount] = useState<number>(0)

  const error =
    amount <= 0 ? 'Enter an amount greater than 0' :
    amount > balance ? 'Amount exceeds available balance' :
    null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
          <p className="text-sm text-gray-500 mt-1">
            Available balance: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>

          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">Amount to withdraw</label>
            <input
              type="number"
              min={0}
              max={balance}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value || '0')))}
              className="input-field"
            />
            {error && <p className="text-xs font-medium mt-1" style={{ color: STATUS.critical }}>{error}</p>}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => !error && onConfirm(amount)}
              disabled={!!error}
              className="flex-1 btn text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: BRAND[700] }}
            >
              Confirm Withdrawal
            </button>
            <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
