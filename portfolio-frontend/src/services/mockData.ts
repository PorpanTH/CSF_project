import { HoldingFluctuation, PortfolioItem } from '../types'

export const getHoldingsFluctuations = (items: PortfolioItem[]): HoldingFluctuation[] => {
  return items
    .filter(item => item.itemType !== 'cash')
    .map(item => {
      // True day change (yesterday's close -> today's live price, from yfinance),
      // not a lifetime/cost-basis return.
      const changePercent = item.dayChangePercent ?? 0
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
