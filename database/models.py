from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database.config import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    portfolios = relationship('Portfolio', back_populates='owner', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username} ({self.email})>'

class Portfolio(Base):
    __tablename__ = 'portfolios'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship('User', back_populates='portfolios')
    items = relationship('PortfolioItem', back_populates='portfolio', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Portfolio {self.name} (user={self.user_id})>'

class PortfolioItem(Base):
    __tablename__ = 'portfolio_items'

    id = Column(Integer, primary_key=True)
    portfolio_id = Column(Integer, ForeignKey('portfolios.id'), nullable=False, index=True)
    item_type = Column(String(20), nullable=False)
    ticker = Column(String(20), nullable=False)
    quantity = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=False)
    purchase_date = Column(Date, nullable=False)
    current_price = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    portfolio = relationship('Portfolio', back_populates='items')

    def __repr__(self):
        return f'<PortfolioItem {self.ticker} ({self.item_type})>'
