from flask import Blueprint, jsonify, request
from services.Portfolio_Services import Portfolio_Service

portfolio_bp = Blueprint('portfolio_bp', __name__)


@portfolio_bp.route('/portfolio', methods=['GET'])
def get_all_portfolio_items():
    portfolio_items = Portfolio_Service.get_all_portfolio_items()
    portfolio_item_list_of_dict = [portfolio_item.to_dict() for portfolio_item in portfolio_items]
    return jsonify(portfolio_item_list_of_dict), 200


@portfolio_bp.route('/portfolio', methods=['POST'])
def create_portfolio_item():
    data = request.get_json(silent=True) or {}
    required_fields = ['assetClass', 'ticker', 'quantity', 'purchasePrice', 'purchaseDate']
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return jsonify({'error': f"Missing required fields: {', '.join(missing)}"}), 400

    item = Portfolio_Service.create_portfolio_item({
        'portfolioId': data.get('portfolioId', 1),
        'assetClass': data['assetClass'],
        'itemType': data.get('itemType', 'investment'),
        'ticker': data['ticker'],
        'quantity': data['quantity'],
        'purchasePrice': data['purchasePrice'],
        'purchaseDate': data['purchaseDate'],
        'name': data.get('name'),
        'sector': data.get('sector', ''),
        'region': data.get('region', '')
    })

    if item is None:
        return jsonify({'error': 'Failed to create portfolio item. Check server logs for the database error.'}), 500

    return jsonify(item.to_dict()), 201


@portfolio_bp.route('/portfolio/<int:item_id>', methods=['PUT'])
def update_portfolio_item(item_id):
    data = request.get_json(silent=True) or {}
    if not data:
        return jsonify({'error': 'No update data provided'}), 400

    item = Portfolio_Service.update_portfolio_item(item_id, data)
    if item is None:
        return jsonify({'error': 'Failed to update portfolio item'}), 500

    return jsonify(item.to_dict()), 200