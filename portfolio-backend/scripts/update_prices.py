"""Script to update portfolio item prices from Yahoo Finance."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.config import app, db, Portfolio, PortfolioItem
from services.financial_data import FinancialDataService

def update_portfolio_prices(portfolio_id: int = None):
    """
    Update current prices for all portfolio items from Yahoo Finance.

    Args:
        portfolio_id: Specific portfolio to update (None = all portfolios)
    """
    print("Updating portfolio prices from Yahoo Finance...\n")

    try:
        with app.app_context():
            # Get portfolios to update
            if portfolio_id:
                portfolios = Portfolio.query.filter_by(id=portfolio_id).all()
            else:
                portfolios = Portfolio.query.all()

            if not portfolios:
                print("No portfolios found")
                return False

            updated_count = 0
            for portfolio in portfolios:
                print(f"Portfolio: {portfolio.name}")

                for item in portfolio.items:
                    # Skip cash and other non-stock items
                    if item.ticker == 'CASH' or item.ticker.startswith('USD'):
                        print(f"  {item.ticker}: skipping (cash)")
                        continue

                    # Fetch current price
                    current_price = FinancialDataService.get_current_price(item.ticker)

                    if current_price:
                        old_price = item.current_price
                        change = current_price - old_price
                        percent_change = (change / old_price * 100) if old_price > 0 else 0

                        item.current_price = current_price
                        db.session.commit()

                        print(f"  {item.ticker}: ${old_price:.2f} -> ${current_price:.2f} ({percent_change:+.2f}%)")
                        updated_count += 1
                    else:
                        print(f"  {item.ticker}: FAILED to fetch price")

                print()

            print(f"Updated {updated_count} items")
            return True

    except Exception as e:
        print(f"Error updating prices: {e}")
        import traceback
        traceback.print_exc()
        return False

def get_portfolio_performance():
    """Display current portfolio performance with updated prices."""
    print("Current Portfolio Performance\n")

    try:
        with app.app_context():
            portfolios = Portfolio.query.all()

            for portfolio in portfolios:
                metrics = portfolio.calculate_metrics()
                print(f"Portfolio: {portfolio.name}")
                print(f"  Total Value: ${metrics['totalValue']:,.2f}")
                print(f"  Total Cost: ${metrics['totalCost']:,.2f}")
                print(f"  Unrealized P&L: ${metrics['unrealizedPnL']:,.2f} ({metrics['unrealizedPnLPercent']:.2f}%)")
                print()

            return True

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    # Update prices
    update_portfolio_prices()

    # Show performance
    get_portfolio_performance()
