# Portfolio Manager - Flask Backend Template

This is a starter template for building the Flask REST API backend for the Portfolio Manager application.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip or poetry
- PostgreSQL or SQLite

### Installation

```bash
# Create project directory
mkdir portfolio-backend
cd portfolio-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install flask flask-cors flask-sqlalchemy flask-jwt-extended python-dotenv marshmallow
```

### Project Structure

```
portfolio-backend/
├── app.py                 # Main Flask app
├── config.py             # Configuration
├── requirements.txt      # Dependencies
├── .env                  # Environment variables
├── models/
│   ├── __init__.py
│   ├── user.py
│   └── portfolio.py
├── routes/
│   ├── __init__.py
│   ├── auth.py
│   └── portfolios.py
├── schemas/
│   ├── __init__.py
│   ├── portfolio_schema.py
│   └── item_schema.py
└── migrations/           # Database migrations
```

---

## 📝 Basic Implementation Example

### 1. Main App (`app.py`)

```python
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL', 
        'sqlite:///portfolio.db'
    )
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.portfolios import portfolio_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(portfolio_bp, url_prefix='/api')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
```

### 2. Models (`models/portfolio.py`)

```python
from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    portfolios = db.relationship('Portfolio', backref='owner', lazy=True, cascade='all, delete-orphan')

class Portfolio(db.Model):
    __tablename__ = 'portfolios'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    items = db.relationship('PortfolioItem', backref='portfolio', lazy=True, cascade='all, delete-orphan')

class PortfolioItem(db.Model):
    __tablename__ = 'portfolio_items'
    
    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id'), nullable=False)
    item_type = db.Column(db.String(20), nullable=False)  # 'stock', 'bond', 'cash'
    ticker = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.Date, nullable=False)
    current_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### 3. Portfolio Routes (`routes/portfolios.py`)

```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.portfolio import Portfolio, PortfolioItem, User
from marshmallow import ValidationError

portfolio_bp = Blueprint('portfolios', __name__)

# GET all portfolios
@portfolio_bp.route('/portfolios', methods=['GET'])
@jwt_required()
def get_portfolios():
    user_id = get_jwt_identity()
    portfolios = Portfolio.query.filter_by(user_id=user_id).all()
    
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
    } for p in portfolios])

# POST create portfolio
@portfolio_bp.route('/portfolios', methods=['POST'])
@jwt_required()
def create_portfolio():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Portfolio name is required'}), 400
    
    portfolio = Portfolio(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', '')
    )
    
    db.session.add(portfolio)
    db.session.commit()
    
    return jsonify({
        'id': portfolio.id,
        'name': portfolio.name,
        'description': portfolio.description,
        'createdAt': portfolio.created_at.isoformat(),
        'updatedAt': portfolio.updated_at.isoformat(),
        'items': []
    }), 201

# GET portfolio by ID
@portfolio_bp.route('/portfolios/<int:portfolio_id>', methods=['GET'])
@jwt_required()
def get_portfolio(portfolio_id):
    user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
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
    })

# PUT update portfolio
@portfolio_bp.route('/portfolios/<int:portfolio_id>', methods=['PUT'])
@jwt_required()
def update_portfolio(portfolio_id):
    user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    data = request.get_json()
    portfolio.name = data.get('name', portfolio.name)
    portfolio.description = data.get('description', portfolio.description)
    
    db.session.commit()
    
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
    })

# DELETE portfolio
@portfolio_bp.route('/portfolios/<int:portfolio_id>', methods=['DELETE'])
@jwt_required()
def delete_portfolio(portfolio_id):
    user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    db.session.delete(portfolio)
    db.session.commit()
    
    return jsonify({'message': 'Portfolio deleted successfully'}), 200

# POST add item to portfolio
@portfolio_bp.route('/portfolios/<int:portfolio_id>/items', methods=['POST'])
@jwt_required()
def add_portfolio_item(portfolio_id):
    user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
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
    
    db.session.add(item)
    db.session.commit()
    
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

# DELETE item from portfolio
@portfolio_bp.route('/portfolios/<int:portfolio_id>/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_portfolio_item(portfolio_id, item_id):
    user_id = get_jwt_identity()
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if not portfolio:
        return jsonify({'error': 'Portfolio not found'}), 404
    
    item = PortfolioItem.query.filter_by(id=item_id, portfolio_id=portfolio_id).first()
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Item deleted successfully'}), 200
```

### 4. Environment Variables (`.env`)

```env
# Flask
FLASK_ENV=development
FLASK_DEBUG=True

# Database
DATABASE_URL=sqlite:///portfolio.db
# DATABASE_URL=postgresql://user:password@localhost/portfolio_db

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5000

# Stock API (Optional)
ALPHA_VANTAGE_API_KEY=your-api-key-here
```

### 5. Requirements (`requirements.txt`)

```
Flask==3.0.0
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.0.5
Flask-JWT-Extended==4.5.2
python-dotenv==1.0.0
Marshmallow==3.20.1
python-dateutil==2.8.2
psycopg2-binary==2.9.9
gunicorn==21.2.0
```

---

## 🔐 Authentication Implementation

```python
# routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from models.portfolio import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        email=data['email'],
        username=data['username'],
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username
        }
    })
```

---

## 🧪 Testing

```bash
# Install pytest
pip install pytest pytest-flask

# Create test file
# tests/test_portfolios.py
```

---

## 📦 Deployment

### Heroku

```bash
# Install Heroku CLI
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

---

## 🎯 Next Steps

1. **Set up Database**: Choose PostgreSQL for production
2. **Add Authentication**: Implement JWT token system
3. **Add Validation**: Use Marshmallow schemas
4. **Add Tests**: Write unit tests
5. **Add Error Handling**: Implement proper error responses
6. **Deploy**: Use Heroku, Railway, or AWS
7. **Monitor**: Set up logging and monitoring

---

## 📚 Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/)
- [Marshmallow](https://marshmallow.readthedocs.io/)

---

**Happy coding!** 🚀
