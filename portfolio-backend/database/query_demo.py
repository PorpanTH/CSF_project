#!/usr/bin/env python
"""
Demo queries to verify the database schema works end-to-end.
Run: python database/query_demo.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.config import SessionLocal
from database.models import User, Portfolio, PortfolioItem

def query_demo():
    db = SessionLocal()
    try:
        print('Running demo queries...\n')

        users = db.query(User).all()
        print(f'Users in database: {len(users)}')
        for user in users:
            print(f'  - {user.username} ({user.email})')

        if not users:
            print('  (no users found — run database/seed.py first)')
            return True

        print('\nPortfolios:')
        portfolios = db.query(Portfolio).all()
        for portfolio in portfolios:
            print(f'  {portfolio.name}')
            print(f'    Owner: {portfolio.owner.username}')
            print(f'    Items: {len(portfolio.items)}')
            for item in portfolio.items:
                total_value = item.quantity * item.current_price
                print(f'      - {item.quantity} {item.ticker} ({item.item_type}) @ ${item.current_price} = ${total_value:,.2f}')

        total_portfolio_value = sum(
            item.quantity * item.current_price
            for portfolio in portfolios
            for item in portfolio.items
        )
        print(f'\nTotal portfolio value: ${total_portfolio_value:,.2f}')

        return True

    except Exception as e:
        print(f'[-] Query failed: {e}', file=sys.stderr)
        return False
    finally:
        db.close()

if __name__ == '__main__':
    success = query_demo()
    sys.exit(0 if success else 1)
