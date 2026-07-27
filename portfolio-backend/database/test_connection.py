#!/usr/bin/env python
"""
Test connection to Railway MySQL database.
Run: python database/test_connection.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database.config import engine

def test_connection():
    try:
        print('Connecting to database...')
        with engine.connect() as conn:
            result = conn.execute(text('SELECT 1 as connection_test'))
            print('[+] Connection successful!')

            version_result = conn.execute(text('SELECT VERSION() as mysql_version'))
            version = version_result.scalar()
            print(f'[+] MySQL Version: {version}')

        print('\n[+] Database connection test passed!')
        return True

    except Exception as e:
        print(f'[-] Connection failed: {e}', file=sys.stderr)
        print('\nTroubleshooting:')
        print('1. Check that .env file exists with DATABASE_URL set')
        print('2. Verify the Railway MySQL connection string is correct')
        print('3. Ensure your machine can reach the Railway server')
        return False

if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)
