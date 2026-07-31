"""Demonstrate database queries."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.config import app, db, User, Portfolio

def query_demo():
    print("Running demo queries...\n")
    try:
        with app.app_context():
            # Query users
            users = User.query.all()
            print(f"Users in database: {len(users)}")
            for user in users:
                print(f"  - {user.name}")

            if not users:
                print("  (no users found)")
                return False

            # Query portfolios
            print("\nPortfolios:")
            portfolios = Portfolio.query.all()
            for portfolio in portfolios:
                metrics = portfolio.calculate_metrics()
                print(f"  {portfolio.name}")
                print(f"    Owner: {portfolio.owner.name}")
                print(f"    Items: {len(portfolio.items)}")
                for item in portfolio.items:
                    total_value = item.quantity * item.purchase_price
                    print(f"      - {item.quantity} {item.ticker} ({item.asset_class}) @ ${item.purchase_price} = ${total_value:,.2f}")
                print(f"    Metrics:")
                print(f"      Total Value: ${metrics['totalValue']:,.2f}")
                print(f"      Total Cost: ${metrics['totalCost']:,.2f}")
                print(f"      Unrealized P&L: ${metrics['unrealizedPnL']:,.2f} ({metrics['unrealizedPnLPercent']:.2f}%)")

            total_portfolio_value = sum(
                item.quantity * item.purchase_price
                for portfolio in portfolios
                for item in portfolio.items
            )
            print(f"\nTotal all portfolios value: ${total_portfolio_value:,.2f}")
            return True

    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    query_demo()
