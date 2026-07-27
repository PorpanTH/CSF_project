"""
Database configuration for test/utility scripts.
Provides access to the Flask app, SQLAlchemy db instance, and models.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from models.user import User
from models.portfolio import Portfolio, PortfolioItem

# Create and expose app for test scripts to use with app context
app = create_app()

__all__ = ['app', 'db', 'User', 'Portfolio', 'PortfolioItem']
