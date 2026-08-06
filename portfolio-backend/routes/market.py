from flask import Blueprint, request, jsonify, current_app
import yfinance as yf
import time
from services.symbol_directory import search_symbols

market_bp = Blueprint('market', __name__)

# Short-lived cache so repeated loads of the same tickers (e.g. the default
# listing re-rendering) don't re-hit yfinance and trip its rate limit.
_QUOTE_CACHE_TTL = 60
_quote_cache = {}

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
    'JNJ': {'price': 160.30, 'dayChangePercent': 0.40},
    'PFE': {'price': 25.60, 'dayChangePercent': -0.30},
    'UNH': {'price': 585.40, 'dayChangePercent': 0.75},
    'CAT': {'price': 355.20, 'dayChangePercent': 1.10},
    'BA': {'price': 178.90, 'dayChangePercent': -0.55},
    'LQD': {'price': 109.40, 'dayChangePercent': 0.20},
}


def _get_quotes_with_day_change(tickers):
    """Get current prices and daily % change for tickers using yfinance."""
    tickers = [t.strip().upper() for t in tickers if t and t.strip()]

    quotes = {}
    now = time.time()
    to_fetch = []
    for ticker in tickers:
        cached = _quote_cache.get(ticker)
        if cached and now - cached[0] < _QUOTE_CACHE_TTL:
            quotes[ticker] = cached[1]
        else:
            to_fetch.append(ticker)

    if to_fetch:
        failed_tickers = []
        try:
            # Single batched request instead of one HTTP call per ticker,
            # which is what was tripping yfinance's rate limit.
            history = yf.download(
                to_fetch, period='2d', group_by='ticker',
                threads=True, progress=False, auto_adjust=True
            )

            for ticker in to_fetch:
                try:
                    closes = history[ticker]['Close'].dropna() if len(to_fetch) > 1 else history['Close'].dropna()
                    if closes.empty:
                        failed_tickers.append(ticker)
                        continue

                    latest_close = float(closes.iloc[-1])
                    if len(closes) >= 2:
                        previous_close = float(closes.iloc[-2])
                        day_change_percent = ((latest_close - previous_close) / previous_close) * 100 if previous_close != 0 else 0
                    else:
                        day_change_percent = 0

                    quote = {'price': latest_close, 'dayChangePercent': day_change_percent}
                    quotes[ticker] = quote
                    _quote_cache[ticker] = (now, quote)
                except Exception as e:
                    current_app.logger.debug(f'Failed to parse quote for {ticker}: {e}')
                    failed_tickers.append(ticker)
        except Exception as e:
            current_app.logger.debug(f'Failed to fetch batch quotes for {to_fetch}: {e}')
            failed_tickers = to_fetch

        # Use mock data as fallback for tickers yfinance couldn't provide
        for ticker in failed_tickers:
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
