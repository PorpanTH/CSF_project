from flask import Blueprint, request, jsonify, current_app
import yfinance as yf
from services.symbol_directory import search_symbols

market_bp = Blueprint('market', __name__)


def _get_quotes_with_day_change(tickers):
    """Get current prices and daily % change for tickers using yfinance."""
    quotes = {}

    for ticker in tickers:
        try:
            ticker = ticker.strip().upper()
            if not ticker:
                continue

            # Get 2 days of history to calculate daily change
            history = yf.Ticker(ticker).history(period='2d')

            if history.empty or len(history) < 1:
                continue

            # Get latest close price
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

        except Exception as e:
            current_app.logger.debug(f'Failed to fetch quote for {ticker}: {e}')
            continue

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
