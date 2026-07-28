"""Drop and recreate database schema."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.config import app, db

def reset_db():
    print("Resetting database...")
    try:
        with app.app_context():
            db.drop_all()
            print("Dropped all tables")

            db.create_all()
            print("Created all tables")

            # List tables
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"Tables: {', '.join(tables)}")
            return True

    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    reset_db()
