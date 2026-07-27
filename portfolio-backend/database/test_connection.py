#!/usr/bin/env python
"""
Test connection to the portfolio database (Railway MySQL or local SQLite).
Run: cd portfolio-backend && python database/test_connection.py
"""

import sys
from sqlalchemy import text
from config import app, db

def test_connection():
    try:
        print('Connecting to database...')
        with app.app_context():
            result = db.session.execute(text('SELECT 1 as connection_test'))
            print('[+] Connection successful!')

            version_result = db.session.execute(text('SELECT VERSION() as mysql_version'))
            version = version_result.scalar()
            print(f'[+] Database Version: {version}')

        print('\n[+] Database connection test passed!')
        return True

    except Exception as e:
        print(f'[-] Connection failed: {e}', file=sys.stderr)
        print('\nTroubleshooting:')
        print('1. Check that .env file exists with DATABASE_URL set')
        print('2. Verify the Railway MySQL connection string is correct')
        print('3. For SQLite, no setup is needed')
        return False

if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)
