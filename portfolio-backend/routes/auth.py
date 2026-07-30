from flask import Blueprint, jsonify, current_app
from database.db import db
from models.user import User

auth_bp = Blueprint('auth', __name__)

def get_default_user():
    current_app.logger.debug('loading default user')
    user = User.query.get(1)
    if not user:
        current_app.logger.info('creating default user')
        user = User(id=1, name='Portfolio Manager')
        db.session.add(user)
        db.session.commit()
    return user

@auth_bp.route('/user', methods=['GET'])
def get_user():
    current_app.logger.info('fetch current user')
    user = get_default_user()
    return jsonify(user.to_dict()), 200
