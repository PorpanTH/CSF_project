from flask import Blueprint, request, jsonify, current_app
import yfinance as yf

from services.symbol_directory import search_symbols

market_bp = Blueprint('market', __name__)

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
    quotes = {}
    failed_tickers = []

    for ticker in tickers:
        try:
            ticker = ticker.strip().upper()
            if not ticker:
                continue

            history = yf.Ticker(ticker).history(period='2d')

            if history.empty or len(history) < 1:
                failed_tickers.append(ticker)
                continue

            latest_close = float(history['Close'].iloc[-1])

            if len(history) >= 2:
                previous_close = float(history['Close'].iloc[-2])
                day_change_percent = ((latest_close - previous_close) / previous_close) * 100 if previous_close != 0 else 0
            else:
                day_change_percent = 0

            quotes[ticker] = {
                'price': latest_close,
                'dayChangePercent': day_change_percent,
            }
        except Exception as exc:
            current_app.logger.debug('Failed to fetch quote for %s: %s', ticker, exc)
            failed_tickers.append(ticker)

    for ticker in failed_tickers:
        if ticker in MOCK_QUOTES:
            quotes[ticker] = MOCK_QUOTES[ticker]

    return quotes


@market_bp.route('/symbols', methods=['GET'])
def get_symbols():
    query = request.args.get('q', '').strip()
    category = request.args.get('category', 'all')
    limit = min(int(request.args.get('limit', 25)), 100)

    results = search_symbols(query, category, limit)
    return jsonify(results), 200


@market_bp.route('/quotes', methods=['POST'])
def get_quotes():
    data = request.get_json() or {}
    tickers = data.get('tickers') or data.get('symbols') or []

    if len(tickers) > 30:
        tickers = tickers[:30]

    if not tickers:
        return jsonify({}), 200

    quotes = _get_quotes_with_day_change(tickers)
    return jsonify(quotes), 200
