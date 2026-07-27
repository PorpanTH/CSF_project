#!/usr/bin/env python
"""
Simple session-based auth without JWT.
Generates a session token on login that the frontend includes in API headers.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import secrets
from datetime import datetime, timedelta
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import Session
from werkzeug.security import generate_password_hash, check_password_hash
from database.config import Base, SessionLocal
from database.models import User

class SessionToken(Base):
    __tablename__ = 'session_tokens'

    token = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(10), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

def get_or_create_user(db: Session, username: str = 'demo_user', email: str = 'demo@example.com', password: str = 'password123'):
    """Get existing user or create the default user if it doesn't exist."""
    user = db.query(User).filter_by(username=username).first()
    if not user:
        user = User(
            email=email,
            username=username,
            password_hash=generate_password_hash(password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def create_session_token(user_id: int, expires_in_days: int = 30) -> str:
    """Create a new session token for a user."""
    db = SessionLocal()
    try:
        token = secrets.token_hex(32)
        session = SessionToken(
            token=token,
            user_id=str(user_id),
            expires_at=datetime.utcnow() + timedelta(days=expires_in_days)
        )
        db.add(session)
        db.commit()
        return token
    finally:
        db.close()

def validate_session_token(token: str) -> int | None:
    """Validate a token and return user_id if valid, None otherwise."""
    db = SessionLocal()
    try:
        session = db.query(SessionToken).filter_by(
            token=token,
            is_active=True
        ).first()
        if not session:
            return None
        if session.expires_at < datetime.utcnow():
            session.is_active = False
            db.commit()
            return None
        return int(session.user_id)
    finally:
        db.close()

def logout_token(token: str):
    """Invalidate a session token."""
    db = SessionLocal()
    try:
        session = db.query(SessionToken).filter_by(token=token).first()
        if session:
            session.is_active = False
            db.commit()
    finally:
        db.close()
