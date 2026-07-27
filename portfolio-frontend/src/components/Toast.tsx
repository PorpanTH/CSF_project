import { CheckCircle, AlertCircle, X } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export const Toast = ({ message, type, onClose, duration = 4000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50'
  const borderColor = type === 'success' ? 'border-green-200' : type === 'error' ? 'border-red-200' : 'border-blue-200'
  const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800'
  const iconColor = type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-blue-600'

  return (
    <div className={`fixed bottom-4 right-4 max-w-sm ${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in z-50`}>
      <div className={iconColor}>
        {type === 'success' && <CheckCircle size={24} />}
        {type === 'error' && <AlertCircle size={24} />}
        {type === 'info' && <AlertCircle size={24} />}
      </div>
      <p className={`flex-1 ${textColor} font-medium`}>{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
      >
        <X size={18} />
      </button>
    </div>
  )
}
