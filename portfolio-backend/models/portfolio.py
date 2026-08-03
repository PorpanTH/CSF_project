from database.db import db
from datetime import datetime


class Portfolio(db.Model):
    __tablename__ = 'portfolios'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, default=1)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('PortfolioItem', backref='portfolio', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Portfolio {self.name}>'

    def calculate_metrics(self, live_prices=None):
        live_prices = live_prices or {}
        total_cost = 0
        total_current = 0
        total_pnl = 0
        asset_breakdown = {}

        for item in self.items:
            cost = item.quantity * item.purchase_price
            ticker = (item.ticker or '').upper()
            stored_current_price = item.current_price or item.purchase_price
            current_price = live_prices.get(ticker) or stored_current_price
            current = item.quantity * current_price
            pnl = current - cost

            total_cost += cost
            total_current += current
            total_pnl += pnl

            asset_class = item.asset_class or item.item_type
            if asset_class not in asset_breakdown:
                asset_breakdown[asset_class] = {
                    'value': 0,
                    'cost': 0,
                    'pnl': 0
                }
            asset_breakdown[asset_class]['value'] += current
            asset_breakdown[asset_class]['cost'] += cost
            asset_breakdown[asset_class]['pnl'] += pnl

        return {
            'totalCost': total_cost,
            'totalValue': total_current,
            'pnl': {
                'total': total_pnl,
                'byAssetClass': [
                    {'assetClass': k, 'pnl': v['pnl']}
                    for k, v in sorted(asset_breakdown.items())
                ]
            }
        }

    def to_dict(self, live_prices=None):
        metrics = self.calculate_metrics(live_prices)
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
            'items': [item.to_dict() for item in self.items],
            'metrics': metrics
        }


class PortfolioItem(db.Model):
    __tablename__ = 'portfolio_items'

    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolios.id'), nullable=False)
    asset_class = db.Column(db.String(50), nullable=False)
    item_type = db.Column(db.String(20), nullable=False)
    ticker = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.String(10), nullable=False)
    current_price = db.Column(db.Float, nullable=False, default=0.0)
    name = db.Column(db.String(120), default='')
    sector = db.Column(db.String(100), default='')
    region = db.Column(db.String(100), default='')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, *args, **kwargs):
        super().__init__()

        positional_fields = [
            'id', 'portfolio_id', 'asset_class', 'item_type', 'ticker', 'quantity',
            'purchase_price', 'purchase_date', 'current_price', 'sector', 'region', 'created_at', 'updated_at'
        ]

        if args:
            if len(args) > len(positional_fields):
                raise TypeError('Too many positional arguments for PortfolioItem')
            for field, value in zip(positional_fields, args):
                if value is None:
                    continue
                setattr(self, field, value)

        for key, value in kwargs.items():
            setattr(self, key, value)

    def __str__(self):
        return f'Portfolio details id :{self.id} ticker : {self.ticker}'

    def __repr__(self):
        return f'<PortfolioItem {self.ticker}>'

    def to_dict(self):
        current_price = self.current_price or self.purchase_price
        return {
            'id': str(self.id) if self.id is not None else None,
            'portfolioId': str(self.portfolio_id) if self.portfolio_id is not None else None,
            'assetClass': self.asset_class,
            'itemType': self.item_type or self.asset_class,
            'ticker': self.ticker,
            'quantity': self.quantity,
            'purchasePrice': self.purchase_price,
            'purchaseDate': self.purchase_date,
            'currentPrice': current_price,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'name': self.name or '',
            'sector': self.sector or '',
            'region': self.region or '',
            'priceHistory': []
        }
