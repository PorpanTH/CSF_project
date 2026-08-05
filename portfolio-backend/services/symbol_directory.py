from difflib import SequenceMatcher

FALLBACK_SYMBOLS = [
    {'ticker': 'AAPL', 'name': 'Apple Inc.', 'type': 'stock'},
    {'ticker': 'MSFT', 'name': 'Microsoft Corp.', 'type': 'stock'},
    {'ticker': 'GOOGL', 'name': 'Alphabet Inc.', 'type': 'stock'},
    {'ticker': 'NVDA', 'name': 'NVIDIA Corp.', 'type': 'stock'},
    {'ticker': 'AMZN', 'name': 'Amazon.com Inc.', 'type': 'stock'},
    {'ticker': 'TSLA', 'name': 'Tesla Inc.', 'type': 'stock'},
    {'ticker': 'META', 'name': 'Meta Platforms Inc.', 'type': 'stock'},
    {'ticker': 'JPM', 'name': 'JPMorgan Chase & Co.', 'type': 'stock'},
    {'ticker': 'BAC', 'name': 'Bank of America Corp.', 'type': 'stock'},
    {'ticker': 'WFC', 'name': 'Wells Fargo & Co.', 'type': 'stock'},
    {'ticker': 'VOO', 'name': 'Vanguard S&P 500 ETF', 'type': 'etf'},
    {'ticker': 'VTI', 'name': 'Vanguard Total Stock Market ETF', 'type': 'etf'},
    {'ticker': 'QQQ', 'name': 'Invesco QQQ Trust', 'type': 'etf'},
    {'ticker': 'SPY', 'name': 'SPDR S&P 500 ETF Trust', 'type': 'etf'},
    {'ticker': 'AGG', 'name': 'iShares Core Bond ETF', 'type': 'bond'},
    {'ticker': 'BND', 'name': 'Vanguard Total Bond Market ETF', 'type': 'bond'},
    {'ticker': 'LQD', 'name': 'iShares Investment Grade Corporate Bond ETF', 'type': 'bond'},
]


def _similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def search_symbols(query: str, category: str = 'all', limit: int = 25) -> list:
    symbols = FALLBACK_SYMBOLS

    if not query or not query.strip():
        if category == 'all':
            return symbols[:limit]
        return [s for s in symbols if s['type'] == category][:limit]

    query_lower = query.lower().strip()

    ticker_prefix_matches = [s for s in symbols if s['ticker'].lower().startswith(query_lower)]

    substring_matches = [
        s for s in symbols
        if s not in ticker_prefix_matches and (
            query_lower in s['ticker'].lower() or query_lower in s['name'].lower()
        )
    ]

    fuzzy_matches = []
    for symbol in symbols:
        if symbol in ticker_prefix_matches or symbol in substring_matches:
            continue
        ticker_similarity = _similarity(query_lower, symbol['ticker'].lower())
        name_similarity = _similarity(query_lower, symbol['name'].lower())
        if ticker_similarity >= 0.7 or name_similarity >= 0.6:
            fuzzy_matches.append((max(ticker_similarity, name_similarity), symbol))

    fuzzy_matches.sort(key=lambda pair: pair[0], reverse=True)
    ordered = ticker_prefix_matches + substring_matches + [pair[1] for pair in fuzzy_matches]

    if category != 'all':
        ordered = [s for s in ordered if s['type'] == category]

    return ordered[:limit]
