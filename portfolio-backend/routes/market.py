from flask import Blueprint, request, jsonify, current_app
import yfinance as yf
from services.symbol_directory import search_symbols

market_bp = Blueprint('market', __name__)

# Mock data for fallback when yfinance is unavailable
MOCK_QUOTES = {
    'AAPL': {'price': 228.45, 'dayChangePercent': 1.25},
    'MSFT': {'price': 417.89, 'dayChangePercent': 0.85},
    'GOOGL': {'price': 155.62, 'dayChangePercent': 2.15},
    'NVDA': {'price': 134.50, 'dayChangePercent': 1.95},
    'AMZN': {'price': 185.32, 'dayChangePercent': 1.10},
    'TSLA': {'price': 242.80, 'dayChangePercent': 2.45},
    'META': {'price': 501.25, 'dayChangePercent': 1.65},
    'JPM': {'price': 357.52, 'dayChangePercent': 1.38},
    'BAC': {'price': 62.90, 'dayChangePercent': 0.67},
    'WFC': {'price': 65.40, 'dayChangePercent': 1.45},
    'VOO': {'price': 485.32, 'dayChangePercent': 1.10},
    'VTI': {'price': 245.30, 'dayChangePercent': 1.05},
    'QQQ': {'price': 395.75, 'dayChangePercent': 2.20},
    'SPY': {'price': 502.18, 'dayChangePercent': 1.15},
    'AGG': {'price': 95.75, 'dayChangePercent': 0.45},
    'BND': {'price': 81.20, 'dayChangePercent': 0.50},
}


def _get_quotes_with_day_change(tickers):
    """Get current prices and daily % change for tickers using yfinance with mock fallback."""
    quotes = {}

    for ticker in tickers:
        ticker = ticker.strip().upper()
        if not ticker:
            continue

        got_real_data = False
        try:
            # Try to get real data from yfinance with short timeout
            history = yf.Ticker(ticker).history(period='2d', timeout=1)

            if not history.empty and len(history) >= 1:
                latest_close = float(history['Close'].iloc[-1])

                # Calculate day change percentage
                if len(history) >= 2:
                    previous_close = float(history['Close'].iloc[-2])
                    day_change_percent = ((latest_close - previous_close) / previous_close) * 100 if previous_close != 0 else 0
                else:
                    day_change_percent = 0

                quotes[ticker] = {
                    'price': latest_close,
                    'dayChangePercent': day_change_percent
                }
                got_real_data = True

        except Exception as e:
            current_app.logger.debug(f'Failed to fetch real quote for {ticker}: {e}')

        # Use mock data as fallback if yfinance failed
        if not got_real_data:
            if ticker in MOCK_QUOTES:
                quotes[ticker] = MOCK_QUOTES[ticker]

    return quotes


@market_bp.route('/symbols', methods=['GET'])
def get_symbols():
    """Search NYSE-listed symbols by ticker or company name."""
    query = request.args.get('q', '').strip()
    category = request.args.get('category', 'all')
    limit = min(int(request.args.get('limit', 25)), 100)

    results = search_symbols(query, category, limit)
    return jsonify(results), 200


@market_bp.route('/quotes', methods=['POST'])
def get_quotes():
    """Get live prices and daily change for a list of tickers."""
    data = request.get_json() or {}
    tickers = data.get('tickers', [])

    # Cap tickers to prevent abuse
    if len(tickers) > 30:
        tickers = tickers[:30]

    if not tickers:
        return jsonify({}), 200

    quotes = _get_quotes_with_day_change(tickers)
    return jsonify(quotes), 200