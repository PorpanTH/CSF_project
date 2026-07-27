#!/usr/bin/env python
"""
Initialize the database schema.
Creates all tables based on the models.
Run: cd portfolio-backend && python database/init_db.py
"""

import sys
from sqlalchemy import inspect
from config import app, db

def init_db():
    try:
        print('Creating database tables...')
        with app.app_context():
            db.create_all()
            print('[+] Tables created successfully!')

            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f'\n[+] Tables in database: {", ".join(tables)}')

            print('\nTable schemas:')
            for table_name in tables:
                columns = inspector.get_columns(table_name)
                print(f'\n  {table_name}:')
                for col in columns:
                    col_type = str(col['type'])
                    nullable = 'NULL' if col['nullable'] else 'NOT NULL'
                    print(f'    - {col["name"]}: {col_type} {nullable}')

        return True

    except Exception as e:
        print(f'[-] Failed to create tables: {e}', file=sys.stderr)
        return False

if __name__ == '__main__':
    success = init_db()
    sys.exit(0 if success else 1)
