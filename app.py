import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
from flask_cors import CORS
from functools import wraps
from database.config import engine, SessionLocal, Base
from database.models import Portfolio, PortfolioItem, User
from database.auth import SessionToken, get_or_create_user, create_session_token, validate_session_token, logout_token

app = Flask(__name__)
CORS(app)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Missing token'}), 401

        user_id = validate_session_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401

        return f(user_id=user_id, *args, **kwargs)
    return decorated

@app.route('/api/auth/auto-login', methods=['POST'])
def auto_login():
    """Auto-login as the default user."""
    db = SessionLocal()
    try:
        user = get_or_create_user(db)
        token = create_session_token(user.id)
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    finally:
        db.close()

@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout(user_id):
    """Logout and invalidate the session token."""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    logout_token(token)
    return jsonify({'message': 'Logged out'}), 200

@app.route('/api/portfolios', methods=['GET'])
@require_auth
def get_portfolios(user_id):
    db = SessionLocal()
    try:
        portfolios = db.query(Portfolio).filter_by(user_id=user_id).all()
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'createdAt': p.created_at.isoformat(),
            'updatedAt': p.updated_at.isoformat(),
            'items': [{
                'id': item.id,
                'portfolioId': item.portfolio_id,
                'itemType': item.item_type,
                'ticker': item.ticker,
                'quantity': item.quantity,
                'purchasePrice': item.purchase_price,
                'purchaseDate': item.purchase_date.isoformat(),
                'currentPrice': item.current_price,
                'createdAt': item.created_at.isoformat(),
                'updatedAt': item.updated_at.isoformat(),
            } for item in p.items]
        } for p in portfolios]), 200
    finally:
        db.close()

@app.route('/api/portfolios', methods=['POST'])
@require_auth
def create_portfolio(user_id):
    db = SessionLocal()
    try:
        data = request.get_json()
        if not data.get('name'):
            return jsonify({'error': 'Portfolio name is required'}), 400

        portfolio = Portfolio(
            user_id=user_id,
            name=data['name'],
            description=data.get('description', '')
        )
        db.add(portfolio)
        db.commit()

        return jsonify({
            'id': portfolio.id,
            'name': portfolio.name,
            'description': portfolio.description,
            'createdAt': portfolio.created_at.isoformat(),
            'updatedAt': portfolio.updated_at.isoformat(),
            'items': []
        }), 201
    finally:
        db.close()

@app.route('/api/portfolios/<int:portfolio_id>', methods=['GET'])
@require_auth
def get_portfolio(user_id, portfolio_id):
    db = SessionLocal()
    try:
        portfolio = db.query(Portfolio).filter_by(id=portfolio_id, user_id=user_id).first()
        if not portfolio:
            return jsonify({'error': 'Portfolio not found'}), 404

        return jsonify({
            'id': portfolio.id,
            'name': portfolio.name,
            'description': portfolio.description,
            'createdAt': portfolio.created_at.isoformat(),
            'updatedAt': portfolio.updated_at.isoformat(),
            'items': [{
                'id': item.id,
                'portfolioId': item.portfolio_id,
                'itemType': item.item_type,
                'ticker': item.ticker,
                'quantity': item.quantity,
                'purchasePrice': item.purchase_price,
                'purchaseDate': item.purchase_date.isoformat(),
                'currentPrice': item.current_price,
                'createdAt': item.created_at.isoformat(),
                'updatedAt': item.updated_at.isoformat(),
            } for item in portfolio.items]
        }), 200
    finally:
        db.close()

@app.route('/api/portfolios/<int:portfolio_id>', methods=['PUT'])
@require_auth
def update_portfolio(user_id, portfolio_id):
    db = SessionLocal()
    try:
        portfolio = db.query(Portfolio).filter_by(id=portfolio_id, user_id=user_id).first()
        if not portfolio:
            return jsonify({'error': 'Portfolio not found'}), 404

        data = request.get_json()
        portfolio.name = data.get('name', portfolio.name)
        portfolio.description = data.get('description', portfolio.description)
        db.commit()

        return jsonify({
            'id': portfolio.id,
            'name': portfolio.name,
            'description': portfolio.description,
            'createdAt': portfolio.created_at.isoformat(),
            'updatedAt': portfolio.updated_at.isoformat(),
            'items': [{
                'id': item.id,
                'portfolioId': item.portfolio_id,
                'itemType': item.item_type,
                'ticker': item.ticker,
                'quantity': item.quantity,
                'purchasePrice': item.purchase_price,
                'purchaseDate': item.purchase_date.isoformat(),
                'currentPrice': item.current_price,
                'createdAt': item.created_at.isoformat(),
                'updatedAt': item.updated_at.isoformat(),
            } for item in portfolio.items]
        }), 200
    finally:
        db.close()

@app.route('/api/portfolios/<int:portfolio_id>', methods=['DELETE'])
@require_auth
def delete_portfolio(user_id, portfolio_id):
    db = SessionLocal()
    try:
        portfolio = db.query(Portfolio).filter_by(id=portfolio_id, user_id=user_id).first()
        if not portfolio:
            return jsonify({'error': 'Portfolio not found'}), 404

        db.delete(portfolio)
        db.commit()

        return jsonify({'message': 'Portfolio deleted'}), 200
    finally:
        db.close()

@app.route('/api/portfolios/<int:portfolio_id>/items', methods=['POST'])
@require_auth
def add_portfolio_item(user_id, portfolio_id):
    db = SessionLocal()
    try:
        portfolio = db.query(Portfolio).filter_by(id=portfolio_id, user_id=user_id).first()
        if not portfolio:
            return jsonify({'error': 'Portfolio not found'}), 404

        data = request.get_json()
        item = PortfolioItem(
            portfolio_id=portfolio_id,
            item_type=data['itemType'],
            ticker=data['ticker'],
            quantity=data['quantity'],
            purchase_price=data['purchasePrice'],
            purchase_date=data['purchaseDate'],
            current_price=data['currentPrice']
        )
        db.add(item)
        db.commit()

        return jsonify({
            'id': item.id,
            'portfolioId': item.portfolio_id,
            'itemType': item.item_type,
            'ticker': item.ticker,
            'quantity': item.quantity,
            'purchasePrice': item.purchase_price,
            'purchaseDate': item.purchase_date.isoformat(),
            'currentPrice': item.current_price,
            'createdAt': item.created_at.isoformat(),
            'updatedAt': item.updated_at.isoformat(),
        }), 201
    finally:
        db.close()

@app.route('/api/portfolios/<int:portfolio_id>/items/<int:item_id>', methods=['DELETE'])
@require_auth
def delete_portfolio_item(user_id, portfolio_id, item_id):
    db = SessionLocal()
    try:
        portfolio = db.query(Portfolio).filter_by(id=portfolio_id, user_id=user_id).first()
        if not portfolio:
            return jsonify({'error': 'Portfolio not found'}), 404

        item = db.query(PortfolioItem).filter_by(id=item_id, portfolio_id=portfolio_id).first()
        if not item:
            return jsonify({'error': 'Item not found'}), 404

        db.delete(item)
        db.commit()

        return jsonify({'message': 'Item deleted'}), 200
    finally:
        db.close()

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    Base.metadata.create_all(bind=engine)
    app.run(debug=True, port=5000)
