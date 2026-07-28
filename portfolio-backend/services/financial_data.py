"""Fetch financial data from Yahoo Finance."""
import yfinance as yf
from datetime import datetime, timedelta
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

class FinancialDataService:
    """Service to fetch financial data from Yahoo Finance."""

    @staticmethod
    def get_current_price(ticker: str) -> Optional[float]:
        """
        Get the current price for a given ticker.

        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')

        Returns:
            Current price as float, or None if fetch fails
        """
        try:
            stock = yf.Ticker(ticker)
            data = stock.history(period='1d')
            if data.empty:
                logger.warning(f"No data found for ticker: {ticker}")
                return None
            current_price = data['Close'].iloc[-1]
            return float(current_price)
        except Exception as e:
            logger.error(f"Error fetching current price for {ticker}: {e}")
            return None

    @staticmethod
    def get_historical_data(
        ticker: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        interval: str = '1d'
    ) -> Optional[Dict]:
        """
        Get historical price data for a given ticker.

        Args:
            ticker: Stock ticker symbol
            start_date: Start date (default: 1 year ago)
            end_date: End date (default: today)
            interval: Data interval ('1d', '1wk', '1mo', etc.)

        Returns:
            Dictionary with 'dates' and 'prices' lists, or None if fetch fails
        """
        try:
            if end_date is None:
                end_date = datetime.now()
            if start_date is None:
                start_date = end_date - timedelta(days=365)

            stock = yf.Ticker(ticker)
            data = stock.history(start=start_date, end=end_date, interval=interval)

            if data.empty:
                logger.warning(f"No historical data found for ticker: {ticker}")
                return None

            return {
                'ticker': ticker,
                'dates': [date.strftime('%Y-%m-%d') for date in data.index],
                'prices': data['Close'].tolist(),
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
            }
        except Exception as e:
            logger.error(f"Error fetching historical data for {ticker}: {e}")
            return None

    @staticmethod
    def get_multiple_prices(tickers: List[str]) -> Dict[str, Optional[float]]:
        """
        Get current prices for multiple tickers.

        Args:
            tickers: List of stock ticker symbols

        Returns:
            Dictionary mapping ticker -> price (or None if fetch fails)
        """
        prices = {}
        for ticker in tickers:
            prices[ticker] = FinancialDataService.get_current_price(ticker)
        return prices

    @staticmethod
    def get_stock_info(ticker: str) -> Optional[Dict]:
        """
        Get general stock information.

        Args:
            ticker: Stock ticker symbol

        Returns:
            Dictionary with stock info (name, sector, etc.) or None if fetch fails
        """
        try:
            stock = yf.Ticker(ticker)
            info = stock.info

            return {
                'ticker': ticker,
                'name': info.get('longName', 'N/A'),
                'sector': info.get('sector', 'N/A'),
                'currentPrice': info.get('currentPrice'),
                'market_cap': info.get('marketCap'),
                'pe_ratio': info.get('trailingPE'),
                '52_week_high': info.get('fiftyTwoWeekHigh'),
                '52_week_low': info.get('fiftyTwoWeekLow'),
            }
        except Exception as e:
            logger.error(f"Error fetching stock info for {ticker}: {e}")
            return None
