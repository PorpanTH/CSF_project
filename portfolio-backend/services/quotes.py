import logging
import time

import yfinance as yf

logger = logging.getLogger(__name__)

# Fallback prices for when yfinance is unavailable or rate-limited.
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

# Short-lived cache shared by every caller (market search, portfolio pricing,
# the daily NAV scheduler) so the same ticker isn't re-fetched from yfinance
# multiple times within a short window.
_CACHE_TTL = 60
_cache = {}


def get_quotes(tickers):
    """Get current price + day change % for a list of tickers.

    Batches all tickers into a single yfinance request instead of one
    request per ticker, and caches results briefly to avoid tripping
    yfinance's rate limit on repeated calls.
    """
    tickers = sorted({t.strip().upper() for t in tickers if t and t.strip()})
    if not tickers:
        return {}

    quotes = {}
    now = time.time()
    to_fetch = []
    for ticker in tickers:
        cached = _cache.get(ticker)
        if cached and now - cached[0] < _CACHE_TTL:
            if cached[1] is not None:
                quotes[ticker] = cached[1]
        else:
            to_fetch.append(ticker)

    if to_fetch:
        failed_tickers = []
        try:
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
                    _cache[ticker] = (now, quote)
                except Exception as e:
                    logger.debug(f'Failed to parse quote for {ticker}: {e}')
                    failed_tickers.append(ticker)
        except Exception as e:
            logger.debug(f'Failed to fetch batch quotes for {to_fetch}: {e}')
            failed_tickers = to_fetch

        # Cache the outcome for failed tickers too (mock fallback, or a miss)
        # so a rate-limited/unavailable yfinance isn't hammered again for
        # every request within the cache window.
        for ticker in failed_tickers:
            quote = MOCK_QUOTES.get(ticker)
            _cache[ticker] = (now, quote)
            if quote is not None:
                quotes[ticker] = quote

    return quotes


def get_prices(tickers):
    """Convenience wrapper returning {ticker: price} for tickers with data."""
    return {ticker: quote['price'] for ticker, quote in get_quotes(tickers).items()}
