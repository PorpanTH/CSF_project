#!/usr/bin/env python
"""
Seed the database with sample data.
Run: cd portfolio-backend && python database/seed.py
"""

import sys
from config import app, db, User, Portfolio, PortfolioItem

def seed_db():
    try:
        print('Seeding database with sample data...')
        with app.app_context():
            existing_user = User.query.filter_by(name='Portfolio Manager').first()
            if existing_user:
                print('[+] Sample data already exists, skipping...')
                return True

            user = User(id=1, name='Portfolio Manager')
            db.session.add(user)
            db.session.flush()

            portfolio = Portfolio(
                user_id=user.id,
                name='Tech Portfolio',
                description='A sample portfolio with tech stocks'
            )
            db.session.add(portfolio)
            db.session.flush()

            items = [
                PortfolioItem(
                    portfolio_id=portfolio.id,
                    asset_class='equity',
                    item_type='stock',
                    ticker='AAPL',
                    quantity=10.0,
                    purchase_price=150.00,
                    purchase_date='2023-01-15',
                    current_price=180.50,
                    realized_pnl=0
                ),
                PortfolioItem(
                    portfolio_id=portfolio.id,
                    asset_class='equity',
                    item_type='stock',
                    ticker='GOOGL',
                    quantity=5.0,
                    purchase_price=2800.00,
                    purchase_date='2023-03-20',
                    current_price=3150.75,
                    realized_pnl=0
                ),
                PortfolioItem(
                    portfolio_id=portfolio.id,
                    asset_class='fixed_income',
                    item_type='bond',
                    ticker='BOND',
                    quantity=100.0,
                    purchase_price=1000.00,
                    purchase_date='2023-06-01',
                    current_price=1020.00,
                    realized_pnl=0
                ),
                PortfolioItem(
                    portfolio_id=portfolio.id,
                    asset_class='cash',
                    item_type='cash',
                    ticker='USD',
                    quantity=5000.0,
                    purchase_price=1.00,
                    purchase_date='2023-01-01',
                    current_price=1.00,
                    realized_pnl=0
                ),
            ]
            db.session.add_all(items)
            db.session.commit()

            print(f'[+] Created user: {user.name}')
            print(f'[+] Created portfolio: {portfolio.name}')
            print(f'[+] Added {len(items)} portfolio items')
            print('\nSample data:')
            for item in items:
                value = item.quantity * item.current_price
                print(f'  - {item.quantity} {item.ticker} ({item.asset_class}) @ ${item.current_price} = ${value:,.2f}')

            return True

    except Exception as e:
        with app.app_context():
            db.session.rollback()
        print(f'[-] Failed to seed database: {e}', file=sys.stderr)
        return False

if __name__ == '__main__':
    success = seed_db()
    sys.exit(0 if success else 1)
