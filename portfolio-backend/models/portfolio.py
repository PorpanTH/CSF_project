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

    def calculate_metrics(self):
        total_cost = 0
        total_current = 0
        total_realized_pnl = 0
        max_drawdown = 0
        asset_breakdown = {}

        for item in self.items:
            cost = item.quantity * item.purchase_price
            current = item.quantity * item.current_price
            unrealized = current - cost

            total_cost += cost
            total_current += current
            total_realized_pnl += item.realized_pnl or 0

            # Track by asset class
            asset_class = item.asset_class
            if asset_class not in asset_breakdown:
                asset_breakdown[asset_class] = {
                    'value': 0,
                    'cost': 0,
                    'unrealizedPnL': 0,
                    'realizedPnL': 0
                }
            asset_breakdown[asset_class]['value'] += current
            asset_breakdown[asset_class]['cost'] += cost
            asset_breakdown[asset_class]['unrealizedPnL'] += unrealized
            asset_breakdown[asset_class]['realizedPnL'] += item.realized_pnl or 0

        total_unrealized_pnl = total_current - total_cost

        return {
            'totalCost': total_cost,
            'totalValue': total_current,
            'realizedPnL': total_realized_pnl,
            'unrealizedPnL': total_unrealized_pnl,
            'unrealizedPnLPercent': (total_unrealized_pnl / total_cost * 100) if total_cost > 0 else 0,
            'realizedPnLPercent': (total_realized_pnl / total_cost * 100) if total_cost > 0 else 0,
            'maxDrawdown': max_drawdown,
            'assetBreakdown': asset_breakdown
        }

    def to_dict(self):
        metrics = self.calculate_metrics()
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
    current_price = db.Column(db.Float, nullable=False)
    realized_pnl = db.Column(db.Float, default=0)
    sector = db.Column(db.String(100), default='')
    region = db.Column(db.String(100), default='')
    price_history = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<PortfolioItem {self.ticker}>'

    def calculate_pnl(self):
        cost = self.quantity * self.purchase_price
        current = self.quantity * self.current_price
        unrealized = current - cost
        realized = self.realized_pnl or 0
        return {
            'cost': cost,
            'current': current,
            'unrealizedPnL': unrealized,
            'unrealizedPnLPercent': (unrealized / cost * 100) if cost > 0 else 0,
            'realizedPnL': realized,
            'realizedPnLPercent': (realized / cost * 100) if cost > 0 else 0
        }

    def to_dict(self):
        pnl = self.calculate_pnl()
        return {
            'id': str(self.id),
            'portfolioId': str(self.portfolio_id),
            'assetClass': self.asset_class,
            'itemType': self.item_type,
            'ticker': self.ticker,
            'quantity': self.quantity,
            'purchasePrice': self.purchase_price,
            'purchaseDate': self.purchase_date,
            'currentPrice': self.current_price,
            'cost': pnl['cost'],
            'currentValue': pnl['current'],
            'realizedPnL': pnl['realizedPnL'],
            'realizedPnLPercent': pnl['realizedPnLPercent'],
            'unrealizedPnL': pnl['unrealizedPnL'],
            'unrealizedPnLPercent': pnl['unrealizedPnLPercent'],
            'sector': self.sector or '',
            'region': self.region or '',
            'priceHistory': self.price_history or [],
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }
