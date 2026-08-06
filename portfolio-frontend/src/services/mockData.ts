import { HoldingFluctuation, PortfolioItem } from '../types'

export const getHoldingsFluctuations = (items: PortfolioItem[]): HoldingFluctuation[] => {
  return items
    .filter(item => item.itemType !== 'cash')
    .map(item => {
      const first = item.priceHistory[0]
      const changePercent = first > 0 ? ((item.currentPrice - first) / first) * 100 : 0
      const unrealizedPnl = (item.currentPrice - item.purchasePrice) * item.quantity
      return {
        ticker: item.ticker,
        itemType: item.itemType,
        name: item.name ?? item.ticker,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        currentPrice: item.currentPrice,
        changePercent,
        unrealizedPnl,
        priceHistory: item.priceHistory,
      }
    })
}
