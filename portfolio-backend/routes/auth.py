from flask import Blueprint, jsonify
from app import db
from models.user import User

auth_bp = Blueprint('auth', __name__)

def get_default_user():
    user = User.query.get(1)
    if not user:
        user = User(id=1, name='Portfolio Manager')
        db.session.add(user)
        db.session.commit()
    return user

@auth_bp.route('/user', methods=['GET'])
def get_user():
    user = get_default_user()
    return jsonify(user.to_dict()), 200
