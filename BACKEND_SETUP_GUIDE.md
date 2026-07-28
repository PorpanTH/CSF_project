# Backend setup for the portfolio frontend

## Goal

Replace the current mock-data layer with a real Flask API that can power the portfolio dashboard, portfolio detail pages, trading flow, and market explorer without changing the frontend experience.

## Frontend areas that need backend data

### 1. Portfolio shell and portfolio list
- Components: PortfolioList, Dashboard, Header
- Data needed:
  - list of portfolios
  - portfolio metadata
  - portfolio creation and deletion

### 2. Portfolio detail and holdings
- Components: PortfolioDetail, PortfolioItemRow, AddItemForm, AllocationChart, MetricCard
- Data needed:
  - portfolio details and holdings
  - item CRUD operations
  - metrics and allocation calculations

### 3. Analytics and charting
- Components: PnLOverview, AccumulatedPnLChart, PieBreakdownChart, PerformanceChart
- Data needed:
  - summary metrics
  - P/L breakdown by asset class
  - performance time series
  - allocation slices

### 4. Trading and orders
- Components: TradeModal, WithdrawModal, OrderDialog, OrderHistoryTable
- Data needed:
  - order creation and status updates
  - cash balance and holding adjustments
  - trade execution results

### 5. Market explorer
- Components: MarketExplorer
- Data needed:
  - searchable market catalog
  - price and change data

## Backend endpoints to prepare

### Health
- GET /api/health
- Purpose: verify backend availability

### Portfolios
- GET /api/portfolios
- POST /api/portfolios
- GET /api/portfolios/<portfolio_id>
- PUT /api/portfolios/<portfolio_id>
- DELETE /api/portfolios/<portfolio_id>
- Purpose: manage portfolio records and metadata

### Portfolio items / holdings
- POST /api/portfolios/<portfolio_id>/items
- PUT /api/portfolios/<portfolio_id>/items/<item_id>
- DELETE /api/portfolios/<portfolio_id>/items/<item_id>
- Purpose: add, edit, and remove holdings inside a portfolio

### Portfolio analytics
- GET /api/portfolios/<portfolio_id>/summary
- GET /api/portfolios/<portfolio_id>/analytics
- Purpose: return metrics, allocation, P/L breakdown, holdings, and performance series

### Market catalog
- GET /api/market/equities
- Purpose: return market data used by the buy flow and explorer

### Orders
- GET /api/orders
- POST /api/orders
- Purpose: track trade execution and show order history

## Recommended response shapes

### Portfolio
```json
{
  "id": "1",
  "name": "Primary Investment Portfolio",
  "description": "Core growth-oriented portfolio",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-07-23T10:00:00Z",
  "items": []
}
```

### Portfolio item
```json
{
  "id": "item-1",
  "portfolioId": "1",
  "itemType": "stock",
  "ticker": "AAPL",
  "quantity": 50,
  "purchasePrice": 150.25,
  "purchaseDate": "2023-06-15",
  "currentPrice": 228.45,
  "sector": "Technology",
  "region": "North America",
  "realizedPnL": 820.5,
  "priceHistory": [210.2, 214.0, 219.4, 223.8, 228.45]
}
```

### Portfolio summary
```json
{
  "totalValue": 123456,
  "totalInvested": 100000,
  "totalGainLoss": 23456,
  "percentageReturn": 23.46,
  "dayChange": 2469.12,
  "dayChangePercent": 0.85
}
```

### Analytics payload
```json
{
  "summary": {},
  "allocation": [],
  "pnl": [],
  "holdings": [],
  "performance": []
}
```

## Frontend integration plan

1. Keep the current React components unchanged.
2. Make the frontend API layer in [portfolio-frontend/src/services/api.ts](portfolio-frontend/src/services/api.ts) the single integration point.
3. Point the frontend at the Flask backend by setting VITE_API_URL to the backend base URL, for example:
   - http://localhost:5000/api
4. Replace mock-data helper usage in the pages and charts with the API service progressively.
5. Preserve mock fallback temporarily while the backend is being implemented.

## Components mapped to backend usage

| Component | Backend usage |
| --- | --- |
| PortfolioList | GET /api/portfolios |
| AddPortfolio | POST /api/portfolios |
| PortfolioDetail | GET /api/portfolios/<id> + portfolio items endpoints |
| MetricCard / BalanceCard | GET /api/portfolios/<id>/summary |
| AllocationChart / PieBreakdownChart | GET /api/portfolios/<id>/analytics |
| PnLOverview | GET /api/portfolios/<id>/analytics |
| AccumulatedPnLChart | GET /api/portfolios/<id>/analytics |
| HoldingsFluctuationList | GET /api/portfolios/<id>/analytics |
| MarketExplorer | GET /api/market/equities |
| OrderDialog / OrderHistoryTable | GET /api/orders + POST /api/orders |
| TradeModal / WithdrawModal | POST /api/orders and item updates |

## Next implementation steps

1. Move the in-memory store to a database such as PostgreSQL or SQLite.
2. Add authentication and authorization for multi-user portfolios.
3. Add real-time price updates through a market data provider.
4. Replace the current simulated order flow with real execution statuses.
5. Add pagination and filtering for large portfolio and market datasets.
