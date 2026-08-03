from flask import Blueprint, request, jsonify, current_app
import yfinance as yf
from database.db import db
from models.portfolio import Portfolio, PortfolioItem
from routes.auth import get_default_user
from services.nav_history import (
    record_nav_snapshot,
    get_nav_history,
    calculate_accumulated_pnl,
    filter_by_range
)
from datetime import datetime, timedelta
import time

portfolio_bp = Blueprint('portfolios', __name__)

USER_ID = 1


def _log_action(action, **details):
    current_app.logger.info('%s %s', action, details)


def _get_live_prices(items):
    live_prices = {}
    for ticker in {item.ticker.strip().upper() for item in items if item.ticker}:
        try:
            history = yf.Ticker(ticker).history(period='1d')
            if not history.empty:
                live_prices[ticker] = float(history['Close'].iloc[-1])
        except Exception:
            continue
    return live_prices

@portfolio_bp.route('/portfolios', methods=['GET'])
@portfolio_bp.route('/portfolios/', methods=['GET'])
def get_portfolios():
    _log_action('list portfolios', user_id=USER_ID)
    portfolios = Portfolio.query.filter_by(user_id=USER_ID).all()
    current_app.logger.debug('found %s portfolios', len(portfolios))
    return jsonify([p.to_dict(_get_live_prices(p.items)) for p in portfolios]), 200

@portfolio_bp.route('/portfolios', methods=['POST'])
def create_portfolio():
    data = request.get_json()
    _log_action('create portfolio request', payload=data)
    if not data or not data.get('name'):
        return jsonify({'error': 'Portfolio name is required'}), 400

    get_default_user()
    portfolio = Portfolio(user_id=USER_ID, name=data['name'], description=data.get('description', ''))
    try:
        db.session.add(portfolio)
        db.session.commit()
        _log_action('created portfolio', portfolio_id=portfolio.id, name=portfolio.name)
        return jsonify(portfolio.to_dict(_get_live_prices(portfolio.items))), 201
    except Exception as e:
        current_app.logger.exception('failed to create portfolio')
        db.session.rollback()
        return jsonify({'error': 'Failed to create portfolio'}), 500

@portfolio_bp.route('/portfolios/<int:portfolio_id>', methods=['GET'])
def get_portfolio(portfolio_id):
    _log_action('get portfolio', portfolio_id=portfolio_id)
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    return jsonify(portfolio.to_dict(_get_live_prices(portfolio.items))), 200

@portfolio_bp.route('/portfolios/<int:portfolio_id>', methods=['PUT'])
def update_portfolio(portfolio_id):
    _log_action('update portfolio request', portfolio_id=portfolio_id)
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    data = request.get_json()
    if data.get('name'):
        portfolio.name = data['name']
    if 'description' in data:
        portfolio.description = data['description']

    try:
        db.session.commit()
        _log_action('updated portfolio', portfolio_id=portfolio.id)
        return jsonify(portfolio.to_dict(_get_live_prices(portfolio.items))), 200
    except Exception as e:
        current_app.logger.exception('failed to update portfolio')
        db.session.rollback()
        return jsonify({'error': 'Failed to update portfolio'}), 500

@portfolio_bp.route('/portfolios/<int:portfolio_id>', methods=['DELETE'])
def delete_portfolio(portfolio_id):
    _log_action('delete portfolio request', portfolio_id=portfolio_id)
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    try:
        db.session.delete(portfolio)
        db.session.commit()
        _log_action('deleted portfolio', portfolio_id=portfolio_id)
        return jsonify({'message': 'Portfolio deleted successfully'}), 200
    except Exception as e:
        current_app.logger.exception('failed to delete portfolio')
        db.session.rollback()
        return jsonify({'error': 'Failed to delete portfolio'}), 500

@portfolio_bp.route('/portfolios/<int:portfolio_id>/items', methods=['POST'])
def add_portfolio_item(portfolio_id):
    _log_action('add portfolio item request', portfolio_id=portfolio_id)
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    data = request.get_json()
    required = ['assetClass', 'itemType', 'ticker', 'quantity', 'purchasePrice', 'purchaseDate']
    if not all(field in data for field in required):
        return jsonify({'error': f'Missing required fields: {", ".join(required)}'}), 400

    item = PortfolioItem(
        portfolio_id=portfolio_id,
        asset_class=data['assetClass'],
        item_type=data['itemType'],
        ticker=data['ticker'],
        quantity=data['quantity'],
        purchase_price=data['purchasePrice'],
        purchase_date=data['purchaseDate'],
        sector=data.get('sector', ''),
        region=data.get('region', '')
    )

    try:
        db.session.add(item)
        db.session.commit()
        _log_action('added portfolio item', portfolio_id=portfolio_id, item_id=item.id, ticker=item.ticker)
        return jsonify(item.to_dict()), 201
    except Exception as e:
        current_app.logger.exception('failed to add portfolio item')
        db.session.rollback()
        return jsonify({'error': 'Failed to add item'}), 500

@portfolio_bp.route('/portfolios/<int:portfolio_id>/items/<int:item_id>', methods=['PUT'])
def update_portfolio_item(portfolio_id, item_id):
    _log_action('update portfolio item request', portfolio_id=portfolio_id, item_id=item_id)
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    item = PortfolioItem.query.filter_by(id=item_id, portfolio_id=portfolio_id).first()
    if not item:
        return jsonify({'error': 'Item not found'}), 404

    data = request.get_json()
    if 'assetClass' in data:
        item.asset_class = data['assetClass']
    if 'itemType' in data:
        item.item_type = data['itemType']
    if 'ticker' in data:
        item.ticker = data['ticker']
    if 'quantity' in data:
        item.quantity = data['quantity']
    if 'purchasePrice' in data:
        item.purchase_price = data['purchasePrice']
    if 'purchaseDate' in data:
        item.purchase_date = data['purchaseDate']
    if 'sector' in data:
        item.sector = data['sector']
    if 'region' in data:
        item.region = data['region']

    try:
        db.session.commit()
        _log_action('updated portfolio item', portfolio_id=portfolio_id, item_id=item_id)
        return jsonify(item.to_dict()), 200
    except Exception as e:
        current_app.logger.exception('failed to update portfolio item')
        db.session.rollback()
        return jsonify({'error': 'Failed to update item'}), 500

@portfolio_bp.route('/portfolios/<int:portfolio_id>/items/<int:item_id>', methods=['DELETE'])
def delete_portfolio_item(portfolio_id, item_id):
    _log_action('delete portfolio item request', portfolio_id=portfolio_id, item_id=item_id)
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    item = PortfolioItem.query.filter_by(id=item_id, portfolio_id=portfolio_id).first()
    if not item:
        return jsonify({'error': 'Item not found'}), 404

    try:
        db.session.delete(item)
        db.session.commit()
        _log_action('deleted portfolio item', portfolio_id=portfolio_id, item_id=item_id)
        return jsonify({'message': 'Item deleted successfully'}), 200
    except Exception as e:
        current_app.logger.exception('failed to delete portfolio item')
        db.session.rollback()
        return jsonify({'error': 'Failed to delete item'}), 500


@portfolio_bp.route('/portfolios/<int:portfolio_id>/nav-snapshot', methods=['POST'])
def record_portfolio_nav(portfolio_id):
    _log_action('record nav snapshot request', portfolio_id=portfolio_id)

    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    if not portfolio.items:
        _log_action('empty portfolio', portfolio_id=portfolio_id)
        return jsonify({'error': 'Portfolio has no items'}), 400

    try:
        # Use existing calculate_metrics with live prices
        live_prices = _get_live_prices(portfolio.items)
        metrics = portfolio.calculate_metrics(live_prices)
        nav = metrics['totalValue']

        # Record the snapshot
        snapshot = record_nav_snapshot(portfolio_id, nav)

        _log_action('nav snapshot recorded', portfolio_id=portfolio_id, nav=nav)
        return jsonify(snapshot.to_dict()), 201

    except Exception as e:
        current_app.logger.exception('failed to record nav snapshot')
        return jsonify({'error': 'Failed to record NAV snapshot'}), 500


@portfolio_bp.route('/portfolios/<int:portfolio_id>/accumulated-pnl', methods=['GET'])
def get_accumulated_pnl(portfolio_id):
    """Get accumulated P/L for a portfolio from historical NAV snapshots.

    Query Parameters:
    - range: 'daily' | 'weekly' | 'monthly' | 'ytd' (default: 'ytd')

    Returns:
    [{date: "YYYY-MM-DD", accumulated: number}, ...]
    """
    _log_action('get accumulated pnl', portfolio_id=portfolio_id)

    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    try:
        range_param = request.args.get('range', 'ytd').lower()
        if range_param not in ['daily', 'weekly', 'monthly', 'ytd']:
            range_param = 'ytd'

        # Get NAV history
        snapshots = get_nav_history(portfolio_id)

        if not snapshots:
            _log_action('no nav history', portfolio_id=portfolio_id)
            return jsonify([]), 200

        # Filter by range
        filtered_snapshots = filter_by_range(snapshots, range_param)

        # Calculate accumulated P/L
        accumulated_pnl_data = calculate_accumulated_pnl(filtered_snapshots)

        _log_action(
            'accumulated pnl calculated',
            portfolio_id=portfolio_id,
            data_points=len(accumulated_pnl_data),
            range=range_param
        )

        return jsonify(accumulated_pnl_data), 200

    except Exception as e:
        current_app.logger.exception('failed to calculate accumulated pnl')
        return jsonify({'error': 'Failed to calculate accumulated PnL'}), 500


@portfolio_bp.route('/portfolios/<int:portfolio_id>/backfill-nav', methods=['POST'])
def backfill_nav_history(portfolio_id):
    """Backfill NAV snapshots from portfolio creation date to today.

    Fetches historical prices and calculates NAV for each trading day.
    """
    _log_action('backfill nav history request', portfolio_id=portfolio_id)

    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    if not portfolio.items:
        return jsonify({'error': 'Portfolio has no items'}), 400

    try:
        start_date = portfolio.created_at.date()
        end_date = datetime.now().date()
        current_date = start_date
        count = 0

        _log_action(
            'backfilling nav',
            portfolio_id=portfolio_id,
            start_date=str(start_date),
            end_date=str(end_date)
        )

        while current_date <= end_date:
            # Only process trading days (skip weekends)
            if current_date.weekday() < 5:
                live_prices = {}

                # Fetch prices for that date (only for items that existed on that date)
                for idx, item in enumerate(portfolio.items):
                    if item.purchase_date <= str(current_date):
                        ticker = item.ticker.strip().upper()
                        if ticker == 'BTC':
                            ticker = 'BTC-USD'

                        # Retry logic with exponential backoff
                        max_retries = 3
                        for attempt in range(max_retries):
                            try:
                                # Add delay between ticker requests to avoid rate limiting
                                if idx > 0:
                                    time.sleep(1)

                                data = yf.download(
                                    ticker,
                                    start=str(current_date),
                                    end=str(current_date),
                                    progress=False
                                )

                                if not data.empty:
                                    live_prices[ticker] = float(data['Close'].iloc[-1])
                                break  # Success, exit retry loop

                            except Exception as e:
                                if attempt < max_retries - 1:
                                    wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                                    current_app.logger.warning(
                                        f'Retry {attempt + 1}/{max_retries} for {ticker} on {current_date}. '
                                        f'Waiting {wait_time}s. Error: {str(e)[:50]}'
                                    )
                                    time.sleep(wait_time)
                                else:
                                    current_app.logger.debug(f'Could not fetch {ticker} for {current_date} after {max_retries} attempts')
                                    continue

                # Calculate NAV for that date
                if live_prices:
                    metrics = portfolio.calculate_metrics(live_prices)
                    nav = metrics['totalValue']
                    record_nav_snapshot(portfolio_id, nav, current_date)
                    count += 1

            current_date += timedelta(days=1)

        _log_action('backfill completed', portfolio_id=portfolio_id, snapshots_created=count)
        return jsonify({
            'message': f'Backfilled {count} NAV snapshots',
            'start_date': str(start_date),
            'end_date': str(end_date),
            'snapshots': count
        }), 201

    except Exception as e:
        current_app.logger.exception('backfill nav history failed')
        return jsonify({'error': f'Backfill failed: {str(e)}'}), 500
