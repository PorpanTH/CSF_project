"""Seed database with sample data."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.config import app, db, User, Portfolio, PortfolioItem

def seed_db():
    print("Seeding database with sample data...")
    try:
        with app.app_context():
            # Create default user
            user = User(id=1, name='Portfolio Manager')
            db.session.add(user)
            db.session.commit()
            print(f"Created user: {user.name}")

            # Create portfolio
            portfolio = Portfolio(
                user_id=1,
                name='Main Portfolio',
                description='My investment portfolio'
            )
            db.session.add(portfolio)
            db.session.commit()
            print(f"Created portfolio: {portfolio.name}")

            # Create sample items
            items_data = [
                {'ticker': 'AAPL', 'quantity': 100, 'purchase_price': 150, 'asset_class': 'Stocks'},
                {'ticker': 'GOOGL', 'quantity': 50, 'purchase_price': 2000, 'asset_class': 'Stocks'},
                {'ticker': 'BTC', 'quantity': 0.5, 'purchase_price': 40000, 'asset_class': 'Crypto'},
                {'ticker': 'SPY', 'quantity': 200, 'purchase_price': 350, 'asset_class': 'ETF'},
            ]

            for item_data in items_data:
                item = PortfolioItem(
                    portfolio_id=portfolio.id,
                    ticker=item_data['ticker'],
                    quantity=item_data['quantity'],
                    purchase_price=item_data['purchase_price'],
                    asset_class=item_data['asset_class'],
                    item_type='investment',
                    purchase_date='2024-01-01'
                )
                db.session.add(item)

            db.session.commit()
            print(f"Created {len(items_data)} portfolio items")

            # Verify data
            users = User.query.all()
            portfolios = Portfolio.query.all()
            items = PortfolioItem.query.all()
            print(f"\nData summary: {len(users)} users, {len(portfolios)} portfolios, {len(items)} items")
            return True

    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    seed_db()
