from flask import Blueprint, request, jsonify
from services.symbol_directory import search_symbols
from services.quotes import get_quotes

market_bp = Blueprint('market', __name__)


@market_bp.route('/symbols', methods=['GET'])
def get_symbols():
    """Search NYSE-listed symbols by ticker or company name."""
    query = request.args.get('q', '').strip()
    category = request.args.get('category', 'all')
    limit = min(int(request.args.get('limit', 25)), 100)

    results = search_symbols(query, category, limit)
    return jsonify(results), 200


@market_bp.route('/quotes', methods=['POST'])
def get_quotes_route():
    """Get live prices and daily change for a list of tickers."""
    data = request.get_json() or {}
    tickers = data.get('tickers', [])

    # Cap tickers to prevent abuse
    if len(tickers) > 30:
        tickers = tickers[:30]

    if not tickers:
        return jsonify({}), 200

    quotes = get_quotes(tickers)
    return jsonify(quotes), 200
