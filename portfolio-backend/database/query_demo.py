#!/usr/bin/env python
"""
Demo queries to verify the database schema works end-to-end.
Run: cd portfolio-backend && python database/query_demo.py
"""

import sys
from config import app, db, User, Portfolio

def query_demo():
    try:
        print('Running demo queries...\n')
        with app.app_context():
            users = User.query.all()
            print(f'Users in database: {len(users)}')
            for user in users:
                print(f'  - {user.name}')

            if not users:
                print('  (no users found — run database/seed.py first)')
                return True

            print('\nPortfolios:')
            portfolios = Portfolio.query.all()
            for portfolio in portfolios:
                metrics = portfolio.calculate_metrics()
                print(f'  {portfolio.name}')
                print(f'    Owner: {portfolio.owner.name}')
                print(f'    Items: {len(portfolio.items)}')
                for item in portfolio.items:
                    total_value = item.quantity * item.current_price
                    print(f'      - {item.quantity} {item.ticker} ({item.asset_class}) @ ${item.current_price} = ${total_value:,.2f}')
                print(f'    Metrics:')
                print(f'      Total Value: ${metrics["totalValue"]:,.2f}')
                print(f'      Total Cost: ${metrics["totalCost"]:,.2f}')
                print(f'      Unrealized P&L: ${metrics["unrealizedPnL"]:,.2f} ({metrics["unrealizedPnLPercent"]:.2f}%)')

            total_portfolio_value = sum(
                item.quantity * item.current_price
                for portfolio in portfolios
                for item in portfolio.items
            )
            print(f'\nTotal all portfolios value: ${total_portfolio_value:,.2f}')

            return True

    except Exception as e:
        print(f'[-] Query failed: {e}', file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = query_demo()
    sys.exit(0 if success else 1)
