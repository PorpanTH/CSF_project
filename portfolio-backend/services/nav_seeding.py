from models.portfolio import PortfolioNavHistory
from database.db import db
from datetime import datetime, timedelta
import random
import logging

logger = logging.getLogger(__name__)


def seed_historical_nav(portfolio_id: int, start_date_str: str, end_date_str: str, starting_nav: float) -> int:
    """Generate and seed realistic historical NAV data with daily variations.

    Args:
        portfolio_id: Portfolio ID
        start_date_str: Start date as string (YYYY-MM-DD)
        end_date_str: End date as string (YYYY-MM-DD)
        starting_nav: Starting NAV value

    Returns:
        Number of snapshots created
    """
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

    current_date = start_date
    current_nav = starting_nav
    count = 0

    # Daily returns: simulates realistic market movements
    # Most days: ±0.5% to ±1.5%, occasional big moves: ±2% to ±3%
    while current_date <= end_date:
        # Skip weekends
        if current_date.weekday() < 5:
            # Random daily return
            if random.random() < 0.1:  # 10% chance of big move
                daily_return = random.uniform(-0.03, 0.03)  # ±3%
            else:
                daily_return = random.uniform(-0.015, 0.015)  # ±1.5%

            # Apply return to NAV
            current_nav = current_nav * (1 + daily_return)
            current_nav = round(current_nav, 2)

            # Check if snapshot already exists
            existing = PortfolioNavHistory.query.filter_by(
                portfolio_id=portfolio_id,
                snapshot_date=current_date
            ).first()

            if not existing:
                snapshot = PortfolioNavHistory(
                    portfolio_id=portfolio_id,
                    snapshot_date=current_date,
                    nav=current_nav
                )
                db.session.add(snapshot)
                count += 1

        current_date += timedelta(days=1)

    db.session.commit()
    logger.info(f'Seeded {count} NAV snapshots for portfolio {portfolio_id}')
    return count


def get_portfolio_seed_data(portfolio_id: int, nav_value: float) -> dict:
    """Get seeding parameters for a portfolio.

    Args:
        portfolio_id: Portfolio ID
        nav_value: Current NAV value (used as base for backfill)

    Returns:
        Dict with start_date, end_date, starting_nav
    """
    # Get earliest purchase date from portfolio
    from models.portfolio import Portfolio, PortfolioItem

    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio or not portfolio.items:
        return None

    purchase_dates = [item.purchase_date for item in portfolio.items if item.purchase_date]
    if not purchase_dates:
        return None

    purchase_dates.sort()
    start_date = purchase_dates[0]  # Format: YYYY-MM-DD string

    return {
        'start_date': start_date,
        'end_date': datetime.now().strftime('%Y-%m-%d'),
        'starting_nav': nav_value
    }
