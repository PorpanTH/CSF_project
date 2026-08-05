#!/usr/bin/env python3
"""
Seed portfolio NAV history with realistic daily market data.
Generates daily NAV snapshots from Aug 5, 2024 to Aug 4, 2026 (2 years).
Uses geometric Brownian motion to simulate realistic market fluctuations.
Target: 55% total return with 40% annualized volatility for realistic daily swings.
Expected: ±0.25% typical day, ±0.50% extreme days, ±0.76% rare days.
"""

import sys
import os
from datetime import datetime, timedelta
import random
import math

sys.path.insert(0, os.path.dirname(__file__))

from controller.app import create_app
from models.portfolio import PortfolioNavHistory
from database.db import db


def get_business_days(start_date, end_date):
    """Generate list of business days (Mon-Fri) between start and end dates."""
    current = start_date
    business_days = []
    while current <= end_date:
        if current.weekday() < 5:  # Monday=0, Friday=4
            business_days.append(current)
        current += timedelta(days=1)
    return business_days


def generate_nav_data(initial_nav, business_days, target_return_pct):
    """
    Generate daily NAV using geometric Brownian motion.

    Args:
        initial_nav: Starting NAV value
        business_days: List of business day dates
        target_return_pct: Target 2-year return percentage (e.g., 55 for 55%)

    Returns:
        List of tuples: (date, nav_value)
    """
    num_days = len(business_days)
    target_return = target_return_pct / 100.0

    # 40% annualized volatility creates visible daily swings of ±0.5-1%
    sigma = 1.2

    # Drift adjusted to achieve target return
    # Formula: (mu - sigma^2/2) * (num_days / 252) = ln(1 + target_return)
    mu = math.log(1 + target_return) * 252.0 / num_days + sigma**2 / 2

    nav_history = [(business_days[0], initial_nav)]
    current_nav = initial_nav

    random.seed(42)  # Reproducible randomization

    for i in range(1, num_days):
        z = random.gauss(0, 1)
        dt = 1 / 252.0  # Trading days per year
        exponent = (mu - sigma**2 / 2) * dt + sigma * math.sqrt(dt) * z
        current_nav = current_nav * math.exp(exponent)
        nav_history.append((business_days[i], current_nav))

    return nav_history


def seed_nav_history():
    """Main function to seed NAV history data."""
    app = create_app()

    with app.app_context():
        portfolio_id = 1
        start_date = datetime(2024, 8, 5).date()
        end_date = datetime(2026, 8, 4).date()
        initial_nav = 10000.0
        target_return_pct = 55.0  # 55% over 2 years (middle of 50-60% range)

        print(f"\n{'='*70}")
        print(f"SEEDING NAV HISTORY FOR PORTFOLIO {portfolio_id}")
        print(f"{'='*70}")
        print(f"Period: {start_date} to {end_date}")
        print(f"Target return: {target_return_pct}%")
        print(f"Initial NAV: ${initial_nav:,.2f}")

        business_days = get_business_days(start_date, end_date)
        print(f"Business days to generate: {len(business_days)}")

        print(f"\nClearing existing NAV history for portfolio {portfolio_id}...")
        deleted = PortfolioNavHistory.query.filter_by(portfolio_id=portfolio_id).delete()
        db.session.commit()
        print(f"Deleted {deleted} existing records")

        print(f"\nGenerating NAV data using geometric Brownian motion...")
        nav_data = generate_nav_data(initial_nav, business_days, target_return_pct)

        final_nav = nav_data[-1][1]
        actual_return = (final_nav - initial_nav) / initial_nav * 100

        print(f"Generated {len(nav_data)} NAV data points")
        print(f"Final NAV: ${final_nav:,.2f}")
        print(f"Actual return: {actual_return:.2f}%")

        print(f"\nInserting {len(nav_data)} records into database...")
        inserted_count = 0

        for idx, (snapshot_date, nav_value) in enumerate(nav_data):
            snapshot = PortfolioNavHistory(
                portfolio_id=portfolio_id,
                snapshot_date=snapshot_date,
                nav=nav_value
            )
            db.session.add(snapshot)
            inserted_count += 1

            if (idx + 1) % 100 == 0:
                db.session.commit()
                print(f"  Committed {idx + 1} records...")

        db.session.commit()

        print(f"\n{'='*70}")
        print(f"SUCCESS: Inserted {inserted_count} NAV records")
        print(f"Total return: {actual_return:.2f}%")
        print(f"{'='*70}\n")


if __name__ == '__main__':
    seed_nav_history()
