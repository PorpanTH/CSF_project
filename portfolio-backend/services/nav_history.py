from models.portfolio import PortfolioNavHistory
from database.db import db
from datetime import datetime, timedelta
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


def record_nav_snapshot(portfolio_id: int, nav_value: float, snapshot_date=None) -> PortfolioNavHistory:
    """Record a NAV snapshot for a portfolio on a given date.

    Args:
        portfolio_id: Portfolio ID
        nav_value: Net Asset Value (from calculate_metrics)
        snapshot_date: Date for snapshot (defaults to today)

    Returns:
        PortfolioNavHistory record
    """
    if snapshot_date is None:
        snapshot_date = datetime.now().date()

    # Check if snapshot already exists for this date
    existing = PortfolioNavHistory.query.filter_by(
        portfolio_id=portfolio_id,
        snapshot_date=snapshot_date
    ).first()

    if existing:
        # Update existing snapshot
        existing.nav = nav_value
        db.session.commit()
        logger.info(f'Updated NAV snapshot for portfolio {portfolio_id} on {snapshot_date}')
        return existing

    # Create new snapshot
    snapshot = PortfolioNavHistory(
        portfolio_id=portfolio_id,
        snapshot_date=snapshot_date,
        nav=nav_value
    )
    db.session.add(snapshot)
    db.session.commit()
    logger.info(f'Created NAV snapshot for portfolio {portfolio_id} on {snapshot_date}: {nav_value}')
    return snapshot


def get_nav_history(portfolio_id: int, start_date=None, end_date=None) -> List[PortfolioNavHistory]:
    """Get NAV history for a portfolio within a date range.

    Args:
        portfolio_id: Portfolio ID
        start_date: Start date (defaults to beginning of year)
        end_date: End date (defaults to today)

    Returns:
        List of PortfolioNavHistory records, sorted by date
    """
    if end_date is None:
        end_date = datetime.now().date()

    if start_date is None:
        start_date = datetime(end_date.year, 1, 1).date()

    snapshots = PortfolioNavHistory.query.filter(
        PortfolioNavHistory.portfolio_id == portfolio_id,
        PortfolioNavHistory.snapshot_date >= start_date,
        PortfolioNavHistory.snapshot_date <= end_date
    ).order_by(PortfolioNavHistory.snapshot_date).all()

    return snapshots


def calculate_accumulated_pnl(snapshots: List[PortfolioNavHistory]) -> List[Dict]:
    """Calculate accumulated P/L from NAV history snapshots.

    Args:
        snapshots: List of PortfolioNavHistory records

    Returns:
        List of dicts: [{date: "YYYY-MM-DD", accumulated: value}, ...]
    """
    if not snapshots:
        return []

    accumulated_pnl_data = []
    accumulated = 0.0
    previous_nav = None

    for snapshot in snapshots:
        if previous_nav is None:
            # First day: accumulated = 0
            daily_delta = 0.0
            accumulated = 0.0
        else:
            daily_delta = snapshot.nav - previous_nav
            accumulated += daily_delta

        accumulated_pnl_data.append({
            'date': snapshot.snapshot_date.isoformat(),
            'accumulated': round(accumulated, 2)
        })

        previous_nav = snapshot.nav

    return accumulated_pnl_data


def calculate_daily_pnl(snapshots: List[PortfolioNavHistory]) -> List[Dict]:
    """Calculate daily P/L deltas from NAV history snapshots.

    Args:
        snapshots: List of PortfolioNavHistory records

    Returns:
        List of dicts: [{date: "YYYY-MM-DD", daily: value}, ...]
    """
    if not snapshots:
        return []

    daily_pnl_data = []
    previous_nav = None

    for snapshot in snapshots:
        if previous_nav is None:
            # First day: daily delta = 0
            daily_delta = 0.0
        else:
            daily_delta = snapshot.nav - previous_nav

        daily_pnl_data.append({
            'date': snapshot.snapshot_date.isoformat(),
            'daily': round(daily_delta, 2)
        })

        previous_nav = snapshot.nav

    return daily_pnl_data


def filter_by_range(snapshots: List[PortfolioNavHistory], range_param: str) -> List[PortfolioNavHistory]:
    """Filter snapshots by range parameter.

    Args:
        snapshots: List of PortfolioNavHistory records
        range_param: 'daily', 'weekly', 'monthly', or 'ytd'

    Returns:
        Filtered list
    """
    if not snapshots:
        return []

    today = datetime.now().date()

    if range_param == 'daily':
        # Return all snapshots for daily view (will show daily deltas)
        return snapshots

    elif range_param == 'weekly':
        cutoff_date = today - timedelta(days=7)

    elif range_param == 'monthly':
        cutoff_date = today - timedelta(days=30)

    elif range_param == 'ytd':
        cutoff_date = datetime(today.year, 1, 1).date()

    else:
        cutoff_date = datetime(today.year, 1, 1).date()

    filtered = [s for s in snapshots if s.snapshot_date >= cutoff_date]
    return filtered