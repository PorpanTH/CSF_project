#!/usr/bin/env python
"""
Drop all tables and recreate schema from scratch.
Use when switching between incompatible model versions.
Run: cd portfolio-backend && python database/reset_db.py
"""

import sys
from config import app, db

def reset_db():
    try:
        print('[WARNING] Dropping all tables...')
        with app.app_context():
            db.drop_all()
            print('[+] All tables dropped.')

            print('[+] Recreating tables from current schema...')
            db.create_all()
            print('[+] Tables created successfully!')

        return True

    except Exception as e:
        print(f'[-] Failed to reset database: {e}', file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = reset_db()
    sys.exit(0 if success else 1)
