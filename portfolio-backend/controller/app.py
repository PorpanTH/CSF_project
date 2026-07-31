import logging
import time

from flask import Flask, jsonify, g, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from sqlalchemy import event
from repository import test_connection

load_dotenv()

def create_app():
    app = Flask(__name__)

    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    app.logger.handlers.clear()
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s [%(name)s] %(message)s'))
    app.logger.addHandler(handler)
    app.logger.setLevel(getattr(logging, log_level, logging.INFO))
    app.logger.propagate = False

    # Configuration
    db = test_connection.get_database_connection()

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    @app.before_request
    def log_incoming_request():
        g.request_started_at = time.perf_counter()
        payload = request.get_json(silent=True)
        app.logger.info(
            "request %s %s query=%s payload=%s",
            request.method,
            request.path,
            request.args.to_dict(flat=True),
            payload,
        )

    @app.after_request
    def log_outgoing_response(response):
        duration_ms = (time.perf_counter() - getattr(g, 'request_started_at', time.perf_counter())) * 1000
        app.logger.info(
            "response %s %s status=%s duration_ms=%.2f",
            request.method,
            request.path,
            response.status_code,
            duration_ms,
        )
        return response

    @app.teardown_request
    def log_request_teardown(error):
        if error is not None:
            app.logger.error("request failed %s %s: %s", request.method, request.path, error)

    with app.app_context():
        @event.listens_for(db.engine, 'before_cursor_execute')
        def log_sql_before_execute(conn, cursor, statement, parameters, context, executemany):
            conn.info.setdefault('query_start_time', []).append(time.perf_counter())
            app.logger.debug('sql start executemany=%s statement=%s parameters=%s', executemany, statement, parameters)

        @event.listens_for(db.engine, 'after_cursor_execute')
        def log_sql_after_execute(conn, cursor, statement, parameters, context, executemany):
            total = time.perf_counter() - conn.info['query_start_time'].pop(-1)
            app.logger.debug('sql done duration_ms=%.2f rowcount=%s', total * 1000, cursor.rowcount)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.portfolios import portfolio_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(portfolio_bp, url_prefix='/api')

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'message': 'Portfolio API is running'}), 200

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
        from models.user import User
        from models.portfolio import Portfolio, PortfolioItem

        user = User.query.get(1)
        if not user:
            app.logger.info('seeding default user')
            user = User(id=1, name='Portfolio Manager')
            db.session.add(user)
            db.session.commit()

        portfolio = Portfolio.query.filter_by(user_id=1).first()
        if not portfolio:
            app.logger.info('seeding default portfolio and holdings')
            portfolio = Portfolio(
                user_id=1,
                name='Primary Investment Portfolio',
                description='My main investment portfolio focused on long-term growth',
            )
            db.session.add(portfolio)
            db.session.commit()

            default_items = [
                {'asset_class': 'stock', 'item_type': 'stock', 'ticker': 'AAPL', 'quantity': 50, 'purchase_price': 150.25, 'current_price': 228.45, 'purchase_date': '2023-06-15', 'realized_pnl': 820.50, 'sector': 'Technology', 'region': 'North America', 'price_history': [228.45]},
                {'asset_class': 'stock', 'item_type': 'stock', 'ticker': 'MSFT', 'quantity': 30, 'purchase_price': 310.50, 'current_price': 417.89, 'purchase_date': '2023-08-20', 'realized_pnl': 445.00, 'sector': 'Technology', 'region': 'North America', 'price_history': [417.89]},
                {'asset_class': 'stock', 'item_type': 'stock', 'ticker': 'GOOGL', 'quantity': 25, 'purchase_price': 100.00, 'current_price': 155.62, 'purchase_date': '2023-09-10', 'realized_pnl': -120.00, 'sector': 'Technology', 'region': 'North America', 'price_history': [155.62]},
                {'asset_class': 'stock', 'item_type': 'stock', 'ticker': 'ASML', 'quantity': 10, 'purchase_price': 550.00, 'current_price': 680.30, 'purchase_date': '2023-11-02', 'realized_pnl': 0, 'sector': 'Technology', 'region': 'Europe', 'price_history': [680.30]},
                {'asset_class': 'stock', 'item_type': 'stock', 'ticker': 'TSM', 'quantity': 40, 'purchase_price': 90.00, 'current_price': 165.20, 'purchase_date': '2024-01-18', 'realized_pnl': 210.00, 'sector': 'Technology', 'region': 'Asia', 'price_history': [165.20]},
                {'asset_class': 'bond', 'item_type': 'bond', 'ticker': 'VBTLX', 'quantity': 100, 'purchase_price': 75.00, 'current_price': 76.50, 'purchase_date': '2023-07-01', 'realized_pnl': 30.00, 'sector': 'Fixed Income', 'region': 'North America', 'price_history': [76.50]},
                {'asset_class': 'cash', 'item_type': 'cash', 'ticker': 'CASH', 'quantity': 5000, 'purchase_price': 1.0, 'current_price': 1.0, 'purchase_date': '2024-07-20', 'realized_pnl': 0, 'sector': 'Cash & Equivalents', 'region': 'North America', 'price_history': [1.0]},
            ]

            for item_data in default_items:
                db.session.add(PortfolioItem(portfolio_id=portfolio.id, **item_data))
            db.session.commit()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
