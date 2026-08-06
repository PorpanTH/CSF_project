import requests
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Fallback list for when the CSV fetch fails
FALLBACK_SYMBOLS = [
    # Tech stocks
    {'ticker': 'AAPL', 'name': 'Apple Inc.', 'type': 'stock'},
    {'ticker': 'MSFT', 'name': 'Microsoft Corp.', 'type': 'stock'},
    {'ticker': 'GOOGL', 'name': 'Alphabet Inc.', 'type': 'stock'},
    {'ticker': 'NVDA', 'name': 'NVIDIA Corp.', 'type': 'stock'},
    {'ticker': 'AMZN', 'name': 'Amazon.com Inc.', 'type': 'stock'},
    {'ticker': 'TSLA', 'name': 'Tesla Inc.', 'type': 'stock'},
    {'ticker': 'META', 'name': 'Meta Platforms Inc.', 'type': 'stock'},
    # Financial stocks (NYSE)
    {'ticker': 'JPM', 'name': 'JPMorgan Chase & Co.', 'type': 'stock'},
    {'ticker': 'BAC', 'name': 'Bank of America Corp.', 'type': 'stock'},
    {'ticker': 'WFC', 'name': 'Wells Fargo & Co.', 'type': 'stock'},
    # Healthcare
    {'ticker': 'JNJ', 'name': 'Johnson & Johnson', 'type': 'stock'},
    {'ticker': 'PFE', 'name': 'Pfizer Inc.', 'type': 'stock'},
    {'ticker': 'UNH', 'name': 'UnitedHealth Group Inc.', 'type': 'stock'},
    # Industrial/Other
    {'ticker': 'CAT', 'name': 'Caterpillar Inc.', 'type': 'stock'},
    {'ticker': 'BA', 'name': 'The Boeing Company', 'type': 'stock'},
    # ETFs
    {'ticker': 'VOO', 'name': 'Vanguard S&P 500 ETF', 'type': 'etf'},
    {'ticker': 'VTI', 'name': 'Vanguard Total Stock Market ETF', 'type': 'etf'},
    {'ticker': 'QQQ', 'name': 'Invesco QQQ Trust', 'type': 'etf'},
    {'ticker': 'SPY', 'name': 'SPDR S&P 500 ETF Trust', 'type': 'etf'},
    # Bond ETFs
    {'ticker': 'AGG', 'name': 'iShares Core Bond ETF', 'type': 'bond'},
    {'ticker': 'BND', 'name': 'Vanguard Total Bond Market ETF', 'type': 'bond'},
    {'ticker': 'LQD', 'name': 'iShares Investment Grade Corporate Bond ETF', 'type': 'bond'},
]

DEFAULT_STOCKS = [symbol for symbol in FALLBACK_SYMBOLS if symbol['type'] == 'stock']


class SymbolDirectory:
    def __init__(self):
        self.symbols = None
        self.last_fetch = None
        self.cache_ttl = timedelta(hours=24)
        self.csv_urls = [
            'https://raw.githubusercontent.com/datasets/nyse-listings/master/data/nyse-listed.csv',
            'https://raw.githubusercontent.com/datasets/nasdaq-listings/master/data/nasdaq-listed.csv'
        ]

    def _classify_type(self, company_name: str) -> str:
        """Classify security type based on company name."""
        lower_name = company_name.lower()
        if 'etf' in lower_name or 'etp' in lower_name:
            return 'etf'
        if 'bond' in lower_name or 'note' in lower_name or 'debenture' in lower_name:
            return 'bond'
        if 'fund' in lower_name or 'credit' in lower_name:
            return 'other'
        return 'stock'

    def _fetch_symbols(self):
        """Fetch NYSE and NASDAQ symbol lists from GitHub CSV."""
        symbols = []
        for csv_url in self.csv_urls:
            try:
                response = requests.get(csv_url, timeout=10)
                response.raise_for_status()
                lines = response.text.strip().split('\n')
                if len(lines) < 2:
                    continue

                for line in lines[1:]:  # Skip header
                    parts = line.split(',', 1)
                    if len(parts) >= 2:
                        ticker = parts[0].strip().strip('"')
                        name = parts[1].strip().strip('"')
                        if ticker and name:
                            symbols.append({
                                'ticker': ticker,
                                'name': name,
                                'type': self._classify_type(name)
                            })
            except Exception as e:
                logger.warning(f'Failed to fetch symbol list from {csv_url}: {e}')
                continue

        if symbols:
            unique_symbols = {}
            for symbol in symbols:
                unique_symbols[symbol['ticker']] = symbol
            merged = list(unique_symbols.values())
            logger.info(f'Fetched {len(merged)} symbols from US exchange directories')
            return merged

        logger.error('Failed to fetch any symbol directory data')
        return None

    def ensure_loaded(self):
        """Load symbols if not already loaded or cache expired."""
        if self.symbols is None or (self.last_fetch and datetime.now() - self.last_fetch > self.cache_ttl):
            fetched = self._fetch_symbols()
            if fetched:
                self.symbols = fetched
                self.last_fetch = datetime.now()
            else:
                self.symbols = FALLBACK_SYMBOLS
                logger.warning('Using fallback symbol list')

    def search(self, query: str, category: str = 'all', limit: int = 25) -> list:
        """Search for a symbol by exact ticker match only."""
        if not query or not query.strip():
            # No query: show the curated starter list only, no NYSE/NASDAQ fetch.
            if category == 'all':
                return FALLBACK_SYMBOLS[:limit]
            return [s for s in FALLBACK_SYMBOLS if s['type'] == category][:limit]

        # Active search: pull the full NYSE/NASDAQ directory for live lookup.
        self.ensure_loaded()

        # Exact match only -- prefix/substring/fuzzy matching (on ticker or
        # name) was surfacing unrelated results, e.g. "TSLA" also matching
        # "TSLG"/"TSLL" tickers, or "apple" matching "Pineapple" by name.
        query_lower = query.lower()
        results = [s for s in self.symbols if s['ticker'].lower() == query_lower]

        # Filter by category
        if category != 'all':
            results = [s for s in results if s['type'] == category]

        # Truncate to limit
        return results[:limit]


# Singleton instance
_directory = SymbolDirectory()


def search_symbols(query: str, category: str = 'all', limit: int = 25) -> list:
    """Public API to search NYSE symbols."""
    return _directory.search(query, category, limit)
