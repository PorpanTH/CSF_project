from flask import Blueprint, request, jsonify
from app import db
from models.portfolio import Portfolio, PortfolioItem
from routes.auth import get_default_user

portfolio_bp = Blueprint('portfolios', __name__)

USER_ID = 1

@portfolio_bp.route('/portfolios', methods=['GET'])
def get_portfolios():
    portfolios = Portfolio.query.filter_by(user_id=USER_ID).all()
    return jsonify([p.to_dict() for p in portfolios]), 200

@portfolio_bp.route('/portfolios', methods=['POST'])
def create_portfolio():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Portfolio name is required'}), 400

    get_default_user()
    portfolio = Portfolio(user_id=USER_ID, name=data['name'], description=data.get('description', ''))
    try:
        db.session.add(portfolio)
        db.session.commit()
        return jsonify(portfolio.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create portfolio'}), 500

@portfolio_bp.route('/portfolios/<int:portfolio_id>', methods=['GET'])
def get_portfolio(portfolio_id):
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    return jsonify(portfolio.to_dict()), 200

@portfolio_bp.route('/portfolios/<int:portfolio_id>', methods=['PUT'])
def update_portfolio(portfolio_id):
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
        return jsonify(portfolio.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update portfolio'}), 500

@portfolio_bp.route('/portfolios/<int:portfolio_id>', methods=['DELETE'])
def delete_portfolio(portfolio_id):
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    try:
        db.session.delete(portfolio)
        db.session.commit()
        return jsonify({'message': 'Portfolio deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete portfolio'}), 500

@portfolio_bp.route('/portfolios/<int:portfolio_id>/items', methods=['POST'])
def add_portfolio_item(portfolio_id):
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    data = request.get_json()
    required = ['assetClass', 'itemType', 'ticker', 'quantity', 'purchasePrice', 'currentPrice', 'purchaseDate']
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
        current_price=data['currentPrice'],
        realized_pnl=data.get('realizedPnL', 0),
        sector=data.get('sector', ''),
        region=data.get('region', ''),
        price_history=data.get('priceHistory', [])
    )

    try:
        db.session.add(item)
        db.session.commit()
        return jsonify(item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add item'}), 500

@portfolio_bp.route('/portfolios/<int:portfolio_id>/items/<int:item_id>', methods=['PUT'])
def update_portfolio_item(portfolio_id, item_id):
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
    if 'currentPrice' in data:
        item.current_price = data['currentPrice']
    if 'realizedPnL' in data:
        item.realized_pnl = data['realizedPnL']
    if 'sector' in data:
        item.sector = data['sector']
    if 'region' in data:
        item.region = data['region']
    if 'priceHistory' in data:
        item.price_history = data['priceHistory']

    try:
        db.session.commit()
        return jsonify(item.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update item'}), 500

@portfolio_bp.route('/portfolios/<int:portfolio_id>/items/<int:item_id>', methods=['DELETE'])
def delete_portfolio_item(portfolio_id, item_id):
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=USER_ID).first()
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404

    item = PortfolioItem.query.filter_by(id=item_id, portfolio_id=portfolio_id).first()
    if not item:
        return jsonify({'error': 'Item not found'}), 404

    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete item'}), 500
