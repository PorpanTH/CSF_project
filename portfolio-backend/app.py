from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from database.db import db

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configuration
    database_url = os.getenv('DATABASE_URL', 'sqlite:///portfolio.db')
    if database_url.startswith('mysql://'):
        database_url = database_url.replace('mysql://', 'mysql+pymysql://', 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Import models
    from models.user import User
    from models.portfolio import Portfolio

    # Register blueprints
    from routes.auth import auth_bp
    from routes.portfolios import portfolio_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(portfolio_bp, url_prefix='/api')

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'message': 'Portfolio API is running'}), 200
    
    @app.route('/api/database', methods=['GET'])
    def query_demo():
        try:
            users = User.query.all()
            portfolios = Portfolio.query.all()

            portfolio_data = []
            for portfolio in portfolios:
                metrics = portfolio.calculate_metrics()
                items_data = []
                for item in portfolio.items:
                    total_value = item.quantity * item.current_price
                    items_data.append({
                        'ticker': item.ticker,
                        'quantity': item.quantity,
                        'current_price': item.current_price,
                        'asset_class': item.asset_class,
                        'total_value': total_value
                    })

                portfolio_data.append({
                    'name': portfolio.name,
                    'owner': portfolio.owner.name if portfolio.owner else 'Unknown',
                    'items': items_data,
                    'metrics': {
                        'totalValue': metrics['totalValue'],
                        'totalCost': metrics['totalCost'],
                        'unrealizedPnL': metrics['unrealizedPnL'],
                        'unrealizedPnLPercent': metrics['unrealizedPnLPercent']
                    }
                })

            total_portfolio_value = sum(
                item.quantity * item.current_price
                for portfolio in portfolios
                for item in portfolio.items
            )

            return jsonify({
                'success': True,
                'userCount': len(users),
                'users': [{'id': u.id, 'name': u.name} for u in users],
                'portfolios': portfolio_data,
                'totalPortfolioValue': total_portfolio_value
            }), 200

        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request'}), 400

    # Create tables
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
