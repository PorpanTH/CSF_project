from flask import Blueprint, jsonify, request
from services.Portfolio_Services import Portfolio_Service

portfolio_bp = Blueprint('portfolio_bp', __name__)


@portfolio_bp.route('/portfolio', methods=['GET'])
def get_all_portfolio_items():
    portfolio_items = Portfolio_Service.get_all_portfolio_items()
    portfolio_item_list_of_dict = [portfolio_item.to_dict() for portfolio_item in portfolio_items]
    return jsonify(portfolio_item_list_of_dict), 200


# @portfolio_bp.route('/publishers', methods=['POST'])
# def create_publisher():
#     data = request.get_json()
#     required_fields = ['pub_id', 'pub_name', 'city', 'state', 'country']
#     missing = [f for f in required_fields if not data or f not in data]
#     if missing:
#         return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
#     publisher = Publisher_service.create_publisher(data)
#     return jsonify(publisher.to_dict()), 201

# @publisher_bp.route('/publishers', methods =["DELETE"])
# def delete_publisher():
#     data = request.get_json()
#     required_fields = ['pub_name']
#     missing = [f for f in required_fields if not data or f not in data]
#     if missing:
#         return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
#     publisher = Publisher_service.delete_publisher(data)
#     return jsonify(publisher.to_dict()), 201