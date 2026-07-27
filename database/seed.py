#!/usr/bin/env python
"""
Seed the database with sample data.
Run: python database/seed.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date
from werkzeug.security import generate_password_hash
from database.config import SessionLocal
from database.models import User, Portfolio, PortfolioItem

def seed_db():
    db = SessionLocal()
    try:
        print('Seeding database with sample data...')

        existing_user = db.query(User).filter_by(email='demo@example.com').first()
        if existing_user:
            print('[+] Sample data already exists, skipping...')
            return True

        user = User(
            email='demo@example.com',
            username='demo_user',
            password_hash=generate_password_hash('password123')
        )
        db.add(user)
        db.flush()

        portfolio = Portfolio(
            user_id=user.id,
            name='Tech Portfolio',
            description='A sample portfolio with tech stocks'
        )
        db.add(portfolio)
        db.flush()

        items = [
            PortfolioItem(
                portfolio_id=portfolio.id,
                item_type='stock',
                ticker='AAPL',
                quantity=10.0,
                purchase_price=150.00,
                purchase_date=date(2023, 1, 15),
                current_price=180.50
            ),
            PortfolioItem(
                portfolio_id=portfolio.id,
                item_type='stock',
                ticker='GOOGL',
                quantity=5.0,
                purchase_price=2800.00,
                purchase_date=date(2023, 3, 20),
                current_price=3150.75
            ),
            PortfolioItem(
                portfolio_id=portfolio.id,
                item_type='bond',
                ticker='BOND',
                quantity=100.0,
                purchase_price=1000.00,
                purchase_date=date(2023, 6, 1),
                current_price=1020.00
            ),
            PortfolioItem(
                portfolio_id=portfolio.id,
                item_type='cash',
                ticker='USD',
                quantity=5000.0,
                purchase_price=1.00,
                purchase_date=date(2023, 1, 1),
                current_price=1.00
            ),
        ]
        db.add_all(items)
        db.commit()

        print(f'[+] Created user: {user.username} ({user.email})')
        print(f'[+] Created portfolio: {portfolio.name}')
        print(f'[+] Added {len(items)} portfolio items')
        print('\nSample data:')
        print(f'  - {items[0].quantity} shares of {items[0].ticker} @ ${items[0].current_price}')
        print(f'  - {items[1].quantity} shares of {items[1].ticker} @ ${items[1].current_price}')
        print(f'  - {items[2].quantity} units of {items[2].ticker} @ ${items[2].current_price}')
        print(f'  - ${items[3].quantity} {items[3].ticker}')

        return True

    except Exception as e:
        db.rollback()
        print(f'[-] Failed to seed database: {e}', file=sys.stderr)
        return False
    finally:
        db.close()

if __name__ == '__main__':
    success = seed_db()
    sys.exit(0 if success else 1)
