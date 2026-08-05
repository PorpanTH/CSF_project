import { HoldingFluctuation, PortfolioItem } from '../types'

export const getHoldingsFluctuations = (items: PortfolioItem[]): HoldingFluctuation[] => {
  return items
    .filter(item => item.itemType !== 'cash')
    .map(item => {
      const basePrice = item.purchasePrice
      const changePercent = basePrice > 0 ? ((item.currentPrice - basePrice) / basePrice) * 100 : 0
      const unrealizedPnl = (item.currentPrice - item.purchasePrice) * item.quantity
      return {
        ticker: item.ticker,
        name: item.name ?? item.ticker,
        itemType: item.itemType,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        currentPrice: item.currentPrice,
        changePercent,
        unrealizedPnl,
        priceHistory: [],
      }
    })
}
