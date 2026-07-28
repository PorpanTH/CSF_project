# Services

Backend services for portfolio management.

## FinancialDataService

Service to fetch financial data from Yahoo Finance using the `yfinance` library.

### Methods

#### `get_current_price(ticker: str) -> Optional[float]`
Get the current stock price for a given ticker.

```python
from services.financial_data import FinancialDataService

price = FinancialDataService.get_current_price('AAPL')
print(f"AAPL: ${price}")  # Output: AAPL: $175.25
```

#### `get_historical_data(ticker: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, interval: str = '1d') -> Optional[Dict]`
Get historical price data for a given ticker.

```python
from datetime import datetime
from services.financial_data import FinancialDataService

data = FinancialDataService.get_historical_data(
    'AAPL',
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 6, 30),
    interval='1d'  # Daily data
)

print(f"Ticker: {data['ticker']}")
print(f"Dates: {data['dates']}")  # List of dates
print(f"Prices: {data['prices']}")  # List of prices
```

#### `get_multiple_prices(tickers: List[str]) -> Dict[str, Optional[float]]`
Get current prices for multiple tickers at once.

```python
from services.financial_data import FinancialDataService

prices = FinancialDataService.get_multiple_prices(['AAPL', 'GOOGL', 'MSFT'])
for ticker, price in prices.items():
    print(f"{ticker}: ${price}")
```

#### `get_stock_info(ticker: str) -> Optional[Dict]`
Get general stock information (name, sector, market cap, P/E ratio, etc.).

```python
from services.financial_data import FinancialDataService

info = FinancialDataService.get_stock_info('AAPL')
print(f"Company: {info['name']}")
print(f"Sector: {info['sector']}")
print(f"Market Cap: ${info['market_cap']:,.0f}")
print(f"P/E Ratio: {info['pe_ratio']}")
```

### Usage in Routes

```python
from flask import Blueprint, jsonify
from services.financial_data import FinancialDataService

api = Blueprint('api', __name__)

@api.route('/stock/<ticker>/price', methods=['GET'])
def get_stock_price(ticker):
    price = FinancialDataService.get_current_price(ticker)
    if price:
        return jsonify({'ticker': ticker, 'price': price})
    return jsonify({'error': 'Failed to fetch price'}), 500
```

### Usage in Scripts

See `scripts/update_prices.py` for an example of updating portfolio item prices from Yahoo Finance.

```bash
python scripts/update_prices.py
```

## Requirements

- `yfinance>=0.2.33` - Yahoo Finance data fetcher
- `pandas>=2.1.4` - Data manipulation (required by yfinance)

These are already in `requirements.txt`.
